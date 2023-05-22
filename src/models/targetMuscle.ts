import {db} from '../loaders'

const tableName = 'TargetMuscles'

async function findAll(): Promise<[{id: number; name: string}]> {
  try {
    return await db.query({
      sql: `SELECT t.id, t.name
            FROM ?? t`,
      values: [tableName]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, findAll}
