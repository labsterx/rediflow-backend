'use strict';

const LivepeerVideoPricingModel = require('../models').LivepeerVideoPricing;

// ---------------------------------------------------------------------
//
// ---------------------------------------------------------------------
exports.getPricingByOwnerAddress = async function(req, res) {

  if (!req.params.networkId) {
    return res.status(400).json({msg: 'Error', err: 'Missing networkId'});
  }
  if (!req.params.ownerAddress) {
    return res.status(400).json({msg: 'Error', err: 'Missing ownerAddress'});
  }

  const networkId = req.params.networkId;
  const ownerAddress = req.params.ownerAddress;

  try {

    const result = await LivepeerVideoPricingModel.findOne({ networkId: networkId, ownerAddress: ownerAddress }).exec();
    if (result) {
      const data = {
        networkId: result.networkId,
        ownerAddress: result.ownerAddress,
        tokenName: result.tokenName,
        pricePerHour: result.pricePerHour
      };
      res.status(200).send(result)
    } else {
      res.status(404).send({err: 'Not found'});
    }

  } catch (err) {
    return res.status(500).send(err);
  } 

};


// ---------------------------------------------------------------------
//
// ---------------------------------------------------------------------
exports.addPricing = function(req, res) {

  if (!req.params.networkId) {
    return res.status(400).json({msg: 'Error', err: 'Missing networkId'});
  }
  if (!req.params.userAddress) {
    return res.status(400).json({msg: 'Error', err: 'Missing userAddress'});
  }
  if (!req.body.tokenName) {
    return res.status(400).json({msg: 'Error', err: 'Missing tokenName'});
  }  
  if (!req.body.pricePerHour) {
    return res.status(400).json({msg: 'Error', err: 'Missing pricePerHour'});
  }
  if (!req.user || !req.user.userAddress) {
    return res.status(400).json({msg: 'Error', err: 'Missing senderInfo'});
  }
  if (req.user.userAddress.toLowerCase() !== req.params.userAddress.toLowerCase()) {
    return res.status(401).send({ err: 'useraddress in param does not match useraddress in header'});
  }

  const networkId = req.params.networkId;
  const ownerAddress = req.params.userAddress;
  const tokenName = req.body.tokenName;
  const pricePerHour = req.body.pricePerHour;

  const data = {
    networkId: networkId,
    ownerAddress: ownerAddress,
    tokenName: tokenName,
    pricePerHour: pricePerHour,
  };

  const newData = new LivepeerVideoPricingModel(data);

  newData.save(function(err) {
    if (err){
      res.json(500, {msg: 'Error createing new follow.', err: err});
    } else {
      res.json(newData);
    }
  });

};


// ---------------------------------------------------------------------
//
// ---------------------------------------------------------------------
exports.deletePricing = function(req, res) {

  if (!req.params.networkId) {
    return res.status(400).json({msg: 'Error', err: 'Missing networkId'});
  }
  if (!req.params.userAddress) {
    return res.status(400).json({msg: 'Error', err: 'Missing userAddress'});
  }
  if (!req.user || !req.user.userAddress) {
    return res.status(400).json({msg: 'Error', err: 'Missing senderInfo'});
  }
  if (req.user.userAddress.toLowerCase() !== req.params.userAddress.toLowerCase()) {
    return res.status(401).send({ err: 'useraddress in param does not match useraddress in header'});
  }  

  const networkId = req.params.networkId;
  const ownerAddress = req.params.userAddress;

  LivepeerVideoPricingModel.deleteOne({
    networkId: networkId,
    ownerAddress: ownerAddress,
  })
  .exec(function(err, data) {
    if (err) {
      res.json(500, {msg: 'Error deleting data.', err: err});
    }
    else {
      res.json({ message: 'data deleted!' });
    }
  });

};


// ---------------------------------------------------------------------
//
// ---------------------------------------------------------------------
// create a function to update a record
exports.updatePricing = function(req, res) {

  if (!req.params.networkId) {
    return res.status(400).json({msg: 'Error', err: 'Missing networkId'});
  }
  if (!req.params.userAddress) {
    return res.status(400).json({msg: 'Error', err: 'Missing userAddress'});
  }
  if (!req.body.tokenName) {
    return res.status(400).json({msg: 'Error', err: 'Missing tokenName'});
  }  
  if (!req.body.pricePerHour) {
    return res.status(400).json({msg: 'Error', err: 'Missing pricePerHour'});
  }

  if (!req.user || !req.user.userAddress) {
    return res.status(400).json({msg: 'Error', err: 'Missing senderInfo'});
  }
  if (req.user.userAddress.toLowerCase() !== req.params.userAddress.toLowerCase()) {
    return res.status(401).send({ err: 'useraddress in param does not match useraddress in header'});
  }

  const networkId = req.params.networkId;
  const ownerAddress = req.params.userAddress;
  const tokenName = req.body.tokenName;
  const pricePerHour = req.body.pricePerHour;

  LivepeerVideoPricingModel.findOneAndUpdate(
    {
      networkId: networkId,
      ownerAddress: ownerAddress,
    },
    {
      tokenName: tokenName,
      pricePerHour: pricePerHour,
    },
    {
      new: true,
    },
    function(err, data) {
      if (err) {
        res.json(500, {msg: 'Error updating data.', err: err});
      }
      else {
        res.json(data);
      }
    }
  );

}
