const { Document, DocumentVersion, DocumentPermission } = require('../models/Document');
const User = require('../models/User');
const { Op } = require('sequelize');

// @desc    Upload new document
// @route   POST /api/documents
exports.uploadDocument = async (req, res) => {
    try {
        console.log('\n🚀 =================================');
        console.log('🚀 UPLOAD DOCUMENT START');
        console.log('🚀 =================================');
        console.log('👤 User ID:', req.user?.id);
        console.log('👤 User Email:', req.user?.email);
        console.log('📦 File:', req.file?.filename);
        console.log('📦 File Size:', req.file?.size, 'bytes');
        console.log('📋 Title:', req.body?.title);
        console.log('📋 Description:', req.body?.description);
        console.log('🏷️  Tags:', req.body?.tags);

        // Validation
        if (!req.file) {
            console.error('❌ ERROR: No file in request');
            return res.status(400).json({ 
                success: false,
                message: 'No file uploaded' 
            });
        }

        if (!req.user) {
            console.error('❌ ERROR: No user authenticated');
            return res.status(401).json({ 
                success: false,
                message: 'Not authenticated' 
            });
        }

        if (!req.body.title) {
            console.error('❌ ERROR: No title provided');
            return res.status(400).json({ 
                success: false,
                message: 'Title is required' 
            });
        }

        const { title, description, tags } = req.body;

        console.log('💾 Creating document in database...');
        console.log('   Path: uploads/' + req.file.filename);

        const document = await Document.create({
            title: title.trim(),
            description: description?.trim() || '',
            tag: tags?.trim() || '',
            filePath: `uploads/${req.file.filename}`,
            ownerId: Number(req.user.id),
            currentVersion: 1
        });

        console.log('✅ Document created successfully');
        console.log('   Document ID:', document.id);
        console.log('   Owner ID:', document.ownerId);

        // Fetch the created document with relations
        const completeDoc = await Document.findByPk(document.id, {
            include: [
                { model: User, as: 'owner', attributes: ['id', 'username', 'email'] }
            ]
        });

        console.log('✅ Document fetched with relations');
        
        const responseData = completeDoc.get({ plain: true });
        console.log('✅ Response Data:', responseData);
        
        console.log('🚀 =================================');
        console.log('🚀 UPLOAD SUCCESSFUL');
        console.log('🚀 =================================\n');

        // Return document with success flag so frontend knows it was uploaded
        res.status(201).json({
            ...responseData,
            success: true,
            message: 'Document uploaded successfully'
        });
    } catch (error) {
        console.error('\n❌ =================================');
        console.error('❌ UPLOAD ERROR');
        console.error('❌ =================================');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('❌ =================================\n');

        res.status(500).json({ 
            success: false,
            message: 'Upload failed: ' + (error.message || 'Unknown error'),
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update document/New version
// @route   PUT /api/documents/:id/version
exports.updateVersion = async (req, res) => {
    console.log('🔄 updateVersion called for document', req.params.id);
    if (!req.file) {
        console.error('🔄 No file provided in update');
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const doc = await Document.findByPk(req.params.id, {
            include: [{ model: DocumentPermission, as: 'permissions' }]
        });
        if (!doc) {
            console.error('🔄 Document not found for id', req.params.id);
            return res.status(404).json({ message: 'Document not found' });
        }

        const isOwner = doc.ownerId === req.user.id;
        const hasEditorPerm = doc.permissions && doc.permissions.some(p => p.userId === req.user.id && p.accessType === 'editor');

        if (!isOwner && !hasEditorPerm) {
            console.error('🔄 User', req.user.id, 'lacks permission to update document', doc.id);
            return res.status(403).json({ message: 'No permission to update' });
        }

        console.log('🔄 Current version before update:', doc.currentVersion);
        console.log('🔄 Existing filePath:', doc.filePath);

        // Add current to history
        const historyEntry = await DocumentVersion.create({
            versionNumber: doc.currentVersion,
            filePath: doc.filePath,
            documentId: doc.id,
            updatedBy: req.user.id
        });
        console.log('🔄 History entry created:', historyEntry.id);

        // Update current
        doc.filePath = `uploads/${req.file.filename}`;
        doc.currentVersion += 1;

        await doc.save();
        console.log('🔄 Document updated to new file', req.file.filename, 'new version', doc.currentVersion);
        res.json({ success: true, document: doc });
    } catch (error) {
        console.error('🔄 updateVersion error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all documents (where user has access)
exports.getDocuments = async (req, res) => {
    try {
        console.log('--- Fetching Authorized Docs for User:', req.user.id, '---');

        let conditions = {
            [Op.or]: [
                { ownerId: Number(req.user.id) },
                { '$permissions.userId$': Number(req.user.id) }
            ]
        };

        const docs = await Document.findAll({
            where: conditions,
            include: [
                { model: User, as: 'owner', attributes: ['username'] },
                {
                    model: DocumentPermission,
                    as: 'permissions',
                    required: false
                }
            ],
            order: [['updatedAt', 'DESC']],
            subQuery: false
        });

        const plainDocs = docs.map(d => d.get({ plain: true }));
        console.log('Final returning count:', plainDocs.length);
        res.json(plainDocs);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search by Title or Tag
exports.searchDocuments = async (req, res) => {
    const { query, tags } = req.query;
    console.log('--- Search Start ---', { query, tags }, 'User:', req.user.id);

    let conditions = [
        {
            [Op.or]: [
                { ownerId: Number(req.user.id) },
                { '$permissions.userId$': Number(req.user.id) }
            ]
        }
    ];

    if (query) conditions.push({ title: { [Op.like]: `%${query}%` } });
    if (tags) conditions.push({ tag: { [Op.like]: `%${tags}%` } });

    try {
        const docs = await Document.findAll({
            where: { [Op.and]: conditions },
            include: [
                { model: User, as: 'owner', attributes: ['username'] },
                {
                    model: DocumentPermission,
                    as: 'permissions',
                    required: false
                }
            ],
            order: [['updatedAt', 'DESC']],
            subQuery: false
        });
        const plainDocs = docs.map(d => d.get({ plain: true }));
        console.log('Search returning count:', plainDocs.length);
        res.json(plainDocs);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update permissions
exports.updatePermissions = async (req, res) => {
    try {
        const doc = await Document.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        if (doc.ownerId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        const { userId, accessType } = req.body;
        const [permission, created] = await DocumentPermission.findOrCreate({
            where: { documentId: doc.id, userId },
            defaults: { accessType }
        });

        if (!created) {
            permission.accessType = accessType;
            await permission.save();
        }
        res.json(permission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get version history
exports.getVersionHistory = async (req, res) => {
    console.log('📜 getVersionHistory called for document', req.params.id);
    try {
        const versions = await DocumentVersion.findAll({
            where: { documentId: req.params.id },
            include: [{ model: User, as: 'updater', attributes: ['username'] }],
            order: [['versionNumber', 'DESC']]
        });
        console.log('📜 Versions fetched:', versions.length);
        res.json(versions);
    } catch (error) {
        console.error('📜 getVersionHistory error:', error);
        res.status(500).json({ message: error.message });
    }
};
