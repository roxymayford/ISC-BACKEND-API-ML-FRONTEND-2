# Learning Path App

Platform pembelajaran cerdas berbasis AI yang memberikan rekomendasi jalur karir dan memantau perkembangan belajar pengguna.

## Arsitektur Proyek

Proyek ini menggunakan arsitektur *monorepo* yang terdiri dari 3 bagian utama:

### 1. Frontend (React + Vite)
Berada di folder `frontend/`. Menangani antarmuka pengguna, termasuk fitur autentikasi, dashboard, dan integrasi dengan backend.
- **Teknologi**: React 19, Vite, TailwindCSS, React Router.
- **Port**: `http://localhost:5173`

### 2. Machine Learning API (Flask)
Berada di folder `backend/`. Menangani logika Machine Learning untuk memprediksi rekomendasi jalur karir berdasarkan minat dan keahlian menggunakan model berbasis `scikit-learn`.
- **Teknologi**: Python, Flask, scikit-learn, joblib.
- **Port**: `http://127.0.0.1:5000`

### 3. Authentication & Main API (Laravel)
Berada di folder `laravel/` (dan `learning_path_server/`). Menangani logika otentikasi utama menggunakan *Google OAuth* (Laravel Socialite) dan manajemen database pengguna dengan Laravel Sanctum.
- **Teknologi**: PHP, Laravel 11, MySQL, Laravel Sanctum, Laravel Socialite.
- **Port**: `http://127.0.0.1:8000`

## Cara Menjalankan Aplikasi

1. **Jalankan Frontend (React)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Jalankan ML Backend (Flask)**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

3. **Jalankan API (Laravel)**
   ```bash
   # Di folder server Laravel Anda
   composer install
   php artisan migrate
   php artisan serve
   ```

## Fitur Utama
- **Autentikasi Cepat**: Mendukung Login via Google.
- **Rekomendasi Karir AI**: Mengolah input *skills* & *interests* pengguna lalu memprediksi 5 besar bidang pekerjaan yang paling cocok dengan persentase kesesuaian (menggunakan *Machine Learning*).
- **Gamifikasi**: Notifikasi pencapaian (badge) dan monitoring progress belajar.
