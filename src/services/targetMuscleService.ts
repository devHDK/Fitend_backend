import {TargetMuscle} from '../models/index'

async function findAll(): Promise<[{id: number; name: string}]> {
  try {
    return await TargetMuscle.findAll()
  } catch (e) {
    throw e
  }
}

export {findAll}
