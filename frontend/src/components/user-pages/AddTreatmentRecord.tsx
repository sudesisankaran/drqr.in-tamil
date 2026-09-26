import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Upload, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../utils/firebase';
import _env from '../../utils/_env';

const AddTreatmentRecord: React.FC = () => {
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
      let treatmentIdProofUrl = '';

      if (values.treatmentIdProof?.length > 0) {
        treatmentIdProofUrl = await uploadFile(values.treatmentIdProof[0].originFileObj, 'treatment_proofs');
      }

      const payload = {
        doctorName: values.doctorName || '',
        doctorLicenceNumber: values.doctorLicenceNumber || '',
        doctorQualification: values.doctorQualification || '',
        treatmentDate: values.treatmentDate ? values.treatmentDate.toISOString() : undefined,
        treatmentName: values.treatmentName || '',
        treatmentIdProofUrl: treatmentIdProofUrl,
      };

      const token = sessionStorage.getItem('token');
      await axios.post(`${_env.SERVER_URL}/treatments`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      message.success('Treatment record added successfully');
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error('Failed to add treatment record');
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
      <Card title="Add Treatment Record" className="max-w-3xl mx-auto shadow-sm">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="doctorName" label="Doctor Name" rules={[{ required: true, message: 'Please enter doctor name' }]}>
              <Input placeholder="Dr. John Doe" />
            </Form.Item>
            
            <Form.Item name="doctorLicenceNumber" label="Doctor Licence Number" rules={[{ required: true, message: 'Please enter doctor licence number' }]}>
              <Input placeholder="e.g. DOC-12345" />
            </Form.Item>
            
            <Form.Item name="doctorQualification" label="Doctor Qualification" rules={[{ required: true, message: 'Please enter doctor qualification' }]}>
              <Input placeholder="e.g. MBBS, MD" />
            </Form.Item>
            
            <Form.Item name="treatmentName" label="Treatment Name" rules={[{ required: true, message: 'Please enter treatment name' }]}>
              <Input placeholder="e.g. Root Canal, Checkup" />
            </Form.Item>
            
            <Form.Item name="treatmentDate" label="Date of Treatment" rules={[{ required: true, message: 'Please select date' }]}>
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <div className="mt-4">
            <Form.Item name="treatmentIdProof" label="Treatment ID / Document Proof" valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />}>Upload Document</Button>
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

export default AddTreatmentRecord;
