import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Bell, 
  Search, 
  CheckCircle2, 
  Flame, 
  Check, 
  Sparkles, 
  Trophy, 
  Play, 
  Settings, 
  Maximize, 
  FileText,
  ChevronRight,
  Headphones,
  MousePointer2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const MateriDetail = () => {
  const navigate = useNavigate();
  const { dashboardData: data, setDashboardData } = useAuth();
  const [isCompleted, setIsCompleted] = useState(data?.completedModules?.includes(1) || false);

  // Default to visual if not set
  const learningStyle = data?.preferences?.learningStyle || 'visual';

  const handleSelesai = () => {
    if (isCompleted) return;
    setIsCompleted(true);
    
    // Update global dashboard data
    const newData = JSON.parse(JSON.stringify(data)); // Deep copy
    
    // Update Modul Selesai (id: 2)
    const modulStat = newData.stats.find(s => s.id === 2);
    if (modulStat) {
      modulStat.value = (parseInt(modulStat.value || "0") + 1).toString();
    }
    
    // Update Total XP (id: 4)
    const xpStat = newData.stats.find(s => s.id === 4);
    if (xpStat) {
      xpStat.value = (parseInt(xpStat.value || "0") + 50).toString();
    }

    // Add study time
    if (!newData.dailyTarget) newData.dailyTarget = { targetMinutes: 30, currentMinutes: 0 };
    newData.dailyTarget.currentMinutes = (newData.dailyTarget.currentMinutes || 0) + 15;

    // Add Notification
    if (!newData.notifications) newData.notifications = [];
    newData.notifications.unshift({
      id: Date.now() + Math.random(),
      type: 'system',
      unread: true,
      title: 'Modul Selesai: Konsep Dasar Aljabar Linear',
      time: 'Baru saja',
      description: 'Selamat! Kamu telah menyelesaikan modul ini dan mendapatkan **+50 XP** serta **+15 Menit** waktu belajar.',
      iconName: 'Grid',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
    });

    // Add this module (id: 1) to completedModules
    if (!newData.completedModules) {
      newData.completedModules = [];
    }
    if (!newData.completedModules.includes(1)) {
      newData.completedModules.push(1);
    }
    
    setDashboardData(newData);

    // Give a short delay so user can see the "Selesai" animation, then redirect
    setTimeout(() => {
      navigate('/materi');
    }, 800);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left">
      <Sidebar user={data.user} />
      
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm hover:text-primary transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Konsep Dasar Aljabar Linear</h1>
              <p className="text-gray-500 text-sm font-medium">Modul 1: Pengantar Matematika untuk AI</p>
            </div>
          </div>
          
          <Link to="/notifications" className="bg-white p-2.5 rounded-full shadow-sm text-gray-400 hover:text-primary transition-colors relative block">
            <Bell size={20} />
            {data.notifications?.some(n => n.unread) && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* Dynamic Content Area based on Learning Style */}
            {learningStyle === 'visual' && (
              <div className="relative w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-md group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-800 to-teal-900 opacity-80">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-teal-400 rounded-full blur-3xl opacity-40"></div>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#4232c2] shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play size={32} className="ml-1" fill="currentColor" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-4 text-white text-xs font-medium mb-2">
                    <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-white rounded-full relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"></div>
                      </div>
                    </div>
                    <span>12:45 / 18:20</span>
                    <Settings size={16} className="cursor-pointer hover:text-gray-300" />
                    <Maximize size={16} className="cursor-pointer hover:text-gray-300" />
                  </div>
                </div>
              </div>
            )}

            {learningStyle === 'auditory' && (
              <div className="w-full bg-white rounded-3xl p-10 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-50 to-white"></div>
                <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 shadow-xl mb-8 relative z-10 flex flex-col items-center justify-center text-white">
                  <Headphones size={48} className="mb-2" />
                  <span className="font-bold text-sm">Podcast AI</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">Konsep Dasar Aljabar Linear</h2>
                <p className="text-gray-500 font-medium mb-8 relative z-10">Episode 1 • 15 Menit</p>
                
                <div className="w-full max-w-md flex flex-col items-center relative z-10">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-gray-400 mb-3">
                    <span>04:12</span>
                    <span>15:00</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full mb-8 cursor-pointer relative">
                    <div className="h-full w-1/3 bg-orange-500 rounded-full relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-orange-500 rounded-full shadow"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
                    </button>
                    <button className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg transition-transform transform hover:scale-105">
                      <Play size={28} className="ml-1" fill="currentColor" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {learningStyle === 'read_write' && (
              <div className="w-full bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-bold">Artikel Bacaan</span>
                  <span className="text-sm font-medium text-gray-400">Estimasi baca: 7 menit</span>
                </div>
                
                <h1 className="text-3xl font-black text-gray-900 mb-6 leading-tight">Mengenal Lebih Jauh Tentang Aljabar Linear</h1>
                
                <div className="prose prose-indigo max-w-none">
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    <strong>Aljabar linear</strong> adalah fondasi dari hampir semua algoritma <em>machine learning</em> dan <em>artificial intelligence</em>. Sebelum kita bisa mengajarkan komputer untuk mengenali gambar atau menerjemahkan bahasa, kita harus mengubah data tersebut menjadi bentuk matriks dan vektor.
                  </p>
                  
                  <div className="bg-gray-50 border-l-4 border-[#4232c2] p-6 rounded-r-2xl mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Vektor dan Ruang Vektor</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Secara sederhana, vektor adalah besaran yang memiliki arah. Dalam konteks AI, vektor hanyalah sebuah array atau daftar angka (misalnya: <code>[1.2, 3.4, 5.0]</code>) yang merepresentasikan fitur-fitur dari sebuah data.
                    </p>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Mengapa ini penting?</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Bayangkan Anda ingin membuat model AI pendeteksi rumah. Fitur rumah seperti luas tanah, jumlah kamar, dan usia bangunan akan disusun menjadi matriks. Dengan operasi aljabar linear seperti <em>dot product</em>, komputer dapat mengkalikan matriks data dengan bobot (weights) secara efisien tanpa harus melakukan perulangan (loop) satu per satu.
                  </p>
                  
                  <button className="w-full py-4 border-2 border-dashed border-pink-200 text-pink-600 rounded-xl font-bold hover:bg-pink-50 transition-colors flex items-center justify-center gap-2">
                    <FileText size={20} />
                    Buat Catatan Pribadi
                  </button>
                </div>
              </div>
            )}

            {learningStyle === 'kinesthetic' && (
              <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[500px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                      <MousePointer2 size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Simulasi Vektor Aktif</h2>
                      <p className="text-xs font-bold text-gray-400">Tarik titik untuk melihat perubahan nilai</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-600 transition-colors">Reset</button>
                </div>
                
                {/* Interactive Canvas Mockup */}
                <div className="flex-1 bg-gray-50 rounded-2xl border-2 border-gray-200 border-dashed relative flex items-center justify-center group overflow-hidden">
                  
                  {/* Grid Background */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#4232c2 1px, transparent 1px), linear-gradient(90deg, #4232c2 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                  
                  {/* Axis */}
                  <div className="absolute w-full h-0.5 bg-gray-300"></div>
                  <div className="absolute h-full w-0.5 bg-gray-300"></div>
                  
                  {/* Vector Line */}
                  <div className="absolute w-[180px] h-1 bg-red-500 origin-left transform -rotate-45 ml-[180px] z-10 shadow-md">
                    {/* Arrow head */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 transform rotate-45 scale-x-50 translate-x-1"></div>
                  </div>
                  
                  {/* Draggable Point */}
                  <div className="absolute w-8 h-8 bg-white border-4 border-red-500 rounded-full z-20 cursor-move shadow-xl hover:scale-110 transition-transform flex items-center justify-center transform translate-x-[120px] -translate-y-[120px]">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  
                  {/* Vector Value Tooltip */}
                  <div className="absolute bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold transform translate-x-[120px] -translate-y-[170px] shadow-lg">
                    v = [ 3, 4 ]
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 mb-1">Nilai X (Horizontal)</p>
                    <input type="range" className="w-full accent-red-500" defaultValue="60" />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 mb-1">Nilai Y (Vertikal)</p>
                    <input type="range" className="w-full accent-red-500" defaultValue="80" />
                  </div>
                </div>
              </div>
            )}

            {/* Tentang Materi Ini */}
            <div className="bg-white rounded-3xl p-8 shadow-sm flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Tentang Materi Ini</h2>
              </div>
              
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Aljabar linear adalah cabang matematika yang berkaitan dengan vektor, ruang vektor, transformasi linear, dan sistem persamaan linear. Dalam materi ini, kita akan membahas dasar-dasar operasi matriks, perkalian dot product, dan bagaimana konsep ini menjadi tulang punggung algoritma kecerdasan buatan modern.
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 bg-indigo-50 text-[#4232c2] rounded-full text-xs font-bold">Matematika</span>
                <span className="px-4 py-1.5 bg-indigo-50 text-[#4232c2] rounded-full text-xs font-bold">AI Fundamental</span>
                <span className="px-4 py-1.5 bg-indigo-50 text-[#4232c2] rounded-full text-xs font-bold">Data Science</span>
              </div>
            </div>



          </div>

          {/* Right Column (Sidebar content) */}
          <div className="space-y-6">
            


            {/* Progress Modul */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Progress Modul</h3>
                <span className="text-[#4232c2] font-bold text-sm">{isCompleted ? '100%' : '70%'}</span>
              </div>
              
              <div className="h-2 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-[#4232c2] rounded-full transition-all duration-1000" style={{ width: isCompleted ? '100%' : '70%' }}></div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                    <CheckCircle2 size={14} />
                  </div>
                  {isCompleted ? '1' : '0'} Modul Selesai
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
                    <Flame size={14} fill="currentColor" className="text-orange-500" />
                  </div>
                  0 Hari Streak
                </div>
              </div>

              <button 
                onClick={handleSelesai}
                disabled={isCompleted}
                className={`w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm ${
                  isCompleted 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#0d9488] hover:bg-[#0f766e] text-white'
                }`}
              >
                <Check size={18} /> {isCompleted ? 'Selesai' : 'Selesai & Tandai'}
              </button>
            </div>

            {/* Rekomendasi AI */}
            <div className="bg-gradient-to-br from-[#4f46e5] to-[#4338ca] rounded-3xl p-6 shadow-md text-white relative overflow-hidden">
              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles size={12} className="text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">Rekomendasi AI</span>
              </div>

              <h3 className="text-xl font-bold mb-2">Quiz: Dasar Aljabar</h3>
              <p className="text-white/80 text-xs leading-relaxed mb-6">
                Uji pemahamanmu setelah menonton video ini untuk mendapatkan 500 XP tambahan!
              </p>

              <button className="w-full bg-white text-[#4232c2] hover:bg-gray-50 font-bold py-3 rounded-xl transition-colors text-sm shadow-sm">
                Mulai Latihan
              </button>
            </div>



          </div>
        </div>
      </main>
    </div>
  );
};

export default MateriDetail;
