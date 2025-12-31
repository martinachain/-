import { useState, useEffect, useMemo } from 'react';
import { getRecords } from '../utils/storage';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getAccountColorMap, getAccountColor } from '../utils/colors';

const DashboardView = () => {
  const [records, setRecords] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [chartType, setChartType] = useState('month');
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

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (!dateRange.start && !dateRange.end) return true;
      const recordDate = new Date(record.date);
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;
      
      if (start && recordDate < start) return false;
      if (end && recordDate > end) return false;
      return true;
    });
  }, [records, dateRange]);

  // 总收益
  const totalRevenue = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + parseFloat(r.revenue || 0), 0);
  }, [filteredRecords]);

  // 本月收益
  const currentMonthRevenue = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return filteredRecords
      .filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + parseFloat(r.revenue || 0), 0);
  }, [filteredRecords]);

  // 账号总数
  const accountCount = useMemo(() => {
    const accounts = new Set(filteredRecords.map(r => r.accountName));
    return accounts.size;
  }, [filteredRecords]);

  // 获取账号颜色映射（与日历保持一致）
  const accountColorMap = useMemo(() => {
    return getAccountColorMap(filteredRecords);
  }, [filteredRecords]);

  // 按账号收益统计（用于饼图）
  const accountRevenueData = useMemo(() => {
    const accountStats = {};
    filteredRecords.forEach(record => {
      const account = record.accountName;
      if (!accountStats[account]) {
        accountStats[account] = 0;
      }
      accountStats[account] += parseFloat(record.revenue || 0);
    });

    return Object.entries(accountStats)
      .map(([name, value]) => ({ 
        name, 
        value: parseFloat(value.toFixed(2)),
        percent: 0 // 稍后计算
      }))
      .sort((a, b) => b.value - a.value)
      .map((item, index, arr) => {
        const total = arr.reduce((sum, i) => sum + i.value, 0);
        return {
          ...item,
          percent: total > 0 ? (item.value / total) * 100 : 0
        };
      });
  }, [filteredRecords]);

  // 按月统计收益
  const monthlyRevenueData = useMemo(() => {
    const monthlyStats = {};
    filteredRecords.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = 0;
      }
      monthlyStats[monthKey] += parseFloat(record.revenue || 0);
    });

    return Object.entries(monthlyStats)
      .map(([month, revenue]) => ({
        period: month.replace(/-/, '年').replace(/-/, '月'),
        revenue: parseFloat(revenue.toFixed(2))
      }))
      .sort((a, b) => {
        const aDate = a.period.replace('年', '-').replace('月', '');
        const bDate = b.period.replace('年', '-').replace('月', '');
        return aDate.localeCompare(bDate);
      });
  }, [filteredRecords]);

  // 按周统计收益
  const weeklyRevenueData = useMemo(() => {
    const weeklyStats = {};
    
    filteredRecords.forEach(record => {
      const date = new Date(record.date);
      const year = date.getFullYear();
      const startOfYear = new Date(year, 0, 1);
      const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
      const week = Math.floor(days / 7) + 1;
      const weekKey = `${year}年第${week}周`;
      
      if (!weeklyStats[weekKey]) {
        weeklyStats[weekKey] = 0;
      }
      weeklyStats[weekKey] += parseFloat(record.revenue || 0);
    });

    return Object.entries(weeklyStats)
      .map(([week, revenue]) => ({
        period: week,
        revenue: parseFloat(revenue.toFixed(2))
      }))
      .sort((a, b) => {
        const aNum = parseInt(a.period.match(/\d+/g)?.[1] || '0');
        const bNum = parseInt(b.period.match(/\d+/g)?.[1] || '0');
        return aNum - bNum;
      });
  }, [filteredRecords]);

  // 按日统计收益（按账号分组）
  const dailyRevenueData = useMemo(() => {
    const dailyStats = {};
    const accounts = new Set(filteredRecords.map(r => r.accountName));
    
    filteredRecords.forEach(record => {
      const dateStr = record.date; // 已经是 YYYY-MM-DD 格式
      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {};
        accounts.forEach(acc => {
          dailyStats[dateStr][acc] = 0;
        });
      }
      dailyStats[dateStr][record.accountName] = (dailyStats[dateStr][record.accountName] || 0) + parseFloat(record.revenue || 0);
    });

    return Object.entries(dailyStats)
      .map(([date, accountRevenues]) => ({
        period: date,
        ...Object.fromEntries(
          Object.entries(accountRevenues).map(([acc, rev]) => [acc, parseFloat(rev.toFixed(2))])
        )
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [filteredRecords]);

  // 详情表格数据（按收益排序）
  const sortedRecords = useMemo(() => {
    return [...filteredRecords]
      .map(record => ({
        ...record,
        revenue: parseFloat(record.revenue || 0)
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredRecords]);

  // 根据图表类型选择数据和账号列表
  const { chartData, accountList } = useMemo(() => {
    if (chartType === 'day') {
      const accounts = Array.from(new Set(filteredRecords.map(r => r.accountName)));
      return {
        chartData: dailyRevenueData,
        accountList: accounts
      };
    } else if (chartType === 'month') {
      // 按月统计，按账号分组
      const monthlyStats = {};
      const accounts = new Set(filteredRecords.map(r => r.accountName));
      
      filteredRecords.forEach(record => {
        const date = new Date(record.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = {};
          accounts.forEach(acc => {
            monthlyStats[monthKey][acc] = 0;
          });
        }
        monthlyStats[monthKey][record.accountName] = (monthlyStats[monthKey][record.accountName] || 0) + parseFloat(record.revenue || 0);
      });

      return {
        chartData: Object.entries(monthlyStats)
          .map(([month, accountRevenues]) => ({
            period: month.replace(/-/, '年').replace(/-/, '月'),
            ...Object.fromEntries(
              Object.entries(accountRevenues).map(([acc, rev]) => [acc, parseFloat(rev.toFixed(2))])
            )
          }))
          .sort((a, b) => {
            const aDate = a.period.replace('年', '-').replace('月', '');
            const bDate = b.period.replace('年', '-').replace('月', '');
            return aDate.localeCompare(bDate);
          }),
        accountList: Array.from(accounts)
      };
    } else {
      // 按周统计，按账号分组
      const weeklyStats = {};
      const accounts = new Set(filteredRecords.map(r => r.accountName));
      
      filteredRecords.forEach(record => {
        const date = new Date(record.date);
        const year = date.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
        const week = Math.floor(days / 7) + 1;
        const weekKey = `${year}年第${week}周`;
        
        if (!weeklyStats[weekKey]) {
          weeklyStats[weekKey] = {};
          accounts.forEach(acc => {
            weeklyStats[weekKey][acc] = 0;
          });
        }
        weeklyStats[weekKey][record.accountName] = (weeklyStats[weekKey][record.accountName] || 0) + parseFloat(record.revenue || 0);
      });

      return {
        chartData: Object.entries(weeklyStats)
          .map(([week, accountRevenues]) => ({
            period: week,
            ...Object.fromEntries(
              Object.entries(accountRevenues).map(([acc, rev]) => [acc, parseFloat(rev.toFixed(2))])
            )
          }))
          .sort((a, b) => {
            const aNum = parseInt(a.period.match(/\d+/g)?.[1] || '0');
            const bNum = parseInt(b.period.match(/\d+/g)?.[1] || '0');
            return aNum - bNum;
          }),
        accountList: Array.from(accounts)
      };
    }
  }, [chartType, filteredRecords, dailyRevenueData]);

  // 自定义 Tooltip 样式（支持多条线）
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xl p-3 backdrop-blur-sm">
          <p className="text-sm font-semibold text-slate-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-slate-600" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> ¥{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-view w-full">
      <div className="max-w-7xl mx-auto p-6 w-full space-y-6">
        {/* 标题和日期筛选 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 mt-1">数据统计与分析</p>
          </div>
          
          {/* 日期筛选 - 右上角工具栏 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3 flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-medium text-slate-500 whitespace-nowrap">日期范围</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border border-slate-300 rounded-md px-2 py-1 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
            />
            <span className="text-slate-400 text-sm">至</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border border-slate-300 rounded-md px-2 py-1 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
            />
            <button 
              onClick={() => setDateRange({ start: '', end: '' })}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
            >
              清除
            </button>
          </div>
        </div>

        {/* 数据总览卡片 - 横向排列 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 总收益 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">总收益</p>
              <p className="text-3xl font-bold text-slate-800 tracking-tight">¥{totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* 本月收益 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">本月收益</p>
              <p className="text-3xl font-bold text-slate-800 tracking-tight">¥{currentMonthRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* 账号总数 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">账号总数</p>
              <p className="text-3xl font-bold text-slate-800 tracking-tight">{accountCount}</p>
            </div>
          </div>
        </div>

        {/* 图表区域 - Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 饼图 - 账号收益占比 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800 mb-1">账号收益占比</h3>
              <p className="text-sm text-slate-500">各账号收益分布情况</p>
            </div>
            {accountRevenueData.length === 0 ? (
              <div className="flex items-center justify-center h-80 text-slate-400">
                <p className="text-sm">暂无数据</p>
              </div>
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={accountRevenueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={120}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="none"
                    >
                      {accountRevenueData.map((entry, index) => {
                        const accountColor = getAccountColor(entry.name, accountColorMap);
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={accountColor.bg}
                            stroke={accountColor.border}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip 
                      content={<CustomTooltip formatter={(value) => `¥${value.toFixed(2)}`} />}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* 自定义图例 */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {accountRevenueData.map((entry, index) => {
                    const accountColor = getAccountColor(entry.name, accountColorMap);
                    return (
                      <div key={entry.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0 border-2" 
                          style={{ 
                            backgroundColor: accountColor.bg,
                            borderColor: accountColor.border
                          }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{entry.name}</p>
                          <p className="text-xs text-slate-500">¥{entry.value.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-800">{entry.percent.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 柱状图 - 收益趋势 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">收益趋势</h3>
                <p className="text-sm text-slate-500">收益变化趋势分析</p>
              </div>
              <div className="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setChartType('day')}
                  className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${
                    chartType === 'day'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  按日
                </button>
                <button
                  onClick={() => setChartType('week')}
                  className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${
                    chartType === 'week'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  按周
                </button>
                <button
                  onClick={() => setChartType('month')}
                  className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${
                    chartType === 'month'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  按月
                </button>
              </div>
            </div>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-80 text-slate-400">
                <p className="text-sm">暂无数据</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#f1f5f9" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="period" 
                    stroke="#cbd5e1"
                    style={{ fontSize: '12px' }}
                    tick={{ fill: '#64748b' }}
                    angle={chartType === 'day' ? -45 : 0}
                    textAnchor={chartType === 'day' ? 'end' : 'middle'}
                    height={chartType === 'day' ? 60 : 30}
                  />
                  <YAxis 
                    stroke="#cbd5e1"
                    style={{ fontSize: '12px' }}
                    tick={{ fill: '#64748b' }}
                    tickFormatter={(value) => `¥${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    animationDuration={200}
                  />
                  {accountList.map((account, index) => {
                    const accountColor = getAccountColor(account, accountColorMap);
                    return (
                      <Line
                        key={account}
                        type="monotone"
                        dataKey={account}
                        stroke={accountColor.bg}
                        strokeWidth={2}
                        dot={{ fill: accountColor.bg, r: 4 }}
                        activeDot={{ r: 6 }}
                        name={account}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 详情表格 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">收益详情</h3>
              <p className="text-sm text-slate-500">按收益从高到低排序</p>
            </div>
          </div>
          {sortedRecords.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm">暂无记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">排名</th>
                    <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">日期</th>
                    <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">账号名</th>
                    <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">推荐产品</th>
                    <th className="text-right py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">收益</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedRecords.map((record, index) => {
                    const accountColor = getAccountColor(record.accountName, accountColorMap);
                    return (
                      <tr 
                        key={record.id} 
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold ${
                            index === 0 
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 shadow-sm' 
                              : index === 1 
                              ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 shadow-sm'
                              : index === 2 
                              ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-orange-900 shadow-sm'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-700 font-medium">{record.date}</td>
                        <td className="py-4 px-4">
                          <span 
                            className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border-2" 
                            style={{
                              backgroundColor: accountColor.bg,
                              color: accountColor.text,
                              borderColor: accountColor.border
                            }}
                          >
                            {record.accountName}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">{record.product}</td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm font-bold text-slate-800">
                            ¥{record.revenue.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
