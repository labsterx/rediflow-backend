'use strict';

const jwt     = require('jsonwebtoken');  //https://npmjs.org/package/node-jsonwebtoken
const config  = require('../config');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');

const jwtSecret     = config.jwt.jwtSecret;
const metaMaskMessage = config.jwt.metaMaskMessage
const tokenExpires = config.jwt.tokenExpires

exports.signIn = async function (req, res) {
  const sig = req.body.sig;
  const user = req.body.user;
  const networkId = req.body.networkid;

  if (!sig || !user || !networkId) {
    res.status(500).send({err: 'invalid input'});
    return;
  }

  if (!config.supportedNetworkIds[networkId]) {
    res.status(400).json({msg: 'Error', err: `Network ${networkId} not supported`});
    return;
  }

  const msgBufferHex = ethUtil.bufferToHex(Buffer.from(metaMaskMessage, 'utf8'));
  const addr = sigUtil.recoverPersonalSignature({
    data: msgBufferHex,
    sig: sig
  });

  if (addr == user) {
  	const jwtData = {
  		userAddress: user,
      networkId: networkId
  	}
    const token = jwt.sign(jwtData, jwtSecret,  { expiresIn: tokenExpires });

    res.status(200).send({
      token: token,
    })

  } else {
    res.status(401).send({ err: 'Signature did not match.'});
  }
};

exports.validateHeaderParams = function (err, req, res, next) {

  console.log('validateHeaderParams: ', req);
  console.log('req.params: ', req.params);
  console.log('req.user: ', req.user);

  let error = false;

  if (!req.user || !req.user.userAddress || !req.user.networkId) {
    error = true;
    // console.log('Missing userAddress or NetworkId in header');
    return res.status(401).send({ err: 'Missing userAddress or NetworkId in header'});
  }
  if (req.params.networkid) {
    if (req.params.networkid !== req.user.networkId) {
      error = true;
      // console.log('networkid in param does not match networkid in header');
      return res.status(401).send({ err: 'networkid in param does not match networkid in header'});
    }
  }
  if (req.params.useraddress) {
    if (req.params.useraddress !== req.user.userAddress) {
      error = true;
      // console.log('useraddress in param does not match useraddress in header');
      return res.status(401).send({ err: 'useraddress in param does not match useraddress in header'});
    }
  }
  if (req.params.userAddress) {
    if (req.params.userAddress !== req.user.userAddress) {
      error = true;
      // console.log('useraddress in param does not match useraddress in header');
      return res.status(401).send({ err: 'useraddress in param does not match useraddress in header'});
    }
  }
  if (req.body.useraddress) {
    if (req.body.useraddress !== req.user.userAddress) {
      error = true;
      // console.log('useraddress in param does not match useraddress in header');
      return res.status(401).send({ err: 'useraddress in body does not match useraddress in header'});
    }
  }  
  if (req.body.userAddress) {
    if (req.body.userAddress !== req.user.userAddress) {
      error = true;
      // console.log('useraddress in param does not match useraddress in header');
      return res.status(401).send({ err: 'useraddress in body does not match useraddress in header'});
    }
  }

  if (error === false) {
    next();
  }

};

exports.refreshToken = function (req, res) {

	let token = null;
	const parts = req.headers.authorization.split(' ');
	if (parts && parts.length == 2) {
		const scheme = parts[0];
		const credentials = parts[1];

		if (/^Bearer$/i.test(scheme)) {
				token = credentials;
				const decoded = jwt.decode(token, jwtSecret);
				const user = decoded.userAddress;
        const networkId = decoded.networkId;
				const jwtData = {
  				userAddress: user,
          networkId: networkId
  			};
  			const newToken = jwt.sign(jwtData, jwtSecret, { expiresIn: tokenExpires });
  			res.json({ token: newToken });
		}
		else {
			res.status(500).send('Error passing headers');
			return;
		}
	}
	else {
		res.status(500).send('Error passing headers');
		return;
	}

};


