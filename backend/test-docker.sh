#!/bin/bash

echo "🐳 Testing Lab Scheduler Backend Docker Setup"
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ docker-compose not found. Please install docker-compose."
    exit 1
fi

echo "✅ docker-compose is available"

# Stop any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose -f ../docker/docker-compose.yml down -v > /dev/null 2>&1

# Start the services
echo "🚀 Starting services..."
docker-compose -f ../docker/docker-compose.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "📊 Service status:"
docker-compose -f ../docker/docker-compose.yml ps

# Test API health
echo ""
echo "🔍 Testing API health..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ API is healthy: http://localhost:8000"
else
    echo "❌ API health check failed"
fi

# Test API docs
if curl -s http://localhost:8000/docs > /dev/null; then
    echo "✅ API docs available: http://localhost:8000/docs"
else
    echo "❌ API docs not accessible"
fi

# Test Mongo Express
if curl -s http://localhost:8081 > /dev/null; then
    echo "✅ Mongo Express available: http://localhost:8081"
else
    echo "❌ Mongo Express not accessible"
fi

echo ""
echo "🎉 Docker setup test completed!"
echo ""
echo "📋 Available services:"
echo "   API:           http://localhost:8000"
echo "   API Docs:      http://localhost:8000/docs"
echo "   Mongo Express: http://localhost:8081 (admin/admin123)"
echo "   MongoDB:       localhost:27017"
echo "   Redis:         localhost:6379"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:     docker-compose -f ../docker/docker-compose.yml logs -f api"
echo "   Stop services: docker-compose -f ../docker/docker-compose.yml down"
echo "   Restart API:   docker-compose -f ../docker/docker-compose.yml restart api"