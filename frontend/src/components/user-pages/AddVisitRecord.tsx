import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Upload, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../utils/firebase';
import _env from '../../utils/_env';

const AddVisitRecord: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileRef = ref(storage, `${path}/${uuidv4()}-${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      let prescriptionUrl = '';
      let scanningReportUrl = '';
      let billUrl = '';
      const labReportsData: { name: string; url: string }[] = [];

      if (values.prescription?.length > 0) {
        prescriptionUrl = await uploadFile(values.prescription[0].originFileObj, 'prescriptions');
      }
      if (values.scanningReport?.length > 0) {
        scanningReportUrl = await uploadFile(values.scanningReport[0].originFileObj, 'scans');
      }
      if (values.bill?.length > 0) {
        billUrl = await uploadFile(values.bill[0].originFileObj, 'bills');
      }
      if (values.labReports?.length > 0) {
        for (const file of values.labReports) {
          const url = await uploadFile(file.originFileObj, 'lab-reports');
          labReportsData.push({ name: file.name, url });
        }
      }

      const payload = {
        prescription: prescriptionUrl,
        scanningReport: scanningReportUrl,
        bill: billUrl,
        labReports: labReportsData,
        location: values.location || '',
        hospitalName: values.hospitalName || '',
        doctorName: values.doctorName || '',
        doctorRegNo: values.doctorRegNo || '',
        visitDate: values.visitDate ? values.visitDate.toISOString() : undefined,
      };

      const token = sessionStorage.getItem('token');
      await axios.post(`${_env.SERVER_URL}/visits`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      message.success('Visit record added successfully');
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error('Failed to add visit record');
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div className="p-6">
      <Card title="Add Visit Record" className="max-w-3xl mx-auto shadow-sm">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="doctorName" label="Doctor Name" rules={[{ required: true, message: 'Please enter doctor name' }]}>
              <Input placeholder="Dr. John Doe" />
            </Form.Item>
            <Form.Item name="doctorRegNo" label="Doctor Reg No">
              <Input placeholder="Registration Number" />
            </Form.Item>
            <Form.Item name="hospitalName" label="Hospital Name" rules={[{ required: true, message: 'Please enter hospital name' }]}>
              <Input placeholder="City Hospital" />
            </Form.Item>
            <Form.Item name="location" label="Location">
              <Input placeholder="City, State" />
            </Form.Item>
            <Form.Item name="visitDate" label="Date & Time" rules={[{ required: true, message: 'Please select date' }]}>
              <DatePicker showTime className="w-full" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Form.Item name="prescription" label="Prescription" valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />}>Upload Prescription</Button>
              </Upload>
            </Form.Item>
            <Form.Item name="scanningReport" label="Scanning Report" valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />}>Upload Scanning Report</Button>
              </Upload>
            </Form.Item>
            <Form.Item name="bill" label="Bill" valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />}>Upload Bill</Button>
              </Upload>
            </Form.Item>
            <Form.Item name="labReports" label="Lab Reports (Multiple)" valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload beforeUpload={() => false} multiple>
                <Button icon={<UploadOutlined />}>Upload Lab Reports</Button>
              </Upload>
            </Form.Item>
          </div>

          <Form.Item className="mt-6 text-right">
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Submit Record
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddVisitRecord;
