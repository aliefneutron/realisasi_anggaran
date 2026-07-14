import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Progress, 
  Button, 
  Space, 
  Tooltip,
  Modal,
  message
} from 'antd';
import { 
  ExportOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import { 
  formatCurrency, 
  getStatusColor,
  exportToXLSX 
} from '../utils/helpers';
import { getLevelInfoByKodeRekening } from '../utils/bidangMapping';

const BudgetTable = ({ 
  data = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  showActions = true,
  pagination = true,
  size = 'default'
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Handle row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record) => ({
      disabled: record.disabled,
    }),
  };

  // Handle export
  const handleExport = () => {
    const exportData = selectedRowKeys.length > 0 
      ? data.filter(item => selectedRowKeys.includes(item.id))
      : data;

    if (exportData.length === 0) {
      message.warning('Tidak ada data untuk diekspor.');
      return;
    }

    try {
      exportToXLSX(exportData, `budget_data_${new Date().toISOString().split('T')[0]}.xlsx`);
      message.success(`${exportData.length} data berhasil diekspor ke format XLSX.`);
    } catch (error) {
      message.error('Gagal mengekspor data: ' + error.message);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Pilih data yang akan dihapus');
      return;
    }

    Modal.confirm({
      title: 'Konfirmasi Hapus',
      content: `Apakah Anda yakin ingin menghapus ${selectedRowKeys.length} data yang dipilih?`,
      okText: 'Ya, Hapus',
      cancelText: 'Batal',
      okType: 'danger',
      onOk: () => {
        // Handle bulk delete logic here
        selectedRowKeys.forEach(id => {
          if (onDelete) onDelete(id);
        });
        setSelectedRowKeys([]);
        message.success(`${selectedRowKeys.length} data berhasil dihapus`);
      }
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
      fixed: 'left'
    },
    {
      title: 'Nama Kegiatan',
      dataIndex: 'nama_kegiatan',
      key: 'nama_kegiatan',
      width: 250,
      fixed: 'left',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <div style={{ 
            fontWeight: 500,
            color: '#333'
          }}>
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Kode Rekening',
      dataIndex: 'kode_rekening',
      key: 'kode_rekening',
      width: 150,
      render: (text) => {
        const levelInfo = getLevelInfoByKodeRekening(text);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <code style={{ 
              background: '#f5f5f5', 
              padding: '2px 6px', 
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {text}
            </code>
            {levelInfo !== 'Unknown' && (
              <Tag color={
                levelInfo === 'Sub Kegiatan' ? 'purple' : 
                levelInfo === 'Jenis Belanja' ? 'orange' : 
                levelInfo === 'Detail Belanja' ? 'cyan' : 'default'
              } style={{ fontSize: '10px', width: 'fit-content', margin: 0 }}>
                {levelInfo}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Bidang',
      dataIndex: 'bidang',
      key: 'bidang',
      width: 100,
      render: (text) => (
        <Tag color="blue" style={{ fontSize: '11px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      width: 110,
      render: (text) => (
        <Tag color="green" style={{ fontSize: '11px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Pagu',
      dataIndex: 'pagu',
      key: 'pagu',
      width: 120,
      align: 'right',
      render: (value) => (
        <span className="currency-value">
          {formatCurrency(value)}
        </span>
      ),
      sorter: (a, b) => a.pagu - b.pagu,
    },
    {
      title: 'Realisasi',
      dataIndex: 'realisasi',
      key: 'realisasi',
      width: 120,
      align: 'right',
      render: (value) => (
        <span className="currency-value" style={{ color: '#52c41a' }}>
          {formatCurrency(value)}
        </span>
      ),
      sorter: (a, b) => a.realisasi - b.realisasi,
    },
    {
      title: 'Sisa',
      dataIndex: 'sisa',
      key: 'sisa',
      width: 120,
      align: 'right',
      render: (value) => (
        <span 
          className="currency-value" 
          style={{ color: value < 0 ? '#ff4d4f' : '#faad14' }}
        >
          {formatCurrency(value)}
        </span>
      ),
      sorter: (a, b) => a.sisa - b.sisa,
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 120,
      render: (_, record) => {
        const percentage = record.percentage || 0;
        const status = percentage > 100 ? 'exception' : 
                      percentage >= 80 ? 'success' : 'normal';
        
        return (
          <div>
            <Progress
              percent={Math.min(percentage, 100)}
              size="small"
              status={status}
              format={() => `${percentage.toFixed(1)}%`}
            />
          </div>
        );
      },
      sorter: (a, b) => (a.percentage || 0) - (b.percentage || 0),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const status = record.status || 'unknown';
        const statusLabels = {
          'on-track': 'Sesuai Target',
          'over-budget': 'Melebihi Anggaran',
          'under-budget': 'Di Bawah Target'
        };
        
        return (
          <Tag 
            color={getStatusColor(status)}
            style={{ fontSize: '11px', fontWeight: 500 }}
          >
            {statusLabels[status] || 'Unknown'}
          </Tag>
        );
      },
      filters: [
        { text: 'Sesuai Target', value: 'on-track' },
        { text: 'Melebihi Anggaran', value: 'over-budget' },
        { text: 'Di Bawah Target', value: 'under-budget' },
      ],
      onFilter: (value, record) => record.status === value,
    }
  ];

  // Add actions column if needed
  if (showActions) {
    columns.push({
      title: 'Aksi',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Lihat Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onView && onView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit && onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Hapus">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => {
                Modal.confirm({
                  title: 'Konfirmasi Hapus',
                  content: `Apakah Anda yakin ingin menghapus "${record.nama_kegiatan}"?`,
                  okText: 'Ya, Hapus',
                  cancelText: 'Batal',
                  okType: 'danger',
                  onOk: () => onDelete && onDelete(record.id)
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    });
  }

  return (
    <Card 
      className="table-container"
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="table-title">Data Detail Anggaran</span>
          <Space>
            {selectedRowKeys.length > 0 && (
              <>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {selectedRowKeys.length} item dipilih
                </span>
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleBulkDelete}
                >
                  Hapus Terpilih
                </Button>
              </>
            )}
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExport}
              size="small"
            >
              Export XLSX
            </Button>
          </Space>
        </div>
      }
      bodyStyle={{ padding: 0 }}
    >
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        size={size}
        scroll={{ x: 1200, y: 400 }}
        pagination={pagination ? {
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} dari ${total} item`,
          pageSizeOptions: ['10', '20', '50', '100'],
          defaultPageSize: 20
        } : false}
        summary={(pageData) => {
          if (!pageData || pageData.length === 0) return null;
          
          const totalPagu = pageData.reduce((sum, item) => sum + (item.pagu || 0), 0);
          const totalRealisasi = pageData.reduce((sum, item) => sum + (item.realisasi || 0), 0);
          const totalSisa = totalPagu - totalRealisasi;
          const avgPercentage = totalPagu > 0 ? (totalRealisasi / totalPagu) * 100 : 0;

          return (
            <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
              <Table.Summary.Cell index={0} colSpan={5}>
                <div style={{ textAlign: 'right', paddingRight: 8 }}>
                  Total ({pageData.length} item):
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <div style={{ textAlign: 'right' }} className="currency-value">
                  {formatCurrency(totalPagu)}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                <div style={{ textAlign: 'right', color: '#52c41a' }} className="currency-value">
                  {formatCurrency(totalRealisasi)}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}>
                <div 
                  style={{ 
                    textAlign: 'right', 
                    color: totalSisa < 0 ? '#ff4d4f' : '#faad14' 
                  }}
                  className="currency-value"
                >
                  {formatCurrency(totalSisa)}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <div style={{ textAlign: 'center' }}>
                  {avgPercentage.toFixed(1)}%
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5}>
                <div style={{ textAlign: 'center' }}>
                  -
                </div>
              </Table.Summary.Cell>
              {showActions && (
                <Table.Summary.Cell index={6}>
                  <div style={{ textAlign: 'center' }}>-</div>
                </Table.Summary.Cell>
              )}
            </Table.Summary.Row>
          );
        }}
      />
    </Card>
  );
};

export default BudgetTable;
