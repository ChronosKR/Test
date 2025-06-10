#!/usr/bin/env python3
"""
Ultimate Reverse API Engineering Tool
Educational tool for computer science students to learn API analysis
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import json
import re
import time
import urllib.parse
from datetime import datetime
import mimetypes
import base64
import hashlib
from collections import defaultdict
import threading
import queue

app = Flask(__name__)
CORS(app)

# Global storage for captured requests
captured_requests = []
request_queue = queue.Queue()

class APIAnalyzer:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'API-Reverse-Engineering-Tool/1.0'
        })
    
    def analyze_endpoint(self, url, method='GET', headers=None, data=None, params=None):
        """Analyze a single API endpoint"""
        try:
            headers = headers or {}
            start_time = time.time()
            
            # Make the request
            response = self.session.request(
                method=method.upper(),
                url=url,
                headers=headers,
                data=data,
                params=params,
                timeout=30,
                allow_redirects=True
            )
            
            end_time = time.time()
            response_time = round((end_time - start_time) * 1000, 2)
            
            # Analyze response
            analysis = {
                'url': url,
                'method': method.upper(),
                'status_code': response.status_code,
                'response_time_ms': response_time,
                'headers': dict(response.headers),
                'content_type': response.headers.get('content-type', ''),
                'content_length': len(response.content),
                'timestamp': datetime.now().isoformat(),
                'redirects': [r.url for r in response.history],
                'cookies': dict(response.cookies),
                'encoding': response.encoding,
                'apparent_encoding': response.apparent_encoding,
            }
            
            # Try to parse response content
            try:
                if 'application/json' in analysis['content_type']:
                    analysis['response_data'] = response.json()
                    analysis['data_type'] = 'json'
                elif 'text/' in analysis['content_type'] or 'application/xml' in analysis['content_type']:
                    analysis['response_data'] = response.text
                    analysis['data_type'] = 'text'
                else:
                    # Binary data - encode as base64 for storage
                    analysis['response_data'] = base64.b64encode(response.content).decode('utf-8')
                    analysis['data_type'] = 'binary'
            except Exception as e:
                analysis['response_data'] = f"Error parsing response: {str(e)}"
                analysis['data_type'] = 'error'
            
            # Security analysis
            analysis['security'] = self._analyze_security(response, headers)
            
            # API pattern detection
            analysis['patterns'] = self._detect_patterns(url, response)
            
            return analysis
            
        except requests.exceptions.RequestException as e:
            return {
                'url': url,
                'method': method.upper(),
                'error': str(e),
                'timestamp': datetime.now().isoformat(),
                'status': 'failed'
            }
    
    def _analyze_security(self, response, request_headers):
        """Analyze security aspects of the API"""
        security_info = {
            'https': response.url.startswith('https://'),
            'security_headers': {},
            'vulnerabilities': [],
            'authentication': 'none'
        }
        
        # Check security headers
        security_headers = [
            'strict-transport-security',
            'content-security-policy',
            'x-frame-options',
            'x-content-type-options',
            'x-xss-protection',
            'referrer-policy'
        ]
        
        for header in security_headers:
            if header in response.headers:
                security_info['security_headers'][header] = response.headers[header]
        
        # Check for authentication
        if 'authorization' in request_headers:
            if request_headers['authorization'].startswith('Bearer'):
                security_info['authentication'] = 'bearer_token'
            elif request_headers['authorization'].startswith('Basic'):
                security_info['authentication'] = 'basic_auth'
            else:
                security_info['authentication'] = 'custom'
        elif 'x-api-key' in request_headers:
            security_info['authentication'] = 'api_key'
        
        # Check for potential vulnerabilities
        if not security_info['https']:
            security_info['vulnerabilities'].append('Unencrypted HTTP connection')
        
        if 'x-frame-options' not in response.headers:
            security_info['vulnerabilities'].append('Missing X-Frame-Options header')
        
        if 'strict-transport-security' not in response.headers and security_info['https']:
            security_info['vulnerabilities'].append('Missing HSTS header')
        
        return security_info
    
    def _detect_patterns(self, url, response):
        """Detect common API patterns"""
        patterns = {
            'rest_api': False,
            'graphql': False,
            'soap': False,
            'rpc': False,
            'crud_operations': [],
            'versioning': None,
            'pagination': False,
            'rate_limiting': False
        }
        
        # REST API detection
        rest_indicators = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        if any(method in response.request.method for method in rest_indicators):
            patterns['rest_api'] = True
        
        # GraphQL detection
        if '/graphql' in url.lower() or 'query' in str(response.request.body):
            patterns['graphql'] = True
        
        # SOAP detection
        if 'soap' in response.headers.get('content-type', '').lower():
            patterns['soap'] = True
        
        # Version detection
        version_patterns = [
            r'/v(\d+)/',
            r'/api/(\d+)/',
            r'version=(\d+)',
            r'v=(\d+)'
        ]
        for pattern in version_patterns:
            match = re.search(pattern, url)
            if match:
                patterns['versioning'] = match.group(1)
                break
        
        # Rate limiting detection
        rate_limit_headers = ['x-ratelimit-limit', 'x-rate-limit-limit', 'rate-limit']
        if any(header in response.headers for header in rate_limit_headers):
            patterns['rate_limiting'] = True
        
        # Pagination detection
        pagination_indicators = ['page', 'offset', 'limit', 'next', 'prev']
        response_text = str(response.content).lower()
        if any(indicator in response_text for indicator in pagination_indicators):
            patterns['pagination'] = True
        
        return patterns

# Initialize analyzer
analyzer = APIAnalyzer()

@app.route('/')
def index():
    """Main interface"""
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_api():
    """Analyze an API endpoint"""
    data = request.get_json()
    
    url = data.get('url')
    method = data.get('method', 'GET')
    headers = data.get('headers', {})
    request_data = data.get('data')
    params = data.get('params', {})
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    # Parse headers from string format if needed
    if isinstance(headers, str):
        try:
            headers = json.loads(headers)
        except:
            # Parse simple key:value format
            headers_dict = {}
            for line in headers.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    headers_dict[key.strip()] = value.strip()
            headers = headers_dict
    
    # Parse request data
    if isinstance(request_data, str) and request_data.strip():
        try:
            request_data = json.loads(request_data)
        except:
            pass  # Keep as string if not valid JSON
    
    result = analyzer.analyze_endpoint(url, method, headers, request_data, params)
    
    # Store in captured requests
    captured_requests.append(result)
    
    return jsonify(result)

@app.route('/api/batch-analyze', methods=['POST'])
def batch_analyze():
    """Analyze multiple endpoints"""
    data = request.get_json()
    endpoints = data.get('endpoints', [])
    
    results = []
    for endpoint in endpoints:
        result = analyzer.analyze_endpoint(
            endpoint.get('url'),
            endpoint.get('method', 'GET'),
            endpoint.get('headers', {}),
            endpoint.get('data'),
            endpoint.get('params', {})
        )
        results.append(result)
        captured_requests.append(result)
    
    return jsonify({'results': results})

@app.route('/api/discover', methods=['POST'])
def discover_endpoints():
    """Discover API endpoints from a base URL"""
    data = request.get_json()
    base_url = data.get('url')
    
    if not base_url:
        return jsonify({'error': 'Base URL is required'}), 400
    
    discovered = []
    common_paths = [
        '/api', '/api/v1', '/api/v2', '/v1', '/v2',
        '/users', '/user', '/auth', '/login', '/logout',
        '/data', '/info', '/status', '/health', '/ping',
        '/docs', '/documentation', '/swagger', '/openapi.json',
        '/graphql', '/api/graphql'
    ]
    
    for path in common_paths:
        test_url = base_url.rstrip('/') + path
        try:
            response = requests.head(test_url, timeout=5)
            if response.status_code < 500:  # Found something
                discovered.append({
                    'url': test_url,
                    'status_code': response.status_code,
                    'content_type': response.headers.get('content-type', ''),
                    'method': 'HEAD'
                })
        except:
            continue
    
    return jsonify({'discovered': discovered})

@app.route('/api/captured')
def get_captured_requests():
    """Get all captured requests"""
    return jsonify({'requests': captured_requests})

@app.route('/api/clear-captured', methods=['POST'])
def clear_captured():
    """Clear captured requests"""
    global captured_requests
    captured_requests = []
    return jsonify({'status': 'cleared'})

@app.route('/api/export', methods=['POST'])
def export_data():
    """Export captured data in various formats"""
    data = request.get_json()
    format_type = data.get('format', 'json')
    
    if format_type == 'json':
        return jsonify({
            'data': captured_requests,
            'exported_at': datetime.now().isoformat(),
            'total_requests': len(captured_requests)
        })
    elif format_type == 'curl':
        curl_commands = []
        for req in captured_requests:
            if 'error' not in req:
                curl_cmd = f"curl -X {req['method']} '{req['url']}'"
                if req.get('headers'):
                    for key, value in req['headers'].items():
                        curl_cmd += f" -H '{key}: {value}'"
                curl_commands.append(curl_cmd)
        return jsonify({'curl_commands': curl_commands})
    
    return jsonify({'error': 'Unsupported format'}), 400

@app.route('/api/generate-docs', methods=['POST'])
def generate_docs():
    """Generate API documentation from captured requests"""
    if not captured_requests:
        return jsonify({'error': 'No captured requests to document'}), 400
    
    # Group by endpoint
    endpoints = defaultdict(list)
    for req in captured_requests:
        if 'error' not in req:
            key = f"{req['method']} {req['url']}"
            endpoints[key].append(req)
    
    documentation = {
        'title': 'Reverse Engineered API Documentation',
        'generated_at': datetime.now().isoformat(),
        'endpoints': []
    }
    
    for endpoint_key, requests in endpoints.items():
        method, url = endpoint_key.split(' ', 1)
        
        # Analyze patterns across requests
        status_codes = [req['status_code'] for req in requests]
        response_times = [req['response_time_ms'] for req in requests]
        
        endpoint_doc = {
            'method': method,
            'url': url,
            'description': f'Auto-discovered {method} endpoint',
            'status_codes': list(set(status_codes)),
            'avg_response_time': sum(response_times) / len(response_times),
            'content_types': list(set(req['content_type'] for req in requests)),
            'security': requests[0].get('security', {}),
            'patterns': requests[0].get('patterns', {}),
            'example_response': requests[0].get('response_data') if requests else None
        }
        
        documentation['endpoints'].append(endpoint_doc)
    
    return jsonify(documentation)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)