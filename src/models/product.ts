import {IProductsList} from '../interfaces/products'
import {db} from '../loaders'

const tableName = 'Products'

async function findAll(): Promise<IProductsList> {
  try {
    return await db.query({
      sql: `SELECT t.id, t.name, t.price, t.originPrice, t.month, t.discountRate
            FROM ?? t
            WHERE t.isAvailable is TRUE`,
      values: [tableName]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, findAll}
