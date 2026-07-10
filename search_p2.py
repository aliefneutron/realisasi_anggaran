import openpyxl

# Load the Excel file
wb = openpyxl.load_workbook(r'C:\Users\ALIEF COMPUTER\Downloads\Realisasi Keuangan\Realisasi Keuangan\data\REALISASI BELANJA DINKES.xlsx', read_only=True, data_only=True)
ws = wb.active

print("Searching for P2 Bidang...")
print("=" * 120)

# Skip header rows (rows 1-9)
data_rows = list(ws.iter_rows(min_row=10, values_only=True))

found_p2 = False
for i, row in enumerate(data_rows, start=10):
    bidang_col = row[14] if len(row) > 14 and row[14] else None
    
    if bidang_col and 'P2' in str(bidang_col).upper():
        kode = str(row[0]) if row[0] else ""
        kode_full = str(row[1]) if row[1] else ""
        kode_program = str(row[2]) if row[2] else ""
        uraian = str(row[4])[:100] if row[4] else ""
        
        print(f"Row {i}:")
        print(f"  Kode: '{kode}' | Kode Full: '{kode_full}' | Kode Program: '{kode_program}'")
        print(f"  Uraian: {uraian}")
        print(f"  BIDANG: {bidang_col}")
        print()
        found_p2 = True

if not found_p2:
    print("P2 not found in Bidang column. Checking all unique Bidang values...")
    print()
    
    unique_bidangs = set()
    for row in data_rows:
        bidang_col = row[14] if len(row) > 14 and row[14] else None
        if bidang_col and str(bidang_col) != "None" and bidang_col != "PPTK":
            unique_bidangs.add(str(bidang_col).strip())
    
    print("All unique Bidang values found:")
    for bidang in sorted(unique_bidangs):
        if not bidang.startswith("Puskesmas") and bidang != "RSUD H. MOH. ANWAR":
            print(f"  - {bidang}")

wb.close()
