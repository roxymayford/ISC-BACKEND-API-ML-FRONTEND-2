import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import ActiveCourseCard from '../components/ActiveCourseCard';
import ProfileAnalysisCard from '../components/ProfileAnalysisCard';
import RecommendationCard from '../components/RecommendationCard';
import DailyTargetCard from '../components/DailyTargetCard';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { dashboardData: data, isLoading } = useAuth();

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left">
      <Sidebar user={data?.user} />
      
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        {isLoading ? (
          <div className="animate-pulse">
            <header className="flex justify-between items-end mb-8">
              <div>
                <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-64"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-3xl h-32 flex items-center shadow-sm">
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl mr-4"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded-lg w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-24"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl h-64 p-8 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded-lg w-48 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
                </div>
                
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-gray-200 rounded-lg w-48"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-16"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                      <div key={i} className="bg-white rounded-3xl h-48 shadow-sm p-6"></div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-3xl h-80 shadow-sm p-6"></div>
                <div className="bg-white rounded-3xl h-48 shadow-sm p-6"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <header className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Beranda</h1>
                <p className="text-gray-400 mt-1 font-medium text-sm">Selamat Pagi {data.user.name}. Mari capai target belajarmu hari ini!</p>
              </div>
              <Link to="/notifications" className="bg-white p-2.5 rounded-full shadow-sm text-gray-400 hover:text-primary transition-colors relative block">
                <Bell size={20} />
                {data.notifications?.some(n => n.unread) && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {data.stats.map(stat => (
                <StatCard 
                  key={stat.id}
                  icon={stat.icon} 
                  value={stat.value} 
                  label={stat.label} 
                  iconColorClass={stat.iconColorClass} 
                  iconBgClass={stat.iconBgClass} 
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (Takes up 2/3 on large screens) */}
              <div className="lg:col-span-2 space-y-8">
                <ActiveCourseCard course={data.activeCourse} />
                
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Rekomendasi Cerdas AI</h3>
                    <a href="#" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">Lihat Semua</a>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.recommendations.map(rec => (
                      <RecommendationCard 
                        key={rec.id}
                        title={rec.title} 
                        level={rec.level} 
                        duration={rec.duration} 
                        bgClass={rec.bgClass} 
                      />
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column (Takes up 1/3 on large screens) */}
              <div className="space-y-8">
                <ProfileAnalysisCard profile={data.profileAnalysis} />
                <DailyTargetCard target={data.dailyTarget} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
