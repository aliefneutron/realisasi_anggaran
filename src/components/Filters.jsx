import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Input, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Search } = Input;

const getCurrentSemester = () => {
  const month = new Date().getMonth();
  return month < 6 ? 'Semester 1' : 'Semester 2';
};

const MONTHS = [
  { value: '0', label: 'Januari' },
  { value: '1', label: 'Februari' },
  { value: '2', label: 'Maret' },
  { value: '3', label: 'April' },
  { value: '4', label: 'Mei' },
  { value: '5', label: 'Juni' },
  { value: '6', label: 'Juli' },
  { value: '7', label: 'Agustus' },
  { value: '8', label: 'September' },
  { value: '9', label: 'Oktober' },
  { value: '10', label: 'November' },
  { value: '11', label: 'Desember' }
];

const Filters = ({ 
  onFilterChange, 
  loading = false, 
  filterOptions = { semesters: [], bidangs: [] },
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState({
    semester: getCurrentSemester(),
    bulan: 'all',
    bidang: [],
    search: '',
    ...initialFilters
  });

  // Apply filters when they change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const handleSemesterChange = (value) => {
    setFilters(prev => ({ ...prev, semester: value }));
  };

  const handleBulanChange = (value) => {
    setFilters(prev => {
      const newFilters = { ...prev, bulan: value };
      
      if (value !== 'all') {
        const monthNum = parseInt(value, 10);
        if (monthNum >= 0 && monthNum <= 5) {
          newFilters.semester = 'Semester 1';
        } else if (monthNum >= 6 && monthNum <= 11) {
          newFilters.semester = 'Semester 2';
        }
      }
      
      return newFilters;
    });
  };

  const handleBidangChange = (value) => {
    setFilters(prev => ({ ...prev, bidang: value }));
  };

  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleReset = () => {
    const resetFilters = {
      semester: 'all',
      bulan: 'all',
      bidang: [],
      search: ''
    };
    setFilters(resetFilters);
  };

  const hasActiveFilters = () => {
    return filters.semester !== 'all' || 
           filters.bulan !== 'all' ||
           filters.bidang.length > 0 || 
           filters.search.trim() !== '';
  };

  return (
    <Card 
      className="filters-container"
      title={
        <Space>
          <FilterOutlined />
          Filter Data
          {hasActiveFilters() && (
            <span style={{ 
              background: '#1890ff', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '10px', 
              fontSize: '12px',
              marginLeft: '8px'
            }}>
              Active
            </span>
          )}
        </Space>
      }
      extra={
        <Button 
          type="text" 
          icon={<ReloadOutlined />}
          onClick={handleReset}
          disabled={!hasActiveFilters()}
          size="small"
        >
          Reset
        </Button>
      }
      style={{ marginBottom: 24 }}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Semester Filter */}
        <Col xs={24} sm={12} md={5}>
          <div className="filter-item">
            <div className="filter-label" style={{ 
              fontWeight: 500, 
              marginBottom: 8, 
              color: '#333',
              fontSize: '14px'
            }}>
              Semester
            </div>
            <Select
              value={filters.semester}
              onChange={handleSemesterChange}
              style={{ width: '100%' }}
              placeholder="Pilih Semester"
              loading={loading}
            >
              <Option value="all">Semua Semester</Option>
              {filterOptions.semesters.map(semester => (
                <Option key={semester} value={semester}>
                  {semester}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Bulan Filter */}
        <Col xs={24} sm={12} md={5}>
          <div className="filter-item">
            <div className="filter-label" style={{ 
              fontWeight: 500, 
              marginBottom: 8, 
              color: '#333',
              fontSize: '14px'
            }}>
              Bulan
            </div>
            <Select
              value={filters.bulan}
              onChange={handleBulanChange}
              style={{ width: '100%' }}
              placeholder="Pilih Bulan"
              loading={loading}
            >
              <Option value="all">Semua Bulan</Option>
              {MONTHS.map(m => (
                <Option key={m.value} value={m.value}>
                  {m.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Bidang Filter */}
        <Col xs={24} sm={12} md={5}>
          <div className="filter-item">
            <div className="filter-label" style={{ 
              fontWeight: 500, 
              marginBottom: 8, 
              color: '#333',
              fontSize: '14px'
            }}>
              Bidang
            </div>
            <Select
              mode="multiple"
              value={filters.bidang}
              onChange={handleBidangChange}
              style={{ width: '100%' }}
              placeholder="Pilih Bidang"
              loading={loading}
              maxTagCount={2}
              maxTagTextLength={10}
            >
              {filterOptions.bidangs.map(bidang => (
                <Option key={bidang} value={bidang}>
                  {bidang}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Search Filter */}
        <Col xs={24} sm={12} md={5}>
          <div className="filter-item">
            <div className="filter-label" style={{ 
              fontWeight: 500, 
              marginBottom: 8, 
              color: '#333',
              fontSize: '14px'
            }}>
              Pencarian
            </div>
            <Search
              placeholder="Cari kegiatan, kode rekening..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onSearch={handleSearchChange}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </div>
        </Col>

        {/* Filter Summary */}
        <Col xs={24} sm={12} md={4}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '60px'
          }}>
            {hasActiveFilters() && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginBottom: '4px' 
                }}>
                  Filter Aktif
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: '#1890ff' 
                }}>
                  {[
                    filters.semester !== 'all' ? 1 : 0,
                    filters.bulan !== 'all' ? 1 : 0,
                    filters.bidang.length > 0 ? 1 : 0,
                    filters.search.trim() !== '' ? 1 : 0
                  ].reduce((a, b) => a + b, 0)}
                </div>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <Row style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Col span={24}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
              Filter yang diterapkan:
            </div>
            <Space wrap>
              {filters.semester !== 'all' && (
                <span style={{ 
                  background: '#e6f7ff', 
                  color: '#1890ff', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Semester: {filters.semester}
                </span>
              )}
              {filters.bulan !== 'all' && (
                <span style={{ 
                  background: '#e6f7ff', 
                  color: '#1890ff', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Bulan: {MONTHS.find(m => m.value === filters.bulan)?.label}
                </span>
              )}
              {filters.bidang.length > 0 && (
                <span style={{ 
                  background: '#f6ffed', 
                  color: '#52c41a', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Bidang: {filters.bidang.length} dipilih
                </span>
              )}
              {filters.search.trim() !== '' && (
                <span style={{ 
                  background: '#fff2e8', 
                  color: '#fa8c16', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Pencarian: "{filters.search}"
                </span>
              )}
            </Space>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default Filters;
