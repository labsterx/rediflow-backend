'use strict';
const config  = require('../config');
const LivepeerVideoModel = require('../models').LivepeerVideo;
const axios = require('axios');
const apiKey = config.api.livepeer.key;
const webhookId = config.api.livepeer.webhookId;
const webhookSecret = config.api.livepeer.webhookSecret;
const jwt     = require('jsonwebtoken');
const jwtSecret     = config.jwt.jwtSecret;

// ---------------------------------------------------------------------
// getLivepeerVideoInfo
// ---------------------------------------------------------------------
exports.getLivepeerVideoInfo = async function(req, res) {

  if (!req.params.assetid) {
    return res.status(500).json({msg: 'Error', err: 'Missing assetId'});
  }

  const assetId = req.params.assetid;

  try {

    const result = await LivepeerVideoModel.findOne({ assetId: assetId}).exec();
    if (result) {
      const data = {
        assetId: result.assetId,
        name: result.name,
        ownerAddress: result.ownerAddress,
        created: result.created,
        isReady: result.isReady,
        isPaid: result.isPaid
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
// getLivepeerVideosByOwner
// ---------------------------------------------------------------------
exports.getLivepeerVideosByOwner = async function(req, res) {

  if (!req.params.ownerAddress) {
    return res.status(500).json({msg: 'Error', err: 'Missing ownerAddress'});
  }

  const ownerAddress = req.params.ownerAddress;
  const list = [];

  try {

    let results = await LivepeerVideoModel.find(
      {
        ownerAddress: ownerAddress,
      }).sort({ created: -1 });
    if (results) {
      for (let result of results) {
        const data = {
          assetId: result.assetId,
          name: result.name,
          ownerAddress: result.ownerAddress,
          created: result.created,
          isReady: result.isReady,
          isPaid: result.isPaid,
        };
        list.push(data);
      }
    }

    res.status(200).send(list);

  } catch (err) {
    return res.status(500).send(err);
  }

};

// ---------------------------------------------------------------------
// createUploadRequest
// ---------------------------------------------------------------------
exports.createUploadRequest = async function(req, res) {

  // console.log(req.body);

  if (!req.body.userAddress) {
    return res.status(500).json({msg: 'Error', err: 'Missing userAddress'});
  }

  if (!req.body.name) {
    return res.status(500).json({msg: 'Error', err: 'Missing name'});
  }  

  if (!req.user || !req.user.userAddress) {
    return res.status(500).json({msg: 'Error', err: 'Missing senderInfo'});
  }
  if (req.user.userAddress.toLowerCase() !== req.body.userAddress.toLowerCase()) {
    return res.status(401).send({ err: 'useraddress in body does not match useraddress in header'});
  }  

  const userAddress = req.body.userAddress;
  const name = req.body.name;
  let isPaid = false;

  if (typeof req.body.isPaid !== 'undefined') {
    if (typeof req.body.isPaid !== 'boolean') {
      return res.status(500).json({msg: 'Error', err: 'Wrong type for isPaid'});
    }
    else {
      isPaid = req.body.isPaid;
    }
  }

  const requestUrl = 'https://livepeer.studio/api/asset/request-upload';
  const requestData = {
    name: name,
    playbackPolicy: {
      type: 'webhook',
      webhookId: webhookId,
      webhookContext: {
        ownerAddress: userAddress,
      },
    },     
  };
  const requestConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    }
  };

  let uploadURL = '';
  let tusEndpoint = '';
  let assetId = '';

  try {
        
    const res = await axios.post(requestUrl, requestData, requestConfig);
    // console.log(res.data)
    uploadURL = res.data.url;
    tusEndpoint = res.data.tusEndpoint;
    assetId = res.data.asset.id;

  } catch (error) {
    // console.error('Error:', error)
    res.json(500, {msg: 'Error: ', err: error});
    return;
  } 

  const data = {
    ownerAddress: userAddress,
    name: name,
    isPaid: isPaid,
    assetId: assetId,
  };

  var newData = new LivepeerVideoModel(data);

  const returnData = {
    uploadURL: uploadURL,
    tusEndpoint: tusEndpoint,
    assetId: assetId
  };

  newData.save(function(err) {
    if (err){
      return res.status(500).send(err);
    } else {
      return res.status(200).send(returnData);
    }
  });

};


// ---------------------------------------------------------------------
//
// ---------------------------------------------------------------------
exports.checkLivepeerAssetStatus = async function(req, res) {

  if (!req.params.assetid) {
    return res.status(500).json({msg: 'Error', err: 'Missing assetId'});
  }

  var assetId = req.params.assetid;

  const requestUrl = 'https://livepeer.studio/api/asset/' + assetId;
  const requestConfig = {
    headers: {
      'Authorization': 'Bearer ' + apiKey
    }
  };
  try {
    
    const result = await axios.get(requestUrl, requestConfig);
    // console.log(result);
    if (result && result.data) {

      if (result.data.status 
        && result.data.status.phase 
        && result.data.status.phase === 'ready'
        && result.data.playbackId) {
        let record = await LivepeerVideoModel.findOne({ assetId: assetId}).exec();
        // console.log(record);
        if (record['isReady'] !== true) {
          record['isReady'] = true;
          record['playbackId'] = result.data.playbackId;
          record.save();
        }
      }

      res.status(200).send(result.data)
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
exports.updateVideoInfo = function(req, res) {

  if (!req.params.ownerAddress) {
    return res.status(500).json({msg: 'Error', err: 'Missing userAddress'});
  }
  if (!req.params.assetId) {
    return res.status(500).json({msg: 'Error', err: 'Missing assetId'});
  }

  if (!req.user || !req.user.userAddress) {
    return res.status(500).json({msg: 'Error', err: 'Missing senderInfo'});
  }
  if (req.user.userAddress.toLowerCase() !== req.params.ownerAddress.toLowerCase()) {
    return res.status(401).send({ err: 'useraddress in param does not match useraddress in header'});
  }

  const assetId = req.params.assetId;
  const ownerAddress = req.params.ownerAddress;

  const updateData = {};
  if (req.body.name !== undefined) {
    updateData.name = req.body.name;
  }
  if (req.body.isPaid !== undefined) {
    updateData.isPaid = req.body.isPaid;
  }

  // check if updateData is empty
  if (Object.keys(updateData).length === 0) {
    return res.status(500).json({msg: 'Error', err: 'Missing update data'});
  }

  LivepeerVideoModel.findOneAndUpdate(
    {
      assetId: assetId,
      ownerAddress: ownerAddress,
    },
    updateData,
    {
      new: true,
    },
    function(err, data) {
      if (err) {
        console.log(err)
        return res.status(500).send({msg: 'Error updating data.', err: err});
      }
      else {
        return res.status(200).send(data);
      }
    }
  );
};

// ---------------------------------------------------------------------
//
// ---------------------------------------------------------------------
exports.webhookAccessControl = function(req, res) {

  if (!req.body.accessKey) {
    return res.status(500).json({msg: 'Error', err: 'Missing accessKey'});
  }
  if (!req.body.context) {
    return res.status(500).json({msg: 'Error', err: 'Missing context'});
  }
  if (!req.body.context.ownerAddress) {
    return res.status(500).json({msg: 'Error', err: 'Missing context.ownerAddress'});
  }

  const accessKey = req.body.accessKey;
  const ownerAddress = req.body.context.ownerAddress;

  const decoded = jwt.decode(accessKey, jwtSecret);
  const userAddress = decoded.userAddress;

  const data = {
    userAddress: userAddress,
    ownerAddress: ownerAddress,
  }

  return res.status(200).send(data)

}
