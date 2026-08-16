import React from 'react';
import { 
  CalendarCheck, 
  BookOpenCheck, 
  Flame, 
  TrendingUp, 
  Award
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Progress = () => {
  const { dashboardData: data } = useAuth();

  const completedModulesCount = data.completedModules?.length || 0;
  const isModule1Completed = data.completedModules?.includes(1);
  const streakCount = data.stats?.find(s => s.id === 3)?.value || "0";
  const targetMinutes = data.dailyTarget?.targetMinutes || 30;
  const currentMinutes = data.dailyTarget?.currentMinutes || 0;
  const targetPercent = Math.min(Math.round((currentMinutes / targetMinutes) * 100), 100);

  const barChartData = [
    { day: 'Sen', value: 0 },
    { day: 'Sel', value: 0 },
    { day: 'Rab', value: 0 },
    { day: 'Kam', value: 0 },
    { day: 'Jum', value: 0 },
    { day: 'Sab', value: isModule1Completed ? 1 : 0, active: true },
    { day: 'Min', value: 0 },
  ];



  const subjects = [
    {
      name: 'Matematika',
      completed: isModule1Completed ? 1 : 0,
      percentage: isModule1Completed ? 100 : 0, // Since only 1 module exists in Mathematics right now, 1 = 100%
      trend: isModule1Completed ? '+100%' : '0%',
      trendUp: true,
      color: '#4232c2', // blue/indigo
    },
    {
      name: 'Bahasa Indonesia',
      completed: 0,
      percentage: 0,
      trend: '0%',
      trendUp: true,
      color: '#ea580c', // orange
    },
    {
      name: 'Fisika',
      completed: 0,
      percentage: 0,
      trend: '0%',
      trendUp: true,
      color: '#0d9488', // teal
    },
    {
      name: 'Ilmu Pengetahuan Sosial',
      completed: 0,
      percentage: 0,
      trend: '0%',
      trendUp: true,
      color: '#9333ea', // purple
    },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left">
      <Sidebar user={data.user} />
      
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Progress Belajar</h1>
            <p className="text-gray-500 font-medium text-sm">Pantau perkembangan belajarmu minggu ini</p>
          </div>
          <div className="flex bg-white rounded-xl shadow-sm p-1 border border-gray-100">
            <button className="px-6 py-2 bg-[#4232c2] text-white text-sm font-bold rounded-lg shadow-sm">
              7 Hari
            </button>
            <button className="px-6 py-2 text-gray-500 hover:text-gray-900 text-sm font-semibold rounded-lg transition-colors">
              30 Hari
            </button>
            <button className="px-6 py-2 text-gray-500 hover:text-gray-900 text-sm font-semibold rounded-lg transition-colors">
              3 Bulan
            </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 flex items-center gap-5 shadow-sm border border-gray-50">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#4232c2] flex items-center justify-center">
              <CalendarCheck size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-semibold mb-1">Hari Belajar</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{streakCount}</span>
                <span className="text-gray-500 font-medium text-sm">/ 7 hari</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 flex items-center gap-5 shadow-sm border border-gray-50">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <BookOpenCheck size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-semibold mb-1">Materi Selesai</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{completedModulesCount}</span>
                <span className="text-gray-500 font-medium text-sm">materi</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 flex items-center gap-5 shadow-sm border border-gray-50">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Flame size={28} fill="currentColor" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-semibold mb-1">Streak</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{streakCount}</span>
                <span className="text-gray-500 font-medium text-sm">hari berturut</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 mb-8 relative">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Aktivitas 7 Hari Terakhir</h2>
              <p className="text-sm text-gray-400 font-medium">Jumlah materi yang diselesaikan per hari</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">
              <TrendingUp size={14} /> 0%
            </div>
          </div>

          <div className="h-64 flex items-end justify-between relative pl-8">
            {/* Y-axis lines and labels */}
            <div className="absolute left-0 top-0 bottom-8 w-full flex flex-col justify-between text-xs text-gray-400 font-medium">
              <div className="flex items-center gap-4 w-full"><span>6</span><div className="flex-1 border-b border-gray-100"></div></div>
              <div className="flex items-center gap-4 w-full"><span>4</span><div className="flex-1 border-b border-gray-100"></div></div>
              <div className="flex items-center gap-4 w-full"><span>2</span><div className="flex-1 border-b border-gray-100"></div></div>
              <div className="flex items-center gap-4 w-full"><span>0</span><div className="flex-1 border-b border-gray-100"></div></div>
            </div>

            {/* Bars */}
            <div className="w-full flex justify-between items-end h-[calc(100%-2rem)] z-10 px-4 md:px-10">
              {barChartData.map((item, index) => {
                // Calculate height percentage based on max value 7
                const heightPercentage = (item.value / 7) * 100;
                return (
                  <div key={index} className="flex flex-col items-center gap-3 w-12 md:w-16 h-full justify-end">
                    <div 
                      className={`w-full rounded-sm transition-all ${item.active ? 'bg-[#4232c2]' : 'bg-indigo-200'}`}
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                    <span className="text-xs text-gray-400 font-medium">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Ringkasan Minggu Ini */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-8">Ringkasan Minggu Ini</h2>
            
            <div className="space-y-6 flex-1">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">Konsistensi</span>
                  <span className="text-sm font-bold text-[#4232c2]">0%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4232c2] rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">Target Harian</span>
                  <span className="text-sm font-bold text-teal-600">{targetPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: `${targetPercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">Nilai Rata-rata</span>
                  <span className="text-sm font-bold text-orange-500">0%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Award className="text-gray-400" size={20} />
              <span className="text-sm font-bold text-gray-500">Ayo mulai belajarmu minggu ini!</span>
            </div>
          </div>

          {/* Penguasaan per Mata Pelajaran */}
          <div className="bg-transparent flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Penguasaan per Mata Pelajaran</h2>
            
            <div className="space-y-4">
              {subjects.map((subject, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex items-center gap-5">
                  
                  {/* Circular Progress (CSS Mock) */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-14 h-14 transform -rotate-90">
                      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                      <circle 
                        cx="28" cy="28" r="24" 
                        stroke={subject.color} 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={24 * 2 * Math.PI} 
                        strokeDashoffset={(24 * 2 * Math.PI) - ((subject.percentage / 100) * (24 * 2 * Math.PI))} 
                        className="transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-gray-800">{subject.percentage}%</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-0.5">{subject.name}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">{subject.completed} materi selesai</p>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        subject.trendUp ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {subject.trend}
                      </div>
                    </div>
                    
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${subject.percentage}%`, backgroundColor: subject.color }}></div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default Progress;
