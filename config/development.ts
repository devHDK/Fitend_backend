export = {
  redis: {
    host: 'redis',
    port: 6379
  },
  aws: {
    secrets: 'fitend/dev',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
    cloudfront: 'https://d20e02zksul93k.cloudfront.net/',
    bucket: 'fitend-dev',
    firebase: 'fitend/firebase/dev'
  }
}
