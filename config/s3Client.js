const { S3Client } = require('@aws-sdk/client-s3');
require("dotenv").config();

//const s3Client = new S3Client({ region: process.env.BUCKET_REGION });

  //testing client with credentials.. remove while deploying
  const s3Client = new S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

module.exports = s3Client;
