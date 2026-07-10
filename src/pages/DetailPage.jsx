import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin, message, Button, Space, Upload } from 'antd';
import { PlusOutlined, ReloadOutlined, FileExcelOutlined, UploadOutlined } from '@ant-design/icons';

// Components
import Filters from '../components/Filters';
import BudgetTable from '../components/BudgetTable';
import BudgetFormModal from '../components/BudgetFormModal';
import RealizationInputForm from '../components/RealizationInputForm';

// Services & Utils
import { getBudgetData, getFilterOptions, createBudgetItem, updateBudgetItem, deleteBudgetItem } from '../services/api';
import { processBudgetData, filterData, exportToXLSX, parseXLSXFile } from '../utils/helpers';

const DetailPage = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ semesters: [], bidangs: [] });
  const [currentFilters, setCurrentFilters] = useState({
    semester: 'all',
    bidang: [],
    search: ''
  });

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'view', or 'edit'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Realization form state
  const [showRealizationForm, setShowRealizationForm] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load data and filter options
      const [budgetResponse, filterResponse] = await Promise.all([
        getBudgetData(),
        getFilterOptions()
      ]);

      if (budgetResponse.success) {
        const processedData = processBudgetData(budgetResponse.data);
        setData(processedData);
        setFilteredData(processedData);
      }

      if (filterResponse.success) {
        setFilterOptions(filterResponse.data);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Gagal memuat data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle realization save
  const handleRealizationSave = async (realizationData) => {
    try {
      // Update each belanja item with new realization
      for (const belanjaItem of realizationData.belanja) {
        await updateBudgetItem(belanjaItem.belanjaId, {
          realisasi: belanjaItem.realisasi
        });
      }

      // Reload data to reflect changes
      await loadData();

      // Hide form after successful save
      setShowRealizationForm(false);

      message.success('Data realisasi berhasil disimpan!');
    } catch (error) {
      message.error('Gagal menyimpan data realisasi');
      console.error(error);
      throw error;
    }
  };

  // Handle filter changes
  const handleFilterChange = useCallback((filters) => {
    setCurrentFilters(filters);

    // Apply filters to data
    const filtered = filterData(data, filters);
    setFilteredData(filtered);
  }, [data]);

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

  const handleDelete = async (id) => {
    try {
      const response = await deleteBudgetItem(id);
      if (response.success) {
        message.success('Data berhasil dihapus');
        loadData(); // Refresh data
      }
    } catch (error) {
      message.error('Gagal menghapus data: ' + error.message);
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedRecord(null);
    setIsModalVisible(true);
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = () => {
    try {
      if (filteredData.length === 0) {
        message.warning('Tidak ada data untuk diekspor.');
        return;
      }
      exportToXLSX(filteredData, 'detail_anggaran.xlsx');
      message.success('Data berhasil diekspor ke format XLSX.');
    } catch (error) {
      message.error('Gagal mengekspor data: ' + error.message);
    }
  };

  const handleImport = async (file) => {
    if (!file) return;

    const key = 'updatable';
    message.loading({ content: 'Mengimpor data...', key });

    try {
      const parsedData = await parseXLSXFile(file);
      const processedNewData = processBudgetData(parsedData);

      // Create the final combined dataset
      const combinedData = [...data, ...processedNewData];

      // Update the main data state
      setData(combinedData);

      // Manually re-apply filters to the newly combined data
      const newlyFilteredData = filterData(combinedData, currentFilters);
      setFilteredData(newlyFilteredData);

      message.success({ content: `${parsedData.length} data berhasil diimpor!`, key, duration: 2 });
    } catch (error) {
      message.error({ content: `Gagal mengimpor data: ${error.message}`, key, duration: 4 });
    }

    // Return false to prevent default upload behavior
    return false;
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

  const handleModalOk = async (values) => {
    try {
      setIsSubmitting(true);
      let response;
      if (modalMode === 'add') {
        response = await createBudgetItem(values);
      } else {
        response = await updateBudgetItem(values.id, values);
      }

      if (response.success) {
        message.success(`Data berhasil ${modalMode === 'add' ? 'ditambahkan' : 'diperbarui'}`);
        setIsModalVisible(false);
        loadData(); // Refresh data
      }
    } catch (error) {
      message.error('Gagal menyimpan data: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="detail-page-container" style={{ padding: '24px' }}>
      {/* Page Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            Input Data Realisasi Anggaran
          </h1>
        </Col>
        <Col>
          <Space>
            <Button
              type={showRealizationForm ? 'default' : 'primary'}
              icon={<PlusOutlined />}
              onClick={() => setShowRealizationForm(!showRealizationForm)}
            >
              {showRealizationForm ? 'Tutup Form' : 'Tambah Realisasi'}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Upload
              name="file"
              accept=".xlsx, .xls"
              showUploadList={false}
              beforeUpload={handleImport}
              customRequest={({ file, onSuccess }) => { // Dummy request
                setTimeout(() => {
                  onSuccess("ok");
                }, 0);
              }}
            >
              <Button icon={<UploadOutlined />}>
                Import XLSX
              </Button>
            </Upload>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Tambah Data
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Realization Input Form */}
      {showRealizationForm && (
        <RealizationInputForm onSave={handleRealizationSave} />
      )}

      {/* Filters */}
      <Filters
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        loading={loading}
      />

      {/* Data Table */}
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
            size="default"
          />
        </Col>
      </Row>

      {/* Modal for Add/View/Edit */}
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

export default DetailPage;
