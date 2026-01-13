import { useState, useEffect, useMemo } from 'react';
import { getRecords, updateRecord } from '../utils/storage';
import { MACARON_COLORS, getAccountColorMap, getAccountColor } from '../utils/colors';

// 待办记录项组件
const PendingRecordItem = ({ record, accountColor, onRecordClick, onMoveToDate }) => {
  const [selectedDate, setSelectedDate] = useState('');

  const handleMove = () => {
    if (selectedDate) {
      onMoveToDate(record.id, selectedDate);
      setSelectedDate('');
    } else {
      alert('请先选择日期');
    }
  };

  return (
    <div
      className="p-3 rounded-lg border shadow-sm w-full min-w-0"
      style={{
        backgroundColor: accountColor.bg,
        borderColor: accountColor.border
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0 break-words">
          <div className="font-semibold text-sm break-words" style={{ color: accountColor.text }}>
            {record.accountName}
          </div>
          <div className="text-xs opacity-80 mt-1 break-words" style={{ color: accountColor.text }}>
            {record.product}
          </div>
          {record.revenue && (
            <div className="text-xs opacity-80 mt-1" style={{ color: accountColor.text }}>
              ¥{parseFloat(record.revenue || 0).toFixed(2)}
            </div>
          )}
        </div>
        <button
          onClick={() => onRecordClick(record)}
          className="text-xs px-2 py-1 rounded bg-white/50 hover:bg-white/80 transition-colors flex-shrink-0"
          style={{ color: accountColor.text }}
        >
          详情
        </button>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="flex-1 min-w-0 text-xs px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="选择日期"
        />
        <button
          onClick={handleMove}
          disabled={!selectedDate}
          className="w-full sm:w-auto px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          移动到
        </button>
      </div>
    </div>
  );
};

const CalendarView = ({ onRefresh, onRecordClick }) => {
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedDate, setExpandedDate] = useState(null); // 展开的日期
  const [loading, setLoading] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState(new Set()); // 选中的账号（空 Set 表示显示所有）

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

  // 根据选中的账号过滤记录（使用 useCallback 确保函数稳定）
  const filterRecordsByAccount = useMemo(() => {
    return (recordsList) => {
      // 如果没有选中任何账号，显示所有记录
      if (selectedAccounts.size === 0) {
        return recordsList;
      }
      // 只显示选中账号的记录
      return recordsList.filter(r => selectedAccounts.has(r.accountName));
    };
  }, [selectedAccounts]);

  // 获取某一天的所有记录（排除无日期的记录，并根据账号过滤）
  const getRecordsForDate = (date) => {
    const dateStr = formatDateLocal(date);
    const dayRecords = records.filter(r => r.date && r.date === dateStr);
    return filterRecordsByAccount(dayRecords);
  };

  // 获取所有待办记录（没有日期的记录，并根据账号过滤）
  const pendingRecords = useMemo(() => {
    const allPending = records.filter(r => {
      const hasNoDate = !r.date || r.date === '' || r.date === null;
      return hasNoDate;
    });
    const filtered = filterRecordsByAccount(allPending);
    // 调试信息（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('待办记录总数:', allPending.length, '过滤后:', filtered.length);
    }
    return filtered;
  }, [records, filterRecordsByAccount]);

  // 将待办记录移动到指定日期
  const handleMoveToDate = async (recordId, targetDate) => {
    try {
      const record = records.find(r => r.id === recordId);
      if (!record) return;

      await updateRecord(recordId, {
        ...record,
        date: targetDate
      });

      // 重新加载记录
      await loadRecords();
    } catch (error) {
      console.error('Error moving record to date:', error);
      alert('移动失败，请重试');
    }
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

  // 切换账号选中状态
  const toggleAccount = (accountName) => {
    setSelectedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountName)) {
        newSet.delete(accountName);
      } else {
        newSet.add(accountName);
      }
      return newSet;
    });
  };

  // 全选所有账号
  const selectAllAccounts = () => {
    const allAccounts = Object.keys(accountColors);
    setSelectedAccounts(new Set(allAccounts));
  };

  // 清除所有选中
  const clearAllAccounts = () => {
    setSelectedAccounts(new Set());
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
    <div className="w-full">
      {/* 左右布局容器：移动端垂直，桌面端水平 */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* 左侧栏：待办事项 - 始终显示 */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col lg:h-[calc(100vh-12rem)] lg:sticky lg:top-24">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
              <span>待办事项 ({pendingRecords.length})</span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2 min-h-0">
              {pendingRecords.length > 0 ? (
                pendingRecords.map(record => {
                  const accountColor = getAccountColor(record.accountName, accountColorMap);
                  return (
                    <PendingRecordItem
                      key={record.id}
                      record={record}
                      accountColor={accountColor}
                      onRecordClick={handleRecordClick}
                      onMoveToDate={handleMoveToDate}
                    />
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-sm text-slate-500 mb-1">暂无待办事项</p>
                  <p className="text-xs text-slate-400">添加记录时不填写日期即可加入待办</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧内容区：账号过滤 + 日历 */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* 账号颜色图例 - 放在一个干净的小卡片里，支持过滤 */}
          {Object.keys(accountColors).length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">账号过滤</span>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllAccounts}
                    className="text-xs px-3 py-1 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                  >
                    全选
                  </button>
                  <button
                    onClick={clearAllAccounts}
                    className="text-xs px-3 py-1 text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                  >
                    清除
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(accountColors).map(([account, color]) => {
                  const isSelected = selectedAccounts.has(account);
                  return (
                    <button
                      key={account}
                      onClick={() => toggleAccount(account)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span 
                        className={`w-3 h-3 rounded-full transition-all ${
                          isSelected ? 'ring-2 ring-emerald-500 ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: color.bg }}
                      ></span>
                      <span className={`text-sm ${
                        isSelected ? 'text-emerald-700 font-medium' : 'text-slate-700'
                      }`}>
                        {account}
                      </span>
                      {isSelected && (
                        <span className="text-emerald-600 text-xs">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedAccounts.size > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    已选择 <span className="font-medium text-emerald-600">{selectedAccounts.size}</span> 个账号
                    {selectedAccounts.size === Object.keys(accountColors).length && '（全部）'}
                  </p>
                </div>
              )}
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
      </div>
    </div>
  );
};

export default CalendarView;
