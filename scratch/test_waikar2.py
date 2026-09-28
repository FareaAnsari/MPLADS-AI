import glob, os, json, sys, re
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')

mps_ls = pd.read_csv('Dataset/Allocated Limit for Honble MPs.csv')
exp = pd.concat([pd.read_csv(f) for f in glob.glob('Dataset/Expenditure on Completed*.csv')], ignore_index=True)

waikar_row = mps_ls[mps_ls["Hon'ble Members of Parliaments"].str.contains('WAIKAR', case=False, na=False)].iloc[0]
print("Waikar Details:")
print("Name:", waikar_row["Hon'ble Members of Parliaments"])
print("State:", waikar_row["State"])
print("Constituency:", waikar_row["Constituency"])
print("Allocated Amount:", waikar_row.iloc[4])

amt_col = [c for c in exp.columns if 'Fund Disbursed' in c or 'Disbursed' in c][0]
e_waikar = exp[exp["Hon'ble Members of Parliament"].str.contains('WAIKAR', case=False, na=False)]

def clean_amt(val):
    if pd.isna(val) or val is None: return 0.0
    val_str = str(val).replace(',', '').replace('?', '').strip()
    try: return float(val_str)
    except: return 0.0

total_exp = sum(clean_amt(x) for x in e_waikar[amt_col])
print(f"Unique works in expenditure for Waikar: {e_waikar['Work'].nunique()}")
print(f"Total Disbursement sum: ?{total_exp:,.2f}")
print("Expenditure records preview:")
for idx, r in e_waikar.head(5).iterrows():
    print(r['Work ID'], '|', r['Work'][:40], '|', clean_amt(r[amt_col]), '|', r['Vendor Name'])
