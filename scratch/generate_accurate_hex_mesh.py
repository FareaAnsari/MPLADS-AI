import json
import math
import numpy as np
from scipy.optimize import linear_sum_assignment

# 1. Load MP data
with open('src/data/allMpsDetailed.json', 'r', encoding='utf-8') as f:
    all_mps = json.load(f)

ls_mps = [m for m in all_mps if m['house'] == 'Lok Sabha']
rs_mps = [m for m in all_mps if m['house'] == 'Rajya Sabha']

print(f"Lok Sabha MPs: {len(ls_mps)}")
print(f"Rajya Sabha MPs: {len(rs_mps)}")

# Carefully tuned relative geographical anchors for India's 36 States/UTs on hex grid
# (col, row) space where row step is 12.75px, col step is 14.72px
STATE_ANCHORS = {
    'Ladakh': (14.0, 1.0),
    'Jammu And Kashmir': (12.0, 2.5),
    'Himachal Pradesh': (14.0, 4.5),
    'Punjab': (11.0, 5.5),
    'Chandigarh': (13.0, 5.5),
    'Uttarakhand': (16.0, 5.5),
    'Haryana': (12.5, 7.5),
    'Delhi': (14.0, 8.5),
    'Rajasthan': (9.0, 11.5),
    'Uttar Pradesh': (16.5, 11.5),
    'Bihar': (22.5, 12.0),
    'Sikkim': (25.0, 9.5),
    'West Bengal': (24.0, 16.5),
    'Jharkhand': (21.5, 16.0),
    'Odisha': (21.0, 21.0),
    'Chhattisgarh': (17.5, 19.5),
    'Madhya Pradesh': (13.5, 16.5),
    'Gujarat': (5.5, 17.5),
    'The Dadra And Nagar Haveli And Daman And Diu': (6.5, 21.5),
    'Maharashtra': (10.5, 23.0),
    'Goa': (7.0, 27.5),
    'Telangana': (15.5, 24.5),
    'Andhra Pradesh': (17.5, 28.5),
    'Karnataka': (10.5, 29.5),
    'Kerala': (10.0, 35.5),
    'Tamil Nadu': (14.5, 35.5),
    'Puducherry': (16.0, 33.5),
    'Assam': (28.5, 12.5),
    'Arunachal Pradesh': (31.5, 9.5),
    'Nagaland': (32.0, 12.0),
    'Manipur': (31.5, 14.5),
    'Mizoram': (30.5, 17.0),
    'Tripura': (28.5, 16.5),
    'Meghalaya': (28.0, 14.5),
    'Andaman And Nicobar Islands': (26.5, 31.0),
    'Lakshadweep': (6.0, 35.0)
}

def generate_mesh_for_house(mps_list, house_name):
    # Group by state
    by_st = {}
    for m in mps_list:
        st = m['state']
        if st not in STATE_ANCHORS:
            st = 'Nominated'
        by_st.setdefault(st, []).append(m)

    total_count = len(mps_list)
    print(f"\nProcessing {house_name}: {total_count} seats across {len(by_st)} groups")

    # If Nominated exists, add anchor
    anchors = dict(STATE_ANCHORS)
    if 'Nominated' in by_st:
        anchors['Nominated'] = (17.0, 8.5)

    # 1. Candidate hex grid cells in bounding box
    candidates = []
    for r in range(0, 42):
        for q in range(0, 36):
            # Pointy topped hex coordinates:
            # x_grid has 0.5 offset on odd rows
            x_grid = q + 0.5 * (r % 2)
            y_grid = r * (math.sqrt(3) / 2)

            # Minimum weighted distance to any state
            min_cost = 999999
            for st, mps in by_st.items():
                if st not in anchors:
                    continue
                cx, cy = anchors[st]
                count = len(mps)
                # Anisotropic distance (X vs Y aspect ratio of India)
                d = math.hypot((x_grid - cx) * 1.04, y_grid - cy)
                cost = d / (math.sqrt(count) + 0.75)
                if cost < min_cost:
                    min_cost = cost

            candidates.append((min_cost, q, r, x_grid, y_grid))

    candidates.sort(key=lambda item: item[0])
    selected_cells = candidates[:total_count]

    # 2. Build target assignments
    target_states = []
    for st, mps in by_st.items():
        target_states.extend([st] * len(mps))

    assert len(target_states) == total_count
    assert len(selected_cells) == total_count

    # 3. Cost matrix for optimal linear assignment
    cost_matrix = np.zeros((total_count, total_count), dtype=np.float32)
    for i, (mc, q, r, x_grid, y_grid) in enumerate(selected_cells):
        for j, st in enumerate(target_states):
            cx, cy = anchors.get(st, (15.0, 15.0))
            dist = math.hypot(x_grid - cx, y_grid - cy)
            cost_matrix[i, j] = dist ** 1.35

    row_ind, col_ind = linear_sum_assignment(cost_matrix)

    # Group assigned cells by state
    assigned_by_state = {}
    for i, j in zip(row_ind, col_ind):
        st = target_states[j]
        mc, q, r, x_grid, y_grid = selected_cells[i]
        assigned_by_state.setdefault(st, []).append((q, r, x_grid, y_grid))

    # Verify counts
    for st, mps in by_st.items():
        assert len(assigned_by_state[st]) == len(mps), f"Count mismatch for {st}"

    # 4. Convert to Screen Coordinates
    # Canvas parameters
    R = 8.6  # Uniform radius of hexagon
    dx = R * math.sqrt(3)      # ~14.895
    dy = R * 1.5               # ~12.900
    
    # Calculate global center of mass
    all_x = [c[2] * dx for cells in assigned_by_state.values() for c in cells]
    all_y = [c[1] * dy for cells in assigned_by_state.values() for c in cells]
    
    mean_x = (min(all_x) + max(all_x)) / 2.0
    mean_y = (min(all_y) + max(all_y)) / 2.0

    # Center at canvas target (viewBox="80 30 530 600", center ≈ 345, 330)
    target_cx = 345.0
    target_cy = 330.0
    offset_x = target_cx - mean_x
    offset_y = target_cy - mean_y

    # Helper function to generate regular hexagon path
    def make_hex_path(cx, cy, radius):
        points = []
        for k in range(6):
            # Pointy-topped vertices: angles 30, 90, 150, 210, 270, 330 degrees
            angle = math.radians(30 + k * 60)
            px = round(cx + radius * math.cos(angle), 1)
            py = round(cy + radius * math.sin(angle), 1)
            points.append(f"{px},{py}")
        return "M " + " L ".join(points) + " Z"

    final_constituencies = []
    
    for st, mps in by_st.items():
        cells = assigned_by_state[st]
        # Sort cells geographically within state (North to South, then West to East)
        cells.sort(key=lambda c: (c[1], c[0]))

        for k, mp in enumerate(mps):
            q, r, x_grid, y_grid = cells[k]
            
            # Screen coordinates for center of hex
            cx = round((q + 0.5 * (r % 2)) * dx + offset_x, 1)
            cy = round(r * dy + offset_y, 1)

            # High-precision regular hexagon path with crisp 0.96 scale for micro-gap
            poly_path = make_hex_path(cx, cy, R * 0.95)

            # Determine reserved category
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

            final_constituencies.append({
                'id': mp['id'],
                'name': mp.get('constituency', mp.get('name', 'Seat')),
                'state': mp['state'],
                'mpName': mp['name'],
                'category': category,
                'x': cx,
                'y': cy,
                'path': poly_path,
                'allocatedAmountCr': mp.get('allocatedAmountCr', '14.70'),
                'recordedExpenditureCr': mp.get('recordedExpenditureCr', '5.00'),
                'fundUtilizationPercent': mp.get('fundUtilizationPercent', 35.0),
                'worksCompleted': mp.get('worksCompleted', 10),
                'worksOngoing': mp.get('worksOngoing', 20),
                'worksRecommended': mp.get('worksRecommended', 30)
            })

    print(f"Generated {len(final_constituencies)} seats for {house_name}.")
    return final_constituencies

# Run for Lok Sabha
ls_mesh = generate_mesh_for_house(ls_mps, 'Lok Sabha')
with open('src/data/indiaConstituenciesMesh.json', 'w', encoding='utf-8') as f:
    json.dump(ls_mesh, f, ensure_ascii=False, indent=2)

# Run for Rajya Sabha
rs_mesh = generate_mesh_for_house(rs_mps, 'Rajya Sabha')
with open('src/data/indiaRajyaSabhaMesh.json', 'w', encoding='utf-8') as f:
    json.dump(rs_mesh, f, ensure_ascii=False, indent=2)

print("\nSuccessfully updated both indiaConstituenciesMesh.json and indiaRajyaSabhaMesh.json!")
