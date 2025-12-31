import { useState } from 'react';
import { addRecord } from '../utils/storage';

const AddRecordModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    product: '',
    date: '',
    revenue: ''
  });

  if (!isOpen) return null;

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
      onClose();
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>添加新记录</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="record-form">
          <div className="form-group">
            <label htmlFor="add-accountName">账号名 *</label>
            <input
              type="text"
              id="add-accountName"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              required
              placeholder="请输入账号名"
            />
          </div>
          <div className="form-group">
            <label htmlFor="add-product">推荐产品 *</label>
            <input
              type="text"
              id="add-product"
              name="product"
              value={formData.product}
              onChange={handleChange}
              required
              placeholder="请输入推荐产品"
            />
          </div>
          <div className="form-group">
            <label htmlFor="add-date">推广日期 *</label>
            <input
              type="date"
              id="add-date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="add-revenue">收益（元）</label>
            <input
              type="number"
              id="add-revenue"
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              placeholder="请输入收益金额"
              step="0.01"
              min="0"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>取消</button>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? '保存中...' : '保存记录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;

