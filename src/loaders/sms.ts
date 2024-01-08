const popbill = require('popbill')

const IsTest = process.env.NODE_ENV !== 'production'
const config = require('../../config/default')

popbill.config({
  LinkID: config.popbill.linkId,
  SecretKey: config.popbill.secretKey,
  IsTest,
  defaultErrorHandler: (err) => {
    console.error(`err : [${err.code}] ${err.message}`)
  }
})
const messageService = popbill.MessageService()
const kakaoService = popbill.KakaoService()

async function sendSMS(phone, contents): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const senderPhone = IsTest ? config.popbill.testSenderPhone : config.popbill.senderPhone

      messageService.sendSMS(
        config.popbill.corporateNumber, //사업자 등록 번호
        senderPhone, //발신자 번호
        phone, //수신자 번호
        '', //수신자명
        contents, //메시지 내용
        '', //예약 문자 시간 (누락 시 즉시 전송)
        false, //광고 문자 여부
        (result) => {
          console.info(`[SMS] sendUser result : ${result}`)
          resolve(result)
        },
        (err) => {
          console.error(`[SMS] sendUser err : ${JSON.stringify(err)}`)
          reject(err)
        }
      )
    } catch (err) {
      console.error(`[SMS] sendUser err : ${JSON.stringify(err)}`)
      resolve(err)
    }
  })
}

async function sendKakao(phone, contents, templateCode): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const senderPhone = IsTest ? config.popbill.testSenderPhone : config.popbill.senderPhone

      kakaoService.sendATS_one(
        config.popbill.corporateNumber, //사업자 등록 번호
        templateCode, //알림톡 템플릿코드
        senderPhone, // 발신번호
        contents, // 알림톡 내용
        contents, // 대체문자 내용
        'A', // 대체문자 유형
        '', // 예약일시, 빈칸시 즉시전송
        phone, // 수신번호
        '', // 수신자명
        (result) => {
          console.info(`[SMS] sendUser result : ${result}`)
          resolve(result)
        },
        (err) => {
          console.error(`[SMS] sendUser err : ${JSON.stringify(err)}`)
          reject(err)
        }
      )
    } catch (err) {
      console.error(`[SMS] sendUser err : ${JSON.stringify(err)}`)
      resolve(err)
    }
  })
}

async function sendVerificationCodeWithMessage(phone: string, code: string): Promise<void> {
  const message = `[FITEND] 인증번호는 ${code} 입니다.`
  await sendSMS(phone, message)
}

export {sendSMS, sendKakao, sendVerificationCodeWithMessage}
