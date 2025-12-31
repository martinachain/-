import { useState, useEffect } from 'react';

import CalendarView from './components/CalendarView';

import DashboardView from './components/DashboardView';

import AddRecordPage from './components/AddRecordPage';

import DetailRecordPage from './components/DetailRecordPage';

import EditRecordPage from './components/EditRecordPage';

import { LayoutDashboard, Calendar, Plus } from 'lucide-react';

import { getAccountColorMap } from './utils/colors';



function App() {

  const [activeTab, setActiveTab] = useState('calendar');

  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedRecord, setSelectedRecord] = useState(null);

  const [editRecord, setEditRecord] = useState(null);
  
  // 初始化 Loading 状态
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  // 初始化检查，带超时容错
  useEffect(() => {
    const initApp = async () => {
      try {
        // 设置超时（10秒）
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('初始化超时')), 10000);
        });

        // 尝试初始化 Supabase 连接
        const initPromise = (async () => {
          // 简单检查：尝试导入 supabaseClient
          await import('./utils/supabaseClient');
          return true;
        })();

        await Promise.race([initPromise, timeoutPromise]);
        
        // 初始化成功
        setLoading(false);
        console.log('应用初始化成功');
      } catch (error) {
        console.error('应用初始化失败:', error);
        setInitError(error.message || '初始化失败');
        setLoading(false); // 即使失败也停止 loading，显示错误信息
      }
    };

    initApp();
  }, []);



  // 如果初始化失败，显示错误信息（但依然显示 Header 和 Footer）
  if (initError) {
    return (
      <div className="min-h-screen bg-[#FDFCF8]">
        {/* 全局导航栏 - 即使出错也显示 */}
        <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent tracking-wide">
                  小满果园
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* 错误提示 */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">果园维护中</h2>
            <p className="text-slate-600 mb-4">请稍后再试</p>
            <p className="text-sm text-slate-400">错误信息: {initError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              刷新页面
            </button>
          </div>
        </main>

        {/* Footer 页脚 */}
        <footer className="w-full border-t border-slate-200 py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-500 text-sm tracking-widest leading-relaxed mb-2">
              记录每一刻闪光的努力，静候满园芬芳；愿星光不负赶路人，岁岁年年，万事如意
            </p>
            <p className="text-slate-300 text-xs mt-4">
              Handcrafted for my best friend
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // 初始化 Loading 状态
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8]">
        {/* 全局导航栏 - Loading 时也显示 */}
        <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent tracking-wide">
                  小满果园
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Loading 提示 */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-slate-500">正在加载...</p>
            </div>
          </div>
        </main>

        {/* Footer 页脚 */}
        <footer className="w-full border-t border-slate-200 py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-500 text-sm tracking-widest leading-relaxed mb-2">
              记录每一刻闪光的努力，静候满园芬芳；愿星光不负赶路人，岁岁年年，万事如意
            </p>
            <p className="text-slate-300 text-xs mt-4">
              Handcrafted for my best friend
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#FDFCF8]">

      {/* 全局导航栏 - 严格的左右布局 */}

      <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center h-16">

            {/* 左侧标题 */}

            <div className="flex items-center">

              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent tracking-wide">

                小满果园

              </span>

            </div>



            {/* 右侧按钮组 */}

            <div className="flex items-center gap-3">

              <button

                onClick={() => setActiveTab(activeTab === 'calendar' ? 'dashboard' : 'calendar')}

                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"

              >

                {activeTab === 'calendar' ? (

                  <><LayoutDashboard size={18} /> 收益看板</>

                ) : (

                  <><Calendar size={18} /> 日程日历</>

                )}

              </button>

              

              <button

                onClick={() => setActiveTab('add')}

                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"

              >

                <Plus size={18} />

                <span>添加新记录</span>

              </button>

            </div>

          </div>

        </div>

      </nav>



      {/* 主体内容区 */}

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {activeTab === 'calendar' ? (

          <CalendarView 
            key={refreshKey} 
            onRecordClick={(record) => {
              setSelectedRecord(record);
              setActiveTab('detail');
            }}
          />

        ) : activeTab === 'dashboard' ? (

          <DashboardView key={refreshKey} />

        ) : activeTab === 'add' ? (

          <AddRecordPage 

            onBack={() => setActiveTab('calendar')} 

            onSuccess={() => {

              setRefreshKey(prev => prev + 1);

              setActiveTab('calendar');

            }}

          />

        ) : activeTab === 'detail' && selectedRecord ? (

          <DetailRecordPage

            record={selectedRecord}

            accountColorMap={selectedRecord ? getAccountColorMap([selectedRecord]) : {}}

            onBack={() => {

              setSelectedRecord(null);

              setActiveTab('calendar');

            }}

            onEdit={() => {

              setEditRecord(selectedRecord);

              setActiveTab('edit');

            }}

            onDelete={() => {

              setRefreshKey(prev => prev + 1);

            }}

          />

        ) : activeTab === 'edit' && editRecord ? (

          <EditRecordPage

            record={editRecord}

            onBack={() => {

              setEditRecord(null);

              setActiveTab('detail');

            }}

            onSuccess={() => {

              setRefreshKey(prev => prev + 1);

              setEditRecord(null);

              setSelectedRecord(null);

              setActiveTab('calendar');

            }}

          />

        ) : null}

      </main>

      {/* Footer 页脚 */}
      <footer className="w-full border-t border-slate-200 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm tracking-widest leading-relaxed mb-2">
            记录每一刻闪光的努力，静候满园芬芳；愿星光不负赶路人，岁岁年年，万事如意
          </p>
          <p className="text-slate-300 text-xs mt-4">
            Handcrafted for my best friend
          </p>
        </div>
      </footer>

    </div>

  );

}



export default App;
