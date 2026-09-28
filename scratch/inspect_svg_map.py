import re
import json

with open(r'C:\Users\FAREA\.gemini\antigravity-ide\brain\4a8f0058-c0eb-4ebd-9944-e146288555e2\.system_generated\steps\549\content.md', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export default (\{.*\})', text, re.DOTALL)
if m:
    data = json.loads(m.group(1))
    print('Label:', data.get('label'))
    print('ViewBox:', data.get('viewBox'))
    locs = data.get('locations', [])
    print(f'Total locations: {len(locs)}')
    for loc in locs:
        print(f"  - {loc['id']}: {loc['name']}")
