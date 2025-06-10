#!/usr/bin/env python3
"""
Demo script for the Ultimate Reverse API Engineering Tool
This script demonstrates the tool's capabilities for educational purposes
"""

import requests
import json
import time

def demo_api_analysis():
    """Demonstrate the API analysis capabilities"""
    print("🚀 Ultimate Reverse API Engineering Tool - Demo")
    print("=" * 60)
    
    base_url = "http://localhost:8080"
    
    # Test 1: Single API Analysis
    print("\n📊 Test 1: Single API Analysis")
    print("-" * 40)
    
    test_data = {
        "url": "https://jsonplaceholder.typicode.com/posts/1",
        "method": "GET"
    }
    
    response = requests.post(f"{base_url}/api/analyze", json=test_data)
    result = response.json()
    
    print(f"✅ URL: {result['url']}")
    print(f"✅ Status: {result['status_code']}")
    print(f"✅ Response Time: {result['response_time_ms']}ms")
    print(f"✅ Content Type: {result['content_type']}")
    print(f"✅ HTTPS: {result['security']['https']}")
    print(f"✅ Rate Limiting: {result['patterns']['rate_limiting']}")
    print(f"✅ REST API: {result['patterns']['rest_api']}")
    
    # Test 2: Endpoint Discovery
    print("\n🔍 Test 2: Endpoint Discovery")
    print("-" * 40)
    
    discovery_data = {"url": "https://jsonplaceholder.typicode.com"}
    response = requests.post(f"{base_url}/api/discover", json=discovery_data)
    result = response.json()
    
    discovered = result['discovered']
    successful = [ep for ep in discovered if ep['status_code'] == 200]
    
    print(f"✅ Total endpoints tested: {len(discovered)}")
    print(f"✅ Successful endpoints found: {len(successful)}")
    
    for endpoint in successful:
        print(f"   📍 {endpoint['url']} - {endpoint['status_code']}")
    
    # Test 3: Batch Analysis
    print("\n📦 Test 3: Batch Analysis")
    print("-" * 40)
    
    batch_data = {
        "endpoints": [
            {"url": "https://jsonplaceholder.typicode.com/posts", "method": "GET"},
            {"url": "https://jsonplaceholder.typicode.com/users", "method": "GET"},
            {"url": "https://jsonplaceholder.typicode.com/comments", "method": "GET"}
        ]
    }
    
    response = requests.post(f"{base_url}/api/batch-analyze", json=batch_data)
    result = response.json()
    
    results = result['results']
    successful_batch = [r for r in results if 'error' not in r and r['status_code'] < 400]
    avg_response_time = sum(r['response_time_ms'] for r in successful_batch) / len(successful_batch)
    
    print(f"✅ Endpoints analyzed: {len(results)}")
    print(f"✅ Successful: {len(successful_batch)}")
    print(f"✅ Average response time: {avg_response_time:.2f}ms")
    
    # Test 4: Generate Documentation
    print("\n📚 Test 4: Generate Documentation")
    print("-" * 40)
    
    response = requests.post(f"{base_url}/api/generate-docs")
    if response.status_code == 200:
        docs = response.json()
        print(f"✅ Documentation generated: {docs['title']}")
        print(f"✅ Endpoints documented: {len(docs['endpoints'])}")
        print(f"✅ Generated at: {docs['generated_at']}")
    else:
        print("❌ No captured requests to document yet")
    
    # Test 5: Security Analysis Demo
    print("\n🛡️  Test 5: Security Analysis Example")
    print("-" * 40)
    
    # Test an HTTP endpoint for security comparison
    insecure_test = {
        "url": "http://httpbin.org/get",
        "method": "GET"
    }
    
    response = requests.post(f"{base_url}/api/analyze", json=insecure_test)
    result = response.json()
    
    security = result['security']
    print(f"✅ HTTPS: {security['https']}")
    print(f"✅ Vulnerabilities found: {len(security['vulnerabilities'])}")
    
    for vuln in security['vulnerabilities']:
        print(f"   ⚠️  {vuln}")
    
    print("\n🎓 Educational Summary")
    print("=" * 60)
    print("This tool helps students learn:")
    print("• HTTP protocol and status codes")
    print("• API security best practices")
    print("• Different API architectures (REST, GraphQL, etc.)")
    print("• Performance analysis and optimization")
    print("• Authentication and authorization methods")
    print("• API documentation and reverse engineering")
    
    print("\n✨ Demo completed successfully!")
    print("Open http://localhost:8080 in your browser to use the web interface")

if __name__ == "__main__":
    try:
        demo_api_analysis()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API server.")
        print("Please make sure the server is running on http://localhost:8080")
        print("Run: python app.py")
    except Exception as e:
        print(f"❌ Error: {e}")