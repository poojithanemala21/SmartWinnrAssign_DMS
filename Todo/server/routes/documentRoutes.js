const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadDocument, getDocuments, searchDocuments, updateVersion, updatePermissions, getVersionHistory } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Multer storage configuration with error handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.resolve(__dirname, '..', '..', 'uploads_repo');
        console.log('📁 Upload destination:', uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        console.log('📄 Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        console.log('🔍 File filter - mimetype:', file.mimetype);
        cb(null, true);
    }
});

// Log incoming requests
router.use((req, res, next) => {
    console.log(`📨 [${req.method}] ${req.path}`);
    console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    next();
});

router.use(protect); // Protect all document routes

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('📤 Multer Error:', err.message);
        return res.status(400).json({ 
            success: false,
            message: 'File upload error: ' + err.message 
        });
    } else if (err) {
        console.error('📤 Upload Middleware Error:', err);
        return res.status(500).json({ 
            success: false,
            message: 'Upload error: ' + err.message 
        });
    }
    next();
};

router.route('/')
    .get(getDocuments)
    .post((req, res, next) => {
        upload.single('file')(req, res, (err) => {
            if (err) {
                console.error('📤 Multer error in post handler:', err.message);
                return res.status(400).json({ 
                    success: false,
                    message: 'File upload error: ' + err.message 
                });
            }
            next();
        });
    }, uploadDocument);

router.get('/search', searchDocuments);
router.put('/:id/version', upload.single('file'), updateVersion);
router.put('/:id/permissions', updatePermissions);
router.get('/:id/versions', getVersionHistory);

module.exports = router;
