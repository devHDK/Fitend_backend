import moment from 'moment'
import {db} from '../loaders'
import {IPayrollCreateSave, IPayrollFindSave} from '../interfaces/payroll'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Payroll'

async function createPayrollSave(options: IPayrollCreateSave): Promise<void> {
  try {
    await db.query({
      sql: `INSERT INTO ?? SET ?`,
      values: [tableName, options]
    })
  } catch (e) {
    throw e
  }
}

async function findSavedPayroll(options: {trainerId: number; lastDate: Date}): Promise<IPayrollFindSave> {
  try {
    const {trainerId, lastDate} = options

    const [rows] = await db.query({
      sql: `SELECT * FROM ?? t WHERE t.trainerId = ? AND t.month = ?`,
      values: [tableName, trainerId, lastDate]
    })
    return rows
  } catch (e) {
    throw e
  }
}

async function updateSavedPayroll(options: IPayrollCreateSave): Promise<void> {
  try {
    const {trainerId, month} = options
    await db.query({
      sql: `UPDATE ?? t SET ? WHERE t.trainerId = ? AND t.month = ?`,
      values: [tableName, options, trainerId, month]
    })
  } catch (e) {
    throw e
  }
}

export {createPayrollSave, findSavedPayroll, updateSavedPayroll}
