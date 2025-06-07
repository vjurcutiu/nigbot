import argparse
import json
import requests
from faker import Faker
import random

"""
Standalone script to generate fake clients and candidates JSON and post to the Flask add_items endpoint.
Usage:
    python generate_data.py --host http://localhost:5000 --clients 10 --candidates 20
"""

def generate_clients(n, fake):
    clients = []
    for _ in range(n):
        username = fake.user_name() + str(random.randint(1,9999))
        password = fake.password(length=10)
        company = {
            'name': fake.company(),
            'bio': fake.catch_phrase(),
            'profile_picture': fake.image_url(),
            'website': fake.url(),
            'industry': random.choice(['Technology', 'Finance', 'Healthcare', 'Education', 'Retail']),
            'size': random.choice(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
            'founded_date': fake.date_between(start_date='-50y', end_date='today').isoformat(),
            'address': fake.street_address(),
            'city': fake.city(),
            'country': fake.country(),
            'latitude': float(fake.latitude()),
            'longitude': float(fake.longitude()),
            'contact_email': fake.company_email(),
            'contact_phone': fake.phone_number()
        }
        clients.append({
            'username': username,
            'password': password,
            'company': company
        })
    return clients

def generate_candidates(n, fake):
    candidates = []
    for _ in range(n):
        username = fake.user_name() + str(random.randint(1,9999))
        password = fake.password(length=10)
        profile = {
            'full_name': fake.name(),
            'email': fake.email(),
            'phone': fake.phone_number(),
            'city': fake.city(),
            'country': fake.country(),
            'profile_picture': fake.image_url(),
            'summary': fake.text(max_nb_chars=200)
        }
        candidates.append({
            'username': username,
            'password': password,
            'profile': profile
        })
    return candidates

def main():
    parser = argparse.ArgumentParser(description='Generate fake data and post to Flask add_items endpoint')
    parser.add_argument('--host', type=str, default='http://localhost:5000', help='Base URL of the Flask app')
    parser.add_argument('--clients', type=int, default=0, help='Number of client accounts to generate')
    parser.add_argument('--candidates', type=int, default=0, help='Number of candidate accounts to generate')
    args = parser.parse_args()

    fake = Faker()

    payload = {
        'clients': generate_clients(args.clients, fake),
        'candidates': generate_candidates(args.candidates, fake)
    }

    url = f"{args.host}/extra/add_items"
    headers = {'Content-Type': 'application/json'}

    print(f"Posting {args.clients} clients and {args.candidates} candidates to {url}")
    resp = requests.post(url, headers=headers, data=json.dumps(payload))
    try:
        resp_json = resp.json()
    except ValueError:
        print(f"Invalid JSON response: {resp.text}")
        return
    if resp.status_code == 201:
        print("Success:", json.dumps(resp_json, indent=2))
    else:
        print(f"Error ({resp.status_code}): {resp_json}")

if __name__ == '__main__':
    main()