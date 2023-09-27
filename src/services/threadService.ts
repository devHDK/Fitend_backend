import {Thread} from '../models/index'
import {IThreadFindAll, IThreadList} from '../interfaces/thread'

async function findAll(options: IThreadFindAll): Promise<IThreadList> {
  try {
    return await Thread.findAll(options)
  } catch (e) {
    throw e
  }
}

export {findAll}
