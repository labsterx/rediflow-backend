'use strict';
const config  = require('../config');
const LivepeerVideoModel = require('../models').LivepeerVideo;
const LivepeerVideoPricing = require('../models/LivepeerVideoPricing');
const axios = require('axios');
const apiKey = config.api.livepeer.key;
const webhookId = config.api.livepeer.webhookId;
const webhookSecret = config.api.livepeer.webhookSecret;
const jwt     = require('jsonwebtoken');
const jwtSecret     = config.jwt.jwtSecret;
const shortid = require('shortid');

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

  const videoId = shortid.generate();
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
        videoId: videoId,
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
    videoId: videoId,
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
exports.deleteVideo = function(req, res) {

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

  // find and delete
  LivepeerVideoModel.findOneAndDelete(
    {
      assetId: assetId,
      ownerAddress: ownerAddress,
    },
    function(err, data) {
      if (err) {
        console.log(err)
        return res.status(500).send({msg: 'Error deleting data.', err: err});
      }
      else {
        return res.status(200).send(data);
      }
    }
  );

};

// ---------------------------------------------------------------------
// getNewVideos
// ---------------------------------------------------------------------
exports.getNewVideos = async function(req, res) {

  const list = [];
  const limit = 24;

  const results = await LivepeerVideoModel.find(
    {
      isReady: true,
    }).limit(limit).sort({ created: -1 }).exec();

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

    res.status(200).send(list);

  } 

};

// ---------------------------------------------------------------------
// getFeaturedVideos
// ---------------------------------------------------------------------
exports.getFeaturedVideos = async function(req, res) {

  const featuredVideos = config.featuredVideos;
  const list = [];

  try {

    let results = await LivepeerVideoModel.find(
      {
        assetId: { "$in" : featuredVideos }
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
// webhookAccessControl
// ---------------------------------------------------------------------
exports.webhookAccessControl = async function(req, res) {

  // console.log(req.body);

  if (!req.body.accessKey) {
    return res.status(500).json({msg: 'Error', err: 'Missing accessKey'});
  }
  if (!req.body.context) {
    return res.status(500).json({msg: 'Error', err: 'Missing context'});
  }
  if (!req.body.context.ownerAddress) {
    return res.status(500).json({msg: 'Error', err: 'Missing context.ownerAddress'});
  }
  if (!req.body.context.videoId) {
    return res.status(500).json({msg: 'Error', err: 'Missing context.videoId'});
  }  

  const accessKey = req.body.accessKey;
  const ownerAddress = req.body.context.ownerAddress;
  const videoId = req.body.context.videoId;

  const decoded = jwt.decode(accessKey, jwtSecret);
  if (!decoded || !decoded.userAddress || !decoded.networkId) {
    return res.status(500).json({msg: 'Error', err: 'Invalid accessKey'});
  }

  const userAddress = decoded.userAddress;
  const networkId = decoded.networkId;

  // Check if correct information is enchoded in the accessKey
  if (!userAddress || !networkId ) {
    return res.status(500).json({msg: 'Error', err: 'Invalid accessKey'});
  }

  // Check if the video exists
  const videoInfo = await LivepeerVideoModel.findOne({ videoId: videoId}).exec();
  if (!videoInfo) {
    return res.status(404).send({err: 'Not found'});
  }

  // Check if you are the owner of the video
  if (videoInfo.ownerAddress.toLowerCase() == userAddress.toLowerCase()) {
    return res.status(200).send({msg: 'Video is your own'});
  }

  // Check if the video owner offers all video for free
  if (videoInfo.isPaid === false) {
    return res.status(200).send({msg: 'Video is free'});
  }

  // Get the price of the video
  const pricingInfo = await LivepeerVideoPricing.findOne({ ownerAddress: ownerAddress, networkId: networkId }).exec();

  // If not pricing info found, the video is free
  if (!pricingInfo) {
    return res.status(200).send({msg: 'Video is free'});
  }
  const tokenName = pricingInfo.tokenName;

  // Check if the user is currently paying for the owner, using subgraph
  const superfluidSubgrahApiURL = config.network[networkId].superfluidSubgrahApiURL;
  if (!superfluidSubgrahApiURL) {
    return res.status(500).json({msg: 'Error', err: 'Could not get data based on networkId'});
  }

  // Call subgraph API to find out whether the user is paying for the owner
  const subgraphQuery = `
{
  streams(where: {
      sender: "${userAddress}",
      receiver: "${ownerAddress}",
      token_: {symbol: "${tokenName}"},
      currentFlowRate_gt: "0"
    }) {
    currentFlowRate
    token {
      symbol
    }
    sender {
      id
    }
    receiver {
      id
    }
  }
}
  `;

  // console.log(subgraphQuery);

  try {
    const subgraphRes = await axios.post(superfluidSubgrahApiURL, { query: subgraphQuery });
    if (!subgraphRes.data.data || !subgraphRes.data.data.streams) {
      return res.status(500).json({msg: 'Error', err: 'Could not get paying info'});
    }
    const list = subgraphRes.data.data.streams;
    if (list.length === 0) {
      return res.status(500).json({msg: 'Not Paying', err: 'Viewer is not paying for the owner'});
    }
    const payingPrice = list[0].currentFlowRate;
    if (payingPrice * 3600 < pricingInfo.pricePerHour) {
      return res.status(500).json({msg: 'Not Paying Enough', err: 'Viewer is not paying enough for the owner'});
    }
    return res.status(200).send({msg: 'Access granted.'});
  } catch (err) {
    // console.log(err);
    return res.status(500).json({msg: 'Error', err: 'Could not get paying info: ' + err});
  }

}
