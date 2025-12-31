import { useState } from 'react';
import { addRecord } from '../utils/storage';

const RecordForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    product: '',
    date: '',
    revenue: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountName || !formData.product || !formData.date) {
      alert('请填写所有必填字段');
      return;
    }
    try {
      setSubmitting(true);
      await addRecord(formData);
      setFormData({
        accountName: '',
        product: '',
        date: '',
        revenue: ''
      });
      if (onSuccess) onSuccess();
      alert('记录已保存！');
    } catch (error) {
      console.error('Error adding record:', error);
      alert('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="record-form">
      <h2>添加新记录</h2>
      <div className="form-group">
        <label htmlFor="accountName">账号名 *</label>
        <input
          type="text"
          id="accountName"
          name="accountName"
          value={formData.accountName}
          onChange={handleChange}
          required
          placeholder="请输入账号名"
        />
      </div>
      <div className="form-group">
        <label htmlFor="product">推荐产品 *</label>
        <input
          type="text"
          id="product"
          name="product"
          value={formData.product}
          onChange={handleChange}
          required
          placeholder="请输入推荐产品"
        />
      </div>
      <div className="form-group">
        <label htmlFor="date">推广日期 *</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="revenue">收益（元）</label>
        <input
          type="number"
          id="revenue"
          name="revenue"
          value={formData.revenue}
          onChange={handleChange}
          placeholder="请输入收益金额"
          step="0.01"
          min="0"
        />
      </div>
      <button type="submit" className="submit-btn" disabled={submitting}>
        {submitting ? '保存中...' : '保存记录'}
      </button>
    </form>
  );
};

export default RecordForm;

