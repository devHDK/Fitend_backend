import {Response} from 'express'
import {ProductService} from '../../../../services'

async function getProducts(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await ProductService.findAll()
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

export {getProducts}
