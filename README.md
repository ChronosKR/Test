# Ultimate Reverse API Engineering Tool

An educational web-based tool designed for computer science students to learn API analysis and reverse engineering concepts. This tool provides a user-friendly interface for analyzing APIs, understanding their structure, security, and patterns.

## 🎯 Features

### Core Analysis Features
- **Single Request Analysis**: Analyze individual API endpoints with detailed insights
- **Batch Analysis**: Test multiple endpoints simultaneously
- **Endpoint Discovery**: Automatically discover common API paths
- **Security Analysis**: Identify security headers, vulnerabilities, and authentication methods
- **Pattern Detection**: Recognize REST, GraphQL, SOAP, and other API patterns

### Educational Features
- **Beginner-Friendly Interface**: Clean, intuitive web interface
- **Real-time Results**: Instant analysis with visual feedback
- **Comprehensive Reports**: Detailed breakdowns of API responses
- **Export Capabilities**: Export findings as JSON or cURL commands
- **Auto Documentation**: Generate API documentation from captured requests

### Security & Learning Focus
- HTTPS/HTTP detection
- Security header analysis
- Authentication method identification
- Vulnerability detection
- Rate limiting detection
- API versioning analysis

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Installation

1. **Clone or download the project**:
   ```bash
   cd reverse-api-tool
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:12000
   ```

## 📖 How to Use

### 1. Single Request Analysis
- Enter an API URL (e.g., `https://jsonplaceholder.typicode.com/posts`)
- Select HTTP method (GET, POST, PUT, DELETE, etc.)
- Add headers if needed (JSON format or Key:Value pairs)
- Add request body for POST/PUT requests
- Click "Analyze API" to get detailed results

### 2. Batch Analysis
- Switch to the "Batch Analysis" tab
- Enter multiple endpoints in JSON format:
  ```json
  [
    {"url": "https://api.example.com/users", "method": "GET"},
    {"url": "https://api.example.com/posts", "method": "GET"},
    {"url": "https://api.example.com/auth", "method": "POST"}
  ]
  ```
- Run batch analysis to test all endpoints

### 3. Endpoint Discovery
- Enter a base URL (e.g., `https://api.example.com`)
- The tool will test common API paths like `/api`, `/v1`, `/users`, etc.
- Discover hidden or undocumented endpoints

### 4. View Captured Requests
- All analyzed requests are automatically captured
- View history of all API calls
- Export data for further analysis

### 5. Generate Documentation
- Automatically generate API documentation from captured requests
- Export documentation as JSON
- Perfect for understanding API structure

## 🎓 Educational Use Cases

### For Students
- **Learn API Concepts**: Understand REST, GraphQL, and other API types
- **Security Awareness**: Learn about API security best practices
- **HTTP Protocol**: Deep dive into HTTP headers, status codes, and methods
- **Authentication**: Explore different authentication mechanisms
- **API Design**: Understand good vs. bad API design patterns

### For Instructors
- **Hands-on Learning**: Practical tool for API-related coursework
- **Security Education**: Demonstrate common API vulnerabilities
- **Protocol Analysis**: Show real-world HTTP communication
- **Project Base**: Use as starting point for student projects

## 🔧 Technical Details

### Architecture
- **Backend**: Python Flask with comprehensive API analysis
- **Frontend**: Modern HTML5, CSS3, Bootstrap 5, and JavaScript
- **Analysis Engine**: Custom-built API analyzer with pattern detection
- **Security Scanner**: Built-in security assessment tools

### Supported API Types
- REST APIs
- GraphQL endpoints
- SOAP services
- RPC-style APIs
- Custom API implementations

### Analysis Capabilities
- Response time measurement
- Content type detection
- Header analysis
- Security assessment
- Pattern recognition
- Error handling analysis

## 🛡️ Security & Ethics

### Educational Purpose
This tool is designed for educational purposes and ethical API analysis:
- Only analyze APIs you own or have permission to test
- Respect rate limits and terms of service
- Use for learning, not for malicious purposes
- Follow responsible disclosure for any vulnerabilities found

### Built-in Safeguards
- Reasonable request timeouts
- No automated vulnerability exploitation
- Focus on analysis, not attack
- Educational warnings and guidelines

## 📊 Example Outputs

### Security Analysis
```
✅ HTTPS: Enabled
⚠️  Missing HSTS header
✅ Authentication: Bearer token detected
⚠️  No rate limiting detected
```

### API Patterns
```
✅ REST API detected
✅ Pagination supported
✅ Versioning: v1
❌ GraphQL: Not detected
```

### Performance Metrics
```
Response Time: 245ms (Good)
Content Length: 1.2KB
Status Code: 200 OK
Content Type: application/json
```

## 🤝 Contributing

This is an educational project. Students and instructors are welcome to:
- Report bugs or issues
- Suggest new educational features
- Contribute code improvements
- Share educational use cases

## 📝 License

This project is created for educational purposes. Please use responsibly and ethically.

## 🆘 Support

For questions or issues:
1. Check the built-in help in the web interface
2. Review this README
3. Test with public APIs like JSONPlaceholder for learning

## 🌟 Example APIs for Learning

Try these public APIs to learn:
- `https://jsonplaceholder.typicode.com/posts` - Simple REST API
- `https://httpbin.org/get` - HTTP testing service
- `https://api.github.com/users/octocat` - GitHub API
- `https://reqres.in/api/users` - Test API with various responses

Happy learning! 🚀