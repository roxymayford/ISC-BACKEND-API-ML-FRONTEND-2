import React, { useState, useEffect } from 'react';
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
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

const ICON_MAP = {
  Calculator: Calculator,
  GitBranch: GitBranch,
  PieChart: PieChart,
  BookOpen: BookOpen,
  Layers: Layers
};

const Materi = () => {
  const navigate = useNavigate();
  const { dashboardData: data } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const completedModules = data?.completedModules || [];

  // Default fallback data in case server is starting
  const fallbackSubjects = [
    {
      id: 1,
      title: 'Aljabar Linear',
      icon: 'Calculator',
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
      id: 2,
      title: 'Teori Graf',
      icon: 'GitBranch',
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
      id: 3,
      title: 'Probabilitas & Statistika',
      icon: 'PieChart',
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

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${FLASK_API}/subjects`);
        if (res.ok) {
          const json = await res.json();
          if (json.subjects && json.subjects.length > 0) {
            setSubjects(json.subjects);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not fetch dynamic subjects, using fallback:', e);
      } finally {
        setLoading(false);
      }
      setSubjects(fallbackSubjects);
    };

    fetchSubjects();
  }, []);

  // Filter subjects and their modules based on search query
  const displaySubjects = subjects.map(sub => {
    const filteredModules = (sub.modules || []).filter(mod => {
      const matchTitle = mod.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDesc = mod.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubject = sub.title?.toLowerCase().includes(searchQuery.toLowerCase());
      return searchQuery ? (matchTitle || matchDesc || matchSubject) : true;
    });

    return {
      ...sub,
      modules: filteredModules
    };
  }).filter(sub => sub.modules.length > 0 || !searchQuery);

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left font-sans">
      <Sidebar user={data?.user} />
      
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Daftar Materi</h1>
            <p className="text-gray-500 font-medium text-sm">Pilih topik dan modul yang ingin kamu pelajari hari ini.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi atau topik..." 
              className="w-full pl-12 pr-4 py-3 bg-white border-transparent shadow-sm rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="space-y-10">
          {displaySubjects.map((subject, idx) => {
            const IconComponent = ICON_MAP[subject.icon] || BookOpen;

            return (
              <div key={subject.id || idx} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${subject.bgColor || 'bg-blue-50'} ${subject.color || 'text-blue-600'}`}>
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{subject.title}</h2>
                    <p className="text-sm text-gray-500 font-medium">{(subject.modules || []).length} Modul Tersedia</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(subject.modules || []).map(mod => {
                    const isModCompleted = completedModules.includes(mod.id);
                    const isModLocked = mod.isLocked && !isModCompleted;

                    return (
                      <div 
                        key={mod.id} 
                        onClick={() => !isModLocked && navigate(`/materi/detail?id=${mod.id}`)}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col justify-between h-full ${
                          isModLocked 
                            ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-80' 
                            : 'border-gray-100 bg-white hover:border-primary/30 hover:shadow-md cursor-pointer group'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isModLocked ? 'bg-gray-200 text-gray-500' : 'bg-indigo-50 text-primary-dark'
                            }`}>
                              {mod.type || 'Video'}
                            </div>
                            {isModLocked ? (
                              <Lock size={18} className="text-gray-400" />
                            ) : isModCompleted ? (
                              <CheckCircle2 size={20} className="text-teal-500" />
                            ) : (
                              <Play size={18} className="text-primary group-hover:scale-110 transition-transform" />
                            )}
                          </div>
                          <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-primary-dark transition-colors">
                            {mod.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                            {mod.description || 'Pelajari konsep inti dan penerapannya secara bertahap.'}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <Clock size={14} />
                            <span>{mod.duration || '15:00'}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-amber-600 font-semibold flex items-center gap-1">
                              <Sparkles size={12} /> +{mod.xpReward || 50} XP
                            </span>
                          </div>
                          {!isModLocked && (
                            <div className="flex items-center gap-1 text-sm font-bold text-primary-dark hover:text-primary transition-colors">
                              {isModCompleted ? 'Pelajari Ulang' : 'Mulai'} <ArrowRight size={16} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
};

export default Materi;
