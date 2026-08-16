import React from 'react';
import { 
  Search, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Calculator,
  GitBranch,
  PieChart,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Materi = () => {
  const navigate = useNavigate();
  const { dashboardData: data } = useAuth();

  const completedModules = data.completedModules || [];

  const subjects = [
    {
      title: 'Aljabar Linear',
      icon: Calculator,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      modules: [
        {
          id: 1,
          title: 'Konsep Dasar Aljabar Linear',
          description: 'Pengantar Matematika untuk AI, vektor, dan matriks.',
          duration: '18:20',
          type: 'Video',
          isLocked: false,
          progress: completedModules.includes(1) ? 100 : 0
        },
        {
          id: 2,
          title: 'Operasi Matriks Tingkat Lanjut',
          description: 'Perkalian matriks, invers, dan determinan.',
          duration: '24:10',
          type: 'Video + Artikel',
          isLocked: true,
          progress: completedModules.includes(2) ? 100 : 0
        }
      ]
    },
    {
      title: 'Teori Graf',
      icon: GitBranch,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      modules: [
        {
          id: 3,
          title: 'Pengenalan Graf dan Tree',
          description: 'Mengenal struktur data graf dan pohon.',
          duration: '15:30',
          type: 'Video',
          isLocked: true,
          progress: completedModules.includes(3) ? 100 : 0
        }
      ]
    },
    {
      title: 'Probabilitas & Statistika',
      icon: PieChart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      modules: [
        {
          id: 4,
          title: 'Probabilitas Dasar',
          description: 'Peluang kejadian dan ruang sampel.',
          duration: '20:45',
          type: 'Video',
          isLocked: true,
          progress: completedModules.includes(4) ? 100 : 0
        }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left">
      <Sidebar user={data.user} />
      
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Daftar Materi</h1>
            <p className="text-gray-500 font-medium text-sm">Pilih topik yang ingin kamu pelajari hari ini.</p>
          </div>
          
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Cari materi..." 
              className="w-full pl-12 pr-4 py-3 bg-white border-transparent shadow-sm rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="space-y-10">
          {subjects.map((subject, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${subject.bgColor} ${subject.color}`}>
                  <subject.icon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{subject.title}</h2>
                  <p className="text-sm text-gray-500 font-medium">{subject.modules.length} Modul Tersedia</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subject.modules.map(mod => (
                  <div 
                    key={mod.id} 
                    onClick={() => !mod.isLocked && navigate('/materi/detail')}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col justify-between h-full ${
                      mod.isLocked 
                        ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-80' 
                        : 'border-gray-100 bg-white hover:border-primary/30 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          mod.isLocked ? 'bg-gray-200 text-gray-500' : 'bg-indigo-50 text-[#4232c2]'
                        }`}>
                          {mod.type}
                        </div>
                        {mod.isLocked ? (
                          <Lock size={18} className="text-gray-400" />
                        ) : mod.progress > 0 ? (
                          <CheckCircle2 size={20} className="text-teal-500" />
                        ) : (
                          <Play size={18} className="text-[#4232c2]" />
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{mod.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <Clock size={14} />
                        <span>{mod.duration}</span>
                      </div>
                      {!mod.isLocked && (
                        <div className="flex items-center gap-1 text-sm font-bold text-[#4232c2] hover:text-[#3426a1] transition-colors">
                          Mulai <ArrowRight size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};

export default Materi;
