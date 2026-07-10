import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Typography, Spin, message, Space, Button, Select } from 'antd';
import { FileExcelOutlined, ReloadOutlined } from '@ant-design/icons';
import { getHierarchicalData, getAllRealizationHistory } from '../services/api';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Option } = Select;

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MonthlyReportTable = () => {
  const [loading, setLoading] = useState(false);
  const [hierarchyData, setHierarchyData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [selectedBidang, setSelectedBidang] = useState('Semua');
  const [bidangList, setBidangList] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hierarchyRes, historyRes] = await Promise.all([
        getHierarchicalData(),
        getAllRealizationHistory()
      ]);

      if (hierarchyRes.success) {
        setHierarchyData(hierarchyRes.data);
        
        // Extract bidangs by traversing the tree
        const bidangSet = new Set();
        const findBidangs = (nodes) => {
            nodes.forEach(node => {
                if (node.bidang && node.bidang !== 'Umum') {
                    bidangSet.add(node.bidang);
                }
                if (node.children) {
                    findBidangs(node.children);
                }
            });
        };
        findBidangs(hierarchyRes.data);
        setBidangList(Array.from(bidangSet).sort());
      }
      if (historyRes.success) {
        setHistoryData(historyRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  // Map history by kode_rekening and month
  const realizationMap = useMemo(() => {
    const map = {};
    historyData.forEach(item => {
      if (!map[item.kode_rekening]) {
        map[item.kode_rekening] = {
          total: 0,
          months: Array(12).fill(0)
        };
      }
      
      const date = new Date(item.tanggal);
      if (!isNaN(date.getTime())) {
        const monthIndex = date.getMonth(); // 0-11
        const amount = parseFloat(item.jumlah_realisasi) || 0;
        
        map[item.kode_rekening].months[monthIndex] += amount;
        map[item.kode_rekening].total += amount;
      }
    });
    return map;
  }, [historyData]);

  // Process data for table
  const tableData = useMemo(() => {
    let result = [];
    let noSubKeg = 1;

    // Helper to recursively find all belanja items inside a node
    const getBelanjaItems = (node, acc = []) => {
      if (node.level === 'belanja') {
        acc.push(node);
      }
      if (node.children) {
        node.children.forEach(child => {
          getBelanjaItems(child, acc);
        });
      }
      return acc;
    };

    const traverse = (nodes) => {
      nodes.forEach(node => {

        if (node.level === 'sub_kegiatan') {
          // Apply Bidang filter at the sub_kegiatan level
          if (selectedBidang !== 'Semua' && node.bidang !== selectedBidang) {
              return; // Skip this sub_kegiatan
          }

          const allBelanja = getBelanjaItems(node);
          
          if (allBelanja.length > 0) {
            // Add Sub Kegiatan row
            const subKegRow = {
              key: `subkeg-${node.id}`,
              no: noSubKeg++,
              isSubKegiatan: true,
              nama: node.name,
              kode: node.kode_rekening,
              pagu: node.pagu || 0,
              realisasi: 0,
              sisa: 0,
              months: Array(12).fill(0)
            };

            const childrenRows = [];
            let belanjaNo = 1;

            allBelanja.forEach(belanja => {
              const rMap = realizationMap[belanja.kode_rekening] || { total: 0, months: Array(12).fill(0) };
              const realisasi = rMap.total;
              const pagu = belanja.pagu || 0;

              // Aggregate to Sub Kegiatan
              subKegRow.pagu += pagu;
              subKegRow.realisasi += realisasi;
              for (let i = 0; i < 12; i++) {
                subKegRow.months[i] += rMap.months[i];
              }

              childrenRows.push({
                key: `belanja-${belanja.id}`,
                no: `${noSubKeg - 1}.${belanjaNo++}`,
                isSubKegiatan: false,
                nama: belanja.name,
                kode: belanja.kode_rekening,
                pagu: pagu,
                realisasi: realisasi,
                sisa: pagu - realisasi,
                months: rMap.months
              });
            });

            // If SubKeg pagu was already correctly set in database, we can use it, but aggregating ensures accuracy
            // Let's use the DB pagu if it's > 0 and greater than our aggregation (sometimes nodes are missing)
            if (node.pagu > subKegRow.pagu) {
                subKegRow.pagu = node.pagu;
            }
            
            subKegRow.sisa = subKegRow.pagu - subKegRow.realisasi;
            
            result.push(subKegRow);
            childrenRows.forEach(r => result.push(r));
          }
        }

        if (node.children && node.level !== 'sub_kegiatan') {
          traverse(node.children);
        }
      });
    };

    if (hierarchyData.length > 0) {
      traverse(hierarchyData);
    }

    return result;
  }, [hierarchyData, realizationMap, selectedBidang]);

  const exportToExcel = () => {
    // Basic Excel export
    const wsData = [
      ['NO', 'KODE REKENING', 'URAIAN (SUB KEGIATAN / BELANJA)', 'PAGU (NOMINAL)', 'TOTAL REALISASI', 'SISA PAGU', ...months.map(m => m.toUpperCase())]
    ];

    tableData.forEach(row => {
      wsData.push([
        row.no,
        row.kode,
        row.nama,
        row.pagu,
        row.realisasi,
        row.sisa,
        ...row.months
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Bulanan');
    XLSX.writeFile(wb, 'Laporan_Realisasi_Bulanan.xlsx');
  };

  const formatCurrency = (val) => {
    if (!val) return '-';
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      width: 60,
      fixed: 'left',
    },
    {
      title: 'Uraian',
      dataIndex: 'nama',
      key: 'nama',
      width: 300,
      fixed: 'left',
      render: (text, record) => (
        <div style={{ paddingLeft: record.isSubKegiatan ? 0 : 24 }}>
          <Text strong={record.isSubKegiatan} type={record.isSubKegiatan ? 'primary' : 'secondary'}>
            {text}
          </Text>
          <br/>
          <Text type="secondary" style={{fontSize: 11}}>{record.kode}</Text>
        </div>
      ),
    },
    {
      title: 'Nominal (Pagu)',
      dataIndex: 'pagu',
      key: 'pagu',
      width: 150,
      align: 'right',
      render: (val, record) => <Text strong={record.isSubKegiatan}>{formatCurrency(val)}</Text>
    },
    {
      title: 'Total Realisasi',
      dataIndex: 'realisasi',
      key: 'realisasi',
      width: 150,
      align: 'right',
      render: (val, record) => <Text strong={record.isSubKegiatan} style={{color: '#faad14'}}>{formatCurrency(val)}</Text>
    },
    {
      title: 'Sisa Pagu',
      dataIndex: 'sisa',
      key: 'sisa',
      width: 150,
      align: 'right',
      render: (val, record) => <Text strong={record.isSubKegiatan} style={{color: val < 0 ? '#ff4d4f' : '#52c41a'}}>{formatCurrency(val)}</Text>
    }
  ];

  // Add month columns dynamically
  months.forEach((month, index) => {
    columns.push({
      title: month,
      dataIndex: 'months',
      key: `month_${index}`,
      width: 120,
      align: 'right',
      render: (monthsArr) => {
        const val = monthsArr[index];
        return val ? formatCurrency(val) : '-';
      }
    });
  });

  return (
    <Card 
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>Jadwal & Laporan Realisasi Bulanan</Title>
        </Space>
      }
      extra={
        <Space>
          <Select 
            value={selectedBidang} 
            onChange={setSelectedBidang}
            style={{ width: 200 }}
          >
            <Option value="Semua">Semua Bidang</Option>
            {bidangList.map(b => (
              <Option key={b} value={b}>{b}</Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<FileExcelOutlined />} onClick={exportToExcel} disabled={tableData.length === 0}>
            Export Excel
          </Button>
        </Space>
      }
      style={{ margin: '24px 0' }}
    >
      <Table 
        columns={columns} 
        dataSource={tableData}
        loading={loading}
        pagination={false}
        scroll={{ x: 2000, y: 600 }}
        size="small"
        rowClassName={(record) => record.isSubKegiatan ? 'subkeg-row' : 'belanja-row'}
      />
      
      <style>{`
        .subkeg-row {
          background-color: #fafafa;
        }
        .subkeg-row td {
          border-top: 2px solid #e8e8e8;
          font-weight: 500;
        }
      `}</style>
    </Card>
  );
};

export default MonthlyReportTable;
