const AWS = require('aws-sdk');
const keys = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
  region: 'eu-central-1',
});
module.exports = (app) => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuidv4()}.jpeg`;

    s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'blogster-bucket-74',
        ContentType: 'image/jpeg',
        Key: key,
      },
      (err, url) => {
        res.send({ key, url });
      }
    );
  });
};
