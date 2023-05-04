import config from 'config'
import mysql, {PoolConnection} from 'mysql'
import {logger} from './'
import {getSecretValue} from './aws'
import {code as Code} from '../libs'

const awsSecrets: string = config.get('aws.secrets')
const dbConfig: Dictionary = config.get('database')
const poolCluster = mysql.createPoolCluster()

interface IQuery {
  connection?: PoolConnection
  sql: string
  values?: any[]
  stringifyObjects?: boolean
  timeZone?: string
  nestTables?: any
}

function typeCast(field, next) {
  if ((field.type === 'TINY' || field.type === 'TINYINT') && field.length === 1) {
    return field.string() === '1'
  }
  if (field.type === 'JSON') {
    const json = JSON.parse(field.string())
    if (Array.isArray(json)) return json.filter((i) => i)
    return json
  }
  return next()
}

async function init(): Promise<void> {
  try {
    const {mysqlUsername, mysqlPassword, mysqlHost, mysqlDbname, mysqlPort} = await getSecretValue(awsSecrets)
    const config = {
      host: mysqlHost,
      port: mysqlPort,
      user: mysqlUsername,
      password: mysqlPassword,
      database: mysqlDbname,
      ...dbConfig
    }
    if (process.env.NODE_ENV === 'production') {
      poolCluster.add('MASTER', {...config, typeCast})
      // poolCluster.add('SLAVE1', {...config.database.slave1, typeCast})
    } else {
      poolCluster.add('MASTER', {...config, typeCast})
    }
    logger.debug('Mysql loaded')
  } catch (e) {
    throw e
  }
}

async function query(options: IQuery, pattern = '*'): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const target: mysql.Pool | PoolConnection = options.connection ? options.connection : poolCluster.of(pattern)
      const sql = mysql.format(options.sql, options.values, options.stringifyObjects, options.timeZone)
      logger.debug(sql)
      target.query({sql, nestTables: options.nestTables}, (eor, results) => {
        if (eor) reject(eor)
        else resolve(results)
      })
    } catch (e) {
      reject(e)
    }
  })
}

async function getConnection(): Promise<PoolConnection> {
  return new Promise((resolve, reject) => {
    try {
      poolCluster.getConnection((e, connection) => {
        if (e) reject(e)
        else {
          resolve(connection)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

async function rollback(connection: PoolConnection): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      connection.rollback((e) => {
        if (e) reject(e)
        else {
          connection.release()
          resolve()
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

async function beginTransaction(): Promise<PoolConnection> {
  return new Promise((resolve, reject) => {
    try {
      getConnection()
        .then((connection) => {
          connection.beginTransaction((e) => {
            if (e) reject(rollback(connection))
            else resolve(connection)
          })
        })
        .catch((e) => reject(e))
    } catch (e) {
      reject(e)
    }
  })
}

async function commit(connection: PoolConnection): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      connection.commit((e) => {
        if (e) reject(rollback(connection))
        else {
          connection.release()
          resolve()
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

function reduceNull(rows: Array<any>, property: string, key: string, keyToInt?: boolean): Array<any> {
  try {
    return rows.map((row) => {
      if (!Array.isArray(row[property])) {
        row[property] = Object.keys(row[property]).reduce((prev, curr) => {
          if (curr !== 'null') {
            const newItem = row[property][curr]
            newItem[key] = keyToInt ? parseInt(curr, 10) : curr
            prev.push(newItem)
          }
          return prev
        }, [])
      }
      row[property] = row[property].reduce((prev, curr) => {
        if (curr[key]) prev.push(curr)
        return prev
      }, [])
      return row
    })
  } catch (e) {
    return rows
  }
}

async function generateRandomCode(tableName: string, digit: number, prefix = '', key = 'id'): Promise<number> {
  try {
    const id = Code.generateRandomCode(digit)
    const rows = await query({
      sql: `SELECT ?? FROM ?? WHERE ?? = ?`,
      values: [key, tableName, key, prefix + id]
    })
    if (rows.length) {
      return await generateRandomCode(tableName, digit, prefix, key)
    }
    return id
  } catch (e) {
    throw e
  }
}

async function generateRandomHash(tableName: string, digit: number, key = 'id'): Promise<string> {
  try {
    const id = Code.generateRandomHash(digit)
    const rows = await query({
      sql: `SELECT ?? FROM ?? WHERE ?? = ?`,
      values: [key, tableName, key, id]
    })
    if (rows.length) {
      return await generateRandomHash(tableName, digit, key)
    }
    return id
  } catch (e) {
    throw e
  }
}

export {
  init,
  query,
  getConnection,
  beginTransaction,
  commit,
  rollback,
  reduceNull,
  generateRandomCode,
  generateRandomHash
}
