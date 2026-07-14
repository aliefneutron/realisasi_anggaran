import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, Button, Dropdown, Space } from 'antd';
import { LogoutOutlined, UserOutlined, DownOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import './App.css';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/index';
import DetailPage from './pages/DetailPage';
import HierarchicalDashboard from './components/HierarchicalDashboard';
import SipdCardPage from './pages/SipdCardPage';
import UploadPage from './pages/UploadPage';
import MonthlyReportTable from './components/MonthlyReportTable';

const { Header, Content, Footer } = Layout;

// Header component with auth info
const AppHeader = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div>
          <div><strong>{currentUser?.name}</strong></div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            {currentUser?.role === 'admin' ? 'Administrator' : `Bidang ${currentUser?.bidang}`}
          </div>
        </div>
      ),
      disabled: true
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true
    }
  ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#531dab',
        padding: '0 24px',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%',
      }}
    >
      {/* SIMONA Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '40px',
          padding: '0 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}
      >
        SIMONA
      </div>

      {/* Navigation */}
      <nav style={{ lineHeight: '64px', flex: 1, marginLeft: '40px' }}>
        <a href="/" style={{ color: 'white', marginRight: '24px' }}>Dashboard</a>
        <a href="/monthly-report" style={{ color: 'white', marginRight: '24px' }}>Laporan Bulanan</a>
        <a href="/detail" style={{ color: 'white', marginRight: '24px' }}>Data Realisasi</a>
        <a href="/hierarchy" style={{ color: 'white', marginRight: '24px' }}>Hierarki</a>
        {/* Unit SKPD only visible for admin */}
        {currentUser?.role === 'admin' && (
          <>
            <a href="/upload" style={{ color: 'white' }}>Setup Data</a>
          </>
        )}
      </nav>

      {/* User Menu */}
      {currentUser && (
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
          <Button
            type="text"
            style={{ color: 'white', height: '40px' }}
            icon={<UserOutlined />}
          >
            <Space>
              {currentUser.name}
              <DownOutlined style={{ fontSize: '12px' }} />
            </Space>
          </Button>
        </Dropdown>
      )}
    </Header>
  );
};

// Main App Layout
const AppLayout = () => {
  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <AppHeader />

      <Content style={{ padding: '24px', background: '#f9f0ff' }}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/hierarchy" element={
            <ProtectedRoute>
              <HierarchicalDashboard />
            </ProtectedRoute>
          } />
          <Route path="/detail" element={
            <ProtectedRoute>
              <DetailPage />
            </ProtectedRoute>
          } />
          <Route path="/monthly-report" element={
            <ProtectedRoute>
              <MonthlyReportTable />
            </ProtectedRoute>
          } />
          <Route path="/sipd-cards" element={
            <ProtectedRoute adminOnly={true}>
              <SipdCardPage />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute adminOnly={true}>
              <UploadPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#722ed1', color: 'white' }}>
        Created by Alief Neutron 2025 - Sistem Monitoring Anggaran
      </Footer>
    </Layout>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#722ed1',
          colorSuccess: '#52c41a',
          colorInfo: '#1677ff',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          borderRadius: 8,
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f5f5f5',
        },
      }}
    >
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;