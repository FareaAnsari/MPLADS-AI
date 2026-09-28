import json
import math

# State geographic bounding centroids (center_x, center_y, span_r) on a 520x560 canvas
STATE_GEO_PROJECTIONS = {
    'Jammu and Kashmir': {'cx': 210, 'cy': 65, 'r': 35},
    'Ladakh': {'cx': 240, 'cy': 50, 'r': 30},
    'Himachal Pradesh': {'cx': 225, 'cy': 105, 'r': 20},
    'Punjab': {'cx': 195, 'cy': 120, 'r': 22},
    'Uttarakhand': {'cx': 250, 'cy': 130, 'r': 20},
    'Haryana': {'cx': 210, 'cy': 140, 'r': 20},
    'Delhi': {'cx': 225, 'cy': 150, 'r': 12},
    'Rajasthan': {'cx': 165, 'cy': 190, 'r': 48},
    'Uttar Pradesh': {'cx': 295, 'cy': 190, 'r': 55},
    'Bihar': {'cx': 375, 'cy': 210, 'r': 35},
    'Sikkim': {'cx': 415, 'cy': 175, 'r': 10},
    'West Bengal': {'cx': 415, 'cy': 250, 'r': 38},
    'Jharkhand': {'cx': 365, 'cy': 255, 'r': 28},
    'Odisha': {'cx': 355, 'cy': 310, 'r': 38},
    'Chhattisgarh': {'cx': 305, 'cy': 285, 'r': 35},
    'Madhya Pradesh': {'cx': 245, 'cy': 250, 'r': 52},
    'Gujarat': {'cx': 145, 'cy': 260, 'r': 40},
    'Maharashtra': {'cx': 215, 'cy': 330, 'r': 55},
    'Goa': {'cx': 185, 'cy': 405, 'r': 8},
    'Andhra Pradesh': {'cx': 280, 'cy': 390, 'r': 42},
    'Telangana': {'cx': 265, 'cy': 345, 'r': 30},
    'Karnataka': {'cx': 215, 'cy': 420, 'r': 42},
    'Kerala': {'cx': 220, 'cy': 480, 'r': 30},
    'Tamil Nadu': {'cx': 255, 'cy': 470, 'r': 42},
    'Puducherry': {'cx': 265, 'cy': 465, 'r': 8},
    'Assam': {'cx': 455, 'cy': 195, 'r': 25},
    'Arunachal Pradesh': {'cx': 480, 'cy': 165, 'r': 22},
    'Nagaland': {'cx': 485, 'cy': 200, 'r': 12},
    'Manipur': {'cx': 480, 'cy': 220, 'r': 12},
    'Mizoram': {'cx': 465, 'cy': 245, 'r': 14},
    'Tripura': {'cx': 445, 'cy': 235, 'r': 12},
    'Meghalaya': {'cx': 440, 'cy': 210, 'r': 14},
    'Andaman and Nicobar Islands': {'cx': 430, 'cy': 475, 'r': 18},
    'Lakshadweep': {'cx': 180, 'cy': 475, 'r': 12},
    'Dadra and Nagar Haveli and Daman and Diu': {'cx': 170, 'cy': 295, 'r': 10},
    'Chandigarh': {'cx': 212, 'cy': 125, 'r': 6}
}

def generate_constituencies_map():
    with open('src/data/allMpsDetailed.json', 'r', encoding='utf-8') as f:
        mps = json.load(f)

    ls_mps = [m for m in mps if m['house'] == 'Lok Sabha']
    
    # Group by state
    by_state = {}
    for m in ls_mps:
        by_state.setdefault(m['state'], []).append(m)

    mapped_constituencies = []
    
    for state_name, state_mps in by_state.items():
        proj = STATE_GEO_PROJECTIONS.get(state_name, {'cx': 260, 'cy': 270, 'r': 30})
        cx, cy, radius = proj['cx'], proj['cy'], proj['r']
        n = len(state_mps)

        for i, mp in enumerate(state_mps):
            # Spiral distribution for natural geographic dispersion within state boundary
            if n == 1:
                x, y = cx, cy
            else:
                angle = (i * (2 * math.pi / n)) + (i * 0.4)
                # Golden ratio radius distribution
                dist = radius * math.sqrt((i + 1) / n) * 0.88
                x = round(cx + dist * math.cos(angle), 1)
                y = round(cy + dist * math.sin(angle), 1)

            # Determine reserved category
            cat_raw = mp.get('category', 'GEN').upper()
            const_name = mp.get('constituency', '').upper()
            if 'SC' in cat_raw or '(SC)' in const_name:
                category = 'SC'
            elif 'ST' in cat_raw or '(ST)' in const_name:
                category = 'ST'
            else:
                category = 'GEN'

            mapped_constituencies.append({
                'id': mp['id'],
                'name': mp['constituency'],
                'state': mp['state'],
                'mpName': mp['name'],
                'category': category,
                'x': x,
                'y': y,
                'allocatedAmountCr': mp['allocatedAmountCr'],
                'recordedExpenditureCr': mp['recordedExpenditureCr'],
                'fundUtilizationPercent': mp['fundUtilizationPercent'],
                'worksCompleted': mp['worksCompleted'],
                'worksOngoing': mp['worksOngoing'],
                'worksRecommended': mp['worksRecommended']
            })

    print(f'Total Mapped Lok Sabha Constituencies: {len(mapped_constituencies)}')
    
    with open('src/data/constituenciesMapData.json', 'w', encoding='utf-8') as f:
        json.dump(mapped_constituencies, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    generate_constituencies_map()
