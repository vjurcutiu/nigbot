import json
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app, db
from db.company_models import Company
from db.candidate_models import CandidateProfile
from datetime import date, datetime

def serialize_date(d):
    if isinstance(d, (date, datetime)):
        return d.isoformat()
    return d

def serialize_company(company: Company) -> dict:
    return {
        "id": company.id,
        "user_id": company.user_id,
        "name": company.name,
        "bio": company.bio,
        "profile_picture": company.profile_picture,
        "website": company.website,
        "industry": company.industry,
        "size": company.size,
        "founded_date": serialize_date(company.founded_date),
        "address": company.address,
        "city": company.city,
        "country": company.country,
        "latitude": company.latitude,
        "longitude": company.longitude,
        "contact_email": company.contact_email,
        "contact_phone": company.contact_phone,
        "created_at": serialize_date(company.created_at),
        "updated_at": serialize_date(company.updated_at),
    }

def serialize_candidate(candidate: CandidateProfile) -> dict:
    return {
        "id": candidate.id,
        "user_id": candidate.user_id,
        "full_name": candidate.full_name,
        "email": candidate.email,
        "phone": candidate.phone,
        "city": candidate.city,
        "country": candidate.country,
        "profile_picture": candidate.profile_picture,
        "summary": candidate.summary,
        "created_at": serialize_date(getattr(candidate, 'created_at', None)),
        "updated_at": serialize_date(getattr(candidate, 'updated_at', None)),
    }

def main():
    with app.app_context():
        companies = Company.query.all()
        candidates = CandidateProfile.query.all()

        companies_data = [serialize_company(c) for c in companies]
        candidates_data = [serialize_candidate(c) for c in candidates]

        output = {
            "companies": companies_data,
            "candidates": candidates_data,
        }

        print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
