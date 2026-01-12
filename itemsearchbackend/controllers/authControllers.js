// ✅ backend/api/loginEmployee.js
const axios = require('axios');
const http = require('http');
const https = require('https');
const mongoose = require('mongoose');
const EmployeeActivity = require('../models/employeeActivity');
const { getDeviceInfo } = require('../utils/deviceDetector');

// 🚀 Performance: Reusable HTTP agents with keep-alive for faster connections
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 10 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 10 });

const loginEmployee = async (req, res) => {
  const { employeeId, password } = req.body;

  // 🚀 Performance: Minimal logging for faster response
  const startTime = Date.now();

  try {
    // 🚀 Performance: Ultra-fast login - 4 second timeout to ensure <5s total
    const loginPromise = axios.post(
      'https://rootments.in/api/verify_employee',
      { employeeId, password },
      {
        headers: {
          Authorization: 'Bearer RootX-production-9d17d9485eb772e79df8564004d4a4d4',
        },
        timeout: 4000, // 4 second timeout - ensures total login < 5 seconds
        httpAgent: httpAgent, // Reusable agent with keep-alive for faster connections
        httpsAgent: httpsAgent,
      }
    );
    
    // 🚀 Use Promise.race for even faster failure detection
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Login timeout - please try again')), 4000)
    );
    
    const response = await Promise.race([loginPromise, timeoutPromise]);

    // 🚀 Performance: Return response immediately, save activity in background
    if (response.data && response.data.status === 'success') {
      const duration = Date.now() - startTime;
      // Send response immediately without waiting for DB save
      res.json(response.data);
      
      // Log performance only if > 3 seconds (for monitoring)
      if (duration > 3000) {
        console.log(`⚠️ Login took ${duration}ms (target: <5000ms)`);
      }
      
      // 🚀 Save employee activity to MongoDB in background (non-blocking)
      // Fire and forget - doesn't block the login response
      (async () => {
        try {
          // 🚀 Performance: Check if MongoDB is connected before attempting save
          // If not connected, skip silently (prevents waiting for slow connection)
          if (mongoose.connection.readyState !== 1) {
            return; // Skip silently for performance
          }
          
          const userAgent = req.headers['user-agent'] || 'Unknown';
          const deviceInfo = getDeviceInfo(userAgent, req);
          
          const activityData = {
            employeeId: response.data.data?.employeeId || employeeId,
            employeeName: response.data.data?.employeeName || response.data.data?.Name || 'Unknown',
            storeName: response.data.data?.storeName || response.data.data?.Store || '',
            locationId: response.data.data?.locationId || '',
            employeePhone: response.data.data?.phoneNumber || '',
            email: response.data.data?.email || '',
            activityType: 'login',
            activityDescription: 'Employee login',
            
            // Device & Browser Information
            browser: deviceInfo.browser,
            browserVersion: deviceInfo.browserVersion,
            operatingSystem: deviceInfo.operatingSystem,
            deviceType: deviceInfo.deviceType,
            deviceModel: `${deviceInfo.deviceVendor} ${deviceInfo.deviceModel}`,
            screenResolution: deviceInfo.screenResolution,
            
            // Network Information
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            
            sessionId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };

          const activity = new EmployeeActivity(activityData);
          await activity.save();
          // Minimal logging for performance
        } catch (dbError) {
          console.error('⚠️ Failed to save activity to MongoDB:', dbError.message);
          // Silently fail - tracking shouldn't affect user experience
        }
      })().catch(() => {
        // Silently handle any uncaught errors in background task
      });
      
      return; // Exit early after sending response
    }

    // If login failed, return error response
    res.json(response.data);
  } catch (error) {
    console.error('❌ Login error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    res.status(500).json({
      status: 'error',
      message: 'Login failed.',
      debug: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      },
    });
  }
};

module.exports = { loginEmployee };

