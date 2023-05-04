import * as dotenv from 'dotenv'

dotenv.config()

export = {
  database: {
    database: 'fitend',
    connectionLimit: 20,
    timezone: 'utc',
    charset: 'utf8mb4',
    debug: []
  },
  mongodb: {
    agenda: 'mongodb://localhost:27017/agenda'
  },
  redis: {
    host: 'localhost',
    port: 6379
  },
  swagger: {
    id: 'raid',
    password: 'raid0323'
  },
  aws: {
    secrets: 'fitend/dev',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
    tempBucket: 'fitend',
    cloudfront: 'https://',
    bucket: 'fitend-dev',
    serverKey: 'e86eb151-fb7a-473e-95a0-a80ca9f1456e',
    firebase: 'firebase/dev'
  }
}
