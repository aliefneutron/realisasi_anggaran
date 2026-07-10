import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const { Title, Text } = Typography;

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const result = login(values.username, values.password);

        if (result.success) {
            message.success(`Selamat datang, ${result.user.name}!`);
            navigate('/', { replace: true });
        } else {
            message.error(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <Card className="login-card" bordered={false}>
                <div className="login-header">
                    <Title level={2} style={{ margin: 0, color: '#531dab' }}>
                        SIMONA
                    </Title>
                    <Text type="secondary">Sistem Monitoring Anggaran</Text>
                </div>

                <Form
                    name="login"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Masukkan username!' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Username"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Masukkan password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<LoginOutlined />}
                            block
                            style={{ height: '45px', fontSize: '16px' }}
                        >
                            Login
                        </Button>
                    </Form.Item>
                </Form>

                <div className="login-info">
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        <strong>Demo Credentials:</strong><br />
                        Admin: admin / admin123<br />
                        Bidang: sekretariat / sekretariat123
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
