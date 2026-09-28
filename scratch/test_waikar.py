import glob, os, json, sys, re
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')

mps_ls = pd.read_csv('Dataset/Allocated Limit for Honble MPs.csv')
mps_rs = pd.read_csv('Dataset/Allocated Limit for Honble MPs RajyaSabha (1).csv')
works = pd.concat([pd.read_csv(f) for f in glob.glob('Dataset/Works Completed*.csv')], ignore_index=True)
exp = pd.concat([pd.read_csv(f) for f in glob.glob('Dataset/Expenditure on Completed*.csv')], ignore_index=True)

# Find Waikar in LS
waikar_row = mps_ls[mps_ls["Hon'ble Members of Parliaments"].str.contains('WAIKAR|Ravindra', case=False, na=False)]
print("Waikar in LS:")
print(waikar_row)

w_waikar = works[works["Hon'ble Members of Parliament"].str.contains('WAIKAR|Ravindra', case=False, na=False)]
print(f"\nWorks count for Waikar: {len(w_waikar)}")

e_waikar = exp[exp["Hon'ble Members of Parliament"].str.contains('WAIKAR|Ravindra', case=False, na=False)]
print(f"Exp records for Waikar: {len(e_waikar)}")

def clean_amt(val):
    if pd.isna(val) or val is None: return 0.0
    val_str = str(val).replace(',', '').replace('?', '').strip()
    try: return float(val_str)
    except: return 0.0

total_exp = sum(clean_amt(x) for x in e_waikar['Fund Disbursed Amount ( ? )'])
print(f"Total Expenditure sum: ?{total_exp:,.2f}")
