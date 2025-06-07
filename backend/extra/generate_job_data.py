import argparse
import json
import requests
from faker import Faker
import random
from datetime import datetime, timedelta

"""
Standalone script to generate fake job postings and applications JSON and post to the Flask job endpoints.
Usage:
    python generate_job_data.py --host http://localhost:5000 --jobs 10 --applications 20
"""

def generate_job_postings(n, fake, company_ids):
    jobs = []
    employment_types = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship']
    locations = ['New York', 'San Francisco', 'Remote', 'London', 'Berlin', 'Tokyo', 'Paris']
    for _ in range(n):
        company_id = random.choice(company_ids) if company_ids else None
        title = fake.job()
        description = fake.text(max_nb_chars=500)
        requirements = fake.text(max_nb_chars=300)
        location = random.choice(locations)
        employment_type = random.choice(employment_types)
        remote = random.choice([True, False])
        posted_at = datetime.utcnow()
        expires_at = posted_at + timedelta(days=random.randint(30, 90))
        jobs.append({
            'company_id': company_id,
            'title': title,
            'description': description,
            'requirements': requirements,
            'location': location,
            'employment_type': employment_type,
            'remote': remote,
            'posted_at': posted_at.isoformat(),
            'expires_at': expires_at.isoformat(),
        })
    return jobs

def generate_job_applications(n, fake, candidate_ids, job_ids):
    applications = []
    statuses = ['Applied', 'Interviewing', 'Rejected', 'Hired']
    for _ in range(n):
        candidate_id = random.choice(candidate_ids) if candidate_ids else None
        job_position_id = random.choice(job_ids) if job_ids else None
        status = random.choice(statuses)
        applied_at = datetime.utcnow() - timedelta(days=random.randint(0, 30))
        applications.append({
            'candidate_id': candidate_id,
            'job_position_id': job_position_id,
            'status': status,
            'applied_at': applied_at.isoformat(),
            'resume_path': None,
            'cover_letter_path': None,
        })
    return applications

def main():
    parser = argparse.ArgumentParser(description='Generate fake job postings and applications and post to Flask job endpoints')
    parser.add_argument('--host', type=str, default='http://localhost:5000', help='Base URL of the Flask app')
    parser.add_argument('--jobs', type=int, default=0, help='Number of job postings to generate')
    parser.add_argument('--applications', type=int, default=0, help='Number of job applications to generate')
    parser.add_argument('--company-ids', type=int, nargs='*', default=[], help='List of company IDs to assign jobs to')
    parser.add_argument('--candidate-ids', type=int, nargs='*', default=[], help='List of candidate IDs to assign applications to')
    args = parser.parse_args()

    fake = Faker()

    # Generate and post job postings
    job_postings = generate_job_postings(args.jobs, fake, args.company_ids)
    job_ids = []
    headers = {'Content-Type': 'application/json'}
    for job in job_postings:
        if job['company_id'] is None:
            print("Skipping job posting with no company_id")
            continue
        url = f"{args.host}/api/jobs"
        resp = requests.post(url, headers=headers, data=json.dumps(job))
        if resp.status_code == 201:
            job_data = resp.json()
            job_ids.append(job_data['id'])
            print(f"Created job: {job_data['title']} (ID: {job_data['id']})")
        else:
            print(f"Failed to create job: {resp.status_code} {resp.text}")

    # Generate and post job applications
    job_applications = generate_job_applications(args.applications, fake, args.candidate_ids, job_ids)
    for app in job_applications:
        if app['candidate_id'] is None or app['job_position_id'] is None:
            print("Skipping application with missing candidate_id or job_position_id")
            continue
        url = f"{args.host}/api/jobs/{app['job_position_id']}/apply"
        # Only send candidate_id, resume_path, cover_letter_path in payload as per route
        payload = {
            'candidate_id': app['candidate_id'],
            'resume_path': app.get('resume_path'),
            'cover_letter_path': app.get('cover_letter_path'),
        }
        resp = requests.post(url, headers=headers, data=json.dumps(payload))
        if resp.status_code == 201:
            app_data = resp.json()
            print(f"Created application for candidate {app_data['candidate_name']} to job ID {app_data['job_position_id']}")
        else:
            print(f"Failed to create application: {resp.status_code} {resp.text}")

if __name__ == '__main__':
    main()
