import {Franchise} from '../models'
import {IFranchise} from '../interfaces/franchise'

async function findAllForAdmin(): Promise<[IFranchise]> {
  try {
    return await Franchise.findAllForAdmin()
  } catch (e) {
    throw e
  }
}

export {findAllForAdmin}
