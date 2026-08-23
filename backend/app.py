# ─────────────────────────────────────────────────────────────────────────────
# BACKEND APP.PY - WITH USER PROGRESS, ML RECS & ADMIN MATERI MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

import os
import pickle
import numpy as np
import joblib
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# ─── Load Environment Variables ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(BASE_DIR, '.env'))
except ImportError:
    pass



GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "244826909624-055j98h4rd5m8m9ruvami0invr46muof.apps.googleusercontent.com"
)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "iscLP")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "kelompok9")
PORT = int(os.getenv("PORT", 5000))


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database configuration: support Cloud DB via DATABASE_URL or fallback to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'learning_path.db')}"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)

# ─── Models ───────────────────────────────────────────────────────────────────
class User(db.Model):
    __tablename__ = 'users'
    id          = db.Column(db.Integer, primary_key=True)
    google_id   = db.Column(db.String(100), unique=True, nullable=True)
    name        = db.Column(db.String(100), nullable=False)
    email       = db.Column(db.String(150), unique=True, nullable=False)
    avatar      = db.Column(db.String(500), nullable=True)
    role        = db.Column(db.String(20), default='user') # 'user' or 'admin'
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    is_new      = db.Column(db.Boolean, default=True)

    recommendations = db.relationship('CareerRecommendation', backref='user', lazy=True)
    progress = db.relationship('UserProgress', backref='user', uselist=False, lazy=True)

    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "avatar":     self.avatar,
            "role":       self.role,
            "google_id":  self.google_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CareerRecommendation(db.Model):
    __tablename__ = 'career_recommendations'
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    top_career    = db.Column(db.String(150), nullable=False)
    skills        = db.Column(db.Text, nullable=True)
    interests     = db.Column(db.Text, nullable=True)
    probabilities = db.Column(db.Text, nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id":            self.id,
            "user_id":       self.user_id,
            "top_career":    self.top_career,
            "skills":        json.loads(self.skills)        if self.skills        else [],
            "interests":     json.loads(self.interests)     if self.interests     else [],
            "probabilities": json.loads(self.probabilities) if self.probabilities else {},
            "created_at":    self.created_at.isoformat() if self.created_at else None,
        }


class UserProgress(db.Model):
    __tablename__ = 'user_progress'
    id                = db.Column(db.Integer, primary_key=True)
    user_id           = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    completed_modules = db.Column(db.Text, default='[]')
    completed_quizzes = db.Column(db.Text, default='[]')
    quiz_xp           = db.Column(db.Integer, default=0)
    daily_target      = db.Column(db.Text, default='{}')
    preferences       = db.Column(db.Text, default='{}')
    unlocked_badges   = db.Column(db.Text, default='[]')
    last_login_date   = db.Column(db.String(20), nullable=True)
    stats             = db.Column(db.Text, default='[]')
    notifications     = db.Column(db.Text, default='[]')
    updated_at        = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "completedModules":  json.loads(self.completed_modules)  if self.completed_modules  else [],
            "completedQuizzes":  json.loads(self.completed_quizzes)  if self.completed_quizzes  else [],
            "quizXp":            self.quiz_xp,
            "dailyTarget":       json.loads(self.daily_target)       if self.daily_target       else {},
            "preferences":       json.loads(self.preferences)       if self.preferences       else {},
            "unlockedBadges":    json.loads(self.unlocked_badges)    if self.unlocked_badges    else [],
            "lastLoginDate":     self.last_login_date,
            "stats":             json.loads(self.stats)             if self.stats             else [],
            "notifications":     json.loads(self.notifications)     if self.notifications     else [],
        }


class Subject(db.Model):
    __tablename__ = 'subjects'
    id          = db.Column(db.Integer, primary_key=True)
    title       = db.Column(db.String(150), nullable=False)
    icon        = db.Column(db.String(50), default='BookOpen')
    color       = db.Column(db.String(50), default='text-blue-600')
    bg_color    = db.Column(db.String(50), default='bg-blue-50')
    order       = db.Column(db.Integer, default=0)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    modules     = db.relationship('Materi', backref='subject', cascade='all, delete-orphan', lazy=True, order_by='Materi.order')

    def to_dict(self, include_modules=True):
        data = {
            "id":        self.id,
            "title":     self.title,
            "icon":      self.icon,
            "color":     self.color,
            "bgColor":   self.bg_color,
            "order":     self.order,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }
        if include_modules:
            data["modules"] = [m.to_dict() for m in self.modules]
        return data


class Materi(db.Model):
    __tablename__ = 'materi'
    id          = db.Column(db.Integer, primary_key=True)
    subject_id  = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    title       = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    duration    = db.Column(db.String(50), default='15:00')
    type        = db.Column(db.String(50), default='Video')  # 'Video', 'Video + Artikel', 'Artikel', 'Interaktif'
    video_url   = db.Column(db.String(500), nullable=True)
    content     = db.Column(db.Text, nullable=True)
    xp_reward   = db.Column(db.Integer, default=50)
    is_locked   = db.Column(db.Boolean, default=False)
    order       = db.Column(db.Integer, default=0)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id":           self.id,
            "subjectId":    self.subject_id,
            "subjectTitle": self.subject.title if self.subject else None,
            "title":        self.title,
            "description":  self.description or '',
            "duration":     self.duration or '15:00',
            "type":         self.type or 'Video',
            "videoUrl":     self.video_url or '',
            "content":      self.content or '',
            "xpReward":     self.xp_reward or 50,
            "isLocked":     bool(self.is_locked),
            "order":        self.order or 0,
            "createdAt":    self.created_at.isoformat() if self.created_at else None,
            "updatedAt":    self.updated_at.isoformat() if self.updated_at else None
        }


# ─── Create tables & Seed default data on startup ─────────────────────────────
def seed_default_data():
    if Subject.query.count() == 0:
        print("[SEED] Seeding initial subjects and materi...")
        s1 = Subject(title='Aljabar Linear', icon='Calculator', color='text-blue-600', bg_color='bg-blue-50', order=1)
        s2 = Subject(title='Teori Graf', icon='GitBranch', color='text-orange-600', bg_color='bg-orange-50', order=2)
        s3 = Subject(title='Probabilitas & Statistika', icon='PieChart', color='text-green-600', bg_color='bg-green-50', order=3)

        db.session.add_all([s1, s2, s3])
        db.session.flush()

        m1 = Materi(
            subject_id=s1.id,
            title='Konsep Dasar Aljabar Linear',
            description='Pengantar Matematika untuk AI, vektor, dan operasi matriks dasar.',
            duration='18:20',
            type='Video',
            video_url='https://www.youtube.com/watch?v=fNk_zzaMoSs',
            content='### Pengantar Aljabar Linear\nAljabar linear adalah cabang matematika yang mempelajari vektor, ruang vektor, transformasi linear, dan sistem persamaan linear. Dalam Machine Learning dan Data Science, data direpresentasikan dalam bentuk vektor dan matriks multidimensi.',
            xp_reward=50,
            is_locked=False,
            order=1
        )
        m2 = Materi(
            subject_id=s1.id,
            title='Operasi Matriks Tingkat Lanjut',
            description='Perkalian matriks, invers, dan determinan dalam komputasi modern.',
            duration='24:10',
            type='Video + Artikel',
            video_url='https://www.youtube.com/watch?v=kYB8IZa5AuE',
            content='### Operasi Matriks Lanjut\nMemahami dot product, perkalian matriks, determinan, dan invers matriks untuk komputasi grafika komputer dan neural network.',
            xp_reward=50,
            is_locked=True,
            order=2
        )
        m3 = Materi(
            subject_id=s2.id,
            title='Pengenalan Graf dan Tree',
            description='Mengenal struktur data graf, representasi adjacency matrix, dan pohon.',
            duration='15:30',
            type='Video',
            video_url='',
            content='### Struktur Data Graf\nGraf terdiri dari himpunan simpul (vertices) dan sisi (edges). Digunakan luas dalam navigasi rute terpendek dan jejaring sosial.',
            xp_reward=50,
            is_locked=True,
            order=1
        )
        m4 = Materi(
            subject_id=s3.id,
            title='Probabilitas Dasar',
            description='Peluang kejadian, ruang sampel, dan distribusi probabilitas.',
            duration='20:45',
            type='Video',
            video_url='',
            content='### Dasar-dasar Teori Peluang\nKonsep peluang bersyarat, independensi variabel, dan Teorema Bayes.',
            xp_reward=50,
            is_locked=True,
            order=1
        )

        db.session.add_all([m1, m2, m3, m4])
        db.session.commit()
        print("[SEED] Default data seeded successfully!")

with app.app_context():
    db.create_all()
    try:
        with db.engine.connect() as conn:
            conn.execute(db.text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'"))
            conn.commit()
    except Exception:
        pass
    seed_default_data()

# ─── Load ML Model ────────────────────────────────────────────────────────────
MODEL_PATH    = os.path.join(BASE_DIR, '..', 'model_rekomendasi_karir.pkl')
FEATURES_PATH = os.path.join(BASE_DIR, '..', 'kolom_fitur.pkl')

try:
    model = joblib.load(MODEL_PATH)
    with open(FEATURES_PATH, 'rb') as f:
        feature_columns = pickle.load(f)

    skills_clean    = []
    interests_clean = []
    for col in feature_columns:
        if col.startswith('Skills_'):
            skills_clean.append(col.replace('Skills_', ''))
        elif col.startswith('Interests_'):
            interests_clean.append(col.replace('Interests_', ''))

    print(f"[OK] Model loaded - {len(skills_clean)} skills, {len(interests_clean)} interests")

except Exception as e:
    print(f"[ERROR] Error loading model: {e}")
    model          = None
    feature_columns = []
    skills_clean    = []
    interests_clean = []


# ═══════════════════════════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    data       = request.get_json()
    credential = data.get('credential') if data else None

    if not credential:
        return jsonify({"error": "No credential provided"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        return jsonify({"error": f"Invalid token: {str(e)}"}), 401

    google_id = idinfo.get('sub')
    email     = idinfo.get('email')
    name      = idinfo.get('name', 'User')
    avatar    = idinfo.get('picture', '')

    if not email:
        return jsonify({"error": "Email not provided by Google"}), 400

    user = User.query.filter_by(google_id=google_id).first()
    is_new_user = False

    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id
            user.avatar    = avatar or user.avatar
        else:
            user = User(
                google_id=google_id,
                name=name,
                email=email,
                avatar=avatar,
                is_new=True
            )
            db.session.add(user)
            is_new_user = True

    db.session.commit()

    has_recommendation = CareerRecommendation.query.filter_by(user_id=user.id).first() is not None
    
    # Get user progress
    progress = UserProgress.query.filter_by(user_id=user.id).first()
    progress_data = progress.to_dict() if progress else None

    return jsonify({
        "message":            "Login successful",
        "user":               user.to_dict(),
        "is_new_user":        is_new_user,
        "has_recommendation": has_recommendation,
        "progress":           progress_data
    }), 200


@app.route('/api/auth/google-token', methods=['POST'])
def google_token_auth():
    data        = request.get_json()
    user_info   = data.get('user_info', {}) if data else {}

    google_id   = user_info.get('sub')
    email       = user_info.get('email')
    name        = user_info.get('name', 'User')
    avatar      = user_info.get('picture', '')

    if not email or not google_id:
        return jsonify({"error": "Invalid user info from Google"}), 400

    user = User.query.filter_by(google_id=google_id).first()
    is_new_user = False

    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id
            user.avatar    = avatar or user.avatar
            if name and name != 'User':
                user.name = name
        else:
            user = User(google_id=google_id, name=name, email=email, avatar=avatar, is_new=True)
            db.session.add(user)
            is_new_user = True
    else:
        if avatar and not user.avatar:
            user.avatar = avatar
        if name and name != 'User' and user.name == 'User':
            user.name = name

    db.session.commit()

    has_recommendation = CareerRecommendation.query.filter_by(user_id=user.id).first() is not None
    
    # Get user progress
    progress = UserProgress.query.filter_by(user_id=user.id).first()
    progress_data = progress.to_dict() if progress else None

    return jsonify({
        "message":            "Login successful",
        "user":               user.to_dict(),
        "is_new_user":        is_new_user,
        "has_recommendation": has_recommendation,
        "progress":           progress_data
    }), 200


# ═══════════════════════════════════════════════════════════════════════════════
#  USER PROGRESS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route('/api/progress/<int:user_id>', methods=['GET'])
def get_progress(user_id):
    progress = UserProgress.query.filter_by(user_id=user_id).first()
    
    if not progress:
        return jsonify({"progress": None}), 200
    
    return jsonify({"progress": progress.to_dict()}), 200


@app.route('/api/progress/<int:user_id>', methods=['POST'])
def save_progress(user_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    progress = UserProgress.query.filter_by(user_id=user_id).first()
    
    if not progress:
        progress = UserProgress(user_id=user_id)
        db.session.add(progress)
    
    # Update fields if provided
    if 'completedModules' in data:
        progress.completed_modules = json.dumps(data['completedModules'])
    if 'completedQuizzes' in data:
        progress.completed_quizzes = json.dumps(data['completedQuizzes'])
    if 'quizXp' in data:
        progress.quiz_xp = data['quizXp']
    if 'dailyTarget' in data:
        progress.daily_target = json.dumps(data['dailyTarget'])
    if 'preferences' in data:
        progress.preferences = json.dumps(data['preferences'])
    if 'unlockedBadges' in data:
        progress.unlocked_badges = json.dumps(data['unlockedBadges'])
    if 'lastLoginDate' in data:
        progress.last_login_date = data['lastLoginDate']
    if 'stats' in data:
        progress.stats = json.dumps(data['stats'])
    if 'notifications' in data:
        progress.notifications = json.dumps(data['notifications'])
    
    progress.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({"message": "Progress saved successfully", "progress": progress.to_dict()}), 200


# ═══════════════════════════════════════════════════════════════════════════════
#  CAREER RECOMMENDATION ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route('/api/save-recommendation', methods=['POST'])
def save_recommendation():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    user_id       = data.get('user_id')
    top_career    = data.get('top_career')
    skills        = data.get('skills', [])
    interests     = data.get('interests', [])
    probabilities = data.get('probabilities', {})

    if not user_id or not top_career:
        return jsonify({"error": "user_id and top_career are required"}), 400

    existing = CareerRecommendation.query.filter_by(user_id=user_id).first()
    if existing:
        existing.top_career    = top_career
        existing.skills        = json.dumps(skills)
        existing.interests     = json.dumps(interests)
        existing.probabilities = json.dumps(probabilities)
        existing.updated_at    = datetime.utcnow()
    else:
        rec = CareerRecommendation(
            user_id       = user_id,
            top_career    = top_career,
            skills        = json.dumps(skills),
            interests     = json.dumps(interests),
            probabilities = json.dumps(probabilities)
        )
        db.session.add(rec)

    user = User.query.get(user_id)
    if user:
        user.is_new = False

    db.session.commit()

    return jsonify({"message": "Recommendation saved successfully"}), 200


@app.route('/api/recommendation/<int:user_id>', methods=['GET'])
def get_recommendation(user_id):
    rec = CareerRecommendation.query.filter_by(user_id=user_id).order_by(
        CareerRecommendation.updated_at.desc()
    ).first()

    if not rec:
        return jsonify({"recommendation": None}), 200

    return jsonify({"recommendation": rec.to_dict()}), 200


# ═══════════════════════════════════════════════════════════════════════════════
#  ADMIN & MATERI MANAGEMENT ENDPOINTS (NEW)
# ═══════════════════════════════════════════════════════════════════════════════

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Authenticate administrator."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Data login tidak diberikan"}), 400

    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return jsonify({
            "message": "Login admin berhasil",
            "success": True,
            "admin": {
                "username": username,
                "role": "admin"
            }
        }), 200

    return jsonify({"error": "Username atau password admin salah"}), 401


@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    """Returns analytics overview for admin dashboard."""
    total_subjects = Subject.query.count()
    total_materi   = Materi.query.count()
    total_users    = User.query.count()
    total_recs     = CareerRecommendation.query.count()

    return jsonify({
        "totalSubjects": total_subjects,
        "totalMateri":   total_materi,
        "totalUsers":    total_users,
        "totalRecommendations": total_recs
    }), 200


@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """List all subjects with their modules/materi ordered."""
    subjects = Subject.query.order_by(Subject.order.asc(), Subject.id.asc()).all()
    return jsonify({"subjects": [s.to_dict(include_modules=True) for s in subjects]}), 200


@app.route('/api/subjects', methods=['POST'])
def create_subject():
    """Create a new subject / category."""
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({"error": "Judul kategori wajib diisi"}), 400

    subject = Subject(
        title    = data.get('title').strip(),
        icon     = data.get('icon', 'BookOpen'),
        color    = data.get('color', 'text-blue-600'),
        bg_color = data.get('bgColor', 'bg-blue-50'),
        order    = int(data.get('order', 0))
    )
    db.session.add(subject)
    db.session.commit()

    return jsonify({"message": "Kategori berhasil dibuat", "subject": subject.to_dict()}), 201


@app.route('/api/subjects/<int:subject_id>', methods=['PUT'])
def update_subject(subject_id):
    """Update an existing subject."""
    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({"error": "Kategori tidak ditemukan"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if 'title' in data and data['title']:
        subject.title = data['title'].strip()
    if 'icon' in data:
        subject.icon = data['icon']
    if 'color' in data:
        subject.color = data['color']
    if 'bgColor' in data:
        subject.bg_color = data['bgColor']
    if 'order' in data:
        subject.order = int(data['order'])

    db.session.commit()
    return jsonify({"message": "Kategori berhasil diperbarui", "subject": subject.to_dict()}), 200


@app.route('/api/subjects/<int:subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    """Delete a subject and all associated modules."""
    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({"error": "Kategori tidak ditemukan"}), 404

    db.session.delete(subject)
    db.session.commit()
    return jsonify({"message": "Kategori dan seluruh materi di dalamnya berhasil dihapus"}), 200


@app.route('/api/materi', methods=['GET'])
def get_all_materi():
    """List all materi with optional filtering by subject_id."""
    subject_id = request.args.get('subject_id')
    query = Materi.query

    if subject_id:
        query = query.filter_by(subject_id=subject_id)

    materi_list = query.order_by(Materi.subject_id.asc(), Materi.order.asc(), Materi.id.asc()).all()
    return jsonify({"materi": [m.to_dict() for m in materi_list]}), 200


@app.route('/api/materi/<int:materi_id>', methods=['GET'])
def get_materi_detail(materi_id):
    """Get single materi details."""
    materi = Materi.query.get(materi_id)
    if not materi:
        return jsonify({"error": "Materi tidak ditemukan"}), 404

    return jsonify({"materi": materi.to_dict()}), 200


@app.route('/api/materi', methods=['POST'])
def create_materi():
    """Create a new materi/modul."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    title = data.get('title')
    subject_id = data.get('subjectId')

    if not title or not subject_id:
        return jsonify({"error": "Judul materi dan Kategori wajib diisi"}), 400

    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({"error": "Kategori tidak ditemukan"}), 404

    materi = Materi(
        subject_id  = subject_id,
        title       = title.strip(),
        description = data.get('description', ''),
        duration    = data.get('duration', '15:00'),
        type        = data.get('type', 'Video'),
        video_url   = data.get('videoUrl', ''),
        content     = data.get('content', ''),
        xp_reward   = int(data.get('xpReward', 50)),
        is_locked   = bool(data.get('isLocked', False)),
        order       = int(data.get('order', 0))
    )
    db.session.add(materi)
    db.session.commit()

    return jsonify({"message": "Materi berhasil ditambahkan", "materi": materi.to_dict()}), 201


@app.route('/api/materi/<int:materi_id>', methods=['PUT'])
def update_materi(materi_id):
    """Update an existing materi."""
    materi = Materi.query.get(materi_id)
    if not materi:
        return jsonify({"error": "Materi tidak ditemukan"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if 'subjectId' in data and data['subjectId']:
        subject = Subject.query.get(data['subjectId'])
        if not subject:
            return jsonify({"error": "Kategori baru tidak ditemukan"}), 404
        materi.subject_id = data['subjectId']

    if 'title' in data and data['title']:
        materi.title = data['title'].strip()
    if 'description' in data:
        materi.description = data['description']
    if 'duration' in data:
        materi.duration = data['duration']
    if 'type' in data:
        materi.type = data['type']
    if 'videoUrl' in data:
        materi.video_url = data['videoUrl']
    if 'content' in data:
        materi.content = data['content']
    if 'xpReward' in data:
        materi.xp_reward = int(data['xpReward'])
    if 'isLocked' in data:
        materi.is_locked = bool(data['isLocked'])
    if 'order' in data:
        materi.order = int(data['order'])

    materi.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Materi berhasil diperbarui", "materi": materi.to_dict()}), 200


@app.route('/api/materi/<int:materi_id>', methods=['DELETE'])
def delete_materi(materi_id):
    """Delete a materi."""
    materi = Materi.query.get(materi_id)
    if not materi:
        return jsonify({"error": "Materi tidak ditemukan"}), 404

    db.session.delete(materi)
    db.session.commit()

    return jsonify({"message": "Materi berhasil dihapus"}), 200


# ═══════════════════════════════════════════════════════════════════════════════
#  ML ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route('/api/skills', methods=['GET'])
def get_skills():
    return jsonify({"skills": skills_clean})


@app.route('/api/interests', methods=['GET'])
def get_interests():
    return jsonify({"interests": interests_clean})


@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400

        selected_skills    = data.get('skills', [])
        selected_interests = data.get('interests', [])

        if len(selected_skills) + len(selected_interests) < 3:
            return jsonify({"error": "Please select at least 3 skills and interests combined."}), 400

        if model is None or not feature_columns:
            return jsonify({"error": "Model not loaded properly."}), 500

        input_array = np.zeros(118)

        for skill in selected_skills:
            col_name = f"Skills_{skill}"
            if col_name in feature_columns:
                idx = feature_columns.index(col_name)
                if idx < 118:
                    input_array[idx] = 1

        for interest in selected_interests:
            col_name = f"Interests_{interest}"
            if col_name in feature_columns:
                idx = feature_columns.index(col_name)
                if idx < 118:
                    input_array[idx] = 1

        prediction    = model.predict([input_array])[0]
        probabilities = model.predict_proba([input_array])[0]
        classes       = model.classes_

        prob_dict  = {classes[i]: float(probabilities[i]) for i in range(len(classes))}
        all_results = [
            {"career": classes[i], "probability": float(probabilities[i])}
            for i in range(len(classes))
        ]
        all_results.sort(key=lambda x: x["probability"], reverse=True)

        return jsonify({
            "prediction":  str(prediction),
            "probabilities": prob_dict,
            "all_results": all_results
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=PORT)
