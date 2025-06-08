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


def test_client_debug_endpoints_and_patch(client, app):
    signup_client(client, 'dbg')
    login(client, 'dbg')
    comp_id = client.post('/api/auth/login', json={'username':'dbg','password':'pass'},
                          environ_base={'wsgi.url_scheme':'https','REMOTE_ADDR':'dbg'}).get_json()['company_id']
    # debug add company should report already exists
    resp = client.post('/api/client/debug/add_test_company', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data.get('company_id') == comp_id
    # list companies
    resp = client.get('/api/client/debug/companies', environ_base={'wsgi.url_scheme':'https'})
    assert any(c['id']==comp_id for c in resp.get_json()['companies'])
    # patch sanitization
    resp = client.patch(f'/api/client/{comp_id}', json={'bio': '<b>x</b><script>'}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    assert resp.get_json()['bio'] == '<b>x</b>'
    # unauthorized patch
    signup_client(client, 'other')
    login(client, 'other')
    resp = client.patch(f'/api/client/{comp_id}', json={'name':'Bad'}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 403


def test_update_company_validation_error(client):
    signup_client(client, 'vali')
    login(client, 'vali')
    comp_id = client.post('/api/auth/login', json={'username':'vali','password':'pass'},
                          environ_base={'wsgi.url_scheme':'https','REMOTE_ADDR':'vali'}).get_json()['company_id']
    resp = client.patch(f'/api/client/{comp_id}', json={'latitude': 'bad'}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 400

