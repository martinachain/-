import { useState } from 'react';

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
