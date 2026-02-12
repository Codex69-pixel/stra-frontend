// server.js - Complete Node.js Express Backend for STRATEGIC ER System
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid'); // Used in API routes
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken'); // Not used in mock auth
const WebSocket = require('ws');

// Initialize Express app
const app = express();
const HTTP_PORT = process.env.PORT || 5000; // Used in server startup
const WS_PORT = 3001;

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, error: 'Too many requests' }
});
app.use('/api/v1/', limiter);

// ==================== MOCK DATABASE ====================
// This will be replaced by SQL database from your backend colleague
const mockDatabase = {
  users: [
    {
      id: '1',
      email: 'admin@hospital.com',
      password: bcrypt.hashSync('admin123', 10),
      firstName: 'System',
      lastName: 'Admin',
      role: 'admin',
      department: 'Administration',
      phoneNumber: '+254700000001',
      specialization: 'Administration',
      licenseNumber: 'ADMIN001',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      email: 'doctor@hospital.com',
      password: bcrypt.hashSync('doctor123', 10),
      firstName: 'John',
      lastName: 'Smith',
      role: 'doctor',
      department: 'Emergency',
      phoneNumber: '+254711111111',
      specialization: 'Emergency Medicine',
      licenseNumber: 'DOC001',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      email: 'nurse@hospital.com',
      password: bcrypt.hashSync('nurse123', 10),
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'nurse',
      department: 'Triage',
      phoneNumber: '+254722222222',
      specialization: 'Emergency Nursing',
      licenseNumber: 'NUR001',
      createdAt: new Date().toISOString()
    }
  ],
  patients: [],
  triageRecords: [],
  queue: [],
  labOrders: [],
  prescriptions: [],
  medications: [
    {
      id: 'med1',
      name: 'Paracetamol 500mg',
      category: 'Analgesic',
      stock: 1500,
      unit: 'tablets',
      lowStockThreshold: 200,
      costPerUnit: 5.50,
      supplier: 'MediPharm Ltd',
      expiryDate: '2024-12-31'
    },
    {
      id: 'med2',
      name: 'Amoxicillin 250mg',
      category: 'Antibiotic',
      stock: 800,
      unit: 'capsules',
      lowStockThreshold: 100,
      costPerUnit: 12.75,
      supplier: 'PharmaCare',
      expiryDate: '2024-10-15'
    }
  ],
  resources: [
    {
      id: 'res1',
      name: 'ICU Bed 01',
      type: 'BED',
      subtype: 'ICU',
      department: 'Emergency ICU',
      status: 'AVAILABLE',
      location: 'ICU Room 1'
    },
    {
      id: 'res2',
      name: 'X-Ray Machine',
      type: 'EQUIPMENT',
      subtype: 'IMAGING',
      department: 'Radiology',
      status: 'AVAILABLE',
      location: 'Radiology Room 2'
    }
  ],
  vitalSigns: []
};

// ==================== HELPER FUNCTIONS ====================
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Used in register
const validatePhone = (phone) => /^\+?[\d\s\-()]+$/.test(phone); // Used in register

// Generate STRA ID for patients
const generateStraId = () => { // Used in triage
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `STRA-${date}-${random}`;
};

// Calculate triage score
const calculateTriageScore = (vitals, symptoms = {}) => { // Used in triage
  let score = 0;
    
  if (vitals.temperature > 39 || vitals.temperature < 35) score += 2;
  if (vitals.heartRate > 120 || vitals.heartRate < 50) score += 2;
  if (vitals.systolicBp > 180 || vitals.systolicBp < 90) score += 2;
  if (vitals.oxygenSaturation < 92) score += 3;
  if (vitals.painScale > 7) score += 2;
    
  const criticalSymptoms = [
    'notBreathing', 'seizureCurrent', 'cardiacArrest', 'airwayObstruction',
    'reducedConsciousness', 'uncontrolledHemorrhage', 'acuteStrokeSigns'
  ];
    
  criticalSymptoms.forEach(symptom => {
    if (symptoms[symptom]) score += 5;
  });
    
  return score;
};

const assignPriority = (score) => { // Used in triage
  if (score >= 10) return 'IMMEDIATE';
  if (score >= 6) return 'EMERGENT';
  if (score >= 3) return 'URGENT';
  if (score >= 1) return 'SEMI-URGENT';
  return 'NON-URGENT';
};

// ==================== AUTHENTICATION MIDDLEWARE ====================
const authenticateToken = (req, res, next) => { // Used in API routes
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
    
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token required'
    });
  }
    
  try {
    // In production, verify with JWT_SECRET
    // const user = jwt.verify(token, process.env.JWT_SECRET);
        
    // For development, extract user from mock token
    if (token.startsWith('mock-token-')) {
      const userId = token.replace('mock-token-', '');
      const user = mockDatabase.users.find(u => u.id === userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: `${user.firstName} ${user.lastName}`
        };
        return next();
      }
    }
        
    throw new Error('Invalid token');
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

const authorizeRoles = (...roles) => { // Used in API routes
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    next();
  };
};

// ==================== WEBSOCKET SERVER ====================
const wss = new WebSocket.Server({ port: WS_PORT });
const connectedClients = new Set();

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  connectedClients.add(ws);
    
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to STRATEGIC ER System',
    timestamp: new Date().toISOString()
  }));
    
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('WebSocket message:', data);
            
      // Handle different message types
      switch (data.type) {
        case 'heartbeat':
          ws.send(JSON.stringify({ type: 'heartbeat_ack', timestamp: new Date().toISOString() }));
          break;
        case 'queue_update':
          // Broadcast queue updates to all clients
          broadcast({ type: 'queue_updated', data: data.data });
          break;
        default:
          // Optionally handle unknown types
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
    
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    connectedClients.delete(ws);
  });
});

const broadcast = (data) => {
  const message = JSON.stringify(data);
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// ==================== API ROUTES ====================

// Health endpoints
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'stra-backend',
    version: '1.0.0'
  });
});

app.get('/api/v1/health/db', (req, res) => {
  res.json({
    success: true,
    database: 'connected',
    redis: 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ...existing code...
