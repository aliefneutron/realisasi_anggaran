import openpyxl
import json
from collections import defaultdict

# Load the Excel file
wb = openpyxl.load_workbook(r'C:\Users\ALIEF COMPUTER\Downloads\Realisasi Keuangan\Realisasi Keuangan\data\REALISASI BELANJA DINKES.xlsx', read_only=True, data_only=True)
ws = wb.active

print("Extracting complete Bidang-Program mapping...")
print("=" * 120)

# Skip header rows (rows 1-9)
data_rows = list(ws.iter_rows(min_row=10, values_only=True))

# Track unique Bidang values and their programs
bidang_programs = defaultdict(set)
current_program = None
current_bidang = None

for i, row in enumerate(data_rows, start=10):
    kode = str(row[0]) if row[0] else ""
    kode_full = str(row[1]) if row[1] else ""
    kode_program = str(row[2]) if row[2] else ""
    uraian = str(row[4]) if row[4] else ""
    bidang_col = row[14] if len(row) > 14 and row[14] else None
    
    # Update current bidang if found
    if bidang_col and str(bidang_col) != "None" and bidang_col != "PPTK":
        current_bidang = str(bidang_col).strip()
    
    # Detect Program level (has kode_program but not kode_kegiatan)
    # Program rows have format: kode='1.02', kode_full='1.02.2.14.0.00.01.0000', kode_program='1.02.01'
    if kode and kode_full and kode_program and len(kode_program.split('.')) == 3:
        # This is a Program row
        current_program = uraian
        if current_bidang:
            bidang_programs[current_bidang].add(current_program)
            print(f"Found: {current_bidang} -> {current_program[:80]}")

print("\n" + "=" * 120)
print("\nFINAL BIDANG-PROGRAM MAPPING:")
print("=" * 120)

# Convert sets to lists for JSON serialization
bidang_mapping = {}
for bidang, programs in sorted(bidang_programs.items()):
    bidang_mapping[bidang] = sorted(list(programs))
    print(f"\n{bidang} ({len(programs)} programs):")
    for prog in sorted(programs):
        print(f"  - {prog[:100]}")

# Save to JSON
output = {
    "bidang_program_mapping": bidang_mapping
}

with open('bidang_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("\n" + "=" * 120)
print(f"Total Bidang found: {len(bidang_mapping)}")
print("Mapping saved to bidang_mapping.json")

wb.close()
