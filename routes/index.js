'use strict';

const express = require('express');
const router = express.Router();

// Require Controllers
const metaMaskAuth = require('../controllers/metamask-auth');
const LivepeerVideo = require('../controllers/livepeer-video');
const LivepeerVideoPricing = require('../controllers/livepeer-video-pricing');

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

// Livepeer Video Pricing
router.get('/api/livepeer/pricing/:networkId/:ownerAddress', LivepeerVideoPricing.getPricingByOwnerAddress);
router.post('/api/livepeer/pricing/add/:networkId/:userAddress', LivepeerVideoPricing.addPricing);
router.post('/api/livepeer/pricing/update/:networkId/:userAddress', LivepeerVideoPricing.updatePricing);
router.post('/api/livepeer/pricing/delete/:networkId/:userAddress', LivepeerVideoPricing.deletePricing);

module.exports = router;
