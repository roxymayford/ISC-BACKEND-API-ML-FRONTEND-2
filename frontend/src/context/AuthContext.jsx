import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initialDashboardData } from '../data/mockData';

const AuthContext = createContext(null);

const FLASK_API = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [isLoading, setIsLoading]     = useState(true);
  const saveTimeoutRef                = useRef(null);

  // ─── Sync stats helper ────────────────────────────────────────────────────
  const handleSetDashboardData = (newData) => {
    if (!newData) {
      setDashboardData(newData);
      return;
    }
    const syncedData = JSON.parse(JSON.stringify(newData));
    if (!syncedData.completedModules) syncedData.completedModules = [];
    const completedCount = syncedData.completedModules.length;

    const modulStat = syncedData.stats?.find(s => s.id === 2);
    if (modulStat) modulStat.value = completedCount.toString();

    const xpStat = syncedData.stats?.find(s => s.id === 4);
    if (xpStat) {
      const moduleXp = completedCount * 50;
      const quizXp   = syncedData.quizXp || 0;
      xpStat.value   = (moduleXp + quizXp).toString();
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (syncedData.lastLoginDate !== todayStr) {
      let currentStreak = parseInt(syncedData.stats?.find(s => s.id === 3)?.value || '0');

      if (syncedData.lastLoginDate) {
        const todayMs = new Date(todayStr).getTime();
        const lastMs  = new Date(syncedData.lastLoginDate).getTime();
        const diffDays = Math.round((todayMs - lastMs) / (1000 * 60 * 60 * 24));
        if (diffDays === 1)      currentStreak += 1;
        else if (diffDays > 1)   currentStreak  = 1;
      } else {
        currentStreak = 1;
      }

      const streakStat = syncedData.stats?.find(s => s.id === 3);
      if (streakStat) streakStat.value = currentStreak.toString();

      syncedData.lastLoginDate = todayStr;
      if (syncedData.dailyTarget) syncedData.dailyTarget.currentMinutes = 0;
    }

    if (!syncedData.unlockedBadges) syncedData.unlockedBadges = [];
    if (!syncedData.notifications)  syncedData.notifications  = [];

    const badgeStreak = parseInt(syncedData.stats?.find(s => s.id === 3)?.value || '0');
    const badgeModule = syncedData.completedModules.length;
    const badgeQuiz   = syncedData.completedQuizzes?.length || 0;
    const badgeXp     = parseInt(syncedData.stats?.find(s => s.id === 4)?.value || '0');
    const badgeLevel  = Math.floor(badgeXp / 100) + 1;

    const checkBadge = (id, title, condition) => {
      if (condition && !syncedData.unlockedBadges.includes(id)) {
        syncedData.unlockedBadges.push(id);
        syncedData.notifications.unshift({
          id:          Date.now() + Math.random(),
          type:        'achievement',
          unread:      true,
          title:       `Badge Baru: 🏆`,
          time:        'Baru saja',
          description: `Selamat! Kamu telah membuka badge ${title}. Terus tingkatkan prestasimu!`,
          iconName:    'Award',
        });
      }
    };

    checkBadge('pemula',   'Pemula',         badgeLevel  >= 2);
    checkBadge('rajin',    'Pelajar Rajin',   badgeModule >= 1);
    checkBadge('ahli',     'Ahli Materi',     badgeModule >= 3);
    checkBadge('jenius',   'Si Jenius',       badgeQuiz   >= 1);
    checkBadge('konsisten','Konsisten',        badgeStreak >= 3);
    checkBadge('master',   'Master Kuis',     badgeQuiz   >= 3);
    checkBadge('kutu',     'Kutu Buku',       badgeLevel  >= 5);
    checkBadge('legenda',  'Legenda',         badgeXp     >= 1000);

    setDashboardData(syncedData);
    return syncedData;
  };

  // ─── Save progress to backend (debounced) ──────────────────────────────────
  const saveProgressToBackend = async (data, userId) => {
    if (!userId || !data) return;
    
    try {
      await fetch(`${FLASK_API}/progress/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          completedModules:  data.completedModules || [],
          completedQuizzes:  data.completedQuizzes || [],
          quizXp:            data.quizXp || 0,
          dailyTarget:       data.dailyTarget || {},
          preferences:       data.preferences || {},
          unlockedBadges:    data.unlockedBadges || [],
          lastLoginDate:     data.lastLoginDate || null,
          stats:             data.stats || [],
          notifications:     data.notifications || [],
        }),
      });
    } catch (err) {
      console.error('Failed to save progress to backend:', err);
    }
  };

  // ─── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // Check Google user first
      const googleUserStr = localStorage.getItem('googleUser');
      if (googleUserStr) {
        try {
          const googleUser = JSON.parse(googleUserStr);
          setUser({ name: googleUser.name, email: googleUser.email, avatar: googleUser.avatar, id: googleUser.id, isGoogle: true });
          
          // Initialize with user data
          const newData        = JSON.parse(JSON.stringify(initialDashboardData));
          newData.user.name    = googleUser.name;
          newData.user.email   = googleUser.email;
          newData.user.avatar  = googleUser.avatar;
          
          // Fetch progress from backend if user has ID
          if (googleUser.id) {
            fetch(`${FLASK_API}/progress/`)
              .then(res => res.json())
              .then(result => {
                if (result.progress) {
                  // Merge backend progress with local data
                  const backendProgress = result.progress;
                  newData.completedModules = backendProgress.completedModules || [];
                  newData.completedQuizzes = backendProgress.completedQuizzes || [];
                  newData.quizXp           = backendProgress.quizXp || 0;
                  newData.dailyTarget      = backendProgress.dailyTarget || { targetMinutes: 60, currentMinutes: 0 };
                  newData.preferences      = backendProgress.preferences || {};
                  newData.unlockedBadges   = backendProgress.unlockedBadges || [];
                  newData.lastLoginDate    = backendProgress.lastLoginDate || null;
                  newData.stats            = backendProgress.stats || newData.stats;
                  newData.notifications    = backendProgress.notifications || [];
                }
                handleSetDashboardData(newData);
              })
              .catch(() => {
                handleSetDashboardData(newData);
              });
          } else {
            handleSetDashboardData(newData);
          }
          setIsLoading(false);
          return;
        } catch (_) {}
      }

      // Fallback: email/password user
      const loggedInUserEmail = localStorage.getItem('currentUser');
      if (loggedInUserEmail) {
        const accounts  = JSON.parse(localStorage.getItem('accounts') || '[]');
        const foundUser = accounts.find(acc => acc.email === loggedInUserEmail);
        if (foundUser) {
          setUser({ name: foundUser.name, email: foundUser.email });
          if (foundUser.data) {
            handleSetDashboardData(foundUser.data);
          } else {
            const newData     = JSON.parse(JSON.stringify(initialDashboardData));
            newData.user.name = foundUser.name;
            handleSetDashboardData(newData);
          }
        }
      }
      setIsLoading(false);
    }, 1200);
  }, []);

  // ─── Auto-save dashboardData for Google users (debounced) ──────────────────
  useEffect(() => {
    if (user && user.isGoogle && user.id && dashboardData) {
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Debounce: wait 1 second before saving
      saveTimeoutRef.current = setTimeout(() => {
        saveProgressToBackend(dashboardData, user.id);
      }, 1000);
    }
  }, [dashboardData, user]);

  // ─── Auto-save dashboardData for email/password users ─────────────────────
  useEffect(() => {
    if (user && !user.isGoogle && dashboardData) {
      const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
      const index    = accounts.findIndex(acc => acc.email === user.email);
      if (index !== -1) {
        if (JSON.stringify(accounts[index].data) !== JSON.stringify(dashboardData)) {
          accounts[index].data = dashboardData;
          localStorage.setItem('accounts', JSON.stringify(accounts));
        }
      }
    }
  }, [dashboardData, user]);

  // ─── LOGIN (email + password) ─────────────────────────────────────────────
  const login = (email, password) => {
    const accounts  = JSON.parse(localStorage.getItem('accounts') || '[]');
    const foundUser = accounts.find(acc => acc.email === email && acc.password === password);
    if (foundUser) {
      localStorage.setItem('currentUser', email);
      setUser({ name: foundUser.name, email: foundUser.email });
      if (foundUser.data) {
        handleSetDashboardData(foundUser.data);
      } else {
        const newData     = JSON.parse(JSON.stringify(initialDashboardData));
        newData.user.name = foundUser.name;
        handleSetDashboardData(newData);
      }
      return true;
    }
    return false;
  };

  // ─── LOGIN WITH GOOGLE ────────────────────────────────────────────────────
  const loginWithGoogle = async (credential) => {
    try {
      const response = await fetch(`${FLASK_API}/auth/google`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ credential }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Google login failed');
      }

      const result = await response.json();
      const { user: googleUser, is_new_user, has_recommendation, progress } = result;

      // Persist Google session
      localStorage.setItem('googleUser', JSON.stringify(googleUser));
      localStorage.removeItem('currentUser');

      setUser({
        id:       googleUser.id,
        name:     googleUser.name,
        email:    googleUser.email,
        avatar:   googleUser.avatar,
        isGoogle: true,
      });

      const newData         = JSON.parse(JSON.stringify(initialDashboardData));
      newData.user.name     = googleUser.name;
      newData.user.email    = googleUser.email;
      newData.user.avatar   = googleUser.avatar;
      
      // Merge backend progress if available
      if (progress) {
        newData.completedModules = progress.completedModules || [];
        newData.completedQuizzes = progress.completedQuizzes || [];
        newData.quizXp           = progress.quizXp || 0;
        newData.dailyTarget      = progress.dailyTarget || { targetMinutes: 60, currentMinutes: 0 };
        newData.preferences      = progress.preferences || {};
        newData.unlockedBadges   = progress.unlockedBadges || [];
        newData.lastLoginDate    = progress.lastLoginDate || null;
        newData.stats            = progress.stats || newData.stats;
        newData.notifications    = progress.notifications || [];
      }

      handleSetDashboardData(newData);

      return {
        success:            true,
        is_new_user,
        has_recommendation,
        user_id:            googleUser.id,
      };
    } catch (err) {
      console.error('Google login error:', err);
      return { success: false, error: err.message };
    }
  };

  // ─── REGISTER (email + password) ──────────────────────────────────────────
  const register = (username, email, password) => {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    if (accounts.some(acc => acc.email === email)) return false;

    const newData     = JSON.parse(JSON.stringify(initialDashboardData));
    newData.user.name = username;
    newData.notifications = [{
      id:          Date.now(),
      type:        'system',
      unread:      true,
      title:       'Selamat Datang! 🎉',
      time:        'Baru saja',
      description: `Halo ${username}, selamat bergabung di platform belajar cerdas kami!`,
      iconName:    'CheckCheck',
      iconBg:      'bg-indigo-100',
      iconColor:   'text-indigo-600',
    }];

    accounts.push({ name: username, email, password, data: newData });
    localStorage.setItem('accounts', JSON.stringify(accounts));
    return true;
  };

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = () => {
    if (user && !user.isGoogle && dashboardData) {
      const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
      const index    = accounts.findIndex(acc => acc.email === user.email);
      if (index !== -1) {
        accounts[index].data = dashboardData;
        localStorage.setItem('accounts', JSON.stringify(accounts));
      }
    }
    
    // Also save to backend for Google users before logout
    if (user && user.isGoogle && user.id && dashboardData) {
      saveProgressToBackend(dashboardData, user.id);
    }
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('googleUser');
    localStorage.removeItem('user_id');
    setUser(null);
    setDashboardData(initialDashboardData);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      register,
      logout,
      dashboardData,
      setDashboardData: handleSetDashboardData,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
