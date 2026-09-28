import json
import math
import numpy as np
from scipy.optimize import linear_sum_assignment

# 1. Load Lok Sabha MP data
with open('src/data/allMpsDetailed.json', 'r', encoding='utf-8') as f:
    all_mps = json.load(f)

ls_mps = [m for m in all_mps if m['house'] == 'Lok Sabha']
print(f"Loaded {len(ls_mps)} Lok Sabha MPs.")

# Group by state
by_state = {}
for m in ls_mps:
    by_state.setdefault(m['state'], []).append(m)

# State counts:
state_counts = {st: len(mps) for st, mps in by_state.items()}
total_seats = sum(state_counts.values())
print(f"Total seats: {total_seats} across {len(state_counts)} states.")
