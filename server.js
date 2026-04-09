/**
 * Medical Portfolio Backend
 * Secure file storage for resumes and CVs
 * Only owner can delete/modify uploaded files
 */

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000'],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Ensure upload directories exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const RESUMES_DIR = path.join(UPLOADS_DIR, 'resumes');
const CVS_DIR = path.join(UPLOADS_DIR, 'cvs');

[UPLOADS_DIR, RESUMES_DIR, CVS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Create .htaccess to prevent direct access to uploads
const htaccessContent = `
# Prevent direct access to uploaded files
Order Deny,Allow
Deny from all
`;

[RESUMES_DIR, CVS_DIR].forEach(dir => {
  const htaccessPath = path.join(dir, '.htaccess');
  if (!fs.existsSync(htaccessPath)) {
    fs.writeFileSync(htaccessPath, htaccessContent.trim());
  }
});

// Generate secure filename
function generateFileName(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const allowedExts = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
  if (!allowedExts.includes(ext)) {
    throw new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and RTF files are allowed.');
  }
  const uniqueId = uuidv4();
  const hash = crypto.createHash('sha256').update(uniqueId + Date.now()).digest('hex').substring(0, 16);
  return `${hash}-${Date.now()}${ext}`;
}

// Multer configuration
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB default

const createUpload = (destination) => multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      try {
        const filename = generateFileName(file.originalname);
        cb(null, filename);
      } catch (error) {
        cb(error);
      }
    }
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and RTF files are allowed.'));
    }
  }
});

const uploadResume = createUpload(RESUMES_DIR);
const uploadCV = createUpload(CVS_DIR);

// In-memory file registry (use database in production)
const fileRegistry = {
  resumes: [],
  cvs: []
};

// Load existing files on startup
function loadExistingFiles() {
  const loadDir = (dir, type) => {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach(file => {
        if (file.startsWith('.') || file === '.htaccess') return;
        const stats = fs.statSync(path.join(dir, file));
        fileRegistry[type].push({
          id: file.split('-')[0] || uuidv4(),
          filename: file,
          originalName: file.split('-').slice(1).join('-').replace(/\.[^.]+$/, '').replace(/-\d+$/, ''),
          size: stats.size,
          uploadedAt: stats.birthtime,
          type: type
        });
      });
    }
  };
  loadDir(RESUMES_DIR, 'resumes');
  loadDir(CVS_DIR, 'cvs');
}

loadExistingFiles();

// Simple auth middleware (replace with proper JWT in production)
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const expectedToken = Buffer.from(`owner:${process.env.OWNER_PASSWORD}`).toString('base64');
    if (token !== expectedToken) {
      return res.status(403).json({ error: 'Invalid credentials' });
    }
    req.isOwner = true;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Authentication failed' });
  }
}

// ========================
// API ROUTES
// ========================

// GET all uploaded files
app.get('/api/files', (req, res) => {
  const sanitized = {
    resumes: fileRegistry.resumes.map(f => ({
      id: f.id,
      filename: f.filename,
      originalName: f.originalName,
      size: f.size,
      uploadedAt: f.uploadedAt,
      downloadUrl: `/api/files/resumes/${f.id}`
    })),
    cvs: fileRegistry.cvs.map(f => ({
      id: f.id,
      filename: f.filename,
      originalName: f.originalName,
      size: f.size,
      uploadedAt: f.uploadedAt,
      downloadUrl: `/api/files/cvs/${f.id}`
    }))
  };
  res.json(sanitized);
});

// GET download file
app.get('/api/files/:type/:id', (req, res) => {
  const { type, id } = req.params;
  if (!['resumes', 'cvs'].includes(type)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  const file = fileRegistry[type].find(f => f.id === id);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  const filePath = path.join(type === 'resumes' ? RESUMES_DIR : CVS_DIR, file.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on server' });
  }

  res.download(filePath, file.originalName + path.extname(file.filename));
});

// POST upload resume
app.post('/api/upload/resume', uploadResume.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileEntry = {
    id: req.file.filename.split('-')[0] || uuidv4(),
    filename: req.file.filename,
    originalName: req.body.originalName || req.file.originalname.replace(/\.[^.]+$/, ''),
    size: req.file.size,
    uploadedAt: new Date(),
    type: 'resumes'
  };

  fileRegistry.resumes.push(fileEntry);

  res.status(201).json({
    message: 'Resume uploaded successfully',
    file: {
      id: fileEntry.id,
      originalName: fileEntry.originalName,
      size: fileEntry.size,
      uploadedAt: fileEntry.uploadedAt
    }
  });
});

// POST upload CV
app.post('/api/upload/cv', uploadCV.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileEntry = {
    id: req.file.filename.split('-')[0] || uuidv4(),
    filename: req.file.filename,
    originalName: req.body.originalName || req.file.originalname.replace(/\.[^.]+$/, ''),
    size: req.file.size,
    uploadedAt: new Date(),
    type: 'cvs'
  };

  fileRegistry.cvs.push(fileEntry);

  res.status(201).json({
    message: 'CV uploaded successfully',
    file: {
      id: fileEntry.id,
      originalName: fileEntry.originalName,
      size: fileEntry.size,
      uploadedAt: fileEntry.uploadedAt
    }
  });
});

// DELETE file (owner only)
app.delete('/api/files/:type/:id', authMiddleware, (req, res) => {
  const { type, id } = req.params;
  if (!['resumes', 'cvs'].includes(type)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  const index = fileRegistry[type].findIndex(f => f.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const file = fileRegistry[type][index];
  const filePath = path.join(type === 'resumes' ? RESUMES_DIR : CVS_DIR, file.filename);

  // Remove from disk
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remove from registry
  fileRegistry[type].splice(index, 1);

  res.json({ message: 'File deleted successfully' });
});

// GET upload limit status
app.get('/api/upload-status', (req, res) => {
  const maxFiles = parseInt(process.env.UPLOAD_LIMIT) || 10;
  res.json({
    resumes: { count: fileRegistry.resumes.length, max: maxFiles },
    cvs: { count: fileRegistry.cvs.length, max: maxFiles }
  });
});

// Simple auth endpoint
app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (password === process.env.OWNER_PASSWORD) {
    const token = Buffer.from(`owner:${password}`).toString('base64');
    res.json({ message: 'Authenticated', token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏥 Medical Portfolio Server running on port ${PORT}`);
  console.log(`📁 Upload directories ready`);
  console.log(`🔒 Files are protected - only owner can delete`);
});
