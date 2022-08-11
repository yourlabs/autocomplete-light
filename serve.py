import os
import urllib

from wsgiref.util import setup_testing_defaults
from wsgiref.simple_server import make_server


choices = ['aaa', 'aab', 'abb', 'bbb']


def choices_get(environ):
    data = urllib.parse.parse_qs(environ['QUERY_STRING'])
    q = data.get('q', '')
    if q:
        q = q[0]
    selected = data.get('_', [])
    html = '\n'.join([
        f'<div data-value="{i}">{choice}</div>'
        for i, choice in enumerate(choices)
        if choice.startswith(q)
        and str(i) not in selected
    ])
    if not html:
        html = '<div>No result found</div>'
    return html, 'text/html'


def static(environ):
    ctype = 'text/html'
    if len(environ['PATH_INFO']) > 1:
        path = environ['PATH_INFO'][1:]
        if path.endswith('.css'):
            ctype = 'text/css'
        elif path.endswith('.js'):
            ctype = 'text/javascript'
    else:
        path = 'index.html'
    if os.path.exists(path):
        with open(path, 'r') as f:
            html = f.read()
    else:
        html = f'{path} not found'
    return html, ctype


def application(environ, start_response):
    setup_testing_defaults(environ)
    if environ['QUERY_STRING']:
        html, ctype = choices_get(environ)
    else:
        html, ctype = static(environ)
    body = html.encode('utf8')
    status = '200 OK'
    headers = [('Content-type', ctype)]
    start_response(status, headers)
    return [body]


with make_server('', 8000, application) as httpd:
    print("Serving on port 8000...")
    httpd.serve_forever()
