const mongoose   = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');

const LivepeerVideoSchema = new Schema({
  videoId: {
    type: String,
    unique: true,
    index: true,
  },
  assetId:  { type: String, required: true, trim: true, unique: true, index: true },
  ownerAddress:  { type: String, required: true, trim: true, index: true },
  name: { type: String, required: true, trim: true},
  isReady: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  playbackId: { type: String, trim: true },
  created: { type: Date, default: Date.now },
});

LivepeerVideoSchema.pre('save', function(next) {
  if (!this.videoId) { 
    this.videoId = shortid.generate(); // Generate custom myID using shortid
  }
  next();
});

module.exports = mongoose.model('LivepeerVideo', LivepeerVideoSchema);