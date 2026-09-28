import json
import math
import numpy as np
from scipy.optimize import linear_sum_assignment

# 1. Load MP data
with open('src/data/allMpsDetailed.json', 'r', encoding='utf-8') as f:
    all_mps = json.load(f)

ls_mps = [m for m in all_mps if m['house'] == 'Lok Sabha']

# Group by state
by_state = {}
for m in ls_mps:
    by_state.setdefault(m['state'], []).append(m)

state_counts = {st: len(mps) for st, mps in by_state.items()}
total_seats = sum(state_counts.values())
print(f"Total seats: {total_seats}")

# 2. State Target Centers in normalized hex grid space (approx cols: 0 to 28, rows: 0 to 36)
# Each state center is carefully placed according to Indian relative geography
STATE_CENTROIDS = {
    'Ladakh': (14.0, 1.0),
    'Jammu And Kashmir': (12.0, 2.5),
    'Himachal Pradesh': (14.0, 4.5),
    'Punjab': (11.0, 5.5),
    'Chandigarh': (13.0, 5.5),
    'Uttarakhand': (16.0, 5.5),
    'Haryana': (12.5, 7.5),
    'Delhi': (14.0, 8.0),
    'Rajasthan': (9.0, 11.5),
    'Uttar Pradesh': (16.5, 11.5),
    'Bihar': (22.5, 12.0),
    'Sikkim': (25.0, 10.0),
    'West Bengal': (24.0, 16.5),
    'Jharkhand': (21.5, 16.0),
    'Odisha': (21.0, 21.0),
    'Chhattisgarh': (17.5, 19.0),
    'Madhya Pradesh': (13.5, 16.5),
    'Gujarat': (6.0, 17.5),
    'The Dadra And Nagar Haveli And Daman And Diu': (7.0, 21.0),
    'Maharashtra': (11.0, 23.0),
    'Goa': (7.5, 27.5),
    'Telangana': (15.5, 24.5),
    'Andhra Pradesh': (17.5, 28.5),
    'Karnataka': (10.5, 29.5),
    'Kerala': (10.5, 36.0),
    'Tamil Nadu': (14.5, 36.0),
    'Puducherry': (16.0, 34.5),
    'Assam': (28.0, 12.5),
    'Arunachal Pradesh': (31.0, 10.0),
    'Nagaland': (31.5, 12.5),
    'Manipur': (31.0, 14.5),
    'Mizoram': (30.0, 16.5),
    'Tripura': (28.0, 16.5),
    'Meghalaya': (27.5, 14.5),
    'Andaman And Nicobar Islands': (27.0, 31.0),
    'Lakshadweep': (6.5, 35.5)
}

print("State centroids defined:", len(STATE_CENTROIDS))
