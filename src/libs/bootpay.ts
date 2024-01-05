import {Bootpay} from '@bootpay/backend-js'
import {AccessTokenResponseParameters, ReceiptResponseParameters} from '@bootpay/backend-js/lib/response'

const apiKey = process.env.NODE_ENV === 'production' ? process.env.BOOTPAY_API_KEY : process.env.BOOTPAY_API_KEY_DEV
const privateKey =
  process.env.NODE_ENV === 'production' ? process.env.BOOTPAY_PRIVATE_KEY : process.env.BOOTPAY_PRIVATE_KEY_DEV

// 1. 토큰 발급
async function getAccessToken(): Promise<AccessTokenResponseParameters> {
  Bootpay.setConfiguration({
    application_id: apiKey,
    private_key: privateKey
  })
  try {
    const response = await Bootpay.getAccessToken()
    return response
  } catch (e) {
    console.log(e)
  }
}

// 2. 결제 단건 조회
async function getReceipt(options: {receiptId: string}): Promise<ReceiptResponseParameters> {
  Bootpay.setConfiguration({
    application_id: apiKey,
    private_key: privateKey
  })
  try {
    const {receiptId} = options
    await Bootpay.getAccessToken()
    const response = await Bootpay.receiptPayment(receiptId)
    return response
  } catch (e) {
    console.log(e)
  }
}

// 3. 결제 취소 (전액 취소 / 부분 취소)
async function cancel(options: {receiptId: string}): Promise<ReceiptResponseParameters> {
  Bootpay.setConfiguration({
    application_id: apiKey,
    private_key: privateKey
  })
  try {
    const {receiptId} = options
    await Bootpay.getAccessToken()
    const response = await Bootpay.cancelPayment({
      receipt_id: receiptId
    })
    return response
  } catch (e) {
    console.log(e)
  }
}

// 6. 서버 승인 요청
async function serverConfirm(options: {receiptId: string}): Promise<ReceiptResponseParameters> {
  Bootpay.setConfiguration({
    application_id: apiKey,
    private_key: privateKey
  })
  try {
    const {receiptId} = options
    await Bootpay.getAccessToken()
    const response = await Bootpay.confirmPayment(receiptId)
    return response
  } catch (e) {
    console.log(e)
  }
}

export {getAccessToken, getReceipt, cancel, serverConfirm}
