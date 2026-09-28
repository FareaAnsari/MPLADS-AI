import csv
import sys
import json
from collections import Counter

# Rajya Sabha Official Constitutional Seats vs e-SAKSHI CSV Export
OFFICIAL_RS_SEATS = {
    'Andhra Pradesh': 11,
    'Arunachal Pradesh': 1,
    'Assam': 7,
    'Bihar': 16,
    'Chhattisgarh': 5,
    'Goa': 1,
    'Gujarat': 11,
    'Haryana': 5,
    'Himachal Pradesh': 3,
    'Jharkhand': 6,
    'Karnataka': 12,
    'Kerala': 9,
    'Madhya Pradesh': 11,
    'Maharashtra': 19,
    'Manipur': 1,
    'Meghalaya': 1,
    'Mizoram': 1,
    'Nagaland': 1,
    'Odisha': 10,
    'Punjab': 7,
    'Rajasthan': 10,
    'Sikkim': 1,
    'Tamil Nadu': 18,
    'Telangana': 7,
    'Tripura': 1,
    'Uttar Pradesh': 31,
    'Uttarakhand': 3,
    'West Bengal': 16,
    'Delhi': 3,
    'Jammu and Kashmir': 4, # Note: J&K 4 seats currently vacant since assembly dissolution
    'Puducherry': 1,
    'Nominated': 12
}

csv_counts = Counter()
existing_names = set()

with open('Dataset/Allocated Limit for Honble MPs RajyaSabha (1).csv', 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.reader(f)
    header = next(reader)
    for r in reader:
        if not r or len(r) < 5 or 'grand total' in r[0].lower() or 'grand total' in r[1].lower(): 
            continue
        st = r[1].strip()
        name = r[2].strip()
        cat = r[3].strip()
        existing_names.add(name.lower())
        if 'nominated' in cat.lower():
            csv_counts['Nominated'] += 1
        elif st:
            csv_counts[st] += 1

print("="*60)
print("RAJYA SABHA DATASET COMPLETENESS & AUDIT GAP ANALYSIS")
print("="*60)
print(f"Total Official Constitutional Seats : {sum(OFFICIAL_RS_SEATS.values())}")
print(f"Total MPs in MoSPI CSV Export       : {sum(csv_counts.values())}")
print(f"Total Net Gap / Missing Seats       : {sum(OFFICIAL_RS_SEATS.values()) - sum(csv_counts.values())}\n")

print(f"{'State / Category':<24} | {'Official':<8} | {'In CSV':<8} | {'Gap / Missing':<12}")
print("-"*60)
for st, official in sorted(OFFICIAL_RS_SEATS.items(), key=lambda x: (x[1] - csv_counts[x[0]]), reverse=True):
    in_csv = csv_counts.get(st, 0)
    gap = official - in_csv
    if gap != 0:
        print(f"{st:<24} | {official:<8} | {in_csv:<8} | {gap:<12}")

print("="*60)
