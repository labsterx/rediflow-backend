'use strict';

const express = require('express');
const router = express.Router();

// Require Controllers
const metaMaskAuth = require('../controllers/metamask-auth');

// MetaMask Auth
router.post('/metamask-signin', metaMaskAuth.signIn);
router.post('/api/metamask-refresh', metaMaskAuth.refreshToken);

// Livepeer Webhook
router.post('/livepeer/webhook/access-control', LivepeerVideo.webhookAccessControl);

// Livepeer Video
router.get('/api/livepeer/asset/:assetid', LivepeerVideo.getLivepeerVideoInfo);
router.get('/api/livepeer/assets-by-owner/:ownerAddress', LivepeerVideo.getLivepeerVideosByOwner);
router.post('/api/livepeer/upload-request', LivepeerVideo.createUploadRequest);
router.get('/api/livepeer/check-asset-status/:assetid', LivepeerVideo.checkLivepeerAssetStatus);

module.exports = router;
