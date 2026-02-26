const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');

dotenv.config();

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '..', 'uploads_repo');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Created uploads directory:', uploadDir);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`\n📨 ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('   Body:', req.body);
    }
    next();
});
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads_repo')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));

app.get('/', (req, res) => {
    res.send('DMS API is running with MySQL...');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('\n❌ ===== GLOBAL ERROR HANDLER =====');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('❌ ===================================\n');
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

// 404 handler
app.use((req, res) => {
    console.log('⚠️  404 - Route not found:', req.method, req.url);
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('\n✅ ========================================');
        console.log('✅ Server running on port', PORT);
        console.log('✅ ========================================\n');
    });
}).catch(err => {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
});
