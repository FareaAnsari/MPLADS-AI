import glob, os, json, sys, re
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')

mps_ls = pd.read_csv('Dataset/Allocated Limit for Honble MPs.csv')
mps_rs = pd.read_csv('Dataset/Allocated Limit for Honble MPs RajyaSabha (1).csv')

print(f"LS count: {len(mps_ls)}, RS count: {len(mps_rs)}")
print("LS cols:", list(mps_ls.columns))
print("RS cols:", list(mps_rs.columns))

works_files = glob.glob('Dataset/Works Completed*.csv')
works = pd.concat([pd.read_csv(f) for f in works_files], ignore_index=True)
print(f"Total works: {len(works)}, cols: {list(works.columns)}")

exp_files = glob.glob('Dataset/Expenditure on Completed*.csv')
exp = pd.concat([pd.read_csv(f) for f in exp_files], ignore_index=True)
print(f"Total exp: {len(exp)}, cols: {list(exp.columns)}")

# Sample matches
print("\nSample MP match from Lok Sabha:")
sample_mp = mps_ls.iloc[0]
print(sample_mp.to_dict())

sample_name = sample_mp["Hon'ble Members of Parliament"]
w_match = works[works["Hon'ble Members of Parliament"].astype(str).str.strip().str.upper() == str(sample_name).strip().upper()]
e_match = exp[exp["MP Name"].astype(str).str.strip().str.upper() == str(sample_name).strip().upper()]
print(f"Works matched for {sample_name}: {len(w_match)}")
print(f"Exp matched for {sample_name}: {len(e_match)}")
