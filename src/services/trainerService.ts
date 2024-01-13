import moment from 'moment-timezone'
import {
  ITrainer,
  ITrainerDetail,
  ITrainerFindAllForAdmin,
  ITrainerList,
  ITrainerListForAdmin,
  ITrainerDetailForUser,
  ITrainerListForUser
} from '../interfaces/trainer'
import {EventSchedule, Franchise, Meeting, Reservation, Ticket, Trainer, User} from '../models/index'
import {code as Code, jwt as JWT} from '../libs'
import {passwordIterations} from '../libs/code'
import {db} from '../loaders'

moment.tz.setDefault('Asia/Seoul')

async function create(options: {nickname: string; email: string; password: string}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {password, ...data} = options
    const passwordHash = Code.createPasswordHash(password, passwordIterations.web)
    await Trainer.create({password: JSON.stringify(passwordHash), ...data}, connection)
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    if (e.code === 'ER_DUP_ENTRY') {
      throw new Error('already_in_use')
    }
    throw e
  }
}

async function signIn(options: {email: string; password: string}): Promise<{accessToken: string; trainer: ITrainer}> {
  try {
    const {email, password} = options
    const trainer = await Trainer.findOne({email})
    if (
      trainer &&
      Code.verifyPassword(password, trainer.password.password, trainer.password.salt, Code.passwordIterations.web)
    ) {
      const accessToken = await JWT.createAccessTokenForTrainer({id: trainer.id, franchiseId: 1})
      delete trainer.password
      return {accessToken, trainer}
    }
    throw new Error('not_found')
  } catch (e) {
    throw e
  }
}

async function findAll(franchiseId: number): Promise<[ITrainerList]> {
  try {
    return await Trainer.findAll(franchiseId)
  } catch (e) {
    throw e
  }
}

async function findAllForUserSelect(): Promise<[ITrainerListForUser]> {
  try {
    return await Trainer.findAllForUserSelect()
  } catch (e) {
    throw e
  }
}

async function findAllTrainerScheduleWithId(options: {
  startDate: string
  endDate: string
  trainerId: number
}): Promise<
  {
    startDate: string
    schedules: {
      startTime: string
      endTime: string
      type: string
    }[]
  }[]
> {
  try {
    const {startDate, endDate, trainerId} = options

    const retArr: {startDate: string; schedules: {startTime: string; endTime: string; type: string}[]}[] = []

    const diff = moment.duration(moment(endDate).diff(moment(startDate))).asDays()

    const reservation = await Reservation.findAllWithTrainerIdForMeetingSelect({startDate, endDate, trainerId})
    const meeting = await Meeting.findAllWithTrainerIdForMeetingSelect({startDate, endDate, trainerId})
    const event = await EventSchedule.findAllWithTrainerIdForMeetingSelect({startDate, endDate, trainerId})

    for (let index = 0; index < diff + 1; index++) {
      const date = moment(startDate).add(index, 'day').format('YYYY-MM-DD')
      const reservationIndex = reservation.findIndex((element) => element.startDate === date)
      const meetingIndex = meeting.findIndex((element) => element.startDate === date)
      const eventIndex = event.findIndex((element) => element.startDate === date)
      const ret: {startDate: string; schedules: {startTime: string; endTime: string; type: string}[]} = {
        startDate: date,
        schedules: []
      }

      if (reservationIndex !== -1) {
        ret.schedules = [...ret.schedules, ...reservation[reservationIndex].data]
      }

      if (meetingIndex !== -1) {
        ret.schedules = [...ret.schedules, ...meeting[meetingIndex].data]
      }
      if (eventIndex !== -1) {
        ret.schedules = [...ret.schedules, ...event[eventIndex].data]
      }

      if (ret.schedules.length > 0) {
        retArr.push(ret)
      }
    }
    return retArr
  } catch (e) {
    throw e
  }
}

async function findAllForAdmin(options: ITrainerFindAllForAdmin): Promise<ITrainerListForAdmin> {
  try {
    return await Trainer.findAllForAdmin(options)
  } catch (e) {
    throw e
  }
}

async function findOneWithIdForUser(id: number): Promise<ITrainerDetailForUser> {
  try {
    return await Trainer.findOneWithIdForUser(id)
  } catch (e) {
    throw e
  }
}

async function findOneWithIdForAdmin(id: number): Promise<ITrainerDetail> {
  try {
    const thisMonthStart = moment().startOf('month').format('YYYY-MM-DD')
    const thisMonthEnd = moment().add(1, 'day').format('YYYY-MM-DD')
    const lastMonthStart = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
    const lastMonthEnd = moment().subtract(1, 'month').endOf('month').add(1, 'day').format('YYYY-MM-DD')
    const trainer = await Trainer.findOneWithIdForAdmin(id)
    const franchiseInfo = await Franchise.findOneWithTrainerId(id)
    const fcThisMonthCount = await User.findActiveFitnessUsersForAdminWithTrainerId(id, thisMonthStart, thisMonthEnd)
    const fcLastMonthCount = await User.findActiveFitnessUsersForAdminWithTrainerId(id, lastMonthStart, lastMonthEnd)
    const ptThisMonthCount = await User.findActivePersonalUsersForAdminWithTrainerId(id, thisMonthStart, thisMonthEnd)
    const ptLastMonthCount = await User.findActivePersonalUsersForAdminWithTrainerId(id, lastMonthStart, lastMonthEnd)
    const fitnessActiveUsers = {thisMonthCount: fcThisMonthCount, lastMonthCount: fcLastMonthCount}
    const personalActiveUsers = {thisMonthCount: ptThisMonthCount, lastMonthCount: ptLastMonthCount}
    const reservations = await Reservation.findBetweenReservationWithTrainerIdForAdmin({
      startTime: moment(thisMonthStart).utc().format('YYYY-MM-DDTHH:mm:ss'),
      endTime: moment(thisMonthEnd).utc().format('YYYY-MM-DDTHH:mm:ss'),
      trainerId: id
    })
    const coaching = await Ticket.findFcTicketWithTrainerIdForAdmin({
      startTime: moment(thisMonthStart).utc().format('YYYY-MM-DDTHH:mm:ss'),
      endTime: moment(thisMonthEnd).utc().format('YYYY-MM-DDTHH:mm:ss'),
      trainerId: id
    })
    return {
      ...trainer,
      franchiseInfo,
      activeUsers: {fitnessActiveUsers, personalActiveUsers},
      thisMonthSession: {reservations, coaching}
    }
  } catch (e) {
    throw e
  }
}

async function updatePassword({
  trainerId,
  password,
  newPassword
}: {
  trainerId: number
  password: string
  newPassword: string
}): Promise<void> {
  try {
    const trainer = await Trainer.findOne({id: trainerId})
    if (
      trainer &&
      Code.verifyPassword(password, trainer.password.password, trainer.password.salt, Code.passwordIterations.web)
    ) {
      const passwordHash = Code.createPasswordHash(newPassword, passwordIterations.web)
      await Trainer.updateOne({id: trainerId, password: JSON.stringify(passwordHash)})
    } else throw new Error('not_found')
  } catch (e) {
    throw e
  }
}

export {
  create,
  signIn,
  findAll,
  findAllForAdmin,
  findAllForUserSelect,
  findAllTrainerScheduleWithId,
  findOneWithIdForUser,
  findOneWithIdForAdmin,
  updatePassword
}
