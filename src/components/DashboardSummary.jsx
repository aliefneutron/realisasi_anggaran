import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import { 
  DollarOutlined, 
  TrophyOutlined, 
  BankOutlined, 
  PercentageOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { formatCurrency } from '../utils/helpers';

const DashboardSummary = ({ summary, loading = false }) => {
  // Calculate progress percentage for visual indicator
  const progressPercent = Math.min(summary.averagePercentage || 0, 100);
  
  // Determine progress status color
  const getProgressStatus = (percentage) => {
    if (percentage > 100) return 'exception';
    if (percentage >= 80) return 'success';
    return 'normal';
  };

  // Mock trend data (in real app, this would come from API)
  const trends = {
    pagu: { value: 5.2, isPositive: true },
    realisasi: { value: 12.3, isPositive: true },
    sisa: { value: -8.1, isPositive: false },
    percentage: { value: 3.5, isPositive: true }
  };

  const kpiCards = [
    {
      title: 'Total Pagu Anggaran',
      value: summary.totalPagu || 0,
      icon: <BankOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
      trend: trends.pagu,
      formatter: formatCurrency
    },
    {
      title: 'Total Realisasi',
      value: summary.totalRealisasi || 0,
      icon: <DollarOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
      trend: trends.realisasi,
      formatter: formatCurrency
    },
    {
      title: 'Sisa Dana',
      value: summary.totalSisa || 0,
      icon: <TrophyOutlined style={{ color: '#faad14' }} />,
      color: '#faad14',
      trend: trends.sisa,
      formatter: formatCurrency
    },
    {
      title: 'Persentase Realisasi',
      value: summary.averagePercentage || 0,
      icon: <PercentageOutlined style={{ color: '#722ed1' }} />,
      color: '#722ed1',
      trend: trends.percentage,
      formatter: (value) => `${value.toFixed(1)}%`,
      suffix: '%'
    }
  ];

  return (
    <div className="dashboard-summary">
      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpiCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              loading={loading}
              className="kpi-card"
              style={{ 
                borderLeft: `4px solid ${card.color}`,
                height: '150px'
              }}
              bodyStyle={{ paddingTop: '16px', paddingBottom: '16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div className="kpi-title" style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginBottom: '8px',
                    fontWeight: 500
                  }}>
                    {card.title}
                  </div>
                  <div className="kpi-value" style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: card.color,
                    marginBottom: '4px',
                    lineHeight: 1.2
                  }}>
                    {card.formatter(card.value)}
                  </div>
                  <div className="kpi-change" style={{ 
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    color: card.trend.isPositive ? '#52c41a' : '#ff4d4f'
                  }}>
                    {card.trend.isPositive ? 
                      <ArrowUpOutlined style={{ marginRight: 4 }} /> : 
                      <ArrowDownOutlined style={{ marginRight: 4 }} />
                    }
                    {Math.abs(card.trend.value)}% vs bulan lalu
                  </div>
                </div>
                <div style={{ fontSize: '24px', opacity: 0.3 }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Progress Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Overview Realisasi" 
            loading={loading}
            style={{ height: '220px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%' }}>
              <Progress
                percent={progressPercent}
                status={getProgressStatus(summary.averagePercentage)}
                strokeWidth={12}
                format={(percent) => `${percent.toFixed(1)}%`}
              />
              
              <Row gutter={16} style={{ textAlign: 'center' }}>
                <Col span={8}>
                  <Statistic
                    title="Total Kegiatan"
                    value={summary.totalKegiatan || 0}
                    valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Sesuai Target"
                    value={summary.onTrackCount || 0}
                    valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Melebihi Anggaran"
                    value={summary.overBudgetCount || 0}
                    valueStyle={{ color: '#ff4d4f', fontSize: '20px' }}
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title="Status Distribusi" 
            loading={loading}
            style={{ height: '220px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '12px' }}>Sesuai Target</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {summary.onTrackCount || 0}
                  </span>
                </div>
                <Progress 
                  percent={summary.totalKegiatan ? (summary.onTrackCount / summary.totalKegiatan) * 100 : 0}
                  strokeColor="#52c41a"
                  showInfo={false}
                  size="small"
                />
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '12px' }}>Di Bawah Target</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {summary.underBudgetCount || 0}
                  </span>
                </div>
                <Progress 
                  percent={summary.totalKegiatan ? (summary.underBudgetCount / summary.totalKegiatan) * 100 : 0}
                  strokeColor="#1890ff"
                  showInfo={false}
                  size="small"
                />
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '12px' }}>Melebihi Anggaran</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {summary.overBudgetCount || 0}
                  </span>
                </div>
                <Progress 
                  percent={summary.totalKegiatan ? (summary.overBudgetCount / summary.totalKegiatan) * 100 : 0}
                  strokeColor="#ff4d4f"
                  showInfo={false}
                  size="small"
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardSummary;
