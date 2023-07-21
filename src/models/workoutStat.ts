import {PoolConnection} from 'mysql'
import {db} from '../loaders'

const tableName = 'WorkoutsStats'

async function upsertOne(
  options: {
    userId: number
    franchiseId: number
    month: string
    monthCount?: number
    doneCount?: number
  },
  connection: PoolConnection
): Promise<void> {
  try {
    const {userId, franchiseId, month, monthCount, doneCount} = options
    await db.query({
      connection,
      sql: `INSERT INTO ?? 
            SET ? ${monthCount && monthCount > 0 ? `,monthCount = monthCount + ${monthCount}` : ``} 
            ${doneCount && doneCount > 0 ? `,doneCount = doneCount + ${doneCount}` : ``}
            ON DUPLICATE KEY UPDATE 
            ${monthCount ? `monthCount = monthCount + ${monthCount}` : ``} 
            ${doneCount ? `doneCount = doneCount + ${doneCount}` : ``}`,
      values: [tableName, {userId, franchiseId, month}]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, upsertOne}
