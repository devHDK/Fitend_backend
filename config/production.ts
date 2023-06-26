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
    cloudfront: 'https://djt0uuz3ub045.cloudfront.net/',
    bucket: 'fitend-prod',
    firebase: 'firebase/prod'
  }
}
