import os
import json
import requests
from http.server import HTTPServer, SimpleHTTPRequestHandler, BaseHTTPRequestHandler

host = "localhost"
port = 8000

class CustomHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/news':
            self.handle_news_api()
        else:
            SimpleHTTPRequestHandler.do_GET(self)

    def handle_news_api(self):
        try:
            response = requests.get('https://www.tagesschau.de/api2u/homepage/')
            print(response) 
            if response.status_code == 200:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response.json()).encode('utf-8'))
            else:
                self.send_error(500, 'Failed to fetch news')

        except Exception as e:
            print(f"Error fetching news: {e}")
            self.send_error(500, 'Internal server error')

script_dir = os.path.dirname(os.path.abspath(__file__))
public_dir = os.path.join(script_dir, 'public')
os.chdir(public_dir)

handler = CustomHandler
server = HTTPServer((host, port), handler)

print(f"Server started at http://{host}:{port}")
print(f"Serving files from: {public_dir}")
print("API endpoint available at: /api/news")
print("Press Ctrl+C to stop the server")

try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped")
    server.server_close()
