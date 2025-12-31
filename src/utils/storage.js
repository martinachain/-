import { supabase } from './supabaseClient';

// 从 Supabase 获取所有记录，按日期倒序排列
export const getRecords = async () => {
  try {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching records:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching records:', error);
    return [];
  }
};

// 向 Supabase 添加新记录
export const addRecord = async (record) => {
  try {
    const newRecord = {
      account_name: record.accountName,
      product: record.product,
      date: record.date,
      revenue: parseFloat(record.revenue) || 0,
      account_color: record.accountColor || null
    };

    const { data, error } = await supabase
      .from('records')
      .insert([newRecord])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding record:', error);
      throw error;
    }
    
    // 转换为前端使用的格式
    return {
      id: data.id.toString(),
      accountName: data.account_name,
      product: data.product,
      date: data.date,
      revenue: data.revenue,
      accountColor: data.account_color
    };
  } catch (error) {
    console.error('Error adding record:', error);
    throw error;
  }
};

// 从 Supabase 删除记录
export const deleteRecord = async (id) => {
  try {
    const { error } = await supabase
      .from('records')
      .delete()
      .eq('id', parseInt(id));
    
    if (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};

// 更新 Supabase 中的记录
export const updateRecord = async (id, updatedData) => {
  try {
    const updateData = {
      account_name: updatedData.accountName,
      product: updatedData.product,
      date: updatedData.date,
      revenue: parseFloat(updatedData.revenue) || 0,
      account_color: updatedData.accountColor || null
    };

    const { data, error } = await supabase
      .from('records')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();
    
    if (error) {
      console.error('Error updating record:', error);
      throw error;
    }
    
    // 转换为前端使用的格式
    return {
      id: data.id.toString(),
      accountName: data.account_name,
      product: data.product,
      date: data.date,
      revenue: data.revenue,
      accountColor: data.account_color
    };
  } catch (error) {
    console.error('Error updating record:', error);
    throw error;
  }
};
