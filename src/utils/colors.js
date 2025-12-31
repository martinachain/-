// 马卡龙色系
export const MACARON_COLORS = [
  { bg: '#FFB3BA', text: '#8B4A4F', border: '#FF9BA3' }, // 淡粉色
  { bg: '#FFDFBA', text: '#8B6B4F', border: '#FFD4A3' }, // 淡黄色
  { bg: '#BAFFC9', text: '#4F8B5F', border: '#A3FFB8' }, // 淡绿色
  { bg: '#BAE1FF', text: '#4F6B8B', border: '#A3D4FF' }, // 淡蓝色
  { bg: '#E0BBE4', text: '#6B4F8B', border: '#D4A3D8' }, // 淡紫色
  { bg: '#FFCCCB', text: '#8B4F4F', border: '#FFB3B0' }, // 淡橙色
  { bg: '#B4E4FF', text: '#4F6B8B', border: '#A3D4FF' }, // 淡青色
  { bg: '#C7F5D9', text: '#4F8B6B', border: '#B3F0C9' }, // 淡薄荷绿
  { bg: '#FFE4E1', text: '#8B5F5F', border: '#FFD4D1' }, // 淡玫瑰色
  { bg: '#E6E6FA', text: '#6B6B8B', border: '#D4D4F0' }, // 淡薰衣草色
  { bg: '#FFF8DC', text: '#8B8B6B', border: '#FFF4D4' }, // 淡米色
  { bg: '#F0E68C', text: '#8B8B4F', border: '#E6D87A' }, // 淡卡其色
];

// 根据记录获取账号颜色映射（优先使用用户选择的颜色）
export const getAccountColorMap = (records) => {
  // 获取所有唯一的账号名，按首次出现的顺序
  const accountOrder = [];
  const accountSet = new Set();
  
  records.forEach(record => {
    if (record.accountName && !accountSet.has(record.accountName)) {
      accountSet.add(record.accountName);
      accountOrder.push(record.accountName);
    }
  });
  
  // 创建账号到颜色的映射
  const accountColorMap = {};
  
  // 首先，查找每个账号是否有用户选择的颜色
  accountOrder.forEach((account) => {
    // 查找该账号的所有记录，看是否有用户选择的颜色
    const accountRecords = records.filter(r => r.accountName === account);
    const recordWithColor = accountRecords.find(r => r.accountColor);
    
    if (recordWithColor && recordWithColor.accountColor) {
      // 使用用户选择的颜色
      accountColorMap[account] = recordWithColor.accountColor;
    }
  });
  
  // 对于没有用户选择颜色的账号，按顺序分配颜色
  let colorIndex = 0;
  accountOrder.forEach((account, index) => {
    if (!accountColorMap[account]) {
      // 跳过已被使用的颜色
      const usedColors = Object.values(accountColorMap).map(c => c.bg);
      while (usedColors.includes(MACARON_COLORS[colorIndex % MACARON_COLORS.length].bg)) {
        colorIndex++;
      }
      accountColorMap[account] = MACARON_COLORS[colorIndex % MACARON_COLORS.length];
      colorIndex++;
    }
  });
  
  return accountColorMap;
};

// 根据账号名获取颜色
export const getAccountColor = (accountName, accountColorMap) => {
  if (!accountName) return MACARON_COLORS[0];
  
  // 如果账号在映射中，返回映射的颜色
  if (accountColorMap && accountColorMap[accountName]) {
    return accountColorMap[accountName];
  }
  
  // 如果是新账号，查找未使用的颜色
  if (accountColorMap) {
    const usedColors = Object.values(accountColorMap).map(c => c.bg);
    const unusedColor = MACARON_COLORS.find(color => !usedColors.includes(color.bg));
    if (unusedColor) return unusedColor;
  }
  
  // 如果所有颜色都被使用，使用哈希函数
  let hash = 0;
  for (let i = 0; i < accountName.length; i++) {
    hash = accountName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % MACARON_COLORS.length;
  return MACARON_COLORS[index];
};

