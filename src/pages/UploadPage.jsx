import React, { useState } from 'react';
import { Card, Row, Col, Upload, Button, message, Typography, Steps, Divider, Alert } from 'antd';
import { UploadOutlined, FileExcelOutlined, CloudUploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { updateHierarchicalData } from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const UploadPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [dpaData, setDpaData] = useState(null);
    const [cashBudgetData, setCashBudgetData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Function to parse DPA Excel
    const parseDpaFile = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    resolve(json);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };

    // Function to parse Cash Budget Excel
    const parseCashBudgetFile = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    resolve(json);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const handleDpaUpload = async ({ file, onSuccess, onError }) => {
        try {
            setLoading(true);
            const data = await parseDpaFile(file);

            // Basic validation
            if (!data || data.length === 0) {
                throw new Error("File kosong atau format salah");
            }

            // Mock processing - in real app, convert flat to hierarchy here
            console.log("DPA Data:", data);
            setDpaData(data);
            message.success(`${data.length} baris data DPA berhasil dimuat`);
            setCurrentStep(1);
            onSuccess("ok");
        } catch (error) {
            message.error("Gagal upload DPA: " + error.message);
            onError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCashBudgetUpload = async ({ file, onSuccess, onError }) => {
        try {
            setLoading(true);
            const data = await parseCashBudgetFile(file);

            if (!data || data.length === 0) {
                throw new Error("File kosong atau format salah");
            }

            console.log("Cash Budget Data:", data);
            setCashBudgetData(data);
            message.success(`${data.length} baris Anggaran Kas berhasil dimuat`);
            setCurrentStep(2);
            onSuccess("ok");
        } catch (error) {
            message.error("Gagal upload Anggaran Kas: " + error.message);
            onError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        try {
            setLoading(true);
            // Here we would merge DPA and Cash Budget data and update the backend
            // For now, we'll just simulate a success
            await new Promise(resolve => setTimeout(resolve, 1000));

            message.success("Data berhasil disinkronisasi ke sistem!");
            setCurrentStep(3);
        } catch (error) {
            message.error("Gagal sinkronisasi: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-page" style={{ padding: '24px' }}>
            <Title level={2}>Upload Data Master</Title>
            <Paragraph>
                Gunakan halaman ini untuk mengupload data DPA Global dan Anggaran Kas tahunan.
                Data ini akan digunakan sebagai dasar monitoring realisasi per bidang.
            </Paragraph>

            <Card style={{ marginBottom: 24 }}>
                <Steps current={currentStep}>
                    <Step title="Upload DPA" description="Struktur & Pagu" />
                    <Step title="Upload Anggaran Kas" description="Target Bulanan" />
                    <Step title="Sinkronisasi" description="Proses Data" />
                    <Step title="Selesai" description="Siap Digunakan" />
                </Steps>
            </Card>

            <Row gutter={[24, 24]}>
                {/* DPA Upload Section */}
                <Col xs={24} md={12}>
                    <Card
                        title={<span><FileExcelOutlined /> Upload DPA Global</span>}
                        className={currentStep === 0 ? "active-card" : ""}
                        style={{ opacity: currentStep > 0 ? 0.6 : 1 }}
                    >
                        <Alert
                            message="Format DPA"
                            description="File Excel harus memiliki kolom: Kode Rekening, Nama Kegiatan, Level, Pagu."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Upload
                                customRequest={handleDpaUpload}
                                showUploadList={false}
                                accept=".xlsx, .xls"
                                disabled={currentStep > 0}
                            >
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<UploadOutlined />}
                                    disabled={currentStep > 0}
                                    loading={loading && currentStep === 0}
                                >
                                    Pilih File DPA
                                </Button>
                            </Upload>
                            {dpaData && (
                                <div style={{ marginTop: 16, color: '#52c41a' }}>
                                    <CheckCircleOutlined /> {dpaData.length} data dimuat
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Cash Budget Upload Section */}
                <Col xs={24} md={12}>
                    <Card
                        title={<span><FileExcelOutlined /> Upload Anggaran Kas</span>}
                        style={{ opacity: currentStep !== 1 ? 0.6 : 1 }}
                    >
                        <Alert
                            message="Format Anggaran Kas"
                            description="File Excel harus memiliki kolom: Kode Rekening, Jan, Feb, Mar, ..., Des."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Upload
                                customRequest={handleCashBudgetUpload}
                                showUploadList={false}
                                accept=".xlsx, .xls"
                                disabled={currentStep !== 1}
                            >
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<UploadOutlined />}
                                    disabled={currentStep !== 1}
                                    loading={loading && currentStep === 1}
                                >
                                    Pilih File Anggaran Kas
                                </Button>
                            </Upload>
                            {cashBudgetData && (
                                <div style={{ marginTop: 16, color: '#52c41a' }}>
                                    <CheckCircleOutlined /> {cashBudgetData.length} data dimuat
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Finalize Action */}
            {currentStep === 2 && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<CloudUploadOutlined />}
                        onClick={handleFinalize}
                        loading={loading}
                        style={{ height: '50px', padding: '0 40px', fontSize: '18px' }}
                    >
                        Proses & Simpan Data
                    </Button>
                </div>
            )}

            {currentStep === 3 && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Alert
                        message="Setup Selesai"
                        description="Data master berhasil diperbarui. Anda sekarang dapat melihat monitoring anggaran di Dashboard."
                        type="success"
                        showIcon
                    />
                    <Button
                        type="primary"
                        style={{ marginTop: 16 }}
                        onClick={() => window.location.href = '/hierarchy'}
                    >
                        Ke Dashboard Hierarki
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UploadPage;
