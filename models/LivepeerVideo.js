var mongoose   = require('mongoose');
var Schema = mongoose.Schema;

var LivepeerVideoSchema = new Schema({
  assetId:  { type: String, required: true, trim: true, unique: true, index: true },
  ownerAddress:  { type: String, required: true, trim: true, index: true },
  name: { type: String, required: true, trim: true},
  isReady: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  playbackId: { type: String, trim: true },
  created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LivepeerVideo', LivepeerVideoSchema);