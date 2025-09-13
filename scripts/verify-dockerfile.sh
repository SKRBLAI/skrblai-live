#!/bin/bash

# Helper script to verify Dockerfile usage locally
# Not used by CI, just a local verification tool

SERVICE_DIR=$(cat scripts/.service_dir 2>/dev/null || echo ".")

if [ -f "$SERVICE_DIR/Dockerfile" ]; then
    echo "✅ Dockerfile found at $SERVICE_DIR/Dockerfile"
    echo "📦 Service directory: $SERVICE_DIR"
    echo "🚀 Ready for Railway deployment"
else
    echo "❌ Dockerfile not found at $SERVICE_DIR/Dockerfile"
    echo "📦 Service directory: $SERVICE_DIR"
    echo "⚠️  Please check the service directory configuration"
    exit 1
fi