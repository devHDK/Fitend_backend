import * as dotenv from 'dotenv'

dotenv.config()

export = {
  database: {
    connectionLimit: 20,
    timezone: 'utc',
    charset: 'utf8mb4',
    debug: []
  },
  swagger: {
    id: 'raid',
    password: 'raid0323'
  },
  popbill: {
    linkId: 'MYPT',
    secretKey: process.env.POPBILL_SECRET_KEY,
    corporateNumber: '3062975583',
    senderPhone: '07080953850',
    testSenderPhone: '07080953850'
  }
}
