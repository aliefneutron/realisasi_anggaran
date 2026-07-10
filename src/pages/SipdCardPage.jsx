import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import SipdCardView from '../components/SipdCardView';
import { getPuskesmasData } from '../services/api';
import './SipdCardPage.css';

const SipdCardPage = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [puskesmasData, setPuskesmasData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPuskesmasData();
  }, []);

  const loadPuskesmasData = async () => {
    try {
      setLoading(true);
      const response = await getPuskesmasData();
      if (response.success) {
        setPuskesmasData(response.data);
      }
    } catch (error) {
      message.error('Gagal memuat data puskesmas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePuskesmasTotal = () => {
    const totalPagu = puskesmasData.reduce((sum, item) => sum + item.pagu, 0);
    const totalRealisasi = puskesmasData.reduce((sum, item) => sum + item.realisasi, 0);
    const totalPercentage = totalPagu > 0 ? (totalRealisasi / totalPagu) * 100 : 0;

    return {
      totalPagu,
      totalRealisasi,
      totalSaldo: totalPagu - totalRealisasi,
      totalPercentage,
      totalItems: puskesmasData.length
    };
  };

  const totals = calculatePuskesmasTotal();

  const handleCardClick = (item) => {
    setSelectedCard(item);
    console.log('Card clicked:', item);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="sipd-card-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            🏥 Daftar Unit SKPD - Puskesmas Kabupaten Sumenep
          </h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Total Anggaran:</span>
              <span className="stat-value pagu">{formatCurrency(totals.totalPagu)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Realisasi:</span>
              <span className="stat-value realisasi">{formatCurrency(totals.totalRealisasi)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Persentase:</span>
              <span className="stat-value percentage">{totals.totalPercentage.toFixed(2)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Jumlah Unit:</span>
              <span className="stat-value count">{totals.totalItems} Unit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <nav className="breadcrumb">
          <a href="/" className="breadcrumb-item">🏠 Dashboard</a>
          <span className="breadcrumb-separator">›</span>
          <a href="/hierarchy" className="breadcrumb-item">🏢 SKPD</a>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item current">🏥 Dinas Kesehatan</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item current">📋 Unit SKPD</span>
        </nav>
      </div>

      {/* Filter and Search */}
      <div className="filter-section">
        <div className="filter-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Cari nama puskesmas atau kode rekening..."
              className="search-input"
            />
          </div>
          <div className="filter-options">
            <select className="filter-select">
              <option value="">Semua Status</option>
              <option value="tinggi">Realisasi Tinggi (≥90%)</option>
              <option value="normal">Realisasi Normal (≥70%)</option>
              <option value="rendah">Realisasi Rendah (≥50%)</option>
              <option value="kritis">Realisasi Kritis (&lt;50%)</option>
            </select>
            <select className="filter-select">
              <option value="">Urutkan</option>
              <option value="name-asc">Nama A-Z</option>
              <option value="name-desc">Nama Z-A</option>
              <option value="budget-desc">Anggaran Tertinggi</option>
              <option value="budget-asc">Anggaran Terendah</option>
              <option value="realization-desc">Realisasi Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card View */}
      <SipdCardView
        data={puskesmasData}
        onCardClick={handleCardClick}
      />

      {/* Selected Card Detail Modal */}
      {selectedCard && (
        <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Detail {selectedCard.name}</h3>
              <button
                className="modal-close"
                onClick={() => setSelectedCard(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Nama Unit:</span>
                  <span className="detail-value">{selectedCard.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Kode Rekening:</span>
                  <span className="detail-value code">{selectedCard.kode_rekening}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Anggaran:</span>
                  <span className="detail-value pagu">{formatCurrency(selectedCard.pagu)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Realisasi:</span>
                  <span className="detail-value realisasi">{formatCurrency(selectedCard.realisasi)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Saldo:</span>
                  <span className="detail-value saldo">{formatCurrency(selectedCard.pagu - selectedCard.realisasi)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Persentase Realisasi:</span>
                  <span className="detail-value percentage">
                    {((selectedCard.realisasi / selectedCard.pagu) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-primary">📊 Lihat Detail Program</button>
                <button className="btn-secondary">📈 Lihat Grafik</button>
                <button className="btn-secondary">📋 Export Data</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SipdCardPage;
