import os

from wsgiref.util import setup_testing_defaults
from wsgiref.simple_server import make_server


choices = ['aaa', 'aab', 'abb', 'bbb']


def application(environ, start_response):
    setup_testing_defaults(environ)
    ctype = 'text/html'
    if 'q=' in environ['QUERY_STRING']:
        q = environ['QUERY_STRING'].replace('q=', '')
        html = '\n'.join([
            f'<div data-value="{i}">{choice}</div>'
            for i, choice in enumerate(choices)
            if choice.startswith(q)
        ])
        if not html:
            html = '<div>No result found</div>'
    else:
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
    body = html.encode('utf8')
    status = '200 OK'
    headers = [('Content-type', ctype)]
    start_response(status, headers)
    return [body]


with make_server('', 8000, application) as httpd:
    print("Serving on port 8000...")
    httpd.serve_forever()
