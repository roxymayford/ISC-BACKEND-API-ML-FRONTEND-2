import React from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight,
  Calculator,
  GitBranch,
  PieChart,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const LatihanSoal = () => {
  const navigate = useNavigate();
  const { dashboardData: data } = useAuth();

  const categories = [
    {
      title: 'Aljabar & Matriks',
      description: 'Sistem Persamaan, Vektor, dll.',
      icon: Calculator,
      color: 'blue',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      progressColor: 'bg-blue-600',
      totalQuizzes: 12,
      completedQuizzes: 0,
      progress: 0,
    },
    {
      title: 'Teori Graf',
      description: 'Shortest Path, Minimum Weight',
      icon: GitBranch,
      color: 'orange',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      progressColor: 'bg-orange-500',
      totalQuizzes: 8,
      completedQuizzes: 0,
      progress: 0,
    },
    {
      title: 'Probabilitas & Statistika',
      description: 'Teorema Bayes, Peluang',
      icon: PieChart,
      color: 'green',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
      progressColor: 'bg-green-500',
      totalQuizzes: 15,
      completedQuizzes: 0,
      progress: 0,
    },
    {
      title: 'Ilmu Pengetahuan Sosial',
      description: 'lorem ipsum',
      icon: BookOpen,
      color: 'purple',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500',
      progressColor: 'bg-red-500',
      totalQuizzes: 5,
      completedQuizzes: 0,
      progress: 0,
    }
  ];

  const history = [];

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left">
      <Sidebar user={data.user} />
      
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Latihan Soal</h1>
            <p className="text-gray-500 font-medium text-sm">Pilih topik atau mata pelajaran untuk menguji pemahamanmu.</p>
          </div>
          
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Cari topik atau kuis..." 
              className="w-full pl-12 pr-4 py-3 bg-white border-transparent shadow-sm rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Hero & Categories) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Hero Card */}
            <div className="bg-[#2e2392] rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between items-start md:flex-row md:items-center min-h-[200px]">
              {/* Decorative Background Elements */}
              <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,100 L100,0 L200,100 L100,200 Z" fill="currentColor" opacity="0.3" transform="translate(50, 50)" />
                  <path d="M0,100 L100,0 L200,100 L100,200 Z" fill="currentColor" opacity="0.5" transform="translate(100, 100)" />
                </svg>
              </div>

              <div className="relative z-10 max-w-lg mb-6 md:mb-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold mb-4">
                  <Sparkles size={14} /> Tantangan AI Harian
                </div>
                <h2 className="text-2xl font-bold mb-2">Kuis Adaptif Pertama</h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  Ikuti kuis diagnostik agar AI dapat menyesuaikan materi dengan kemampuanmu.
                </p>
              </div>

              <button 
                onClick={() => navigate('/quiz')}
                className="relative z-10 flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white font-bold px-6 py-3.5 rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                Mulai Kuis <ArrowRight size={18} />
              </button>
            </div>

            {/* Kategori Mata Pelajaran */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Kategori Mata Pelajaran</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.iconBg} ${cat.iconColor}`}>
                        <cat.icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{cat.title}</h4>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{cat.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-6 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} /> {cat.totalQuizzes} Kuis
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> {cat.completedQuizzes} Selesai
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-700">Tingkat Penguasaan</span>
                        <span className={`text-xs font-bold ${cat.iconColor}`}>{cat.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cat.progressColor}`} style={{ width: `${cat.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Stats & History) */}
          <div className="space-y-8">
            
            {/* Statistik Latihan */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
              <h3 className="font-bold text-gray-900 mb-4">Statistik Latihan</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-[#4232c2] mb-1">0</span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Total Kuis Selesai</span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-gray-400 mb-1">0%</span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Akurasi Rata-rata</span>
                </div>
              </div>
            </div>

            {/* Riwayat Kuis Terakhir */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
              <h3 className="font-bold text-gray-900 mb-6">Riwayat Kuis Terakhir</h3>
              
              <div className="space-y-5 mb-6">
                {history.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{item.title}</h4>
                        <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                          {item.category} • {item.time}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${item.scoreColor}`}>
                      {item.score}/100
                    </span>
                  </div>
                ))}
              </div>

              <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition-colors text-sm shadow-sm">
                Lihat Semua Riwayat
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default LatihanSoal;
