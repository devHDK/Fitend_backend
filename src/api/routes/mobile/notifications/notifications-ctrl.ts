import {Response} from 'express'
import {NotificationService} from '../../../../services'

async function getNotifications(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {start, perPage} = req.options
    const ret = await NotificationService.findAll({userId: req.userId, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getNotificationsConfirm(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await NotificationService.findConfirm(req.userId)
    res.status(200).json({isConfirm: ret})
  } catch (e) {
    next(e)
  }
}

async function putNotificationsConfirm(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await NotificationService.updateConfirmWithUserId(req.userId)
    res.status(200).json({isConfirm: ret})
  } catch (e) {
    next(e)
  }
}

async function putNotificationsSettings(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    await NotificationService.updateSettings(req.userId)
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {getNotifications, getNotificationsConfirm, putNotificationsConfirm, putNotificationsSettings}
