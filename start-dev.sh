#!/bin/bash

# RankPulse - Clean Development Server Startup Script
# This script ensures a clean start every time

echo "🧹 Cleaning up previous processes..."

# Kill any existing node processes on ports 3000-3001
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :3001 | xargs kill -9 2>/dev/null || true

# Clean Next.js cache
echo "🗑️  Removing .next cache..."
rm -rf .next

# Small delay to ensure ports are freed
sleep 1

echo "🚀 Starting development server..."
npm run dev
