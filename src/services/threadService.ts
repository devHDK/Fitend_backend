import {Thread, User} from '../models/index'
import {IThreadFindAll, IThreadList, IThreadCreateOne, IThread, IThreadUpdateOne} from '../interfaces/thread'
import {firebase} from '../loaders'

async function create(options: IThreadCreateOne): Promise<void> {
  try {
    await Thread.create(options)
    const user = await User.findOne({id: options.userId})
    await firebase.sendToTopic(`trainer_${options.trainerId}`, {
      notification: {body: `${user.nickname}님이 새로운 스레드를 올렸어요`}
    })
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

async function deleteOne(id: number): Promise<void> {
  try {
    await Thread.deleteOne(id)
  } catch (e) {
    throw e
  }
}

export {create, findAll, findOne, updateOne, deleteOne}
