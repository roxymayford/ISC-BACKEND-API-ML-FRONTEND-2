import { useState } from 'react';
import { Home, BarChart2, BookOpen, PenTool, Award, Compass, Settings, LogOut, User, ChevronUp, Route } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ user }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Beranda', icon: Home, path: '/dashboard' },
    { name: 'Progress Belajar', icon: BarChart2, path: '/progress' },
    { name: 'Learning Path', icon: Route, path: '/learning-path' },
    { name: 'Materi', icon: BookOpen, path: '/materi' },
    { name: 'Latihan Soal', icon: PenTool, path: '/latihan' },
    { name: 'Pencapaian', icon: Award, path: '/pencapaian' },
    { name: 'Rekomendasi Karir', icon: Compass, path: '/rekomendasi' },
    { name: 'Pengaturan', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-white h-screen flex flex-col shadow-sm rounded-r-3xl sticky top-0 overflow-y-auto hidden md:flex font-sans">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-primary-light">Project ISC</span>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  isActive
                    ? 'bg-primary-light/10 text-primary-dark shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={19} className={isActive ? 'text-primary' : 'text-gray-400'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-100 relative">
        {/* Popover Menu */}
        {isProfileMenuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-100 shadow-xl rounded-2xl py-2 z-50 overflow-hidden transform transition-all">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <User size={16} />
              Lihat Profil
            </Link>
            <button 
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin keluar?')) {
                  logout();
                  window.location.href = '/login';
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        )}

        {/* User Toggle */}
        <div 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className={`flex items-center justify-between cursor-pointer group p-2 rounded-xl transition-colors ${isProfileMenuOpen ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
        >
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt="User Avatar" className="w-9 h-9 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 shadow-sm text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <span className="font-semibold text-gray-800 text-sm max-w-[85px] truncate">{user?.name || 'User'}</span>
          </div>
          <ChevronUp size={18} className={`text-gray-400 group-hover:text-primary transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
