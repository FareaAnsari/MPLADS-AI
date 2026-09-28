import json
import math
from collections import deque

# Load all MPs
with open('src/data/allMpsDetailed.json', 'r', encoding='utf-8') as f:
    all_mps = json.load(f)

ls_mps = [m for m in all_mps if m['house'] == 'Lok Sabha']
print(f'Total Lok Sabha MPs: {len(ls_mps)}')

# Group MPs by state
by_state = {}
for m in ls_mps:
    by_state.setdefault(m['state'], []).append(m)

print(f'Total States: {len(by_state)}')
for st, mps in sorted(by_state.items(), key=lambda x: -len(x[1])):
    print(f'  {st}: {len(mps)}')
