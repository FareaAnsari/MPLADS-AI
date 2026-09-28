import json
import math
import random

# State Geographic Anchor Definitions on a 650x720 canvas
STATE_BOUNDS = {
    'Jammu And Kashmir': {'cx': 240, 'cy': 70, 'w': 50, 'h': 40},
    'Ladakh': {'cx': 295, 'cy': 55, 'w': 55, 'h': 45},
    'Himachal Pradesh': {'cx': 255, 'cy': 120, 'w': 35, 'h': 30},
    'Punjab': {'cx': 225, 'cy': 135, 'w': 35, 'h': 35},
    'Chandigarh': {'cx': 245, 'cy': 138, 'w': 10, 'h': 10},
    'Uttarakhand': {'cx': 290, 'cy': 145, 'w': 35, 'h': 30},
    'Haryana': {'cx': 240, 'cy': 165, 'w': 35, 'h': 35},
    'Delhi': {'cx': 255, 'cy': 175, 'w': 18, 'h': 18},
    'Rajasthan': {'cx': 180, 'cy': 220, 'w': 75, 'h': 70},
    'Uttar Pradesh': {'cx': 325, 'cy': 210, 'w': 85, 'h': 60},
    'Bihar': {'cx': 430, 'cy': 230, 'w': 55, 'h': 40},
    'Sikkim': {'cx': 480, 'cy': 195, 'w': 14, 'h': 14},
    'West Bengal': {'cx': 475, 'cy': 285, 'w': 45, 'h': 75},
    'Jharkhand': {'cx': 420, 'cy': 280, 'w': 45, 'h': 40},
    'Odisha': {'cx': 415, 'cy': 350, 'w': 55, 'h': 55},
    'Chhattisgarh': {'cx': 350, 'cy': 320, 'w': 45, 'h': 65},
    'Madhya Pradesh': {'cx': 275, 'cy': 280, 'w': 85, 'h': 60},
    'Gujarat': {'cx': 140, 'cy': 295, 'w': 65, 'h': 55},
    'The Dadra And Nagar Haveli And Daman And Diu': {'cx': 165, 'cy': 335, 'w': 15, 'h': 15},
    'Maharashtra': {'cx': 235, 'cy': 375, 'w': 85, 'h': 70},
    'Goa': {'cx': 195, 'cy': 470, 'w': 14, 'h': 14},
    'Andhra Pradesh': {'cx': 325, 'cy': 445, 'w': 55, 'h': 75},
    'Telangana': {'cx': 305, 'cy': 390, 'w': 45, 'h': 45},
    'Karnataka': {'cx': 235, 'cy': 480, 'w': 55, 'h': 75},
    'Kerala': {'cx': 240, 'cy': 585, 'w': 28, 'h': 65},
    'Tamil Nadu': {'cx': 295, 'cy': 565, 'w': 55, 'h': 70},
    'Puducherry': {'cx': 310, 'cy': 560, 'w': 10, 'h': 10},
    'Assam': {'cx': 535, 'cy': 225, 'w': 45, 'h': 30},
    'Arunachal Pradesh': {'cx': 570, 'cy': 185, 'w': 45, 'h': 30},
    'Nagaland': {'cx': 580, 'cy': 230, 'w': 20, 'h': 20},
    'Manipur': {'cx': 575, 'cy': 255, 'w': 20, 'h': 20},
    'Mizoram': {'cx': 555, 'cy': 285, 'w': 18, 'h': 24},
    'Tripura': {'cx': 530, 'cy': 275, 'w': 16, 'h': 20},
    'Meghalaya': {'cx': 515, 'cy': 245, 'w': 25, 'h': 16},
    'Andaman And Nicobar Islands': {'cx': 525, 'cy': 580, 'w': 16, 'h': 60},
    'Lakshadweep': {'cx': 190, 'cy': 580, 'w': 14, 'h': 35}
}

def build_mesh():
    with open('src/data/allMpsDetailed.json', 'r', encoding='utf-8') as f:
        mps = json.load(f)

    ls_mps = [m for m in mps if m['house'] == 'Lok Sabha']
    by_state = {}
    for m in ls_mps:
        by_state.setdefault(m['state'], []).append(m)

    constituencies = []
    
    # Deterministic random seed
    random.seed(42)

    for state_name, state_mps in by_state.items():
        bounds = STATE_BOUNDS.get(state_name, {'cx': 300, 'cy': 300, 'w': 40, 'h': 40})
        cx = bounds['cx']
        cy = bounds['cy']
        w = bounds['w']
        h = bounds['h']
        count = len(state_mps)

        # Calculate grid layout within the state bounding region
        cols = math.ceil(math.sqrt(count * (w / max(1, h))))
        rows = math.ceil(count / max(1, cols))
        cell_w = (w * 2) / max(1, cols)
        cell_h = (h * 2) / max(1, rows)

        for i, mp in enumerate(state_mps):
            row_idx = i // cols
            col_idx = i % cols

            # Centroid offset with slight jitter for organic shape
            jitter_x = ((i * 7) % 5) - 2.5
            jitter_y = ((i * 11) % 5) - 2.5
            
            x_pos = cx - w + (col_idx + 0.5) * cell_w + jitter_x
            y_pos = cy - h + (row_idx + 0.5) * cell_h + jitter_y

            # Reserved Category mapping (matching reference map: SC = Yellow, ST = Peach, GEN = White)
            cat_raw = mp.get('category', 'GEN').upper()
            const_name = mp.get('constituency', '').upper()
            if 'SC' in cat_raw or '(SC)' in const_name:
                category = 'SC'
            elif 'ST' in cat_raw or '(ST)' in const_name:
                category = 'ST'
            else:
                category = 'GEN'

            # Generate polygon path (irregular hexagonal cell)
            r_size = min(cell_w, cell_h) * 0.52
            points = []
            num_vertices = 6
            for v in range(num_vertices):
                angle = (v * (2 * math.pi / num_vertices)) + 0.2
                rad = r_size * (0.85 + 0.3 * (((i + v) % 4) / 4.0))
                px = round(x_pos + rad * math.cos(angle), 1)
                py = round(y_pos + rad * math.sin(angle), 1)
                points.append(f"{px},{py}")

            poly_path = "M " + " L ".join(points) + " Z"

            constituencies.append({
                'id': mp['id'],
                'name': mp['constituency'],
                'state': mp['state'],
                'mpName': mp['name'],
                'category': category,
                'x': round(x_pos, 1),
                'y': round(y_pos, 1),
                'path': poly_path,
                'allocatedAmountCr': mp['allocatedAmountCr'],
                'recordedExpenditureCr': mp['recordedExpenditureCr'],
                'fundUtilizationPercent': mp['fundUtilizationPercent'],
                'worksCompleted': mp['worksCompleted'],
                'worksOngoing': mp['worksOngoing'],
                'worksRecommended': mp['worksRecommended']
            })

    print(f'Successfully built constituency mesh with {len(constituencies)} constituencies!')
    with open('src/data/indiaConstituenciesMesh.json', 'w', encoding='utf-8') as f:
        json.dump(constituencies, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    build_mesh()
