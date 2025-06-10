// Ultimate Reverse API Engineering Tool - Frontend JavaScript

// Global variables
let currentTab = 'single-request';
let capturedRequests = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadCapturedRequests();
});

function initializeApp() {
    // Set up form submission
    document.getElementById('single-request-form').addEventListener('submit', handleSingleRequest);
    
    // Load captured requests on page load
    loadCapturedRequests();
    
    // Set up auto-refresh for captured requests
    setInterval(loadCapturedRequests, 5000);
}

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    currentTab = tabName;
    
    // Load data for specific tabs
    if (tabName === 'captured-requests') {
        loadCapturedRequests();
    }
}

function showLoading() {
    const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
    modal.show();
}

function hideLoading() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
    if (modal) {
        modal.hide();
    }
}

async function handleSingleRequest(event) {
    event.preventDefault();
    
    const url = document.getElementById('api-url').value;
    const method = document.getElementById('http-method').value;
    const headers = document.getElementById('request-headers').value;
    const body = document.getElementById('request-body').value;
    const params = document.getElementById('query-params').value;
    
    if (!url) {
        alert('Please enter an API URL');
        return;
    }
    
    showLoading();
    
    try {
        const requestData = {
            url: url,
            method: method,
            headers: headers,
            data: body,
            params: params ? JSON.parse(params) : {}
        };
        
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        displayAnalysisResults(result);
        
    } catch (error) {
        console.error('Error analyzing API:', error);
        alert('Error analyzing API: ' + error.message);
    } finally {
        hideLoading();
    }
}

function displayAnalysisResults(result) {
    document.getElementById('analysis-results').style.display = 'block';
    
    // Basic Info
    const basicInfo = document.getElementById('basic-info');
    basicInfo.innerHTML = `
        <div class="row">
            <div class="col-6">
                <strong>Status:</strong> 
                <span class="badge ${getStatusClass(result.status_code)}">${result.status_code}</span>
            </div>
            <div class="col-6">
                <strong>Response Time:</strong> 
                <span class="response-time ${getResponseTimeClass(result.response_time_ms)}">${result.response_time_ms}ms</span>
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-6">
                <strong>Content Type:</strong><br>
                <small>${result.content_type || 'Unknown'}</small>
            </div>
            <div class="col-6">
                <strong>Content Length:</strong><br>
                <small>${formatBytes(result.content_length)}</small>
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-12">
                <strong>Encoding:</strong> ${result.encoding || 'Unknown'}
            </div>
        </div>
    `;
    
    // Security Info
    const securityInfo = document.getElementById('security-info');
    const security = result.security || {};
    const vulnerabilities = security.vulnerabilities || [];
    
    securityInfo.innerHTML = `
        <div class="mb-2">
            <strong>HTTPS:</strong> 
            <span class="${security.https ? 'security-good' : 'security-danger'}">
                <i class="fas ${security.https ? 'fa-check' : 'fa-times'}"></i>
                ${security.https ? 'Enabled' : 'Disabled'}
            </span>
        </div>
        <div class="mb-2">
            <strong>Authentication:</strong> 
            <span class="badge bg-info">${security.authentication || 'None'}</span>
        </div>
        <div class="mb-2">
            <strong>Security Headers:</strong>
            <div class="mt-1">
                ${Object.keys(security.security_headers || {}).map(header => 
                    `<span class="badge bg-success me-1">${header}</span>`
                ).join('') || '<span class="text-muted">None found</span>'}
            </div>
        </div>
        ${vulnerabilities.length > 0 ? `
            <div class="mt-2">
                <strong>Vulnerabilities:</strong>
                ${vulnerabilities.map(vuln => 
                    `<div class="vulnerability-item">${vuln}</div>`
                ).join('')}
            </div>
        ` : '<div class="text-success"><i class="fas fa-shield-alt"></i> No obvious vulnerabilities detected</div>'}
    `;
    
    // Patterns Info
    const patternsInfo = document.getElementById('patterns-info');
    const patterns = result.patterns || {};
    
    patternsInfo.innerHTML = `
        <div class="mb-2">
            <strong>API Type:</strong><br>
            ${patterns.rest_api ? '<span class="pattern-badge active">REST</span>' : '<span class="pattern-badge">REST</span>'}
            ${patterns.graphql ? '<span class="pattern-badge active">GraphQL</span>' : '<span class="pattern-badge">GraphQL</span>'}
            ${patterns.soap ? '<span class="pattern-badge active">SOAP</span>' : '<span class="pattern-badge">SOAP</span>'}
        </div>
        <div class="mb-2">
            <strong>Features:</strong><br>
            ${patterns.rate_limiting ? '<span class="pattern-badge active">Rate Limiting</span>' : '<span class="pattern-badge">Rate Limiting</span>'}
            ${patterns.pagination ? '<span class="pattern-badge active">Pagination</span>' : '<span class="pattern-badge">Pagination</span>'}
        </div>
        ${patterns.versioning ? `
            <div class="mb-2">
                <strong>API Version:</strong> <span class="badge bg-primary">v${patterns.versioning}</span>
            </div>
        ` : ''}
    `;
    
    // Headers Info
    const headersInfo = document.getElementById('headers-info');
    const headers = result.headers || {};
    
    headersInfo.innerHTML = `
        <div style="max-height: 200px; overflow-y: auto;">
            ${Object.entries(headers).map(([key, value]) => `
                <div class="mb-1">
                    <strong>${key}:</strong><br>
                    <small class="text-muted">${value}</small>
                </div>
            `).join('')}
        </div>
    `;
    
    // Response Data
    const responseData = document.getElementById('response-data');
    let formattedData = '';
    
    if (result.data_type === 'json') {
        formattedData = JSON.stringify(result.response_data, null, 2);
    } else if (result.data_type === 'text') {
        formattedData = result.response_data;
    } else if (result.data_type === 'binary') {
        formattedData = '[Binary data - base64 encoded]\n' + result.response_data.substring(0, 500) + '...';
    } else {
        formattedData = result.response_data || 'No response data';
    }
    
    responseData.textContent = formattedData;
    
    // Trigger syntax highlighting
    if (typeof Prism !== 'undefined') {
        Prism.highlightElement(responseData);
    }
    
    // Scroll to results
    document.getElementById('analysis-results').scrollIntoView({ behavior: 'smooth' });
}

async function runBatchAnalysis() {
    const endpointsText = document.getElementById('batch-endpoints').value;
    
    if (!endpointsText.trim()) {
        alert('Please enter endpoints to analyze');
        return;
    }
    
    try {
        const endpoints = JSON.parse(endpointsText);
        showLoading();
        
        const response = await fetch('/api/batch-analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ endpoints: endpoints })
        });
        
        const result = await response.json();
        displayBatchResults(result.results);
        
    } catch (error) {
        console.error('Error in batch analysis:', error);
        alert('Error in batch analysis: ' + error.message);
    } finally {
        hideLoading();
    }
}

function displayBatchResults(results) {
    const resultsContainer = document.getElementById('batch-results');
    
    resultsContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5><i class="fas fa-chart-bar"></i> Batch Analysis Results (${results.length} endpoints)</h5>
            </div>
            <div class="card-body">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${results.filter(r => !r.error && r.status_code < 400).length}</div>
                        <div class="stat-label">Successful</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${results.filter(r => r.error || r.status_code >= 400).length}</div>
                        <div class="stat-label">Failed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${Math.round(results.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / results.length)}ms</div>
                        <div class="stat-label">Avg Response Time</div>
                    </div>
                </div>
                
                <div class="timeline">
                    ${results.map((result, index) => `
                        <div class="timeline-item">
                            <div class="card endpoint-card ${result.method ? result.method.toLowerCase() : 'get'}">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <span class="method-badge method-${result.method ? result.method.toLowerCase() : 'get'}">${result.method || 'GET'}</span>
                                            <strong class="ms-2">${result.url}</strong>
                                        </div>
                                        <div>
                                            ${result.error ? 
                                                '<span class="badge bg-danger">Error</span>' : 
                                                `<span class="badge ${getStatusClass(result.status_code)}">${result.status_code}</span>`
                                            }
                                        </div>
                                    </div>
                                    ${result.error ? 
                                        `<div class="text-danger mt-2">${result.error}</div>` :
                                        `<div class="mt-2">
                                            <small class="text-muted">
                                                Response time: ${result.response_time_ms}ms | 
                                                Content type: ${result.content_type || 'Unknown'}
                                            </small>
                                        </div>`
                                    }
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

async function discoverEndpoints() {
    const baseUrl = document.getElementById('discovery-url').value;
    
    if (!baseUrl) {
        alert('Please enter a base URL');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/api/discover', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: baseUrl })
        });
        
        const result = await response.json();
        displayDiscoveryResults(result.discovered);
        
    } catch (error) {
        console.error('Error discovering endpoints:', error);
        alert('Error discovering endpoints: ' + error.message);
    } finally {
        hideLoading();
    }
}

function displayDiscoveryResults(discovered) {
    const resultsContainer = document.getElementById('discovery-results');
    
    if (discovered.length === 0) {
        resultsContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> No endpoints discovered. The API might use non-standard paths or require authentication.
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5><i class="fas fa-list"></i> Discovered Endpoints (${discovered.length})</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    ${discovered.map(endpoint => `
                        <div class="col-md-6 mb-3">
                            <div class="card border-success">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>${endpoint.url}</strong><br>
                                            <small class="text-muted">${endpoint.content_type || 'Unknown type'}</small>
                                        </div>
                                        <div>
                                            <span class="badge ${getStatusClass(endpoint.status_code)}">${endpoint.status_code}</span>
                                            <button class="btn btn-sm btn-outline-primary ms-2" 
                                                    onclick="analyzeDiscoveredEndpoint('${endpoint.url}')">
                                                <i class="fas fa-search"></i> Analyze
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function analyzeDiscoveredEndpoint(url) {
    // Switch to single request tab and populate URL
    document.getElementById('api-url').value = url;
    showTab('single-request');
    
    // Scroll to the form
    document.getElementById('single-request').scrollIntoView({ behavior: 'smooth' });
}

async function loadCapturedRequests() {
    try {
        const response = await fetch('/api/captured');
        const result = await response.json();
        capturedRequests = result.requests;
        displayCapturedRequests();
    } catch (error) {
        console.error('Error loading captured requests:', error);
    }
}

function displayCapturedRequests() {
    const container = document.getElementById('captured-list');
    
    if (capturedRequests.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> No requests captured yet. Start analyzing APIs to see them here.
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="mb-3">
            <strong>Total Requests:</strong> ${capturedRequests.length}
        </div>
        ${capturedRequests.map((request, index) => `
            <div class="card mb-2">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="method-badge method-${request.method ? request.method.toLowerCase() : 'get'}">${request.method || 'GET'}</span>
                            <strong class="ms-2">${request.url}</strong>
                        </div>
                        <div>
                            <small class="text-muted">${new Date(request.timestamp).toLocaleString()}</small>
                            ${request.error ? 
                                '<span class="badge bg-danger ms-2">Error</span>' : 
                                `<span class="badge ${getStatusClass(request.status_code)} ms-2">${request.status_code}</span>`
                            }
                        </div>
                    </div>
                    ${request.error ? 
                        `<div class="text-danger mt-2">${request.error}</div>` :
                        `<div class="mt-2">
                            <small class="text-muted">
                                Response time: ${request.response_time_ms}ms | 
                                Content type: ${request.content_type || 'Unknown'}
                            </small>
                        </div>`
                    }
                </div>
            </div>
        `).join('')}
    `;
}

async function clearCaptured() {
    if (!confirm('Are you sure you want to clear all captured requests?')) {
        return;
    }
    
    try {
        await fetch('/api/clear-captured', { method: 'POST' });
        capturedRequests = [];
        displayCapturedRequests();
    } catch (error) {
        console.error('Error clearing captured requests:', error);
        alert('Error clearing captured requests');
    }
}

async function exportData(format) {
    try {
        const response = await fetch('/api/export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ format: format })
        });
        
        const result = await response.json();
        
        if (format === 'json') {
            downloadJSON(result, 'api-analysis-export.json');
        } else if (format === 'curl') {
            downloadText(result.curl_commands.join('\n\n'), 'api-curl-commands.txt');
        }
        
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data');
    }
}

async function generateDocs() {
    try {
        const response = await fetch('/api/generate-docs', { method: 'POST' });
        const result = await response.json();
        
        if (result.error) {
            alert(result.error);
            return;
        }
        
        displayGeneratedDocs(result);
        
    } catch (error) {
        console.error('Error generating documentation:', error);
        alert('Error generating documentation');
    }
}

function displayGeneratedDocs(docs) {
    const container = document.getElementById('generated-docs');
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5>${docs.title}</h5>
                <button class="btn btn-sm btn-outline-primary" onclick="downloadJSON(${JSON.stringify(docs).replace(/"/g, '&quot;')}, 'api-documentation.json')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <small class="text-muted">Generated on: ${new Date(docs.generated_at).toLocaleString()}</small>
                </div>
                
                ${docs.endpoints.map(endpoint => `
                    <div class="card mb-3 endpoint-card ${endpoint.method.toLowerCase()}">
                        <div class="card-header">
                            <span class="method-badge method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                            <strong class="ms-2">${endpoint.url}</strong>
                        </div>
                        <div class="card-body">
                            <p>${endpoint.description}</p>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <strong>Status Codes:</strong>
                                    ${endpoint.status_codes.map(code => 
                                        `<span class="badge ${getStatusClass(code)} me-1">${code}</span>`
                                    ).join('')}
                                </div>
                                <div class="col-md-6">
                                    <strong>Avg Response Time:</strong> ${Math.round(endpoint.avg_response_time)}ms
                                </div>
                            </div>
                            
                            <div class="row mt-2">
                                <div class="col-md-6">
                                    <strong>Content Types:</strong><br>
                                    ${endpoint.content_types.map(type => 
                                        `<small class="text-muted">${type}</small>`
                                    ).join('<br>')}
                                </div>
                                <div class="col-md-6">
                                    <strong>Authentication:</strong> 
                                    <span class="badge bg-info">${endpoint.security.authentication || 'None'}</span>
                                </div>
                            </div>
                            
                            ${endpoint.example_response ? `
                                <div class="mt-3">
                                    <strong>Example Response:</strong>
                                    <pre class="code-block mt-2"><code>${JSON.stringify(endpoint.example_response, null, 2)}</code></pre>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Utility functions
function getStatusClass(statusCode) {
    if (statusCode >= 200 && statusCode < 300) return 'bg-success';
    if (statusCode >= 300 && statusCode < 400) return 'bg-warning';
    if (statusCode >= 400 && statusCode < 500) return 'bg-danger';
    if (statusCode >= 500) return 'bg-dark';
    return 'bg-secondary';
}

function getResponseTimeClass(responseTime) {
    if (responseTime < 200) return 'fast';
    if (responseTime < 1000) return 'medium';
    return 'slow';
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}