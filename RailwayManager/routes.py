import random
import string
from datetime import datetime, timedelta
from flask import render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from sqlalchemy import or_, and_, func

from app import app, db
from models import User, Train, Station, Schedule, Ticket
from utils import admin_required, format_date, format_time, generate_pnr

# Basic Routes
@app.route('/')
def index():
    upcoming_schedules = Schedule.query.filter(
        Schedule.departure_time > datetime.utcnow()
    ).order_by(Schedule.departure_time).limit(5).all()
    
    stations = Station.query.order_by(Station.name).all()
    
    return render_template('index.html', 
                          upcoming_schedules=upcoming_schedules, 
                          stations=stations,
                          format_date=format_date,
                          format_time=format_time)

# Authentication Routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user, remember=True)
            next_page = request.args.get('next')
            flash('Logged in successfully!', 'success')
            return redirect(next_page or url_for('index'))
        else:
            flash('Login failed. Please check your username and password.', 'danger')
            
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        full_name = request.form.get('full_name')
        phone = request.form.get('phone')
        
        # Check if username or email already exists
        existing_user = User.query.filter(
            or_(User.username == username, User.email == email)
        ).first()
        
        if existing_user:
            flash('Username or email already exists!', 'danger')
            return redirect(url_for('register'))
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            full_name=full_name,
            phone=phone
        )
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))
        
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

# Schedule Routes
@app.route('/schedule')
def schedule():
    from_station = request.args.get('from')
    to_station = request.args.get('to')
    date_str = request.args.get('date')
    
    schedules = []
    stations = Station.query.order_by(Station.name).all()
    
    if from_station and to_station and date_str:
        try:
            travel_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            
            # Get the start and end of the selected date
            start_date = datetime.combine(travel_date, datetime.min.time())
            end_date = datetime.combine(travel_date, datetime.max.time())
            
            # Query schedules for the selected route and date
            schedules = Schedule.query.join(
                Train, Schedule.train_id == Train.id
            ).filter(
                Schedule.departure_station_id == from_station,
                Schedule.arrival_station_id == to_station,
                Schedule.departure_time >= start_date,
                Schedule.departure_time <= end_date,
                Train.active == True,
                Schedule.available_seats > 0
            ).order_by(Schedule.departure_time).all()
            
        except ValueError:
            flash('Invalid date format', 'danger')
    
    return render_template('schedule.html', 
                          schedules=schedules, 
                          stations=stations,
                          from_station=from_station,
                          to_station=to_station,
                          date=date_str,
                          format_date=format_date,
                          format_time=format_time)

# Booking Routes
@app.route('/booking/<int:schedule_id>', methods=['GET', 'POST'])
@login_required
def booking(schedule_id):
    schedule = Schedule.query.get_or_404(schedule_id)
    
    if request.method == 'POST':
        passenger_name = request.form.get('passenger_name')
        passenger_age = request.form.get('passenger_age')
        passenger_gender = request.form.get('passenger_gender')
        journey_date_str = request.form.get('journey_date')
        
        try:
            passenger_age = int(passenger_age)
            journey_date = datetime.strptime(journey_date_str, '%Y-%m-%d').date()
            
            # Check if there are available seats
            if schedule.available_seats <= 0:
                flash('No seats available for this schedule.', 'danger')
                return redirect(url_for('schedule'))
            
            # Generate seat number and coach
            coach = chr(65 + random.randint(0, min(5, schedule.train.coach_count - 1)))
            seat_number = str(random.randint(1, 72))
            
            # Create ticket
            new_ticket = Ticket(
                pnr=generate_pnr(),
                user_id=current_user.id,
                schedule_id=schedule.id,
                seat_number=seat_number,
                coach=coach,
                journey_date=journey_date,
                fare=schedule.price,
                passenger_name=passenger_name,
                passenger_age=passenger_age,
                passenger_gender=passenger_gender
            )
            
            # Update available seats
            schedule.available_seats -= 1
            
            db.session.add(new_ticket)
            db.session.commit()
            
            flash(f'Ticket booked successfully! Your PNR is {new_ticket.pnr}', 'success')
            return redirect(url_for('profile'))
            
        except ValueError:
            flash('Invalid data provided', 'danger')
            
    return render_template('booking.html', 
                          schedule=schedule, 
                          format_date=format_date,
                          format_time=format_time)

# Station Routes
@app.route('/stations')
def stations():
    stations = Station.query.order_by(Station.name).all()
    return render_template('stations.html', stations=stations)

# Train Status Routes
@app.route('/status', methods=['GET', 'POST'])
def status():
    if request.method == 'POST':
        pnr = request.form.get('pnr')
        ticket = Ticket.query.filter_by(pnr=pnr).first()
        
        if ticket:
            return render_template('status.html', ticket=ticket, format_date=format_date, format_time=format_time)
        else:
            flash('Invalid PNR number', 'danger')
    
    return render_template('status.html', ticket=None)

# User Profile Routes
@app.route('/profile')
@login_required
def profile():
    tickets = Ticket.query.filter_by(user_id=current_user.id).order_by(Ticket.booking_time.desc()).all()
    return render_template('profile.html', 
                          user=current_user, 
                          tickets=tickets, 
                          format_date=format_date,
                          format_time=format_time)

# Admin Routes
@app.route('/admin/dashboard')
@login_required
@admin_required
def admin_dashboard():
    # Count various statistics for the dashboard
    train_count = Train.query.count()
    station_count = Station.query.count()
    schedule_count = Schedule.query.count()
    user_count = User.query.count()
    ticket_count = Ticket.query.count()
    
    # Upcoming schedules within the next 24 hours
    upcoming_schedules = Schedule.query.filter(
        Schedule.departure_time > datetime.utcnow(),
        Schedule.departure_time < datetime.utcnow() + timedelta(days=1)
    ).order_by(Schedule.departure_time).limit(5).all()
    
    # Recently booked tickets
    recent_tickets = Ticket.query.order_by(Ticket.booking_time.desc()).limit(5).all()
    
    return render_template('admin/dashboard.html', 
                          train_count=train_count,
                          station_count=station_count,
                          schedule_count=schedule_count,
                          user_count=user_count,
                          ticket_count=ticket_count,
                          upcoming_schedules=upcoming_schedules,
                          recent_tickets=recent_tickets,
                          format_date=format_date,
                          format_time=format_time)

@app.route('/admin/trains', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_trains():
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'add':
            name = request.form.get('name')
            train_number = request.form.get('train_number')
            total_seats = request.form.get('total_seats')
            coach_count = request.form.get('coach_count')
            amenities = request.form.get('amenities')
            
            # Validate input
            try:
                total_seats = int(total_seats)
                coach_count = int(coach_count)
                
                # Check if train number already exists
                existing_train = Train.query.filter_by(train_number=train_number).first()
                if existing_train:
                    flash('Train number already exists!', 'danger')
                    return redirect(url_for('admin_trains'))
                
                # Create new train
                new_train = Train(
                    name=name,
                    train_number=train_number,
                    total_seats=total_seats,
                    coach_count=coach_count,
                    amenities=amenities,
                    active=True
                )
                
                db.session.add(new_train)
                db.session.commit()
                
                flash('Train added successfully!', 'success')
            except ValueError:
                flash('Invalid input provided', 'danger')
                
        elif action == 'edit':
            train_id = request.form.get('train_id')
            train = Train.query.get_or_404(train_id)
            
            train.name = request.form.get('name')
            train.train_number = request.form.get('train_number')
            train.total_seats = int(request.form.get('total_seats'))
            train.coach_count = int(request.form.get('coach_count'))
            train.amenities = request.form.get('amenities')
            train.active = 'active' in request.form
            
            db.session.commit()
            flash('Train updated successfully!', 'success')
            
        elif action == 'delete':
            train_id = request.form.get('train_id')
            train = Train.query.get_or_404(train_id)
            
            # Check if there are any schedules using this train
            schedules = Schedule.query.filter_by(train_id=train.id).count()
            if schedules > 0:
                flash('Cannot delete train with existing schedules. Deactivate it instead.', 'danger')
            else:
                db.session.delete(train)
                db.session.commit()
                flash('Train deleted successfully!', 'success')
    
    trains = Train.query.order_by(Train.name).all()
    return render_template('admin/trains.html', trains=trains)

@app.route('/admin/stations', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_stations():
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'add':
            name = request.form.get('name')
            code = request.form.get('code').upper()
            city = request.form.get('city')
            state = request.form.get('state')
            address = request.form.get('address')
            platforms = request.form.get('platforms')
            facilities = request.form.get('facilities')
            
            # Validate input
            try:
                platforms = int(platforms)
                
                # Check if station code already exists
                existing_station = Station.query.filter_by(code=code).first()
                if existing_station:
                    flash('Station code already exists!', 'danger')
                    return redirect(url_for('admin_stations'))
                
                # Create new station
                new_station = Station(
                    name=name,
                    code=code,
                    city=city,
                    state=state,
                    address=address,
                    platforms=platforms,
                    facilities=facilities
                )
                
                db.session.add(new_station)
                db.session.commit()
                
                flash('Station added successfully!', 'success')
            except ValueError:
                flash('Invalid input provided', 'danger')
                
        elif action == 'edit':
            station_id = request.form.get('station_id')
            station = Station.query.get_or_404(station_id)
            
            station.name = request.form.get('name')
            station.code = request.form.get('code').upper()
            station.city = request.form.get('city')
            station.state = request.form.get('state')
            station.address = request.form.get('address')
            station.platforms = int(request.form.get('platforms'))
            station.facilities = request.form.get('facilities')
            
            db.session.commit()
            flash('Station updated successfully!', 'success')
            
        elif action == 'delete':
            station_id = request.form.get('station_id')
            station = Station.query.get_or_404(station_id)
            
            # Check if there are any schedules using this station
            departure_schedules = Schedule.query.filter_by(departure_station_id=station.id).count()
            arrival_schedules = Schedule.query.filter_by(arrival_station_id=station.id).count()
            
            if departure_schedules > 0 or arrival_schedules > 0:
                flash('Cannot delete station with existing schedules.', 'danger')
            else:
                db.session.delete(station)
                db.session.commit()
                flash('Station deleted successfully!', 'success')
    
    stations = Station.query.order_by(Station.name).all()
    return render_template('admin/stations.html', stations=stations)

@app.route('/admin/schedules', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_schedules():
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'add':
            train_id = request.form.get('train_id')
            departure_station_id = request.form.get('departure_station_id')
            arrival_station_id = request.form.get('arrival_station_id')
            departure_time_str = request.form.get('departure_time')
            arrival_time_str = request.form.get('arrival_time')
            distance = request.form.get('distance')
            price = request.form.get('price')
            available_seats = request.form.get('available_seats')
            platform = request.form.get('platform')
            
            # Validate input
            try:
                departure_time = datetime.strptime(departure_time_str, '%Y-%m-%dT%H:%M')
                arrival_time = datetime.strptime(arrival_time_str, '%Y-%m-%dT%H:%M')
                distance = int(distance)
                price = float(price)
                available_seats = int(available_seats)
                
                if departure_station_id == arrival_station_id:
                    flash('Departure and arrival stations cannot be the same!', 'danger')
                    return redirect(url_for('admin_schedules'))
                
                if departure_time >= arrival_time:
                    flash('Departure time must be before arrival time!', 'danger')
                    return redirect(url_for('admin_schedules'))
                
                # Create new schedule
                new_schedule = Schedule(
                    train_id=train_id,
                    departure_station_id=departure_station_id,
                    arrival_station_id=arrival_station_id,
                    departure_time=departure_time,
                    arrival_time=arrival_time,
                    distance=distance,
                    price=price,
                    available_seats=available_seats,
                    platform=platform,
                    status='On Time',
                    delay_minutes=0
                )
                
                db.session.add(new_schedule)
                db.session.commit()
                
                flash('Schedule added successfully!', 'success')
            except ValueError:
                flash('Invalid input provided', 'danger')
                
        elif action == 'edit':
            schedule_id = request.form.get('schedule_id')
            schedule = Schedule.query.get_or_404(schedule_id)
            
            schedule.train_id = request.form.get('train_id')
            schedule.departure_station_id = request.form.get('departure_station_id')
            schedule.arrival_station_id = request.form.get('arrival_station_id')
            schedule.departure_time = datetime.strptime(request.form.get('departure_time'), '%Y-%m-%dT%H:%M')
            schedule.arrival_time = datetime.strptime(request.form.get('arrival_time'), '%Y-%m-%dT%H:%M')
            schedule.distance = int(request.form.get('distance'))
            schedule.price = float(request.form.get('price'))
            schedule.available_seats = int(request.form.get('available_seats'))
            schedule.platform = request.form.get('platform')
            schedule.status = request.form.get('status')
            schedule.delay_minutes = int(request.form.get('delay_minutes', 0))
            
            db.session.commit()
            flash('Schedule updated successfully!', 'success')
            
        elif action == 'delete':
            schedule_id = request.form.get('schedule_id')
            schedule = Schedule.query.get_or_404(schedule_id)
            
            # Check if there are any tickets for this schedule
            tickets = Ticket.query.filter_by(schedule_id=schedule.id).count()
            
            if tickets > 0:
                flash('Cannot delete schedule with existing tickets.', 'danger')
            else:
                db.session.delete(schedule)
                db.session.commit()
                flash('Schedule deleted successfully!', 'success')
    
    schedules = Schedule.query.order_by(Schedule.departure_time).all()
    trains = Train.query.filter_by(active=True).order_by(Train.name).all()
    stations = Station.query.order_by(Station.name).all()
    
    return render_template('admin/schedules.html', 
                          schedules=schedules, 
                          trains=trains, 
                          stations=stations,
                          format_date=format_date,
                          format_time=format_time)

@app.route('/admin/passengers')
@login_required
@admin_required
def admin_passengers():
    users = User.query.filter_by(is_admin=False).order_by(User.username).all()
    return render_template('admin/passengers.html', users=users)

@app.route('/admin/reports')
@login_required
@admin_required
def admin_reports():
    # Tickets sold in the last 7 days
    last_week = datetime.utcnow() - timedelta(days=7)
    tickets_last_week = Ticket.query.filter(Ticket.booking_time >= last_week).count()
    
    # Total revenue in the last 7 days
    revenue_last_week = db.session.query(func.sum(Ticket.fare)).filter(Ticket.booking_time >= last_week).scalar() or 0
    
    # Most popular routes (top 5)
    popular_routes = db.session.query(
        Station.name.label('departure_station'),
        Station.name.label('arrival_station'),
        func.count(Ticket.id).label('ticket_count')
    ).join(
        Schedule, Ticket.schedule_id == Schedule.id
    ).join(
        Station, Schedule.departure_station_id == Station.id
    ).join(
        Station, Schedule.arrival_station_id == Station.id,
        isouter=True
    ).group_by(
        Schedule.departure_station_id,
        Schedule.arrival_station_id
    ).order_by(
        func.count(Ticket.id).desc()
    ).limit(5).all()
    
    # Busiest trains (top 5)
    busiest_trains = db.session.query(
        Train.name,
        Train.train_number,
        func.count(Ticket.id).label('ticket_count')
    ).join(
        Schedule, Ticket.schedule_id == Schedule.id
    ).join(
        Train, Schedule.train_id == Train.id
    ).group_by(
        Train.id
    ).order_by(
        func.count(Ticket.id).desc()
    ).limit(5).all()
    
    return render_template('admin/reports.html',
                          tickets_last_week=tickets_last_week,
                          revenue_last_week=revenue_last_week,
                          popular_routes=popular_routes,
                          busiest_trains=busiest_trains)

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500
