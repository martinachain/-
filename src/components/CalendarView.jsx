import { useState, useEffect, useMemo } from 'react';
import { getRecords } from '../utils/storage';
import { MACARON_COLORS, getAccountColorMap, getAccountColor } from '../utils/colors';

const CalendarView = ({ onRefresh, onRecordClick }) => {
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedDate, setExpandedDate] = useState(null); // 展开的日期
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await getRecords();
      // 转换数据格式（从 snake_case 转为 camelCase）
      const formattedData = data.map(record => ({
        id: record.id?.toString() || record.id,
        accountName: record.account_name || record.accountName,
        product: record.product,
        date: record.date,
        revenue: record.revenue,
        accountColor: record.account_color || record.accountColor
      }));
      setRecords(formattedData);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  // 智能颜色分配：按账号首次出现的顺序分配颜色，确保新账号获得不同颜色
  const accountColorMap = useMemo(() => {
    return getAccountColorMap(records);
  }, [records]);

  // 删除功能已移至编辑页面，日历中不再提供删除按钮

  const handleRecordClick = (record) => {
    if (onRecordClick) {
      onRecordClick(record);
    }
  };

  const handleMoreClick = (dateStr, e) => {
    e.stopPropagation();
    // 如果已经展开，则收起；否则展开
    setExpandedDate(expandedDate === dateStr ? null : dateStr);
  };

  // 获取当前月份的第一天和最后一天
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // 获取上个月的最后几天
  const prevMonth = new Date(year, month, 0);
  const daysInPrevMonth = prevMonth.getDate();

  // 生成日历天数数组
  const calendarDays = [];

  // 上个月的日期
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false
    });
  }

  // 当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(year, month, day),
      isCurrentMonth: true
    });
  }

  // 下个月的日期（填满6行）
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false
    });
  }

  // 格式化日期为 YYYY-MM-DD（使用本地时间，避免时区问题）
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 获取某一天的所有记录
  const getRecordsForDate = (date) => {
    const dateStr = formatDateLocal(date);
    return records.filter(r => r.date === dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  // 获取所有账号及其颜色（使用智能分配）
  const accountColors = useMemo(() => {
    return accountColorMap;
  }, [accountColorMap]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* 账号颜色图例 - 放在一个干净的小卡片里 */}
      {Object.keys(accountColors).length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500 border-r pr-4">账号过滤</span>
          <div className="flex flex-wrap gap-4">
            {Object.entries(accountColors).map(([account, color]) => (
              <div key={account} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color.bg }}></span>
                <span className="text-sm text-slate-700">{account}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 日历主体卡片 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* 内部的日历导航（仅限年月切换） */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">
            {year}年 {monthNames[month]}
          </h2>
          <div className="flex gap-2">
            <button onClick={goToPreviousMonth} className="p-2 hover:bg-slate-100 rounded-lg border">‹</button>
            <button onClick={goToToday} className="px-4 py-2 hover:bg-slate-100 rounded-lg border text-sm">今天</button>
            <button onClick={goToNextMonth} className="p-2 hover:bg-slate-100 rounded-lg border">›</button>
          </div>
        </div>

        {/* 日历网格主体 */}
        <div className="p-4">
          {/* 星期标题 */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
            {weekDays.map(day => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500">{day}</div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7">
            {calendarDays.map((dayInfo, index) => {
              const dayRecords = getRecordsForDate(dayInfo.date);
              const dateStr = formatDateLocal(dayInfo.date);
              const todayStr = formatDateLocal(new Date());
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-1 sm:p-2 border-r border-b border-slate-100 flex flex-col gap-1 transition-colors hover:bg-slate-50 ${
                    !dayInfo.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : ''
                  }`}
                >
                  <div className={`font-semibold text-sm ${isToday ? 'w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center' : ''}`}>
                    {dayInfo.date.getDate()}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    {(expandedDate === dateStr ? dayRecords : dayRecords.slice(0, 3)).map(record => {
                      const accountColor = getAccountColor(record.accountName, accountColorMap);
                      return (
                        <div
                          key={record.id}
                          className="px-1 sm:px-2 py-1 text-xs rounded-md border shadow-sm cursor-pointer break-words"
                          onClick={() => handleRecordClick(record)}
                          title={`${record.accountName} - ${record.product} (¥${parseFloat(record.revenue || 0).toFixed(2)})`}
                          style={{
                            backgroundColor: accountColor.bg,
                            color: accountColor.text,
                            borderColor: accountColor.border
                          }}
                        >
                          <div className="break-words whitespace-normal">
                            <span className="font-semibold">{record.accountName}</span>
                            <span className="ml-1 opacity-80">{record.product}</span>
                          </div>
                        </div>
                      );
                    })}
                    {dayRecords.length > 3 && (
                      <div 
                        className="text-xs text-slate-500 text-center py-1 cursor-pointer hover:text-slate-700 border border-dashed border-slate-300 rounded"
                        onClick={(e) => handleMoreClick(dateStr, e)}
                      >
                        {expandedDate === dateStr 
                          ? `收起 (${dayRecords.length - 3})` 
                          : `+${dayRecords.length - 3} 更多`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CalendarView;
