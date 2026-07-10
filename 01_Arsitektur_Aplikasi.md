# Arsitektur Aplikasi Monitoring Anggaran

## 1. Overview Aplikasi
Aplikasi Monitoring Anggaran adalah sistem berbasis web yang memungkinkan pengguna untuk memantau realisasi anggaran secara real-time dengan dashboard interaktif dan tabel detail.

## 2. Arsitektur Sistem

### 2.1 Arsitektur 3-Layer
```
┌─────────────────────────────────────┐
│         PRESENTATION LAYER          │
│  (Dashboard, Tables, Filters, UI)   │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│          BUSINESS LAYER             │
│  (Calculations, Aggregations,       │
│   Filtering Logic, Validations)     │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│           DATA LAYER                │
│  (Excel/Google Sheets Integration,  │
│   Data Storage, CRUD Operations)    │
└─────────────────────────────────────┘
```

### 2.2 Komponen Utama

#### A. Dashboard Component
- **KPI Cards**: Total Pagu, Realisasi, Sisa Dana, Persentase
- **Filter Controls**: Semester, Bidang
- **Visualizations**: Progress bars, bar charts
- **Summary Statistics**: Aggregated data per filter

#### B. Data Table Component
- **Interactive Table**: Sortable, searchable, paginated
- **Columns**: Nama Kegiatan, Kode Rekening, Pagu, Realisasi, Sisa, %
- **Row Actions**: View details, edit (if permitted)
- **Export Functions**: Excel, PDF export

#### C. Filter & Search Component
- **Semester Filter**: Dropdown (Semester 1, Semester 2, All)
- **Bidang Filter**: Multi-select dropdown
- **Search Box**: Global search across all fields
- **Reset Filters**: Clear all applied filters

## 3. Data Flow Architecture

```
Excel File → Data Import → Data Validation → 
Data Processing → Business Logic → UI Components → User Interface
```

### 3.1 Data Processing Pipeline
1. **Data Import**: Excel file upload/sync
2. **Data Validation**: Check required fields, data types
3. **Data Transformation**: Calculate derived fields (Sisa, Persentase)
4. **Data Aggregation**: Summary calculations for dashboard
5. **Data Presentation**: Format for UI display

## 4. Responsive Design Architecture

### 4.1 Breakpoints
- **Mobile**: < 768px (Stack components vertically)
- **Tablet**: 768px - 1024px (2-column layout)
- **Desktop**: > 1024px (Full dashboard layout)

### 4.2 Component Responsiveness
- **Dashboard**: Cards stack on mobile, grid on desktop
- **Table**: Horizontal scroll on mobile, full view on desktop
- **Filters**: Collapsible sidebar on mobile, fixed on desktop

## 5. Security & Performance

### 5.1 Security Measures
- **Data Access Control**: Role-based permissions
- **Input Validation**: Sanitize all user inputs
- **Data Encryption**: Secure data transmission
- **Audit Trail**: Log all data changes

### 5.2 Performance Optimization
- **Data Caching**: Cache aggregated results
- **Lazy Loading**: Load data on demand
- **Pagination**: Limit table rows per page
- **Compression**: Minimize data transfer

## 6. Integration Points

### 6.1 Data Sources
- **Primary**: Excel file upload
- **Secondary**: Google Sheets API (optional)
- **Future**: Database integration (MySQL, PostgreSQL)

### 6.2 Export Capabilities
- **Excel Export**: Filtered data export
- **PDF Reports**: Formatted reports with charts
- **Email Reports**: Scheduled report delivery
