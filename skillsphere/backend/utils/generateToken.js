const jwt = require('jsonwebtoken');
exports.generateAccessToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
exports.generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '30d' });
