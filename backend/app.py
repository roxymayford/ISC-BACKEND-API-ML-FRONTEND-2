# ─────────────────────────────────────────────────────────────────────────────
# BACKEND APP.PY - UPDATED WITH USER PROGRESS
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

# ─── Config ──────────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID = "244826909624-055j98h4rd5m8m9ruvami0invr46muof.apps.googleusercontent.com"

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# SQLite database stored alongside app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
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
            "google_id":  self.google_id,
            "created_at": self.created_at.isoformat(),
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
            "created_at":    self.created_at.isoformat(),
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


# ─── Create tables on startup ─────────────────────────────────────────────────
with app.app_context():
    db.create_all()

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
        else:
            user = User(google_id=google_id, name=name, email=email, avatar=avatar, is_new=True)
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


# ═══════════════════════════════════════════════════════════════════════════════
#  USER PROGRESS ENDPOINTS (NEW)
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
    app.run(debug=True, port=5000)
