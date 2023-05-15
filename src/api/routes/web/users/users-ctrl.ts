import {Response} from 'express'
import {UserService} from '../../../../services'

async function getUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {start, perPage} = req.options
    const ret = await UserService.findAllForTrainer({start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') {
      e.status = 404
      e.code = 1001
      e.message = '이메일 또는 비밀번호를 확인해주세요.'
    }
    next(e)
  }
}

export {
  getUsers
}
