from datetime import datetime
from flask_login import UserMixin
from app import db, login_manager
from werkzeug.security import generate_password_hash, check_password_hash

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    tickets = db.relationship('Ticket', backref='passenger', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Train(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    train_number = db.Column(db.String(20), unique=True, nullable=False)
    total_seats = db.Column(db.Integer, nullable=False)
    coach_count = db.Column(db.Integer, nullable=False)
    amenities = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)
    schedules = db.relationship('Schedule', backref='train', lazy=True)

class Station(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), unique=True, nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text, nullable=False)
    platforms = db.Column(db.Integer, default=1)
    facilities = db.Column(db.Text)
    departure_schedules = db.relationship('Schedule', foreign_keys='Schedule.departure_station_id', backref='departure_station', lazy=True)
    arrival_schedules = db.relationship('Schedule', foreign_keys='Schedule.arrival_station_id', backref='arrival_station', lazy=True)

class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    train_id = db.Column(db.Integer, db.ForeignKey('train.id'), nullable=False)
    departure_station_id = db.Column(db.Integer, db.ForeignKey('station.id'), nullable=False)
    arrival_station_id = db.Column(db.Integer, db.ForeignKey('station.id'), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    arrival_time = db.Column(db.DateTime, nullable=False)
    distance = db.Column(db.Integer, nullable=False)  # in kilometers
    price = db.Column(db.Float, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='On Time')  # On Time, Delayed, Cancelled
    delay_minutes = db.Column(db.Integer, default=0)
    platform = db.Column(db.String(10))
    tickets = db.relationship('Ticket', backref='schedule', lazy=True)

class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pnr = db.Column(db.String(10), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id'), nullable=False)
    seat_number = db.Column(db.String(10), nullable=False)
    coach = db.Column(db.String(10), nullable=False)
    booking_time = db.Column(db.DateTime, default=datetime.utcnow)
    journey_date = db.Column(db.Date, nullable=False)
    fare = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Confirmed')  # Confirmed, Cancelled, Waiting
    passenger_name = db.Column(db.String(100), nullable=False)
    passenger_age = db.Column(db.Integer, nullable=False)
    passenger_gender = db.Column(db.String(10), nullable=False)
