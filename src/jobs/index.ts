import Agenda from 'agenda'
import config from 'config'
import moment from 'moment-timezone'

moment.tz.setDefault('Asia/Seoul')

const mongoDbConfig: Dictionary = config.get('mongodb')
const mongoConnectionString = mongoDbConfig.agenda

const updateStoresUsersMissionInfoJob = 'update storesUsers mission info'

const agenda = new Agenda({db: {address: mongoConnectionString, options: {useUnifiedTopology: true}}})

async function getStoreMissionSetting() {
  try {
    console.log('job success')
  } catch (e) {
    console.error(e)
  }
}

if (process.env.NODE_ENV !== 'test') {
  ;(async function generateAgenda(): Promise<void> {
    agenda.define(
      updateStoresUsersMissionInfoJob,
      {priority: 'high', concurrency: 1},
      async (job) => await getStoreMissionSetting()
    )
    await agenda.start()
    await agenda.every('0 * * * *', updateStoresUsersMissionInfoJob, null, {timezone: 'Asia/Seoul'})
    return agenda
  })()
}

export {agenda}
