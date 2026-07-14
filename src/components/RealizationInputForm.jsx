import React, { useState, useEffect, useMemo } from 'react';
import {
    Card,
    Input,
    Button,
    List,
    Typography,
    Space,
    InputNumber,
    message,
    Divider,
    Row,
    Col,
    Statistic,
    Upload,
    Select
} from 'antd';
import {
    SearchOutlined,
    LeftOutlined,
    SaveOutlined,
    FileTextOutlined,
    FolderOutlined,
    DollarOutlined,
    DownloadOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { getHierarchicalData, addRealizationHistory } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ImportPreviewModal from './ImportPreviewModal';
import {
    generateRealizationTemplate,
    downloadExcelTemplate,
    parseRealizationExcel,
    validateRealizationData
} from '../utils/excelUtils';
import { getBidangsForKodeRekening } from '../utils/bidangMapping';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const RealizationInputForm = ({ onSave }) => {
    const { currentUser } = useAuth();

    // State for navigation
    const [step, setStep] = useState(1); // 1: Kegiatan, 2: Sub Kegiatan, 3: Belanja
    const [loading, setLoading] = useState(false);

    // State for Filter Bidang
    const [selectedBidangFilter, setSelectedBidangFilter] = useState('Semua');

    // State for selections
    const [kegiatanList, setKegiatanList] = useState([]);
    const [selectedKegiatan, setSelectedKegiatan] = useState(null);
    const [subKegiatanList, setSubKegiatanList] = useState([]);
    const [selectedSubKegiatan, setSelectedSubKegiatan] = useState(null);
    const [belanjaList, setBelanjaList] = useState([]);
    const [filteredBelanjaList, setFilteredBelanjaList] = useState([]);

    // State for realization input
    const [realizationInputs, setRealizationInputs] = useState({});

    // Search state
    const [searchText, setSearchText] = useState('');

    // Import state
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [validationResult, setValidationResult] = useState({ valid: [], errors: [] });
    const [importLoading, setImportLoading] = useState(false);

    // Load kegiatan list on mount
    useEffect(() => {
        loadKegiatanList();
    }, []);

    // Extract kegiatan from hierarchical data
    const loadKegiatanList = async () => {
        try {
            setLoading(true);
            const response = await getHierarchicalData();

            if (response.success) {
                const kegiatanData = extractKegiatanFromHierarchy(response.data);
                setKegiatanList(kegiatanData);
            }
        } catch (error) {
            message.error('Gagal memuat data kegiatan');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Extract kegiatan and sub_kegiatan from hierarchy
    const extractKegiatanFromHierarchy = (data) => {
        const result = [];

        const traverse = (nodes, bidangName = '', programName = '') => {
            nodes.forEach(node => {
                if (node.level === 'bidang') {
                    bidangName = node.name;
                } else if (node.level === 'program') {
                    programName = node.name;
                } else if (node.level === 'kegiatan') {
                    // Use getBidangsForKodeRekening to reliably get all Bidangs from the kode_rekening
                    const mappedBidangs = getBidangsForKodeRekening(node.kode_rekening);
                    
                    // Found a kegiatan
                    const kegiatanItem = {
                        id: node.id,
                        name: node.name,
                        kode_rekening: node.kode_rekening,
                        bidang: mappedBidangs, // Now an array of Bidangs
                        program: programName,
                        subKegiatanList: []
                    };

                    // Extract sub_kegiatan children
                    if (node.children) {
                        node.children.forEach(child => {
                            if (child.level === 'sub_kegiatan') {
                                const subKegiatanItem = {
                                    id: child.id,
                                    name: child.name,
                                    kode_rekening: child.kode_rekening,
                                    pagu: child.pagu || 0,
                                    realisasi: child.realisasi || 0,
                                    belanjaList: []
                                };

                                // Extract belanja children recursively
                                const extractDeepBelanja = (nodes) => {
                                    nodes.forEach(node => {
                                        if (node.level === 'belanja') {
                                            subKegiatanItem.belanjaList.push({
                                                id: node.id,
                                                id_unik: node.id_unik || node.id, // Fallback to id just in case
                                                name: node.name,
                                                kode_rekening: node.kode_rekening,
                                                pagu: node.pagu || 0,
                                                realisasi: node.realisasi || 0
                                            });
                                        }
                                        if (node.children) {
                                            extractDeepBelanja(node.children);
                                        }
                                    });
                                };

                                if (child.children) {
                                    extractDeepBelanja(child.children);
                                }

                                kegiatanItem.subKegiatanList.push(subKegiatanItem);
                            }
                        });
                    }

                    result.push(kegiatanItem);
                }

                if (node.children) {
                    traverse(node.children, bidangName, programName);
                }
            });
        };

        traverse(data);
        return result;
    };

    const uniqueBidangs = useMemo(() => {
        const bidangs = new Set();
        kegiatanList.forEach(k => {
            if (Array.isArray(k.bidang)) {
                k.bidang.forEach(b => bidangs.add(b));
            } else if (k.bidang) {
                bidangs.add(k.bidang);
            }
        });
        return ['Semua', ...Array.from(bidangs).sort()];
    }, [kegiatanList]);

    const displayedKegiatan = useMemo(() => {
        if (selectedBidangFilter === 'Semua') return kegiatanList;
        return kegiatanList.filter(k => {
            if (Array.isArray(k.bidang)) {
                return k.bidang.includes(selectedBidangFilter);
            }
            return k.bidang === selectedBidangFilter;
        });
    }, [kegiatanList, selectedBidangFilter]);

    // Handle kegiatan selection
    const handleSelectKegiatan = (kegiatan) => {
        setSelectedKegiatan(kegiatan);
        setSubKegiatanList(kegiatan.subKegiatanList);
        setStep(2);
    };

    // Handle sub kegiatan selection
    const handleSelectSubKegiatan = (subKegiatan) => {
        setSelectedSubKegiatan(subKegiatan);
        setBelanjaList(subKegiatan.belanjaList);
        setFilteredBelanjaList(subKegiatan.belanjaList);
        setStep(3);
    };

    // Handle search in belanja list
    const handleSearch = (value) => {
        setSearchText(value);
        if (!value) {
            setFilteredBelanjaList(belanjaList);
        } else {
            const filtered = belanjaList.filter(
                item =>
                    item.name.toLowerCase().includes(value.toLowerCase()) ||
                    item.kode_rekening.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredBelanjaList(filtered);
        }
    };

    // Handle realization input change
    const handleRealizationChange = (belanjaId, value) => {
        setRealizationInputs(prev => ({
            ...prev,
            [belanjaId]: value || 0
        }));
    };

    // Handle save
    const handleSave = async () => {
        try {
            setLoading(true);

            // Prepare data to save
            const realizationData = {
                isImport: false,
                belanja: Object.entries(realizationInputs).map(([belanjaId, realisasi]) => {
                    const belanjaObj = belanjaList.find(b => b.id === belanjaId);
                    return {
                        id_unik: belanjaObj ? belanjaObj.id_unik : '',
                        kode_rekening: belanjaObj ? belanjaObj.kode_rekening : '',
                        jumlah_realisasi: realisasi,
                        tanggal: new Date().toISOString().split('T')[0],
                        uraian: 'Input Manual dari Sistem'
                    };
                }).filter(item => item.jumlah_realisasi > 0)
            };

            if (realizationData.belanja.length === 0) {
                message.warning('Masukkan minimal satu nilai realisasi!');
                return;
            }

            // Call parent callback to save
            if (onSave) {
                await onSave(realizationData);
            }

            message.success('Data realisasi berhasil disimpan!');
            handleReset();
        } catch (error) {
            message.error('Gagal menyimpan data realisasi');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const handleReset = () => {
        setStep(1);
        setSelectedKegiatan(null);
        setSelectedSubKegiatan(null);
        setSubKegiatanList([]);
        setBelanjaList([]);
        setFilteredBelanjaList([]);
        setRealizationInputs({});
        setSearchText('');
    };

    // Go back to previous step
    const handleBack = () => {
        if (step === 2) {
            setSelectedKegiatan(null);
            setSubKegiatanList([]);
            setStep(1);
        } else if (step === 3) {
            setSelectedSubKegiatan(null);
            setBelanjaList([]);
            setFilteredBelanjaList([]);
            setRealizationInputs({});
            setSearchText('');
            setStep(2);
        }
    };

    // Calculate total realization
    const getTotalRealization = () => {
        return Object.values(realizationInputs).reduce((sum, val) => sum + (val || 0), 0);
    };

    // Calculate total pagu
    const getTotalPagu = () => {
        return belanjaList.reduce((sum, item) => sum + item.pagu, 0);
    };

    // ===== EXCEL IMPORT HANDLERS =====

    // Handle download Excel template
    const handleDownloadTemplate = () => {
        try {
            const blob = generateRealizationTemplate(belanjaList, selectedSubKegiatan.name);
            const filename = `Template_Realisasi_${selectedSubKegiatan.name.replace(/\s+/g, '_')}.xlsx`;
            downloadExcelTemplate(blob, filename);
            message.success('Template Excel berhasil didownload!');
        } catch (error) {
            message.error('Gagal mendownload template');
            console.error(error);
        }
    };

    // Handle Excel file upload
    const handleUploadExcel = async (file) => {
        try {
            setImportLoading(true);

            // Parse Excel file
            const importedData = await parseRealizationExcel(file);

            if (importedData.length === 0) {
                message.warning('File Excel kosong atau tidak ada data yang valid');
                return false;
            }

            // Validate data
            const validated = validateRealizationData(importedData, belanjaList);

            setValidationResult(validated);
            setImportModalVisible(true);

            // Prevent default upload behavior
            return false;
        } catch (error) {
            message.error(error.message || 'Gagal membaca file Excel');
            console.error(error);
            return false;
        } finally {
            setImportLoading(false);
        }
    };

    // Handle confirm import from preview modal
    const handleConfirmImport = async () => {
        try {
            setImportLoading(true);
            const { valid } = validationResult;

            const historyToSave = valid.map(item => ({
                id_unik: item.id_unik,
                kode_rekening: item.kode_rekening,
                tanggal: item.tanggal,
                uraian: item.uraian,
                jumlah_realisasi: item.realisasi
            }));

            const response = await addRealizationHistory(historyToSave);
            
            if (response.success) {
                setImportModalVisible(false);
                message.success(`Berhasil import ${response.data.success} data realisasi!`);
                handleReset();
                if (onSave) {
                    await onSave({ isImport: true });
                }
            }
        } catch (error) {
            message.error('Gagal mengimport data');
            console.error(error);
        } finally {
            setImportLoading(false);
        }
    };

    // Handle cancel import
    const handleCancelImport = () => {
        setImportModalVisible(false);
        setValidationResult({ valid: [], errors: [] });
    };

    return (
        <Card
            title={
                <Space>
                    <DollarOutlined />
                    <span>Form Input Realisasi Anggaran</span>
                </Space>
            }
            style={{ marginBottom: 24 }}
        >
            {/* Step 1: Select Kegiatan */}
            {step === 1 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Title level={4} style={{ margin: 0 }}>Pilih Kegiatan</Title>
                        <Select
                            style={{ width: 250 }}
                            value={selectedBidangFilter}
                            onChange={(value) => setSelectedBidangFilter(value)}
                            placeholder="Filter Bidang"
                        >
                            {uniqueBidangs.map(bidang => (
                                <Option key={bidang} value={bidang}>{bidang}</Option>
                            ))}
                        </Select>
                    </div>
                    <List
                        loading={loading}
                        dataSource={displayedKegiatan}
                        renderItem={(kegiatan) => (
                            <List.Item
                                key={kegiatan.id}
                                style={{
                                    cursor: 'pointer',
                                    padding: '16px',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                    transition: 'all 0.3s'
                                }}
                                onClick={() => handleSelectKegiatan(kegiatan)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#1890ff';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 144, 255, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#f0f0f0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <div style={{
                                            width: 48,
                                            height: 48,
                                            background: '#ff7a45',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FileTextOutlined style={{ fontSize: 24, color: 'white' }} />
                                        </div>
                                    }
                                    title={<Text strong>{kegiatan.name}</Text>}
                                    description={<Text type="secondary">Kode: {kegiatan.kode_rekening}</Text>}
                                />
                                <Button type="primary">Pilih Kegiatan Ini</Button>
                            </List.Item>
                        )}
                    />
                </div>
            )}

            {/* Step 2: Select Sub Kegiatan */}
            {step === 2 && (
                <div>
                    <Button
                        icon={<LeftOutlined />}
                        onClick={handleBack}
                        style={{ marginBottom: 16 }}
                    >
                        Ubah Kegiatan
                    </Button>

                    <Card size="small" style={{ marginBottom: 16, background: '#f0f2f5' }}>
                        <Text strong>Kegiatan Yang Dipilih</Text>
                        <br />
                        <Text>{selectedKegiatan.name}</Text>
                        <br />
                        <Text type="secondary">Kode: {selectedKegiatan.kode_rekening}</Text>
                    </Card>

                    <Title level={4}>Pilih Sub Kegiatan</Title>
                    <List
                        dataSource={subKegiatanList}
                        renderItem={(subKegiatan) => (
                            <List.Item
                                key={subKegiatan.id}
                                style={{
                                    cursor: 'pointer',
                                    padding: '16px',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                    transition: 'all 0.3s'
                                }}
                                onClick={() => handleSelectSubKegiatan(subKegiatan)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#1890ff';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 144, 255, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#f0f0f0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <div style={{
                                            width: 48,
                                            height: 48,
                                            background: '#1890ff',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FolderOutlined style={{ fontSize: 24, color: 'white' }} />
                                        </div>
                                    }
                                    title={<Text strong>{subKegiatan.name}</Text>}
                                    description={<Text type="secondary">Kode: {subKegiatan.kode_rekening}</Text>}
                                />
                                <Button type="primary">Pilih Sub Kegiatan</Button>
                            </List.Item>
                        )}
                    />
                </div>
            )}

            {/* Step 3: Input Realization for Detail Belanja */}
            {step === 3 && (
                <div>
                    <Button
                        icon={<LeftOutlined />}
                        onClick={handleBack}
                        style={{ marginBottom: 16 }}
                    >
                        Ubah Sub Kegiatan
                    </Button>

                    <Card size="small" style={{ marginBottom: 16, background: '#f0f2f5' }}>
                        <Text strong>Sub Kegiatan Yang Dipilih</Text>
                        <br />
                        <Text>{selectedSubKegiatan.name}</Text>
                        <br />
                        <Text type="secondary">Kode: {selectedSubKegiatan.kode_rekening}</Text>
                    </Card>

                    <Title level={4}>Menampilkan Daftar Detail Belanja Didalam Sub Kegiatan {selectedSubKegiatan.name}</Title>

                    {/* Excel Import Buttons */}
                    <Space style={{ marginBottom: 16 }}>
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleDownloadTemplate}
                        >
                            Download Template
                        </Button>
                        <Upload
                            accept=".xlsx,.xls"
                            showUploadList={false}
                            beforeUpload={handleUploadExcel}
                            customRequest={({ onSuccess }) => {
                                setTimeout(() => {
                                    onSuccess("ok");
                                }, 0);
                            }}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                loading={importLoading}
                            >
                                Import Excel
                            </Button>
                        </Upload>
                    </Space>

                    <Search
                        placeholder="Cari nama rekening, kode rekening, anggaran atau anggaran yang dikeluarkan ..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />

                    <List
                        dataSource={filteredBelanjaList}
                        renderItem={(belanja) => (
                            <Card
                                key={belanja.id}
                                size="small"
                                style={{ marginBottom: 12 }}
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: 8
                                        }}>
                                            <div style={{
                                                width: 40,
                                                height: 40,
                                                background: '#52c41a',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 12
                                            }}>
                                                <DollarOutlined style={{ fontSize: 20, color: 'white' }} />
                                            </div>
                                            <div>
                                                <Text strong>{belanja.name}</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Kode: {belanja.kode_rekening}
                                                </Text>
                                            </div>
                                        </div>
                                        <div>
                                            <Text type="secondary">Anggaran / Nilai Maksimal</Text>
                                            <br />
                                            <Text strong style={{ fontSize: 16 }}>
                                                Rp{belanja.pagu.toLocaleString('id-ID')}
                                            </Text>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div style={{ marginBottom: 8 }}>
                                            <Text type="secondary">Anggaran yang ingin dikeluarkan</Text>
                                            <InputNumber
                                                style={{ width: '100%', marginTop: 4 }}
                                                placeholder="Rp0,00"
                                                formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value.replace(/Rp\s?|(,*)/g, '')}
                                                min={0}
                                                max={belanja.pagu}
                                                value={realizationInputs[belanja.id]}
                                                onChange={(value) => handleRealizationChange(belanja.id, value)}
                                            />
                                        </div>
                                        <div>
                                            <Text type="secondary">Not Realisasi</Text>
                                            <br />
                                            <Text strong>
                                                Sisa anggaran Rp{(belanja.pagu - (realizationInputs[belanja.id] || 0)).toLocaleString('id-ID')}
                                            </Text>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        )}
                    />

                    <Divider />

                    {/* Summary */}
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={8}>
                            <Statistic
                                title="Total Pagu"
                                value={getTotalPagu()}
                                precision={0}
                                prefix="Rp"
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Total Realisasi"
                                value={getTotalRealization()}
                                precision={0}
                                prefix="Rp"
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Sisa Anggaran"
                                value={getTotalPagu() - getTotalRealization()}
                                precision={0}
                                prefix="Rp"
                                valueStyle={{
                                    color: getTotalPagu() - getTotalRealization() >= 0 ? '#52c41a' : '#ff4d4f'
                                }}
                            />
                        </Col>
                    </Row>

                    <Space>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            loading={loading}
                            size="large"
                        >
                            Simpan
                        </Button>
                        <Button onClick={handleReset} size="large">
                            Tutup
                        </Button>
                    </Space>
                </div>
            )}

            {/* Import Preview Modal */}
            <ImportPreviewModal
                visible={importModalVisible}
                onCancel={handleCancelImport}
                onConfirm={handleConfirmImport}
                validationResult={validationResult}
                loading={importLoading}
            />
        </Card>
    );
};

export default RealizationInputForm;
