import React from 'react';
import { BankOutlined, FolderOutlined, ProjectOutlined, ToolOutlined, SettingOutlined, DollarOutlined, FileOutlined } from '@ant-design/icons';
import './Breadcrumb.css';

const Breadcrumb = ({ path, onNavigate }) => {
  // Level icons mapping for SIPD hierarchy
  const getLevelIcon = (level) => {
    switch (level) {
      case 'skpd': return <BankOutlined style={{ color: '#1890ff' }} />;
      case 'bidang': return <FolderOutlined style={{ color: '#52c41a' }} />;
      case 'program': return <ProjectOutlined style={{ color: '#722ed1' }} />;
      case 'kegiatan': return <ToolOutlined style={{ color: '#fa8c16' }} />;
      case 'sub_kegiatan': return <SettingOutlined style={{ color: '#13c2c2' }} />;
      case 'belanja': return <DollarOutlined style={{ color: '#eb2f96' }} />;
      default: return <FileOutlined />;
    }
  };

  // Handle breadcrumb click
  const handleBreadcrumbClick = (index) => {
    if (onNavigate && index < path.length - 1) {
      const targetPath = path.slice(0, index + 1);
      onNavigate(targetPath);
    }
  };

  if (!path || path.length === 0) {
    return (
      <div className="breadcrumb">
        <div className="breadcrumb-item">
          <span className="breadcrumb-icon">🏠</span>
          <span className="breadcrumb-text">Dashboard</span>
        </div>
      </div>
    );
  }

  return (
    <div className="breadcrumb">
      <div className="breadcrumb-item">
        <span className="breadcrumb-icon">🏠</span>
        <span className="breadcrumb-text">Dashboard</span>
      </div>

      {path.map((item, index) => (
        <React.Fragment key={index}>
          <span className="breadcrumb-separator">{'>'}</span>
          <div
            className={`breadcrumb-item ${index < path.length - 1 ? 'clickable' : 'current'}`}
            onClick={() => handleBreadcrumbClick(index)}
          >
            <span className="breadcrumb-icon">
              {getLevelIcon(item.level)}
            </span>
            <span className="breadcrumb-text" title={item.name}>
              {item.name.length > 30 ? `${item.name.substring(0, 30)}...` : item.name}
            </span>
            {item.kode_rekening && (
              <span className="breadcrumb-code">({item.kode_rekening})</span>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
