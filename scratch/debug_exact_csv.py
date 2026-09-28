import pandas as pd, glob, sys, re, json
sys.stdout.reconfigure(encoding='utf-8')

mps_ls = pd.read_csv('Dataset/Allocated Limit for Honble MPs.csv')
mps_rs = pd.read_csv('Dataset/Allocated Limit for Honble MPs RajyaSabha (1).csv')

print("Lok Sabha MP row 0-3:")
for idx, r in mps_ls.head(4).iterrows():
    print(r['Sr. No.'], '|', r['State'], '|', r["Hon'ble Members of Parliaments"], '|', r['Constituency'], '|', r['Allocated AMOUNT ( ? )'])

print("\nRajya Sabha MP row 0-3:")
for idx, r in mps_rs.head(4).iterrows():
    print(r['Sr. No.'], '|', r['State'], '|', r["Hon'ble Members of Parliament"], '|', r['Elected/Nominated'], '|', r['Allocated AMOUNT ( ? )'])
