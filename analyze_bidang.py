import openpyxl

# Load the Excel file
wb = openpyxl.load_workbook(r'C:\Users\ALIEF COMPUTER\Downloads\Realisasi Keuangan\Realisasi Keuangan\data\REALISASI BELANJA DINKES.xlsx', read_only=True, data_only=True)
ws = wb.active

print("Analyzing rows with Bidang information...")
print("=" * 120)

# Skip header rows (rows 1-9)
data_rows = list(ws.iter_rows(min_row=10, max_row=100, values_only=True))

for i, row in enumerate(data_rows, start=10):
    bidang_col = row[14] if len(row) > 14 else None
    
    # Only show rows that have Bidang information
    if bidang_col and str(bidang_col) != "None" and bidang_col != "PPTK":
        kode = str(row[0]) if row[0] else ""
        kode_full = str(row[1]) if row[1] else ""
        kode_program = str(row[2]) if row[2] else ""
        uraian = str(row[4])[:100] if row[4] else ""
        
        print(f"Row {i}:")
        print(f"  Kode: '{kode}' | Kode Full: '{kode_full}' | Kode Program: '{kode_program}'")
        print(f"  Uraian: {uraian}")
        print(f"  BIDANG: {bidang_col}")
        print()

wb.close()
