import React, { useState, useEffect } from 'react';
import {
  BankOutlined,
  FolderOutlined,
  AppstoreOutlined,
  ProjectOutlined,
  ToolOutlined,
  SettingOutlined,
  DollarOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  FileOutlined,
  SearchOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
  CheckCircleFilled,
  WarningFilled,
  CloseCircleFilled,
  InfoCircleFilled,
  MinusCircleFilled,
  TagOutlined,
  LineChartOutlined,
  WalletOutlined
} from '@ant-design/icons';
import './HierarchicalMenu.css';

const HierarchicalMenu = ({ data, onNodeSelect, selectedNode }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  // Status icons and colors
  // Status icons and colors
  const getStatusIcon = (percentage) => {
    if (percentage >= 90) return { icon: <CheckCircleFilled />, status: 'Tinggi', color: '#22c55e' };
    if (percentage >= 70) return { icon: <WarningFilled />, status: 'Normal', color: '#eab308' };
    if (percentage >= 50) return { icon: <InfoCircleFilled />, status: 'Rendah', color: '#f97316' };
    if (percentage > 0) return { icon: <CloseCircleFilled />, status: 'Kritis', color: '#ef4444' };
    return { icon: <MinusCircleFilled />, status: 'Tidak Ada Data', color: '#6b7280' };
  };

  // Level icons for SIPD hierarchy
  // Level icons for SIPD hierarchy
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

  // Toggle node expansion
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Handle node selection
  const handleNodeSelect = (node) => {
    onNodeSelect(node);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate percentage
  const calculatePercentage = (realisasi, pagu) => {
    if (!pagu || pagu === 0) return 0;
    return (realisasi / pagu) * 100;
  };

  // Search functionality
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
      return;
    }

    const filterNodes = (nodes) => {
      return nodes.filter(node => {
        const matchesSearch =
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.kode_rekening?.toLowerCase().includes(searchTerm.toLowerCase());

        if (matchesSearch) return true;
        if (node.children) {
          const filteredChildren = filterNodes(node.children);
          return filteredChildren.length > 0;
        }
        return false;
      }).map(node => ({
        ...node,
        children: node.children ? filterNodes(node.children) : undefined
      }));
    };

    setFilteredData(filterNodes(data));
  }, [searchTerm, data]);

  // Render menu node
  const renderNode = (node, level = 1) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const percentage = calculatePercentage(node.realisasi, node.pagu);
    const statusInfo = getStatusIcon(percentage);
    const levelIcon = getLevelIcon(node.level);

    return (
      <div key={node.id} className="menu-node">
        <div
          className={`node-header ${isSelected ? 'selected' : ''}`}
          onClick={() => handleNodeSelect(node)}
          style={{ paddingLeft: `${(level - 1) * 20}px` }}
        >
          <div className="node-content">
            {hasChildren && (
              <button
                className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.id);
                }}
              >
                {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
              </button>
            )}

            <span className="level-icon">{levelIcon}</span>
            <span className="node-name">{node.name}</span>
            <span className="status-icon" title={statusInfo.status}>
              {statusInfo.icon}
            </span>
          </div>

          {node.pagu && (
            <div className="node-details">
              <div className="budget-info">
                <span className="pagu"><LineChartOutlined /> {formatCurrency(node.pagu)}</span>
                <span className="realisasi"><WalletOutlined /> {formatCurrency(node.realisasi)} ({percentage.toFixed(2)}%)</span>
                {node.kode_rekening && (
                  <span className="kode"><TagOutlined /> {node.kode_rekening}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="node-children">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="hierarchical-menu">
      {/* Search Bar */}
      <div className="menu-search">
        <div className="search-input">
          <span className="search-icon"><SearchOutlined /></span>
          <input
            type="text"
            placeholder="Cari program, kegiatan, atau kode rekening..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Menu Tree */}
      <div className="menu-tree">
        {filteredData.map(node => renderNode(node))}
      </div>

      {/* Legend */}
      <div className="menu-legend">
        <h4>Status Realisasi:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span style={{ color: '#22c55e' }}><CheckCircleFilled /></span> Tinggi (≥90%)
          </div>
          <div className="legend-item">
            <span style={{ color: '#eab308' }}><WarningFilled /></span> Normal (≥70%)
          </div>
          <div className="legend-item">
            <span style={{ color: '#f97316' }}><InfoCircleFilled /></span> Rendah (≥50%)
          </div>
          <div className="legend-item">
            <span style={{ color: '#ef4444' }}><CloseCircleFilled /></span> Kritis (&lt;50%)
          </div>
          <div className="legend-item">
            <span style={{ color: '#6b7280' }}><MinusCircleFilled /></span> Tidak Ada Data
          </div>
        </div>
      </div>
    </div>
  );
};

export default HierarchicalMenu;
