import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Spin, message } from 'antd';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Components
import DashboardSummary from '../components/DashboardSummary';
import Filters from '../components/Filters';
import BudgetTable from '../components/BudgetTable';
import BudgetFormModal from '../components/BudgetFormModal';

// Services & Utils
import { getBudgetData, getFilterOptions, updateBudgetItem, getSummaryTotals, getAllRealizationHistory } from '../services/api';
import { processBudgetData, calculateSummary, filterData, generateChartData } from '../utils/helpers';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const getCurrentSemester = () => {
  const month = new Date().getMonth();
  return month < 6 ? 'Semester 1' : 'Semester 2';
};

const HomePage = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [summary, setSummary] = useState({});
  const [exactTotals, setExactTotals] = useState({});
  const [filterOptions, setFilterOptions] = useState({ semesters: [], bidangs: [] });
  const [currentFilters, setCurrentFilters] = useState({
    semester: getCurrentSemester(),
    bidang: [],
    search: ''
  });

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load data and filter options in parallel
      const [budgetResponse, filterResponse, summaryResponse, historyResponse] = await Promise.all([
        getBudgetData(),
        getFilterOptions(),
        getSummaryTotals(),
        getAllRealizationHistory()
      ]);

      let currentHistoryData = [];
      if (historyResponse.success) {
        currentHistoryData = historyResponse.data;
        setHistoryData(currentHistoryData);
      }

      let loadedExactTotals = {};
      if (summaryResponse.success) {
        loadedExactTotals = summaryResponse.data;
        setExactTotals(loadedExactTotals);
      }

      if (budgetResponse.success) {
        const processedData = processBudgetData(budgetResponse.data);
        setData(processedData);
        
        const initialFiltered = filterData(processedData, currentFilters, currentHistoryData);
        setFilteredData(initialFiltered);
        
        const baseSummary = calculateSummary(initialFiltered);
        if (loadedExactTotals['DINKES_INDUK']) {
          baseSummary.totalPagu = loadedExactTotals['DINKES_INDUK'].pagu;
          baseSummary.totalRealisasi = loadedExactTotals['DINKES_INDUK'].realisasi;
          baseSummary.totalSisa = baseSummary.totalPagu - baseSummary.totalRealisasi;
          baseSummary.averagePercentage = baseSummary.totalPagu > 0 ? (baseSummary.totalRealisasi / baseSummary.totalPagu) * 100 : 0;
        }
        setSummary(baseSummary);
      }

      if (filterResponse.success) {
        setFilterOptions(filterResponse.data);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      message.error('Gagal memuat data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = useCallback((filters) => {
    setCurrentFilters(filters);
    
    // Apply filters to data
    const filtered = filterData(data, filters, historyData);
    setFilteredData(filtered);
    
    const newSummary = calculateSummary(filtered);
    
    // Override totals if specific Bidang is selected, or if 'all' is selected
    if (filters.bidang && filters.bidang.length === 1) {
      const selectedBidang = filters.bidang[0];
      if (exactTotals[selectedBidang]) {
        newSummary.totalPagu = exactTotals[selectedBidang].pagu;
        newSummary.totalRealisasi = exactTotals[selectedBidang].realisasi;
        newSummary.totalSisa = newSummary.totalPagu - newSummary.totalRealisasi;
        newSummary.averagePercentage = newSummary.totalPagu > 0 ? (newSummary.totalRealisasi / newSummary.totalPagu) * 100 : 0;
      }
    } else if (!filters.bidang || filters.bidang.length === 0) {
      if (exactTotals['DINKES_INDUK']) {
        newSummary.totalPagu = exactTotals['DINKES_INDUK'].pagu;
        newSummary.totalRealisasi = exactTotals['DINKES_INDUK'].realisasi;
        newSummary.totalSisa = newSummary.totalPagu - newSummary.totalRealisasi;
        newSummary.averagePercentage = newSummary.totalPagu > 0 ? (newSummary.totalRealisasi / newSummary.totalPagu) * 100 : 0;
      }
    }
    
    setSummary(newSummary);
  }, [data, exactTotals, historyData]);

  // Chart configurations
  const barChartData = generateChartData(filteredData, 'bidang');
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Perbandingan Pagu vs Realisasi per Bidang',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const formatted = new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
            return `${context.dataset.label}: ${formatted}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (value >= 1000000000) {
              return (value / 1000000000).toFixed(1) + 'B';
            } else if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        }
      }
    },
    layout: {
      padding: {
        bottom: 20
      }
    }
  };

  // Pie chart data for status distribution
  const statusCounts = {
    'Sesuai Target': summary.onTrackCount || 0,
    'Di Bawah Target': summary.underBudgetCount || 0,
    'Melebihi Anggaran': summary.overBudgetCount || 0
  };

  const pieChartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(82, 196, 26, 0.8)',
          'rgba(24, 144, 255, 0.8)',
          'rgba(255, 77, 79, 0.8)'
        ],
        borderColor: [
          'rgba(82, 196, 26, 1)',
          'rgba(24, 144, 255, 1)',
          'rgba(255, 77, 79, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Distribusi Status Kegiatan',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    layout: {
      padding: {
        bottom: 20
      }
    }
  };

  // Handle table actions
  const handleView = (record) => {
    setModalMode('view');
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    // Delete record
    console.log('Delete record:', id);
    const newData = data.filter(item => item.id !== id);
    setData(newData);
    // Re-apply filters
    const filtered = filterData(newData, currentFilters, historyData);
    setFilteredData(filtered);
    message.success('Data berhasil dihapus');
  };

  const handleModalOk = async (values) => {
    try {
      setIsSubmitting(true);
      const response = await updateBudgetItem(values.id, values);
      if (response.success) {
        // Update data in state
        const updatedData = data.map(item => 
          item.id === values.id ? processBudgetData([response.data])[0] : item
        );
        setData(updatedData);
        // Re-apply filters
        const filtered = filterData(updatedData, currentFilters, historyData);
        setFilteredData(filtered);
        message.success('Data berhasil diperbarui');
        setIsModalVisible(false);
      }
    } catch (error) {
      message.error('Gagal memperbarui data: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Spin size="large" tip="Memuat data..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Filters */}
      <Filters
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        loading={loading}
      />

      {/* Dashboard Summary */}
      <DashboardSummary 
        summary={summary} 
        loading={loading} 
      />

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Grafik Perbandingan Anggaran" 
            className="chart-container"
            style={{ height: '400px' }}
            bodyStyle={{ paddingBottom: '32px' }}
          >
            <div style={{ height: '300px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title="Status Distribusi" 
            className="chart-container"
            style={{ height: '400px' }}
            bodyStyle={{ paddingBottom: '32px' }}
          >
            <div style={{ height: '300px' }}>
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Summary Table */}
      <Row>
        <Col span={24}>
          <BudgetTable
            data={filteredData}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showActions={true}
            pagination={true}
            size="small"
          />
        </Col>
      </Row>

      {/* Modal for View/Edit */}
      <BudgetFormModal
        visible={isModalVisible}
        mode={modalMode}
        record={selectedRecord}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        loading={isSubmitting}
        filterOptions={filterOptions}
      />
    </div>
  );
};

export default HomePage;
