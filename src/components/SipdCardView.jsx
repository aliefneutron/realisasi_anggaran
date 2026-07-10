import React, { useState } from 'react';
import './SipdCardView.css';

const SipdCardView = ({ data, onCardClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate percentage
  const calculatePercentage = (realisasi, pagu) => {
    if (!pagu || pagu === 0) return 0;
    return (realisasi / pagu) * 100;
  };

  // Get status color based on percentage
  const getStatusColor = (percentage) => {
    if (percentage >= 90) return '#22c55e';
    if (percentage >= 70) return '#eab308';
    if (percentage >= 50) return '#f97316';
    if (percentage > 0) return '#ef4444';
    return '#6b7280';
  };

  // Flatten data to get all items for card display
  const flattenData = (items) => {
    let result = [];
    items.forEach(item => {
      result.push(item);
      if (item.children) {
        result = result.concat(flattenData(item.children));
      }
    });
    return result;
  };

  const allItems = flattenData(data);
  const totalItems = allItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = allItems.slice(startIndex, endIndex);

  const handleCardClick = (item) => {
    if (onCardClick) {
      onCardClick(item);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="sipd-card-view">
      {/* Header */}
      <div className="card-view-header">
        <h2>📋 Daftar Unit SKPD</h2>
        <div className="header-info">
          <span>Menampilkan data ke- {startIndex + 1} dari {totalItems} data</span>
          <span className="data-count">{totalItems} Data</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="cards-grid">
        {currentItems.map((item) => {
          const percentage = calculatePercentage(item.realisasi, item.pagu);
          const statusColor = getStatusColor(percentage);
          
          return (
            <div 
              key={item.id} 
              className="sipd-card"
              onClick={() => handleCardClick(item)}
            >
              <div className="card-header">
                <h3 className="card-title">{item.name}</h3>
                <span className="card-type">{item.level === 'skpd' ? 'SKPD' : 'Unit SKPD'}</span>
              </div>
              
              <div className="card-code">
                <span className="code-label">Kode:</span>
                <span className="code-value">{item.kode_rekening}</span>
              </div>

              <div className="card-budget">
                <div className="budget-item">
                  <span className="budget-amount">{formatCurrency(item.pagu)}</span>
                  <span className="budget-label">Anggaran</span>
                </div>
                
                <div className="budget-percentage">
                  <span 
                    className="percentage-value"
                    style={{ color: statusColor }}
                  >
                    {percentage.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="card-realization">
                <span className="realization-amount">{formatCurrency(item.realisasi)}</span>
                <span className="realization-label">Realisasi Rill</span>
              </div>

              {/* Progress bar */}
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: statusColor
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Sebelumnya
        </button>
        
        <div className="pagination-numbers">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-number ${page === currentPage ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button 
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Selanjutnya
        </button>
      </div>

      {/* Footer Info */}
      <div className="card-view-footer">
        <div className="footer-info">
          <h4>📚 Panduan Aplikasi</h4>
          <p>
            Panduan ini dirancang untuk memberikan panduan langkah demi langkah, tips, dan saran yang berguna 
            agar pengguna dapat menggunakan aplikasi secara efisien dan efektif. Dengan pemahaman yang mendalam 
            tentang aplikasi ini, pengguna diharapkan dapat memanfaatkan seluruh fitur dan fungsionalitas yang tersedia, 
            sehingga dapat mencapai hasil yang optimal.
          </p>
          <button className="download-btn">📥 Unduh Sekarang</button>
        </div>
        
        <div className="footer-links">
          <a href="#" className="footer-link">SIPD Penatausahaan</a>
          <a href="#" className="footer-link">Tentang SIPD</a>
          <a href="#" className="footer-link">Helpdesk</a>
          <a href="#" className="footer-link">Buku Panduan</a>
          <a href="#" className="footer-link">Video Tutorial</a>
          <a href="#" className="footer-link">Seputar SIPD</a>
        </div>
      </div>
    </div>
  );
};

export default SipdCardView;
