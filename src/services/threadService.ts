import {Thread} from '../models/index'
import {IThreadFindAll, IThreadList, IThreadCreateOne, IThread, IThreadUpdateOne} from '../interfaces/thread'

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

async function findOne(id: number): Promise<IThread> {
  try {
    return await Thread.findOne(id)
  } catch (e) {
    throw e
  }
}

async function updateOne(options: IThreadUpdateOne): Promise<void> {
  try {
    await Thread.updateOne(options)
  } catch (e) {
    throw e
  }
}

export {create, findAll, findOne, updateOne}
