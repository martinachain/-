import { useState } from 'react';
import { deleteRecord } from '../utils/storage';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { getAccountColor } from '../utils/colors';

const DetailRecordPage = ({ record, accountColorMap, onBack, onEdit, onDelete }) => {
  if (!record) return null;

  const accountColor = getAccountColor(record.accountName, accountColorMap);

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        setDeleting(true);
        await deleteRecord(record.id);
        if (onDelete) onDelete();
        onBack();
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('删除失败，请重试');
      } finally {
        setDeleting(false);
      }
    }
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

      {/* 详情卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">记录详情</h2>
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Edit size={18} />
              <span>编辑</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              <span>{deleting ? '删除中...' : '删除'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* 账号名 */}
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">账号名</label>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-base font-semibold border"
                style={{
                  backgroundColor: accountColor.bg,
                  color: accountColor.text,
                  borderColor: accountColor.border
                }}
              >
                {record.accountName}
              </span>
            </div>
          </div>

          {/* 推荐产品 */}
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">推荐产品</label>
            <p className="text-lg text-slate-800 font-medium">{record.product}</p>
          </div>

          {/* 推广日期 */}
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">推广日期</label>
            <p className="text-lg text-slate-800 font-medium">{record.date}</p>
          </div>

          {/* 收益 */}
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">收益（元）</label>
            <p className="text-2xl font-bold text-slate-800">
              ¥{parseFloat(record.revenue || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailRecordPage;

