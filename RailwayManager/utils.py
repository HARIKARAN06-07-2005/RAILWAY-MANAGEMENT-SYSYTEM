import random
import string
from datetime import datetime
from functools import wraps
from flask import redirect, url_for, flash
from flask_login import current_user

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin:
            flash('You need to be an admin to access this page.', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

def format_date(date_obj):
    """Format a date object to a string"""
    if isinstance(date_obj, str):
        try:
            date_obj = datetime.strptime(date_obj, '%Y-%m-%d').date()
        except ValueError:
            return date_obj
    
    if date_obj:
        return date_obj.strftime('%d %b, %Y')
    return ''

def format_time(time_obj):
    """Format a time object to a string"""
    if isinstance(time_obj, str):
        try:
            time_obj = datetime.strptime(time_obj, '%H:%M:%S').time()
        except ValueError:
            try:
                time_obj = datetime.strptime(time_obj, '%H:%M').time()
            except ValueError:
                return time_obj
    
    if hasattr(time_obj, 'strftime'):
        return time_obj.strftime('%H:%M')
    return ''

def generate_pnr():
    """Generate a unique 10-character PNR number"""
    # Generate a random 10-character string of uppercase letters and digits
    pnr = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    return pnr
