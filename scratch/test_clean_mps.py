import pandas as pd, glob, sys, re, json
sys.stdout.reconfigure(encoding='utf-8')

# Read CSVs with explicit utf-8 or binary-safe
mps_ls = pd.read_csv('Dataset/Allocated Limit for Honble MPs.csv')
mps_rs = pd.read_csv('Dataset/Allocated Limit for Honble MPs RajyaSabha (1).csv')

print("Lok Sabha columns:", list(mps_ls.columns))
print("Rajya Sabha columns:", list(mps_rs.columns))

# Use iloc[4] for allocated amount
for i in range(5):
    r = mps_ls.iloc[i]
    print(r.iloc[0], '|', r.iloc[1], '|', r.iloc[2], '|', r.iloc[3], '|', r.iloc[4])

print("\nRajya Sabha:")
for i in range(5):
    r = mps_rs.iloc[i]
    print(r.iloc[0], '|', r.iloc[1], '|', r.iloc[2], '|', r.iloc[3], '|', r.iloc[4])
