import aws from 'aws-sdk';

// Configure AWS SDK with your credentials
export const s3 = new aws.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.S3_REGION, // e.g., 'us-east-1'
    correctClockSkew: true
});