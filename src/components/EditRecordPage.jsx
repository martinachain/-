import { useState, useEffect } from 'react';
import { updateRecord } from '../utils/storage';
import { ArrowLeft } from 'lucide-react';
import { MACARON_COLORS } from '../utils/colors';

const EditRecordPage = ({ record, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    product: '',
    date: '',
    revenue: '',
    accountColor: null
  });

  // 取前10个颜色供选择
  const availableColors = MACARON_COLORS.slice(0, 10);

  useEffect(() => {
    if (record) {
      setFormData({
        accountName: record.accountName || '',
        product: record.product || '',
        date: record.date || '',
        revenue: record.revenue || '',
        accountColor: record.accountColor || null
      });
    }
  }, [record]);

  if (!record) return null;

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
      alert('记录已更新！');
      if (onSuccess) onSuccess(); // 直接返回日程日历页面
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
    <div className="w-full max-w-2xl mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>返回详情</span>
      </button>

      {/* 表单卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">编辑记录</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="edit-accountName" className="block text-sm font-medium text-slate-700">
              账号名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="edit-accountName"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              required
              placeholder="请输入账号名"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-product" className="block text-sm font-medium text-slate-700">
              推荐产品 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="edit-product"
              name="product"
              value={formData.product}
              onChange={handleChange}
              required
              placeholder="请输入推荐产品"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-date" className="block text-sm font-medium text-slate-700">
              推广日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="edit-date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-revenue" className="block text-sm font-medium text-slate-700">
              收益（元）
            </label>
            <input
              type="number"
              id="edit-revenue"
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              placeholder="请输入收益金额"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              账号颜色
            </label>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({ ...formData, accountColor: color })}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    formData.accountColor?.bg === color.bg
                      ? 'border-slate-800 scale-110 shadow-lg ring-2 ring-indigo-500'
                      : 'border-slate-300 hover:border-slate-400 hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: color.bg,
                    borderColor: formData.accountColor?.bg === color.bg ? color.border : undefined
                  }}
                  title={`选择${['淡粉色', '淡黄色', '淡绿色', '淡蓝色', '淡紫色', '淡橙色', '淡青色', '淡薄荷绿', '淡玫瑰色', '淡薰衣草色'][index]}`}
                >
                  {formData.accountColor?.bg === color.bg && (
                    <span className="text-white text-lg font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">选择一个颜色来标识此账号（可选）</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '保存中...' : '保存更改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecordPage;

