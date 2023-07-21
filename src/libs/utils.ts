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

function defaultWorkoutTimeFormatForPush(startDate: string, totalTime: string, title: string): string {
  const date = moment(startDate).format('M월 D일 (ddd)')
  const totalTimeArr = totalTime.split(':')
  const minute = moment().startOf('day').add(totalTimeArr[0], 'hour').add(totalTimeArr[1], 'minute').format('m분')
  return `${date} | ${minute} ${title}`
}

export {defaultTimeFormatForPush, changeTimeFormatForPush, defaultWorkoutTimeFormatForPush}
