const aws = require('aws-sdk');
require('dotenv').config({path: './app.env'});

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-west-1'
})

console.log("Config: ", process.env.AWS_ACCESS_KEY);
const s3 = new aws.S3();

module.exports = s3;
