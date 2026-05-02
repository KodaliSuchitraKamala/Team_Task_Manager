#!/bin/bash

echo "🔍 Testing Network Connectivity"
echo "============================"
echo "Target IP: 192.168.1.100"
echo

echo "1. Testing local connectivity..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend accessible locally"
else
    echo "❌ Frontend not accessible locally"
fi

if curl -s http://localhost:8081/api/health > /dev/null; then
    echo "✅ Backend accessible locally"
else
    echo "❌ Backend not accessible locally"
fi

echo
echo "2. Testing network connectivity..."
if ping -c 3 192.168.1.100 > /dev/null 2>&1; then
    echo "✅ Ping to 192.168.1.100 successful"
else
    echo "❌ Ping to 192.168.1.100 failed - network issue!"
fi

echo
echo "3. Port status..."
netstat -tlnp 2>/dev/null | grep -E ":(3000|8081)" || echo "No servers found on ports 3000/8081"

echo
echo "📱 Instructions for other laptops:"
echo "================================="
echo "1. Ensure both laptops are on same WiFi/network"
echo "2. Open browser and go to: http://192.168.1.100:3000"
echo "3. If it doesn't work:"
echo "   - Try pinging 192.168.1.100 from other laptop"
echo "   - Check firewall settings"
echo "   - Try different browser"
