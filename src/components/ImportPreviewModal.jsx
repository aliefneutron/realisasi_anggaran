import React from 'react';
import { Modal, Table, Alert, Space, Tag, Typography, Statistic, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ImportPreviewModal = ({ visible, onCancel, onConfirm, validationResult, loading }) => {
    const { valid, errors } = validationResult || { valid: [], errors: [] };

    const totalItems = valid.length + errors.length;
    const validCount = valid.length;
    const errorCount = errors.length;
    const totalRealisasi = valid.reduce((sum, item) => sum + item.realisasi, 0);

    // Columns for valid data table
    const validColumns = [
        {
            title: 'No',
            key: 'index',
            width: 50,
            render: (_, __, index) => index + 1
        },
        {
            title: 'Kode Rekening',
            dataIndex: 'kode_rekening',
            key: 'kode_rekening',
            width: 150
        },
        {
            title: 'Nama Belanja',
            dataIndex: 'nama_belanja',
            key: 'nama_belanja',
            ellipsis: true
        },
        {
            title: 'Pagu',
            dataIndex: ['belanja', 'pagu'],
            key: 'pagu',
            render: (value) => value !== undefined && value !== null ? `Rp${value.toLocaleString('id-ID')}` : '-'
        },
        {
            title: 'Realisasi',
            dataIndex: 'realisasi',
            key: 'realisasi',
            render: (value) => value !== undefined && value !== null ? `Rp${value.toLocaleString('id-ID')}` : '-'
        },
        {
            title: 'Status',
            key: 'status',
            width: 80,
            render: () => (
                <Tag icon={<CheckCircleOutlined />} color="success">
                    Valid
                </Tag>
            )
        }
    ];

    // Columns for error data table
    const errorColumns = [
        {
            title: 'Baris',
            dataIndex: 'rowNumber',
            key: 'rowNumber',
            width: 60
        },
        {
            title: 'Kode Rekening',
            dataIndex: 'kode_rekening',
            key: 'kode_rekening',
            width: 150
        },
        {
            title: 'Nama Belanja',
            dataIndex: 'nama_belanja',
            key: 'nama_belanja',
            ellipsis: true
        },
        {
            title: 'Realisasi',
            dataIndex: 'realisasi',
            key: 'realisasi',
            width: 120,
            render: (value) => `Rp${value.toLocaleString('id-ID')}`
        },
        {
            title: 'Error',
            dataIndex: 'errors',
            key: 'errors',
            render: (errors) => (
                <Space direction="vertical" size="small">
                    {errors.map((error, index) => (
                        <Text key={index} type="danger" style={{ fontSize: 12 }}>
                            <CloseCircleOutlined /> {error}
                        </Text>
                    ))}
                </Space>
            )
        }
    ];

    return (
        <Modal
            title={
                <Space>
                    <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
                    <span>Preview Import Data Realisasi</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            onOk={onConfirm}
            okText={errorCount > 0 ? `Import ${validCount} Data Valid` : `Import Semua Data`}
            cancelText="Batal"
            width={1000}
            okButtonProps={{
                disabled: validCount === 0,
                loading: loading
            }}
        >
            {/* Summary Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Statistic
                        title="Total Item"
                        value={totalItems}
                        prefix={<ExclamationCircleOutlined />}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="Valid"
                        value={validCount}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<CheckCircleOutlined />}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="Error"
                        value={errorCount}
                        valueStyle={{ color: '#ff4d4f' }}
                        prefix={<CloseCircleOutlined />}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="Total Realisasi"
                        value={totalRealisasi}
                        precision={0}
                        prefix="Rp"
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Col>
            </Row>

            {/* Alerts */}
            {errorCount > 0 && (
                <Alert
                    message="Peringatan"
                    description={`Ditemukan ${errorCount} data yang tidak valid. Data tersebut akan diabaikan saat import. Hanya ${validCount} data valid yang akan disimpan.`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {validCount === 0 && (
                <Alert
                    message="Tidak Ada Data Valid"
                    description="Semua data tidak valid. Perbaiki error pada file Excel dan upload ulang."
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* Valid Data Table */}
            {validCount > 0 && (
                <>
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} /> Data Valid ({validCount})
                    </Text>
                    <Table
                        columns={validColumns}
                        dataSource={valid}
                        rowKey={(record) => record.kode_rekening}
                        pagination={{ pageSize: 5, size: 'small' }}
                        size="small"
                        scroll={{ x: 800 }}
                        style={{ marginBottom: 24 }}
                    />
                </>
            )}

            {/* Error Data Table */}
            {errorCount > 0 && (
                <>
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Data Error ({errorCount})
                    </Text>
                    <Table
                        columns={errorColumns}
                        dataSource={errors}
                        rowKey={(record) => record.rowNumber}
                        pagination={{ pageSize: 5, size: 'small' }}
                        size="small"
                        scroll={{ x: 800 }}
                    />
                </>
            )}
        </Modal>
    );
};

export default ImportPreviewModal;
