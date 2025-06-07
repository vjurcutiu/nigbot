from tests.test_api_routes import signup_client, signup_candidate, login


def test_client_dashboard_and_company_endpoints(client):
    signup_client(client, 'comp')
    login(client, 'comp')
    # login again to get company id
    comp_id = client.post('/api/auth/login', json={'username':'comp','password':'pass'},
                          environ_base={'wsgi.url_scheme':'https','REMOTE_ADDR':'comp'}).get_json()['company_id']

    # dashboard should return company data
    resp = client.get('/api/client/', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code in (200, 404)
    if resp.status_code == 200:
        assert resp.get_json()['company']['id'] == comp_id

    # get specific company info
    resp = client.get(f'/api/client/{comp_id}', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    assert resp.get_json()['id'] == comp_id

    # update company
    resp = client.patch(f'/api/client/{comp_id}', json={'name': 'NewName', 'bio': '<b>bold</b>'},
                        environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    assert resp.get_json()['name'] == 'NewName'
    assert resp.get_json()['bio'] == '<b>bold</b>'

