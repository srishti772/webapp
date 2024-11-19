const { SNSClient } = require('@aws-sdk/client-sns');
require("dotenv").config();

const snsClient = new SNSClient({ 
    region: process.env.AWS_REGION});

module.exports = snsClient;
