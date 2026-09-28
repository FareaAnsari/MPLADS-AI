import json
import math
import re
import numpy as np
import shapely
from shapely.geometry import Polygon, Point
from shapely.validation import make_valid
from shapely.ops import unary_union
from scipy.optimize import linear_sum_assignment

def parse_svg(path_str):
    polys = []
    curr = []
    tokens = re.findall(r'[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?', path_str)
    curr_x, curr_y = 0.0, 0.0
    start_x, start_y = 0.0, 0.0
    mode = 'm'
    i = 0
    while i < len(tokens):
        t = tokens[i]
        if t.isalpha():
            mode = t
            i += 1
            if mode in ['z', 'Z']:
                if len(curr) >= 3:
                    curr.append((start_x, start_y))
                    p = Polygon(curr)
                    if not p.is_valid: p = make_valid(p)
                    if p.area > 0.01: polys.append(p)
                    curr = []
                curr_x, curr_y = start_x, start_y
            continue
        try: x = float(t)
        except: i += 1; continue
        i += 1
        if i >= len(tokens) or tokens[i].isalpha(): continue
        try: y = float(tokens[i])
        except: continue
        i += 1
        if mode in ['m', 'M']:
            if len(curr) >= 3:
                p = Polygon(curr)
                if not p.is_valid: p = make_valid(p)
                if p.area > 0.01: polys.append(p)
                curr = []
            if mode == 'm': curr_x += x; curr_y += y
            else: curr_x, curr_y = x, y
            start_x, start_y = curr_x, curr_y
            curr.append((curr_x, curr_y))
            mode = 'l' if mode == 'm' else 'L'
        elif mode == 'l':
            curr_x += x; curr_y += y; curr.append((curr_x, curr_y))
        elif mode == 'L':
            curr_x, curr_y = x, y; curr.append((curr_x, curr_y))
    if len(curr) >= 3:
        p = Polygon(curr)
        if not p.is_valid: p = make_valid(p)
        if p.area > 0.01: polys.append(p)
    return polys

def create_hex_path(cx, cy, r):
    w = r * math.sqrt(3) / 2
    return f"M {round(cx, 2)} {round(cy - r, 2)} L {round(cx + w, 2)} {round(cy - r/2, 2)} L {round(cx + w, 2)} {round(cy + r/2, 2)} L {round(cx, 2)} {round(cy + r, 2)} L {round(cx - w, 2)} {round(cy + r/2, 2)} L {round(cx - w, 2)} {round(cy - r/2, 2)} Z"

# Standard projection between Lat/Lng and India SVG viewBox 0 0 612 696
LAT_MIN, LAT_MAX = 6.5, 37.5
LNG_MIN, LNG_MAX = 68.0, 97.5

def geo_to_svg(lat, lng):
    x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 580 + 16
    y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 660 + 18
    return x, y

def svg_to_geo(x, y):
    lng = LNG_MIN + ((x - 16) / 580) * (LNG_MAX - LNG_MIN)
    lat = LAT_MAX - ((y - 18) / 660) * (LAT_MAX - LAT_MIN)
    return round(lat, 4), round(lng, 4)

def get_state_hex_grid(geom, n):
    minx, miny, maxx, maxy = geom.bounds
    if n == 1:
        c = geom.centroid
        return [(round(c.x, 2), round(c.y, 2))], 6.5
    
    area = geom.area
    est_dx = math.sqrt((area / n) * (2 / math.sqrt(3)))
    
    best_pts = None
    best_diff = 999
    best_dx = est_dx
    for dx in np.linspace(est_dx * 0.45, est_dx * 1.55, 40):
        dy = dx * math.sqrt(3) / 2
        for off_x in np.linspace(0, dx, 4):
            for off_y in np.linspace(0, dy, 4):
                xs, ys = [], []
                row = 0
                y = miny + off_y
                while y <= maxy:
                    x = minx + off_x + (dx / 2 if row % 2 == 1 else 0)
                    while x <= maxx:
                        xs.append(x)
                        ys.append(y)
                        x += dx
                    y += dy
                    row += 1
                if not xs: continue
                mask = shapely.contains_xy(geom, xs, ys)
                in_x = np.array(xs)[mask]
                in_y = np.array(ys)[mask]
                diff = abs(len(in_x) - n)
                if diff < best_diff:
                    best_diff = diff
                    best_pts = list(zip(in_x, in_y))
                    best_dx = dx
                if diff == 0: break
            if best_diff == 0: break
        if best_diff == 0: break

    if len(best_pts) > n:
        best_pts.sort(key=lambda p: -geom.distance(Point(p[0], p[1])))
        best_pts = best_pts[:n]
    elif len(best_pts) < n:
        while len(best_pts) < n:
            c = geom.centroid
            best_pts.append((round(c.x + (len(best_pts) - n/2)*2, 2), round(c.y + (len(best_pts) - n/2)*2, 2)))
    
    radius = min(6.5, max(3.8, (best_dx / 2) * 0.9))
    return [(round(p[0], 2), round(p[1], 2)) for p in best_pts], radius

def main():
    print("Loading data...")
    with open('src/data/indiaGeographicStates.json') as f:
        geo_states = json.load(f)

    with open('src/data/allMpsDetailed.json') as f:
        all_mps = json.load(f)

    with open('scripts/generate_canonical_mesh.cjs') as f:
        cjs_content = f.read()

    coords_block = re.search(r'const CONSTITUENCY_COORDINATES = \{([\s\S]*?)\n\};', cjs_content)
    const_coords = {}
    for line in coords_block.group(1).split('\n'):
        m = re.search(r"'([^']+)':\s*\{\s*lat:\s*([\d\.-]+),\s*lng:\s*([\d\.-]+)\s*\}", line)
        if m:
            const_coords[m.group(1).upper()] = {'lat': float(m.group(2)), 'lng': float(m.group(3))}

    def get_coords(name):
        clean = name.upper().strip()
        if clean in const_coords:
            return const_coords[clean]
        n_clean = re.sub(r'[^A-Z0-9]', '', clean)
        for k, v in const_coords.items():
            if re.sub(r'[^A-Z0-9]', '', k) == n_clean:
                return v
        for k, v in const_coords.items():
            if n_clean in re.sub(r'[^A-Z0-9]', '', k) or re.sub(r'[^A-Z0-9]', '', k) in n_clean:
                return v
        return {'lat': 20.0, 'lng': 78.0}

    state_geoms = {s['id']: unary_union(parse_svg(s['path'])) for s in geo_states['states']}
    state_meta = {s['id']: s for s in geo_states['states']}
    india_geom = unary_union(list(state_geoms.values()))

    # Robust State ID Matcher
    def resolve_state_id(st_name, pc_name):
        norm = (st_name + ' ' + pc_name).lower()
        if 'andaman' in norm: return 'an'
        if 'lakshadweep' in norm: return 'ld'
        if 'ladakh' in norm: return 'jk'
        if 'puducherry' in norm or 'pondicherry' in norm: return 'py'
        if 'chandigarh' in norm: return 'ch'
        if 'daman' in norm or 'dadra' in norm or 'diu' in norm or 'haveli' in norm: return 'dn'
        if 'delhi' in norm: return 'dl'
        if 'goa' in norm: return 'ga'
        if 'sikkim' in norm: return 'sk'
        if 'mizoram' in norm: return 'mz'
        if 'nagaland' in norm: return 'nl'
        if 'tripura' in norm: return 'tr'
        if 'manipur' in norm: return 'mn'
        if 'meghalaya' in norm: return 'ml'
        if 'arunachal' in norm: return 'ar'
        if 'himachal' in norm: return 'hp'
        if 'uttarakhand' in norm or 'uttaranchal' in norm: return 'ut'
        if 'kerala' in norm: return 'kl'
        if 'tamil' in norm: return 'tn'
        if 'karnataka' in norm: return 'ka'
        if 'andhra' in norm: return 'ap'
        if 'telangana' in norm: return 'tg'
        if 'odisha' in norm or 'orissa' in norm: return 'or'
        if 'chhattisgarh' in norm or 'chattisgarh' in norm: return 'ct'
        if 'jharkhand' in norm: return 'jh'
        if 'bihar' in norm: return 'br'
        if 'west bengal' in norm or 'bengal' in norm: return 'wb'
        if 'assam' in norm: return 'as'
        if 'punjab' in norm: return 'pb'
        if 'haryana' in norm: return 'hr'
        if 'rajasthan' in norm: return 'rj'
        if 'gujarat' in norm: return 'gj'
        if 'madhya' in norm: return 'mp'
        if 'maharashtra' in norm: return 'mh'
        if 'uttar pradesh' in norm: return 'up'
        if 'kashmir' in norm or 'jammu' in norm: return 'jk'
        return 'dl'

    # 1. Lok Sabha (543 seats)
    ls_mps = [m for m in all_mps if m.get('house') == 'Lok Sabha']
    print(f"Total Lok Sabha MPs: {len(ls_mps)}")

    mps_by_state = {}
    for mp in ls_mps:
        st_id = resolve_state_id(mp.get('state', ''), mp.get('constituency', ''))
        if st_id not in mps_by_state: mps_by_state[st_id] = []
        mps_by_state[st_id].append(mp)

    final_ls_mesh = []

    for st_id, mps in mps_by_state.items():
        if st_id == 'an':
            mp = mps[0]
            coord = get_coords(mp['constituency'])
            clean_id = mp['id'].replace('ls-ls-', 'ls-').replace('ls-', '')
            final_ls_mesh.append({
                "id": f"ls-{clean_id}",
                "geoId": f"GEO-IN-AN-LS-{clean_id.upper()}",
                "stateId": "IN-AN",
                "stateCode": "AN",
                "state": "Andaman and Nicobar Islands",
                "stateName": "Andaman and Nicobar Islands",
                "pcId": f"PC-{clean_id.upper()}",
                "pcName": mp.get('constituency', 'ANDAMAN AND NICOBAR ISLANDS'),
                "name": mp.get('constituency', 'ANDAMAN AND NICOBAR ISLANDS'),
                "house": "Lok Sabha",
                "mpName": mp.get('name', 'BISHNU PADA RAY'),
                "party": mp.get('party', 'BJP'),
                "partyCategory": mp.get('partyCategory', 'NDA'),
                "latitude": coord['lat'],
                "longitude": coord['lng'],
                "lat": coord['lat'],
                "lng": coord['lng'],
                "x": 518.8,
                "y": 600.8,
                "path": create_hex_path(518.8, 600.8, 6.2),
                "allocatedAmountCr": mp.get('allocatedAmountCr', '14.70'),
                "recordedExpenditureCr": mp.get('recordedExpenditureCr', '3.67'),
                "fundUtilizationPercent": mp.get('fundUtilizationPercent', 25),
                "worksCompleted": mp.get('worksCompleted', 8),
                "worksOngoing": mp.get('worksOngoing', 30),
                "worksRecommended": mp.get('worksRecommended', 38),
                "completionRate": mp.get('completionRate', 21),
                "remainingBalanceCr": mp.get('remainingBalanceCr', '11.03')
            })
            continue

        if st_id == 'ld':
            mp = mps[0]
            coord = get_coords(mp['constituency'])
            clean_id = mp['id'].replace('ls-ls-', 'ls-').replace('ls-', '')
            final_ls_mesh.append({
                "id": f"ls-{clean_id}",
                "geoId": f"GEO-IN-LD-LS-{clean_id.upper()}",
                "stateId": "IN-LD",
                "stateCode": "LD",
                "state": "Lakshadweep",
                "stateName": "Lakshadweep",
                "pcId": f"PC-{clean_id.upper()}",
                "pcName": mp.get('constituency', 'LAKSHADWEEP(ST)'),
                "name": mp.get('constituency', 'LAKSHADWEEP(ST)'),
                "house": "Lok Sabha",
                "mpName": mp.get('name', 'MUHAMMED HAMDULLAH SAYEED'),
                "party": mp.get('party', 'INC'),
                "partyCategory": mp.get('partyCategory', 'INDIA'),
                "latitude": coord['lat'],
                "longitude": coord['lng'],
                "lat": coord['lat'],
                "lng": coord['lng'],
                "x": 100.2,
                "y": 618.4,
                "path": create_hex_path(100.2, 618.4, 6.2),
                "allocatedAmountCr": mp.get('allocatedAmountCr', '15.39'),
                "recordedExpenditureCr": mp.get('recordedExpenditureCr', '3.39'),
                "fundUtilizationPercent": mp.get('fundUtilizationPercent', 22),
                "worksCompleted": mp.get('worksCompleted', 12),
                "worksOngoing": mp.get('worksOngoing', 53),
                "worksRecommended": mp.get('worksRecommended', 65),
                "completionRate": mp.get('completionRate', 18),
                "remainingBalanceCr": mp.get('remainingBalanceCr', '12.01')
            })
            continue

        geom = state_geoms.get(st_id, state_geoms['dl'])
        st_meta_entry = state_meta.get(st_id, {'name': mps[0]['state'], 'id': st_id})
        pts, hex_r = get_state_hex_grid(geom, len(mps))
        min_x, min_y, max_x, max_y = geom.bounds

        coords_list = [get_coords(m['constituency']) for m in mps]
        lats = [c['lat'] for c in coords_list]
        lngs = [c['lng'] for c in coords_list]
        min_lat, max_lat = min(lats), max(lats)
        min_lng, max_lng = min(lngs), max(lngs)

        cost_matrix = np.zeros((len(mps), len(pts)))
        for i, (m, c) in enumerate(zip(mps, coords_list)):
            if max_lng - min_lng > 0.001 and max_lat - min_lat > 0.001:
                target_x = min_x + ((c['lng'] - min_lng) / (max_lng - min_lng)) * (max_x - min_x)
                target_y = min_y + ((max_lat - c['lat']) / (max_lat - min_lat)) * (max_y - min_y)
            else:
                target_x, target_y = geom.centroid.x, geom.centroid.y

            for j, pt in enumerate(pts):
                cost_matrix[i, j] = math.hypot(target_x - pt[0], target_y - pt[1])

        row_ind, col_ind = linear_sum_assignment(cost_matrix)

        for r, c in zip(row_ind, col_ind):
            mp = mps[r]
            pt = pts[c]
            coord = coords_list[r]
            px, py = pt[0], pt[1]
            clean_id = mp['id'].replace('ls-ls-', 'ls-').replace('ls-', '')

            record = {
                "id": f"ls-{clean_id}",
                "geoId": f"GEO-IN-{st_id.upper()}-LS-{clean_id.upper()}",
                "stateId": f"IN-{st_id.upper()}",
                "stateCode": st_id.upper(),
                "state": mp.get('state', st_meta_entry['name']),
                "stateName": mp.get('state', st_meta_entry['name']),
                "pcId": f"PC-{clean_id.upper()}",
                "pcName": mp.get('constituency', 'Constituency'),
                "name": mp.get('constituency', 'Constituency'),
                "house": "Lok Sabha",
                "mpName": mp.get('name', 'MP Name'),
                "party": mp.get('party', 'IND'),
                "partyCategory": mp.get('partyCategory', 'Others'),
                "latitude": coord['lat'],
                "longitude": coord['lng'],
                "lat": coord['lat'],
                "lng": coord['lng'],
                "x": round(px, 1),
                "y": round(py, 1),
                "path": create_hex_path(px, py, hex_r),
                "allocatedAmountCr": mp.get('allocatedAmountCr', '14.70'),
                "recordedExpenditureCr": mp.get('recordedExpenditureCr', '6.50'),
                "fundUtilizationPercent": mp.get('fundUtilizationPercent', 44),
                "worksCompleted": mp.get('worksCompleted', 15),
                "worksOngoing": mp.get('worksOngoing', 22),
                "worksRecommended": mp.get('worksRecommended', 37),
                "completionRate": mp.get('completionRate', 40),
                "remainingBalanceCr": mp.get('remainingBalanceCr', '8.20')
            }
            final_ls_mesh.append(record)

    print(f"Generated {len(final_ls_mesh)} Lok Sabha hexagon cells.")
    with open('src/data/indiaConstituenciesMesh.json', 'w') as f:
        json.dump(final_ls_mesh, f, indent=2)

    # 2. Rajya Sabha (244 seats)
    rs_mps = [m for m in all_mps if m.get('house') == 'Rajya Sabha']
    print(f"Total Rajya Sabha MPs: {len(rs_mps)}")

    rs_mps_by_state = {}
    for mp in rs_mps:
        st_id = resolve_state_id(mp.get('state', ''), mp.get('constituency', ''))
        if st_id not in rs_mps_by_state: rs_mps_by_state[st_id] = []
        rs_mps_by_state[st_id].append(mp)

    final_rs_mesh = []
    for st_id, mps in rs_mps_by_state.items():
        geom = state_geoms.get(st_id, state_geoms['dl'])
        st_meta_entry = state_meta.get(st_id, {'name': mps[0]['state'], 'id': st_id})
        pts, rs_r = get_state_hex_grid(geom, len(mps))
        rs_r = min(10.0, max(5.5, rs_r * 1.4))

        for idx, mp in enumerate(mps):
            pt = pts[idx]
            px, py = pt[0], pt[1]
            lat, lng = svg_to_geo(px, py)
            clean_id = mp['id'].replace('rs-rs-', 'rs-').replace('rs-', '')

            record = {
                "id": f"rs-{clean_id}",
                "geoId": f"GEO-IN-{st_id.upper()}-RS-{clean_id.upper()}",
                "stateId": f"IN-{st_id.upper()}",
                "stateCode": st_id.upper(),
                "state": mp.get('state', st_meta_entry['name']),
                "stateName": mp.get('state', st_meta_entry['name']),
                "pcId": f"RS-{st_id.upper()}-{clean_id.upper()}",
                "pcName": f"{mp.get('state', st_meta_entry['name'])} Seat {idx+1}",
                "name": f"{mp.get('state', st_meta_entry['name'])} Seat {idx+1}",
                "house": "Rajya Sabha",
                "mpName": mp.get('name', 'Nominated Member'),
                "party": mp.get('party', 'IND'),
                "partyCategory": mp.get('partyCategory', 'Others'),
                "latitude": lat,
                "longitude": lng,
                "lat": lat,
                "lng": lng,
                "x": round(px, 1),
                "y": round(py, 1),
                "path": create_hex_path(px, py, rs_r),
                "allocatedAmountCr": mp.get('allocatedAmountCr', '14.70'),
                "recordedExpenditureCr": mp.get('recordedExpenditureCr', '7.10'),
                "fundUtilizationPercent": mp.get('fundUtilizationPercent', 48),
                "worksCompleted": mp.get('worksCompleted', 18),
                "worksOngoing": mp.get('worksOngoing', 20),
                "worksRecommended": mp.get('worksRecommended', 38),
                "completionRate": mp.get('completionRate', 47),
                "remainingBalanceCr": mp.get('remainingBalanceCr', '7.60')
            }
            final_rs_mesh.append(record)

    with open('src/data/indiaRajyaSabhaMesh.json', 'w') as f:
        json.dump(final_rs_mesh, f, indent=2)
    print(f"Saved src/data/indiaRajyaSabhaMesh.json ({len(final_rs_mesh)} seats)")

if __name__ == '__main__':
    main()
