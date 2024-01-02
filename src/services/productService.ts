import {Product} from '../models/index'
import {IProductsList} from '../interfaces/products'

async function findAll(): Promise<IProductsList> {
  try {
    return await Product.findAll()
  } catch (e) {
    throw e
  }
}

export {findAll}
