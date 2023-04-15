var mongoose   = require('mongoose');
var Schema = mongoose.Schema;

var LivepeerVideoPricingSchema = new Schema({
  networkId: { type: Number, required: true, trim: true, index: true },
  ownerAddress: { type: String, required: true, trim: true, index: true },
  tokenName: { type: String, required: true, trim: true},
  pricePerHour: { type: Number }
});

LivepeerVideoPricingSchema.index({networkId: 1, ownerAddress: 1}, {unique: true});

module.exports = mongoose.model('LivepeerVideoPricing', LivepeerVideoPricingSchema);
