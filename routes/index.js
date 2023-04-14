'use strict';

const express = require('express');
const router = express.Router();

// Require Controllers
const metaMaskAuth = require('../controllers/metamask-auth');

// MetaMask Auth
router.post('/metamask-signin', metaMaskAuth.signIn);
router.post('/api/metamask-refresh', metaMaskAuth.refreshToken);

module.exports = router;
