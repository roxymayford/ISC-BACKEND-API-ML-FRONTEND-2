import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Play, 
  Lock, 
  ArrowRight,
  Maximize, 
  Minimize,
  Sparkles,
  Briefcase,
  Star,
  BookOpen,
  Award,
  Layers,
  Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

const CAREER_TRACKS = [
  {
    id: 'Data & AI',
    title: 'Data & AI',
    badge: '🤖 Data & AI',
    icon: '🤖',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #06b6d4 100%)',
    lineGradient: 'from-blue-600 to-cyan-500',
    nodeColor: 'border-blue-600 text-blue-600',
    activeBg: 'bg-blue-600 text-white shadow-blue-200',
    inactiveBg: 'bg-white text-gray-700 border-gray-200 hover:border-blue-300',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-100',
    heroTitle: 'Jalur Belajar Data Science & Artificial Intelligence',
    description: 'Kuasai matematika AI, aljabar linear, probabilitas data, dan algoritma machine learning modern.'
  },
  {
    id: 'Software Development',
    title: 'Software Dev',
    badge: '💻 Software Dev',
    icon: '💻',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)',
    lineGradient: 'from-violet-600 to-purple-500',
    nodeColor: 'border-violet-600 text-violet-600',
    activeBg: 'bg-violet-600 text-white shadow-violet-200',
    inactiveBg: 'bg-white text-gray-700 border-gray-200 hover:border-violet-300',
    tagColor: 'bg-violet-50 text-violet-700 border-violet-100',
    heroTitle: 'Jalur Belajar Software Engineering & Web Development',
    description: 'Pelajari struktur data, algoritma, arsitektur RESTful API, dan CI/CD pipeline modern.'
  },
  {
    id: 'Design',
    title: 'UI/UX Design',
    badge: '🎨 UI/UX Design',
    icon: '🎨',
    gradient: 'linear-gradient(135deg, #831843 0%, #db2777 50%, #f43f5e 100%)',
    lineGradient: 'from-pink-600 to-rose-500',
    nodeColor: 'border-pink-600 text-pink-600',
    activeBg: 'bg-pink-600 text-white shadow-pink-200',
    inactiveBg: 'bg-white text-gray-700 border-gray-200 hover:border-pink-300',
    tagColor: 'bg-pink-50 text-pink-700 border-pink-100',
    heroTitle: 'Jalur Belajar UI/UX Design & Product Experience',
    description: 'Kuasai visual hierarchy, design system, interaktif prototyping, dan usability testing aplikasi.'
  },
  {
    id: 'Infrastructure & Security',
    title: 'Infra & Security',
    badge: '🔒 Infra & Security',
    icon: '🔒',
    gradient: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #f97316 100%)',
    lineGradient: 'from-orange-600 to-amber-500',
    nodeColor: 'border-orange-600 text-orange-600',
    activeBg: 'bg-orange-600 text-white shadow-orange-200',
    inactiveBg: 'bg-white text-gray-700 border-gray-200 hover:border-orange-300',
    tagColor: 'bg-orange-50 text-orange-700 border-orange-100',
    heroTitle: 'Jalur Belajar Cloud Infrastructure & Cybersecurity',
    description: 'Pelajari dasar jaringan komputer, enkripsi kriptografi, cloud computing, dan Docker containerization.'
  },
  {
    id: 'Product & Business',
    title: 'Product & Business',
    badge: '📊 Product & Business',
    icon: '📊',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
    lineGradient: 'from-emerald-600 to-teal-500',
    nodeColor: 'border-emerald-600 text-emerald-600',
    activeBg: 'bg-emerald-600 text-white shadow-emerald-200',
    inactiveBg: 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    heroTitle: 'Jalur Belajar Product Management & Strategy',
    description: 'Kuasai product discovery MVP, kerangka kerja Agile Scrum, dan product metrics KPI untuk pertumbuhan bisnis.'
  },
  {
    id: 'all',
    title: 'Semua Jalur',
    badge: '🌐 Semua Jalur',
    icon: '🌐',
    gradient: 'linear-gradient(135deg, #1f2937 0%, #4338ca 50%, #6366f1 100%)',
    lineGradient: 'from-indigo-600 to-blue-500',
    nodeColor: 'border-indigo-600 text-indigo-600',
    activeBg: 'bg-indigo-600 text-white shadow-indigo-200',
    inactiveBg: 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300',
    tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    heroTitle: 'Jalur Belajar Komprehensif (Seluruh Kurikulum)',
    description: 'Jelajahi seluruh modul materi yang tersedia di database dari setiap disiplin ilmu.'
  }
];

const LearningPath = () => {
  const navigate = useNavigate();
  const { dashboardData: data } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Career Recommendation & Active Track
  const [recommendedCareer, setRecommendedCareer] = useState(null);
  const [selectedTrackId, setSelectedTrackId] = useState('Data & AI');

  const completedModules = data?.completedModules || [];

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const steps = [
    {
      id: '01',
      title: 'Bilangan & Operasi',
      description: 'Konsep dasar bilangan dan operasi hitung.',
      status: 'selesai',
      position: 'top',
    },
    {
      id: '02',
      title: 'Aljabar Dasar',
      description: 'Variabel, ekspresi dan operasi aljabar.',
      status: 'selesai',
      position: 'bottom',
    },
    {
      id: '03',
      title: 'Persamaan Linear',
      description: 'Menyelesaikan persamaan dan memahami grafik.',
      status: 'sedang',
      position: 'top',
    },
    {
      id: '04',
      title: 'Fungsi & Grafik',
      description: 'Pahami hubungan antar variabel dan fungsi.',
      status: 'terkunci',
      position: 'bottom',
    },
    {
      id: '05',
      title: 'Trigonometri',
      description: 'Sinus, cosinus dan penerapannya.',
      status: 'terkunci',
      position: 'top',
    },
    {
      id: '06',
      title: 'Matriks & Vektor',
      description: 'Operasi matriks, determinan dan vektor.',
      status: 'terkunci',
      position: 'bottom',
    },
    {
      id: '07',
      title: 'Kalkulus Dasar',
      description: 'Konsep turunan, limit, dan integral dasar.',
      status: 'terkunci',
      position: 'top',
    },
    {
      id: '08',
      title: 'Probabilitas & Data',
      description: 'Teori peluang, statistik dan interpretasi data.',
      status: 'terkunci',
      position: 'bottom',
    },
  ];

  const completedCount = steps.filter(s => s.status === 'selesai').length;
  const remainingCount = steps.length - completedCount;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  const nextActiveStep = steps.find(s => s.status === 'sedang') || steps[0];

  // Find index of current step for active timeline line length
  const activeStepIndex = steps.findIndex(s => s.status === 'sedang');
  const activeLineWidthPercent = activeStepIndex !== -1 
    ? activeStepIndex * (83 / (steps.length - 1))
    : (completedCount > 0 ? (completedCount - 1) * (83 / (steps.length - 1)) : 0);

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left font-sans">
      <Sidebar user={data?.user} />
      
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-10 px-4 sm:px-6 md:px-8 lg:p-10">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1">Learning Path</h1>
          <p className="text-gray-500 font-medium text-xs sm:text-sm">
            Ikuti jalur belajar yang telah disesuaikan dengan hasil assessment kamu.
          </p>
        </div>

        {/* Hero Card Banner */}
        <div 
          className="rounded-3xl p-6 md:p-8 text-white shadow-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)' }}
        >
          {/* Left Side Info */}
          <div className="z-10 flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight text-white">Matematika Dasar</h2>
            <p className="text-indigo-100 text-xs sm:text-sm font-medium">
              Jalur rekomendasi • {steps.length} materi • Estimasi 3 jam 20 menit
            </p>
          </div>
        </div>

        {/* ─── Career Track Switcher Tabs ─────────────────────────────────── */}
        <div className="mb-6 bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={13} className="text-indigo-600" />
              Pilih Jalur Rekomendasi Karir:
            </span>
            {recommendedCareer && (
              <button
                onClick={() => setSelectedTrackId(recommendedCareer)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Star size={11} className="fill-amber-400 text-amber-500" />
                Kembali ke Rekomendasi Saya
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CAREER_TRACKS.map(track => {
              const isSelected = selectedTrackId === track.id;
              const isUserRec = recommendedCareer === track.id;

              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                    isSelected
                      ? `${track.activeBg} border-transparent shadow-sm scale-[1.02]`
                      : `${track.inactiveBg} hover:bg-gray-50`
                  }`}
                >
                  <span className="text-base">{track.icon}</span>
                  <span>{track.title}</span>
                  {isUserRec && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-0.5 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      <Star size={10} className="fill-amber-400 text-amber-400" /> AI
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Hero Card Banner (Dynamic per career) ────────────────────────── */}
        <div 
          className="rounded-3xl p-6 md:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden transition-all duration-500"
          style={{ background: activeTrackMeta.gradient }}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Left Side Info */}
          <div className="z-10 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-3 border border-white/20">
              <span>{activeTrackMeta.badge}</span>
              {recommendedCareer === selectedTrackId && (
                <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  MATCH ⭐
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight text-white">
              {activeTrackMeta.heroTitle}
            </h2>
            <p className="text-white/90 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed mb-3">
              {activeTrackMeta.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-white/80 font-semibold">
              <span>{steps.length} Modul Terstruktur</span>
              <span>•</span>
              <span>{completedCount} Selesai</span>
              <span>•</span>
              <span>{remainingCount} Tersisa</span>
            </div>
          </div>

          {/* Right Side Progress Component */}
          <div 
            className="z-10 shrink-0 self-start md:self-auto bg-black/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 w-full sm:w-64"
          >
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-white/90">Progress Jalur Ini</span>
              <span className="text-white font-extrabold text-sm">{progressPercent}%</span>
            </div>
            <div 
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
            >
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out bg-white shadow-xs"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-white/75 mt-2 text-center font-medium">
              {completedCount === steps.length && steps.length > 0
                ? '🎉 Selamat! Kamu telah menuntaskan jalur ini!'
                : `${remainingCount} modul lagi untuk menyelesaikan jalur`}
            </p>
          </div>
        </div>

        {/* ─── Section Perjalanan Belajarmu ─────────────────────────────────── */}
        <div 
          className={`transition-all duration-300 ${
            isFullscreen 
              ? 'fixed inset-0 z-50 bg-white p-6 md:p-12 flex flex-col justify-center gap-6 overflow-y-auto w-screen h-screen' 
              : 'relative mb-8'
          }`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-0.5">Perjalanan Belajar: {activeTrackMeta.title}</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Materi akan terbuka secara bertahap sesuai progres belajarmu di karir ini.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Legend */}
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500 bg-white px-4 py-2 rounded-full shadow-xs border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Selesai</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                  <span>Sedang dipelajari</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block"></span>
                  <span>Terkunci</span>
                </div>
              </div>

              {/* Exit Fullscreen Button */}
              {isFullscreen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full border border-indigo-200/60 shadow-xs cursor-pointer transition-all duration-200"
                  title="Keluar Fullscreen"
                >
                  <Minimize size={15} />
                  <span>Keluar Fullscreen</span>
                </button>
              )}
            </div>
          </div>

          {/* Stepper Roadmap Container (All 8 Steps Visible At Once) */}
          
          {/* Desktop Horizontal Timeline (100% Fluid Width) */}
          <div className="hidden sm:block">
            <div 
              onClick={() => !isFullscreen && toggleFullscreen()}
              className={`bg-white rounded-3xl border border-gray-100 relative transition-all ${
                isFullscreen 
                  ? 'shadow-lg p-6 md:p-8 border-gray-200/80' 
                  : 'shadow-sm hover:shadow-md cursor-pointer group p-4 md:p-6'
              }`}
            >
              {/* Click to Fullscreen Badge overlay indicator */}
              {!isFullscreen && (
                <div className="absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 z-30 shadow-xs pointer-events-none">
                  <Maximize size={12} /> Klik area untuk Fullscreen
                </div>
              )}

              {/* Canvas area 100% width - Vertically Centered */}
              <div className="relative w-full overflow-hidden" style={{ height: '360px' }}>
                
                {/* Background Connecting Line */}
                <div 
                  className="absolute h-1 bg-gray-200 z-0 rounded-full"
                  style={{ 
                    top: '180px', 
                    left: '8.5%', 
                    right: '8.5%', 
                    transform: 'translateY(-50%)' 
                  }}
                ></div>
                
                {/* Active Colored Progress Line */}
                <div 
                  className="absolute h-1 bg-gradient-to-r from-emerald-500 via-emerald-500 to-indigo-600 z-0 transition-all duration-500 rounded-full"
                  style={{ 
                    top: '180px', 
                    left: '8.5%', 
                    width: `${activeLineWidthPercent}%`, 
                    transform: 'translateY(-50%)' 
                  }}
                ></div>

                {steps.map((step, idx) => {
                  const isTop = step.position === 'top';
                  const nodeLeftPercent = 8.5 + idx * (83 / (steps.length - 1));

                  return (
                    <React.Fragment key={step.id}>
                      {/* Vertical connector line stem */}
                      <div 
                        className={`absolute w-0.5 z-0 ${
                          step.status === 'selesai' ? 'bg-emerald-300' :
                          step.status === 'sedang' ? 'bg-indigo-300' : 'bg-gray-200'
                        }`}
                        style={{
                          left: `${nodeLeftPercent}%`,
                          transform: 'translateX(-50%)',
                          ...(isTop 
                            ? { top: '135px', height: '35px' } 
                            : { top: '190px', height: '35px' }
                          )
                        }}
                      ></div>

                      {/* Node Circle on Line */}
                      <div 
                        className="absolute z-20 flex items-center justify-center pointer-events-none"
                        style={{ 
                          top: '180px', 
                          left: `${nodeLeftPercent}%`, 
                          transform: 'translate(-50%, -50%)' 
                        }}
                      >
                        {step.status === 'selesai' && (
                          <div className="w-7 h-7 rounded-full bg-white border-4 border-emerald-500 shadow-xs flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          </div>
                        )}
                        {step.status === 'sedang' && (
                          <div className="relative flex items-center justify-center">
                            <div className="absolute w-10 h-10 rounded-full bg-indigo-400/20 animate-ping"></div>
                            <div className="w-8 h-8 rounded-full bg-white border-4 border-indigo-600 shadow-sm flex items-center justify-center z-10">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                            </div>
                          </div>
                        )}
                        {step.status === 'terkunci' && (
                          <div className="w-6 h-6 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                          </div>
                        )}
                      </div>

                      {/* Card Box */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (step.status !== 'terkunci') navigate('/materi/detail');
                        }}
                        className={`absolute w-[11.8%] min-w-[125px] max-w-[210px] p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between z-10 ${
                          step.status === 'selesai'
                            ? 'bg-white border-gray-100 shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-1'
                            : step.status === 'sedang'
                            ? 'bg-white border-indigo-200 shadow-md ring-2 ring-indigo-500/10 cursor-pointer hover:-translate-y-1'
                            : 'bg-gray-50/80 border-gray-100 shadow-xs opacity-80 cursor-not-allowed'
                        }`}
                        style={{
                          left: `${nodeLeftPercent}%`,
                          transform: 'translateX(-50%)',
                          ...(isTop 
                            ? { bottom: '200px' } 
                            : { top: '200px' }
                          )
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                              {step.id}
                            </span>
                            {step.status === 'terkunci' && (
                              <Lock size={12} className="text-gray-400" />
                            )}
                          </div>
                          <h3 className="font-bold text-gray-900 text-xs sm:text-sm mb-1 text-left break-words line-clamp-1" title={step.title}>
                            {step.title}
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-gray-400 leading-tight mb-2 text-left break-words line-clamp-2">
                            {step.description}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between">
                          {step.status === 'selesai' && (
                            <span className="bg-emerald-50 text-emerald-600 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <Check size={10} strokeWidth={3} /> Selesai
                            </span>
                          )}
                          {step.status === 'sedang' && (
                            <span className="bg-indigo-50 text-indigo-600 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <Play size={8} className="fill-indigo-600" /> Sedang dipelajari
                            </span>
                          )}
                          {step.status === 'terkunci' && (
                            <span className="bg-gray-100 text-gray-400 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <Lock size={9} /> Terkunci
                            </span>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                  })}
                </div>
            </div>
          </div>

          {/* Mobile Vertical Step List (Stacked) */}
          <div className="block sm:hidden bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <div className="relative pl-6 space-y-5">
              {/* Vertical connecting line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gray-200 z-0"></div>
              <div 
                className="absolute left-[11px] top-3 w-0.5 bg-emerald-500 z-0 transition-all"
                style={{ height: `${((completedCount) / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((step) => (
                <div 
                  key={step.id}
                  onClick={() => step.status !== 'terkunci' && navigate('/materi/detail')}
                  className={`relative z-10 p-4 rounded-2xl border transition-all ${
                    step.status === 'selesai'
                      ? 'bg-white border-gray-100 shadow-xs'
                      : step.status === 'sedang'
                      ? 'bg-white border-indigo-200 shadow-md ring-2 ring-indigo-500/10'
                      : 'bg-gray-50/80 border-gray-100 opacity-75'
                  }`}
                >
                  {/* Node Circle */}
                  <div className="absolute -left-[31px] top-4 z-20">
                    {step.status === 'selesai' && (
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                    )}
                    {step.status === 'sedang' && (
                      <div className="w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      </div>
                    )}
                    {step.status === 'terkunci' && (
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {step.id}
                    </span>
                    {step.status === 'terkunci' && <Lock size={12} className="text-gray-400" />}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-gray-400 mb-2">{step.description}</p>
                  
                  <div className="pt-2 border-t border-gray-100 flex items-center">
                    {step.status === 'selesai' && (
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> Selesai
                      </span>
                    )}
                    {step.status === 'sedang' && (
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Play size={8} className="fill-indigo-600" /> Sedang dipelajari
                      </span>
                    )}
                    {step.status === 'terkunci' && (
                      <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock size={10} /> Terkunci
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Bottom Cards Row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Rekomendasi Berikutnya Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Play size={22} className="fill-indigo-600 ml-0.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-500" />
                  Rekomendasi Modul Berikutnya: {activeTrackMeta.title}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {nextActiveStep ? nextActiveStep.title : 'Seluruh Materi Selesai! 🎉'}
                </h3>
                <p className="text-xs text-gray-400 font-medium max-w-md">
                  {nextActiveStep ? nextActiveStep.description : 'Hebat! Kamu telah menuntaskan seluruh modul di jalur pembelajaran ini.'}
                </p>
              </div>
            </div>

            {nextActiveStep && (
              <button 
                onClick={() => navigate(`/materi/detail?id=${nextActiveStep.realId || 1}`)}
                className="w-full sm:w-auto bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs hover:shadow-indigo-200 transition-all duration-200 flex items-center justify-center gap-2 shrink-0 cursor-pointer text-sm"
              >
                Mulai Belajar <ArrowRight size={16} />
              </button>
            )}
          </div>

          {/* Ringkasan Jalur Card */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span>Ringkasan Jalur</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                {activeTrackMeta.title}
              </span>
            </h3>
            
            <div className="grid grid-cols-3 gap-2 text-left">
              <div>
                <span className="text-2xl font-bold text-gray-900 block">{completedCount}</span>
                <span className="text-[11px] font-semibold text-gray-400">Modul selesai</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 block">{remainingCount}</span>
                <span className="text-[11px] font-semibold text-gray-400">Tersisa</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-indigo-600 block">{progressPercent}%</span>
                <span className="text-[11px] font-semibold text-gray-400">Progres</span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default LearningPath;
