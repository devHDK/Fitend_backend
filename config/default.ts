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
  }
}
