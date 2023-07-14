import moment from 'moment-timezone'

moment.tz.setDefault('Asia/Seoul')
moment.locale('ko')

function defaultTimeFormatForPush(startTime: string): string {
  return moment(startTime).format('M월 D일 (ddd) | A h시')
}

function changeTimeFormatForPush(beforeTime: string, changeTime: string): string {
  const convertBeforeTime = moment(beforeTime).format('M/D hh:mm')
  const convertChangeTime = moment(changeTime).format('M/D hh:mm')
  return `${convertBeforeTime} → ${convertChangeTime}`
}

export {defaultTimeFormatForPush, changeTimeFormatForPush}
