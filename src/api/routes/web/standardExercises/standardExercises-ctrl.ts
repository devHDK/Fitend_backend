import {Response} from 'express'
import * as Excel from 'xlsx'
import {StandardExerciseService} from '../../../../services'
import {IStandardExerciseUpload} from '../../../../interfaces/standardExercises'

async function postStandardExercises(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {name, nameEn, devisionId, trackingFieldId, targetMuscleIds, machineType, jointType} = req.options
    await StandardExerciseService.create({
      name,
      nameEn,
      devisionId,
      machineType,
      trackingFieldId,
      jointType,
      targetMuscleIds
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

async function postStandardExercisesUpload(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const data: IStandardExerciseUpload[] = await excelToData(req.files[0])
    const errorArr = await StandardExerciseService.uploadExcel(data)
    res.status(200).json(errorArr)
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

async function excelToData(file) {
  try {
    const fileData = Excel.readFile(file.path)
    const sheet = fileData.Sheets['엑셀 업로드']
    const rows: IStandardExerciseUpload[] = Excel.utils.sheet_to_json(sheet)
    return rows
  } catch (e) {
    throw e
  }
}

async function getStandardExercises(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, targetMuscleIds, devisionId, machineType, start, perPage} = req.options
    const ret = await StandardExerciseService.findAll({
      trainerId: req.userId,
      search,
      targetMuscleIds,
      devisionId,
      machineType,
      start,
      perPage
    })
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

async function getStandardExercisesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await StandardExerciseService.findOne({id: req.options.id, trainerId: req.userId})
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

async function putStandardExercisesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, name, nameEn, trackingFieldId, targetMuscleIds, devisionId, machineType, jointType} = req.options
    await StandardExerciseService.update({
      id,
      name,
      nameEn,
      trackingFieldId,
      targetMuscleIds,
      devisionId,
      machineType,
      jointType
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

export {
  postStandardExercises,
  postStandardExercisesUpload,
  getStandardExercises,
  getStandardExercisesWithId,
  putStandardExercisesWithId
}
