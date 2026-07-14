import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, message } from 'antd';
import {
  DashboardOutlined,
  ExportOutlined,
  PlusOutlined,
  WalletOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  LineChartOutlined,
  FileTextOutlined,
  HomeOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  DownloadOutlined,
  RiseOutlined
} from '@ant-design/icons';
import HierarchicalMenu from './HierarchicalMenu';
import Breadcrumb from './Breadcrumb';
import DashboardSummary from './DashboardSummary';
import MonthlyRealizationChart from './MonthlyRealizationChart';
import { getHierarchicalData, updateHierarchicalData } from '../services/api';
import './HierarchicalDashboard.css';

const { Option } = Select;

const HierarchicalDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Load hierarchical data on mount
  useEffect(() => {
    loadHierarchicalData();
  }, []);

  const loadHierarchicalData = async () => {
    try {
      setLoading(true);
      const response = await getHierarchicalData();
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      message.error('Gagal memuat data hierarki: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  const [selectedNode, setSelectedNode] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    totalPagu: 0,
    totalRealisasi: 0,
    totalSaldo: 0,
    persentaseRealisasi: 0,
    jumlahKegiatan: 0
  });

  // Calculate dashboard metrics based on selected node
  const calculateMetrics = (node) => {
    if (!node) {
      // Calculate total metrics from root data
      const totalPagu = data.reduce((sum, item) => sum + (item.pagu || 0), 0);
      const totalRealisasi = data.reduce((sum, item) => sum + (item.realisasi || 0), 0);
      const totalSaldo = totalPagu - totalRealisasi;
      const persentaseRealisasi = totalPagu > 0 ? (totalRealisasi / totalPagu) * 100 : 0;

      return {
        totalPagu,
        totalRealisasi,
        totalSaldo,
        persentaseRealisasi,
        jumlahKegiatan: countAllNodes(data)
      };
    }

    // Calculate metrics for selected node and its children
    const totalPagu = calculateTotalPagu(node);
    const totalRealisasi = calculateTotalRealisasi(node);
    const totalSaldo = totalPagu - totalRealisasi;
    const persentaseRealisasi = totalPagu > 0 ? (totalRealisasi / totalPagu) * 100 : 0;
    const jumlahKegiatan = countNodes(node);

    return {
      totalPagu,
      totalRealisasi,
      totalSaldo,
      persentaseRealisasi,
      jumlahKegiatan
    };
  };

  // Helper function to calculate total pagu recursively
  const calculateTotalPagu = (node) => {
    let total = node.pagu || 0;
    if (node.children) {
      total += node.children.reduce((sum, child) => sum + calculateTotalPagu(child), 0);
    }
    return total;
  };

  // Helper function to calculate total realisasi recursively
  const calculateTotalRealisasi = (node) => {
    let total = node.realisasi || 0;
    if (node.children) {
      total += node.children.reduce((sum, child) => sum + calculateTotalRealisasi(child), 0);
    }
    return total;
  };

  // Helper function to count nodes
  const countNodes = (node) => {
    let count = 1;
    if (node.children) {
      count += node.children.reduce((sum, child) => sum + countNodes(child), 0);
    }
    return count;
  };

  // Helper function to count all nodes in data
  const countAllNodes = (data) => {
    return data.reduce((sum, item) => sum + countNodes(item), 0);
  };

  // Helper function to get path to node (assuming data structure allows this)
  const getPathToNode = (nodes, targetId, currentPath = []) => {
    for (const node of nodes) {
      const newPath = [...currentPath, node];
      if (node.id === targetId) {
        return newPath;
      }
      if (node.children) {
        const foundPath = getPathToNode(node.children, targetId, newPath);
        if (foundPath) {
          return foundPath;
        }
      }
    }
    return null;
  };

  // Handle node selection from menu
  const handleNodeSelect = (node) => {
    setSelectedNode(node);

    // Update breadcrumb path
    const path = getPathToNode(data, node.id); // Using local helper for now
    if (path) {
      setBreadcrumbPath(path); // Keep full path for SIPD structure
    }

    // Update dashboard metrics
    const metrics = calculateMetrics(node);
    setDashboardData(metrics);
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = (targetPath) => {
    if (targetPath.length === 0) {
      // Navigate to dashboard root
      setSelectedNode(null);
      setBreadcrumbPath([]);
      const metrics = calculateMetrics(null);
      setDashboardData(metrics);
    } else {
      // Navigate to specific node in path
      const targetNode = targetPath[targetPath.length - 1];
      setSelectedNode(targetNode);
      setBreadcrumbPath(targetPath);
      const metrics = calculateMetrics(targetNode);
      setDashboardData(metrics);
    }
  };

  // Initialize dashboard with root metrics
  useEffect(() => {
    if (data.length > 0) { // Only calculate if data is loaded
      const metrics = calculateMetrics(null);
      setDashboardData(metrics);
    }
  }, [data]); // Recalculate when data changes

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get status color based on percentage
  const getStatusColor = (percentage) => {
    if (percentage >= 90) return '#22c55e';
    if (percentage >= 70) return '#eab308';
    if (percentage >= 50) return '#f97316';
    return '#ef4444';
  };

  const getChildLevel = (currentLevel) => {
    switch (currentLevel) {
      case 'skpd': return 'bidang';
      case 'bidang': return 'program';
      case 'program': return 'kegiatan';
      case 'kegiatan': return 'sub_kegiatan';
      case 'sub_kegiatan': return 'belanja';
      default: return null;
    }
  };

  const determineLevel = (parentNode) => {
    if (!parentNode) return 'skpd'; // If no parent, it's a top-level SKPD
    return getChildLevel(parentNode.level);
  };

  const addNodeToHierarchy = (nodes, parentId, newNode) => {
    if (!parentId) {
      return [...nodes, newNode];
    }

    return nodes.map(node => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      }
      if (node.children) {
        return {
          ...node,
          children: addNodeToHierarchy(node.children, parentId, newNode)
        };
      }
      return node;
    });
  };

  const handleAddData = () => {
    if (selectedNode && selectedNode.level === 'belanja') {
      message.warning('Tidak dapat menambahkan data di bawah level Belanja');
      return;
    }

    const nextLevel = determineLevel(selectedNode);

    setIsModalVisible(true);
    // Reset form and set default values
    form.resetFields();
    form.setFieldsValue({
      level: nextLevel,
      pagu: 0,
      realisasi: 0
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newNode = {
        id: `new-${Date.now()}`,
        name: values.name,
        kode_rekening: values.kode_rekening,
        pagu: parseFloat(values.pagu),
        realisasi: parseFloat(values.realisasi),
        level: determineLevel(selectedNode),
        children: []
      };

      const updatedData = addNodeToHierarchy(data, selectedNode?.id, newNode);

      // Update via API
      const response = await updateHierarchicalData(updatedData);
      if (response.success) {
        setData(updatedData);
        setIsModalVisible(false);
        form.resetFields();
        message.success('Data berhasil ditambahkan');
      }
    } catch (error) {
      if (error.errorFields) {
        console.log('Validate Failed:', error);
      } else {
        message.error('Gagal menambahkan data: ' + error.message);
      }
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="hierarchical-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <DashboardOutlined /> Monitoring Anggaran - Dashboard Hierarki
          </h1>
          <div className="header-actions">
            <button className="btn-primary" onClick={handleAddData}>
              <PlusOutlined /> Tambah Data
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb
        path={breadcrumbPath}
        onNavigate={handleBreadcrumbNavigate}
      />

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Sidebar - Hierarchical Menu */}
        <div className="dashboard-sidebar">
          <HierarchicalMenu
            data={data}
            onNodeSelect={handleNodeSelect}
            selectedNode={selectedNode}
          />
        </div>

        {/* Right Content Area */}
        <div className="dashboard-main">
          {/* KPI Cards */}
          <div className="kpi-section">
            <div className="kpi-header">
              <h2>
                {selectedNode ? <span><RiseOutlined /> Ringkasan: {selectedNode.name}</span> : <span><RiseOutlined /> Ringkasan Keseluruhan</span>}
              </h2>
              {selectedNode && selectedNode.kode_rekening && (
                <span className="kpi-code">Kode: {selectedNode.kode_rekening}</span>
              )}
            </div>

            <div className="kpi-cards">
              <div className="kpi-card pagu">
                <div className="kpi-icon"><WalletOutlined /></div>
                <div className="kpi-content">
                  <div className="kpi-label">Total Pagu</div>
                  <div className="kpi-value">{formatCurrency(dashboardData.totalPagu)}</div>
                </div>
              </div>

              <div className="kpi-card realisasi">
                <div className="kpi-icon"><BarChartOutlined /></div>
                <div className="kpi-content">
                  <div className="kpi-label">Total Realisasi</div>
                  <div className="kpi-value">{formatCurrency(dashboardData.totalRealisasi)}</div>
                </div>
              </div>

              <div className="kpi-card saldo">
                <div className="kpi-icon"><CreditCardOutlined /></div>
                <div className="kpi-content">
                  <div className="kpi-label">Saldo</div>
                  <div className="kpi-value">{formatCurrency(dashboardData.totalSaldo)}</div>
                </div>
              </div>

              <div className="kpi-card percentage">
                <div className="kpi-icon"><LineChartOutlined /></div>
                <div className="kpi-content">
                  <div className="kpi-label">% Realisasi</div>
                  <div
                    className="kpi-value"
                    style={{ color: getStatusColor(dashboardData.persentaseRealisasi) }}
                  >
                    {dashboardData.persentaseRealisasi.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="kpi-card count">
                <div className="kpi-icon"><FileTextOutlined /></div>
                <div className="kpi-content">
                  <div className="kpi-label">Jumlah Item</div>
                  <div className="kpi-value">{dashboardData.jumlahKegiatan}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="visualization-section">
            <div className="viz-header">
              <h3><BarChartOutlined /> Visualisasi Data</h3>
              <div className="viz-controls">
                <select className="viz-select">
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="line">Line Chart</option>
                </select>
              </div>
            </div>

            <div className="viz-content">
              {selectedNode ? (
                <div className="viz-container">
                  {selectedNode.monthly_targets ? (
                    <MonthlyRealizationChart
                      data={selectedNode}
                      title={`Realisasi vs Target: ${selectedNode.name}`}
                    />
                  ) : (
                    <div className="viz-placeholder">
                      <div className="viz-placeholder-content">
                        <div className="viz-placeholder-icon"><BarChartOutlined /></div>
                        <h4>Visualisasi untuk: {selectedNode.name}</h4>
                        <p>Data bulanan belum tersedia untuk level ini.</p>
                        <div className="viz-placeholder-stats">
                          <div className="stat-item">
                            <span className="stat-label">Pagu:</span>
                            <span className="stat-value">{formatCurrency(selectedNode.pagu || 0)}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Realisasi:</span>
                            <span className="stat-value">{formatCurrency(selectedNode.realisasi || 0)}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Persentase:</span>
                            <span
                              className="stat-value"
                              style={{ color: getStatusColor(((selectedNode.realisasi || 0) / (selectedNode.pagu || 1)) * 100) }}
                            >
                              {(((selectedNode.realisasi || 0) / (selectedNode.pagu || 1)) * 100).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="viz-placeholder">
                  <div className="viz-placeholder-content">
                    <div className="viz-placeholder-icon"><HomeOutlined /></div>
                    <h4>Dashboard Utama</h4>
                    <p>Pilih item dari menu hierarki untuk melihat detail visualisasi</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h3><ThunderboltOutlined /> Aksi Cepat</h3>
            <div className="quick-actions">
              <button className="quick-action-btn">
                <span className="action-icon"><FileTextOutlined /></span>
                <span className="action-text">Lihat Laporan</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon"><LineChartOutlined /></span>
                <span className="action-text">Analisis Trend</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon"><SettingOutlined /></span>
                <span className="action-text">Pengaturan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={selectedNode ? `Tambah Data di bawah ${selectedNode.name}` : "Tambah Data SKPD Baru"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Simpan"
        cancelText="Batal"
      >
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
        >
          <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: 'Level otomatis ditentukan' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: 'Mohon masukkan nama!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="kode_rekening"
            label="Kode Rekening"
            rules={[{ required: true, message: 'Mohon masukkan kode rekening!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="pagu"
            label="Pagu Anggaran"
            rules={[{ required: true, message: 'Mohon masukkan pagu anggaran!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={value => value.replace(/\Rp\s?|(\.*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="realisasi"
            label="Realisasi"
            rules={[{ required: true, message: 'Mohon masukkan realisasi!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={value => value.replace(/\Rp\s?|(\.*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HierarchicalDashboard;
