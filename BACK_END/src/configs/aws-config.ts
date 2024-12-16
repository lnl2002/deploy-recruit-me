import AWS from 'aws-sdk';

AWS.config.update({
  region: process.env.S3_REGION_TEXTRACT_SINGAPORE,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

export const textract = new AWS.Textract();
