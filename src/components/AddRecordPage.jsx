import { useState } from 'react';
import { addRecord } from '../utils/storage';
import { ArrowLeft } from 'lucide-react';
import { MACARON_COLORS } from '../utils/colors';

const AddRecordPage = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    product: '',
    date: '',
    revenue: '',
    accountColor: null // 用户选择的颜色
  });

  // 取前10个颜色供选择
  const availableColors = MACARON_COLORS.slice(0, 10);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountName || !formData.product) {
      alert('请填写账号名和推荐产品');
      return;
    }
    try {
      setSubmitting(true);
      await addRecord(formData);
      setFormData({
        accountName: '',
        product: '',
        date: '',
        revenue: '',
        accountColor: null
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
    <div className="w-full max-w-2xl mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>返回日程日历</span>
      </button>

      {/* 表单卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">添加新记录</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="accountName" className="block text-sm font-medium text-slate-700">
              账号名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountName"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              required
              placeholder="请输入账号名"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="product" className="block text-sm font-medium text-slate-700">
              推荐产品 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="product"
              name="product"
              value={formData.product}
              onChange={handleChange}
              required
              placeholder="请输入推荐产品"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-slate-700">
              推广日期 <span className="text-slate-400 text-xs">(可选，不填将加入待办)</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="revenue" className="block text-sm font-medium text-slate-700">
              收益（元）
            </label>
            <input
              type="number"
              id="revenue"
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
              {submitting ? '保存中...' : '保存记录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordPage;

