import json
import math

# Load MPs
with open('src/data/allMpsDetailed.json', 'r', encoding='utf-8') as f:
    all_mps = json.load(f)

# Load Geographic States data
with open('src/data/indiaGeographicStates.json', 'r', encoding='utf-8') as f:
    geo_data = json.load(f)

# Precise geographic anchors in (x, y) coordinates within 0 0 612 696 viewBox
# Designed specifically so the cartogram outlines the exact iconic silhouette of India
GEO_ANCHORS = {
    'Ladakh': (225.0, 55.0),
    'Jammu And Kashmir': (165.0, 75.0),
    'Himachal Pradesh': (195.0, 130.0),
    'Punjab': (150.0, 150.0),
    'Chandigarh': (178.0, 158.0),
    'Uttarakhand': (235.0, 170.0),
    'Haryana': (170.0, 190.0),
    'Delhi': (186.0, 210.0),
    'Rajasthan': (115.0, 245.0),
    'Uttar Pradesh': (255.0, 235.0),
    'Bihar': (355.0, 265.0),
    'Sikkim': (415.0, 225.0),
    'West Bengal': (395.0, 315.0),
    'Jharkhand': (355.0, 320.0),
    'Odisha': (335.0, 395.0),
    'Chhattisgarh': (290.0, 370.0),
    'Madhya Pradesh': (240.0, 305.0),
    'Gujarat': (75.0, 335.0),
    'The Dadra And Nagar Haveli And Daman And Diu': (85.0, 400.0),
    'Maharashtra': (175.0, 420.0),
    'Goa': (122.0, 505.0),
    'Telangana': (235.0, 455.0),
    'Andhra Pradesh': (245.0, 525.0),
    'Karnataka': (170.0, 515.0),
    'Kerala': (165.0, 610.0),
    'Tamil Nadu': (215.0, 605.0),
    'Puducherry': (245.0, 580.0),
    'Assam': (485.0, 260.0),
    'Arunachal Pradesh': (545.0, 205.0),
    'Nagaland': (545.0, 265.0),
    'Manipur': (535.0, 295.0),
    'Mizoram': (515.0, 335.0),
    'Tripura': (485.0, 320.0),
    'Meghalaya': (465.0, 280.0),
    'Andaman And Nicobar Islands': (515.0, 620.0),
    'Lakshadweep': (95.0, 625.0),
    'Nominated': (295.0, 215.0)
}

# Hexagon geometry in 0 0 612 696 viewBox
# Radius in pixels
R = 7.6
DX = R * math.sqrt(3)  # ~13.16px
DY = R * 1.5           # 11.40px

def hex_vertices(cx, cy, r):
    pts = []
    for i in range(6):
        angle = math.radians(30 + 60 * i)
        px = round(cx + r * math.cos(angle), 1)
        py = round(cy + r * math.sin(angle), 1)
        pts.append((px, py))
    return pts

def hex_path(cx, cy, r):
    pts = hex_vertices(cx, cy, r)
    s = "M " + " L ".join([f"{p[0]},{p[1]}" for p in pts]) + " Z"
    return s

def build_cartogram_for_house(mps_list, house_name):
    by_state = {}
    for m in mps_list:
        st = m['state']
        if st not in GEO_ANCHORS:
            st = 'Nominated'
        by_state.setdefault(st, []).append(m)

    total_seats = len(mps_list)
    print(f"\nBuilding {house_name}: {total_seats} seats across {len(by_state)} states")

    cols = int(600 / DX) + 2
    rows = int(680 / DY) + 2

    grid_cells = []
    for r in range(rows):
        for c in range(cols):
            x = (c + 0.5 * (r % 2)) * DX + 20
            y = r * DY + 30
            grid_cells.append((c, r, x, y))

    # Priority state order: remote outposts first, then outer states, then central states
    outposts = {'Ladakh': 1, 'Jammu And Kashmir': 2, 'Arunachal Pradesh': 3, 'Lakshadweep': 4,
                'Andaman And Nicobar Islands': 5, 'Kerala': 6, 'Tamil Nadu': 7, 'Gujarat': 8,
                'Goa': 9, 'Mizoram': 10, 'Tripura': 11, 'Nagaland': 12, 'Manipur': 13,
                'Meghalaya': 14, 'Sikkim': 15, 'Assam': 16, 'Punjab': 17, 'Himachal Pradesh': 18,
                'Uttarakhand': 19, 'Rajasthan': 20, 'Karnataka': 21, 'Andhra Pradesh': 22,
                'Maharashtra': 23, 'Odisha': 24, 'West Bengal': 25, 'Bihar': 26, 'Haryana': 27,
                'Delhi': 28, 'Telangana': 29, 'Chhattisgarh': 30, 'Jharkhand': 31,
                'Madhya Pradesh': 32, 'Uttar Pradesh': 33}

    state_order = sorted(by_state.keys(), key=lambda s: outposts.get(s, 50))

    used_cells = set()
    state_assignments = {}

    for st in state_order:
        mps = by_state[st]
        count = len(mps)
        anchor_x, anchor_y = GEO_ANCHORS.get(st, (300, 350))

        available = []
        for cell in grid_cells:
            c, r, x, y = cell
            if (c, r) in used_cells:
                continue
            
            # Anisotropic distance
            dist = math.hypot(x - anchor_x, (y - anchor_y) * 1.08)
            available.append((dist, cell))

        available.sort(key=lambda item: item[0])
        chosen = available[:count]

        for _, cell in chosen:
            c, r, x, y = cell
            used_cells.add((c, r))

        state_assignments[st] = [cell for _, cell in chosen]

    # Build constituency items
    mesh_output = []
    state_boundary_paths = {}

    for st, mps in by_state.items():
        cells = state_assignments[st]
        cells.sort(key=lambda item: (item[3], item[2]))
        mps_sorted = sorted(mps, key=lambda m: m['name'])

        # Edge segment counts for boundary calculation
        edge_counts = {}
        for cell in cells:
            c, r, x, y = cell
            verts = hex_vertices(x, y, R)
            for k in range(6):
                p1 = verts[k]
                p2 = verts[(k + 1) % 6]
                seg = tuple(sorted([p1, p2]))
                edge_counts[seg] = edge_counts.get(seg, 0) + 1

        # Perimeter edges are those with count == 1 (external border)
        perimeter_edges = [seg for seg, count in edge_counts.items() if count == 1]
        path_segs = []
        for (p1, p2) in perimeter_edges:
            path_segs.append(f"M {p1[0]} {p1[1]} L {p2[0]} {p2[1]}")
        state_boundary_paths[st] = " ".join(path_segs)

        for mp, cell in zip(mps_sorted, cells):
            c, r, x, y = cell
            path_str = hex_path(x, y, R * 0.95)

            cat_raw = mp.get('category', 'GEN').upper()
            const_name = mp.get('constituency', mp.get('name', '')).upper()
            
            if 'NOM' in cat_raw or mp.get('state') == 'Nominated' or mp.get('house') == 'Rajya Sabha' and 'NOMINATED' in cat_raw:
                category = 'NOM'
            elif 'SC' in cat_raw or '(SC)' in const_name:
                category = 'SC'
            elif 'ST' in cat_raw or '(ST)' in const_name:
                category = 'ST'
            else:
                category = 'GEN'

            mesh_output.append({
                "id": mp["id"],
                "name": mp.get("constituency", mp.get("name", "Seat")),
                "state": mp["state"],
                "mpName": mp["name"],
                "category": category,
                "x": round(x, 1),
                "y": round(y, 1),
                "path": path_str,
                "allocatedAmountCr": mp.get("allocatedAmountCr", "14.70"),
                "recordedExpenditureCr": mp.get("recordedExpenditureCr", "5.00"),
                "fundUtilizationPercent": mp.get("fundUtilizationPercent", 35.0),
                "worksCompleted": mp.get("worksCompleted", 10),
                "worksOngoing": mp.get("worksOngoing", 20),
                "worksRecommended": mp.get("worksRecommended", 30)
            })

    print(f"Generated {len(mesh_output)} seats for {house_name}")
    return mesh_output, state_boundary_paths

ls_mesh, ls_boundaries = build_cartogram_for_house([m for m in all_mps if m['house'] == 'Lok Sabha'], 'Lok Sabha')
rs_mesh, rs_boundaries = build_cartogram_for_house([m for m in all_mps if m['house'] == 'Rajya Sabha'], 'Rajya Sabha')

with open('src/data/indiaConstituenciesMesh.json', 'w', encoding='utf-8') as f:
    json.dump(ls_mesh, f, indent=2)

with open('src/data/indiaRajyaSabhaMesh.json', 'w', encoding='utf-8') as f:
    json.dump(rs_mesh, f, indent=2)

with open('src/data/indiaStateBoundaries.json', 'w', encoding='utf-8') as f:
    json.dump({
        "loksabha": ls_boundaries,
        "rajyasabha": rs_boundaries
    }, f, indent=2)

print("Saved meshes and boundaries successfully!")
