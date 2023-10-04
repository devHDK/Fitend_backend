import {Thread} from '../models/index'
import {IThreadFindAll, IThreadList, IThreadCreateOne} from '../interfaces/thread'

async function create(options: IThreadCreateOne): Promise<void> {
  try {
    await Thread.create(options)
  } catch (e) {
    throw e
  }
}

async function findAll(options: IThreadFindAll): Promise<IThreadList> {
  try {
    return await Thread.findAll(options)
  } catch (e) {
    throw e
  }
}

export {create, findAll}
