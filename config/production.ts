export = {
  database: {
    connectionLimit: 100,
    timezone: 'utc',
    charset: 'utf8mb4',
    debug: []
  },
  aws: {
    secrets: 'fitend/prod',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
    cloudfront: 'https://d20e02zksul93k.cloudfront.net/',
    bucket: 'fitend-prod',
    firebase: 'firebase/prod'
  },
  giftishow: {
    url: 'https://bizapi.giftishow.com/bizApi/'
  }
}
