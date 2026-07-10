import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Descriptions
} from 'antd';
import moment from 'moment';

const { Option } = Select;

const BudgetFormModal = ({ 
  visible,
  mode,
  record,
  onCancel,
  onOk,
  loading,
  filterOptions
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        ...record,
        // Ensure date fields are moment objects if they exist
      });
    } else {
      form.resetFields();
    }
  }, [record, form]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        onOk({ ...record, ...values });
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const isViewMode = mode === 'view';

  return (
    <Modal
      visible={visible}
      title={isViewMode ? 'Detail Data Anggaran' : 'Edit Data Anggaran'}
      okText={isViewMode ? 'OK' : 'Simpan'}
      cancelText="Batal"
      onCancel={onCancel}
      onOk={isViewMode ? onCancel : handleOk}
      confirmLoading={loading}
      width={720}
      destroyOnClose
    >
      {isViewMode ? (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Nama Kegiatan">{record?.nama_kegiatan}</Descriptions.Item>
          <Descriptions.Item label="Kode Rekening">{record?.kode_rekening}</Descriptions.Item>
          <Descriptions.Item label="Bidang">{record?.bidang}</Descriptions.Item>
          <Descriptions.Item label="Semester">{record?.semester}</Descriptions.Item>
          <Descriptions.Item label="Pagu">{`Rp. ${record?.pagu?.toLocaleString('id-ID')}`}</Descriptions.Item>
          <Descriptions.Item label="Realisasi">{`Rp. ${record?.realisasi?.toLocaleString('id-ID')}`}</Descriptions.Item>
          <Descriptions.Item label="Sisa">{`Rp. ${record?.sisa?.toLocaleString('id-ID')}`}</Descriptions.Item>
          <Descriptions.Item label="Persentase">{`${record?.percentage?.toFixed(1)}%`}</Descriptions.Item>
          <Descriptions.Item label="Status">{record?.status}</Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical" name="budget_form">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="nama_kegiatan"
                label="Nama Kegiatan"
                rules={[{ required: true, message: 'Nama kegiatan tidak boleh kosong!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="kode_rekening"
                label="Kode Rekening"
                rules={[{ required: true, message: 'Kode rekening tidak boleh kosong!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bidang"
                label="Bidang"
                rules={[{ required: true, message: 'Bidang tidak boleh kosong!' }]}
              >
                <Select placeholder="Pilih bidang">
                  {filterOptions?.bidangs?.map(b => <Option key={b} value={b}>{b}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="semester"
                label="Semester"
                rules={[{ required: true, message: 'Semester tidak boleh kosong!' }]}
              >
                <Select placeholder="Pilih semester">
                  {filterOptions?.semesters?.map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pagu"
                label="Pagu Anggaran"
                rules={[{ required: true, message: 'Pagu tidak boleh kosong!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `Rp. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/Rp\.\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="realisasi"
                label="Realisasi Anggaran"
                rules={[{ required: true, message: 'Realisasi tidak boleh kosong!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `Rp. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/Rp\.\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
};

export default BudgetFormModal;
