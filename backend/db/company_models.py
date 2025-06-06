 # backend/db/company_models.py

from db.models import db
from datetime import date

class Company(db.Model):
    __tablename__ = 'companies'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Basic info
    name = db.Column(db.String(150), nullable=False, unique=True)
    bio = db.Column(db.Text, nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)  # URL or file path
    website = db.Column(db.String(255), nullable=True)
    industry = db.Column(db.String(100), nullable=True)
    size = db.Column(db.String(50), nullable=True)  # e.g., '1-10', '11-50', '51-200'
    founded_date = db.Column(db.Date, nullable=True)
    
    # Location
    address = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    # Contact
    contact_email = db.Column(db.String(120), nullable=True)
    contact_phone = db.Column(db.String(20), nullable=True)

    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now(), onupdate=db.func.now())

    # Relationships
    owner = db.relationship('User')
    job_positions = db.relationship('JobPosition', cascade='all, delete-orphan', overlaps="company")

    def __repr__(self):
        return f"<Company {self.name}>"
