const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Document = sequelize.define('Document', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tag: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    description: {
        type: DataTypes.TEXT
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currentVersion: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

const DocumentVersion = sequelize.define('DocumentVersion', {
    versionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const DocumentPermission = sequelize.define('DocumentPermission', {
    accessType: {
        type: DataTypes.ENUM('viewer', 'editor'),
        defaultValue: 'viewer'
    }
});

// Associations
Document.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
Document.hasMany(DocumentVersion, { as: 'versionHistory', foreignKey: 'documentId' });
DocumentVersion.belongsTo(User, { as: 'updater', foreignKey: 'updatedBy' });

Document.hasMany(DocumentPermission, { as: 'permissions', foreignKey: 'documentId' });
DocumentPermission.belongsTo(User, { as: 'user', foreignKey: 'userId' });

module.exports = { Document, DocumentVersion, DocumentPermission };
