import { useState, useEffect } from 'react';
import { updateRecord } from '../utils/storage';

const EditRecordModal = ({ record, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    product: '',
    date: '',
    revenue: ''
  });

  useEffect(() => {
    if (record) {
      setFormData({
        accountName: record.accountName || '',
        product: record.product || '',
        date: record.date || '',
        revenue: record.revenue || ''
      });
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountName || !formData.product || !formData.date) {
      alert('请填写所有必填字段');
      return;
    }
    try {
      setSubmitting(true);
      await updateRecord(record.id, formData);
      if (onSuccess) onSuccess();
      onClose();
      alert('记录已更新！');
    } catch (error) {
      console.error('Error updating record:', error);
      alert('更新失败，请重试');
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
          <h2>编辑记录</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="record-form">
          <div className="form-group">
            <label htmlFor="edit-accountName">账号名 *</label>
            <input
              type="text"
              id="edit-accountName"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              required
              placeholder="请输入账号名"
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-product">推荐产品 *</label>
            <input
              type="text"
              id="edit-product"
              name="product"
              value={formData.product}
              onChange={handleChange}
              required
              placeholder="请输入推荐产品"
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-date">推广日期 *</label>
            <input
              type="date"
              id="edit-date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-revenue">收益（元）</label>
            <input
              type="number"
              id="edit-revenue"
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
              {submitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecordModal;

