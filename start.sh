#!/bin/bash

# Ultimate Reverse API Engineering Tool - Startup Script

echo "🚀 Starting Ultimate Reverse API Engineering Tool"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Start the server
echo "🌐 Starting web server on http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo ""

python app.py