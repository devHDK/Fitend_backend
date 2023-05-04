import AWS from 'aws-sdk'
import config from 'config'
import moment from 'moment-timezone'
import {v4 as uuid} from 'uuid'

moment.tz.setDefault('Asia/Seoul')

const awsConfig: Dictionary = config.get('aws')
AWS.config.update({
  accessKeyId: awsConfig.accessKeyId,
  secretAccessKey: awsConfig.secretAccessKey,
  region: awsConfig.region,
  apiVersions: {
    s3: '2006-03-01'
  }
})
const s3 = new AWS.S3()

async function getSecretValue(secretName: string): Promise<any> {
  try {
    const clientSecretManager = new AWS.SecretsManager()
    const data = await clientSecretManager.getSecretValue({SecretId: secretName}).promise()
    if (data.SecretString) {
      return JSON.parse(data.SecretString)
    }
    throw new Error('NoSecretString')
  } catch (e) {
    if (e.code === 'DecryptionFailureException') throw e
    else if (e.code === 'InternalServiceErrorException') throw e
    else if (e.code === 'InvalidParameterException') throw e
    else if (e.code === 'InvalidRequestException') throw e
    else if (e.code === 'ResourceNotFoundException') throw e
    else if (e.code === 'UnrecognizedClientException') throw e
    throw e
  }
}

async function copyTempObject(path: string, prefix = ''): Promise<string> {
  try {
    if (!path) return path
    const url = new URL(path)
    return url.href
  } catch (e) {
    try {
      const targetKey = `${prefix}/${path}`
      const params = {
        Bucket: awsConfig.bucket,
        CopySource: `${awsConfig.tempBucket}/${path}`,
        Key: `${targetKey}`,
        CacheControl: 'max-age=31536000'
      }
      await s3.copyObject(params).promise()
      return `${awsConfig.cloudfront}/${targetKey}`
    } catch (e) {
      throw e
    }
  }
}

function generatePreSignedUrl(key: string, mimeType: string): Dictionary {
  try {
    const params = {
      Bucket: awsConfig.bucket,
      Key: key,
      ContentType: mimeType,
      Expires: 60
    }
    return {
      path: key,
      url: s3.getSignedUrl('putObject', params)
    }
  } catch (e) {
    throw e
  }
}

function dateToSplit(date): {year: string; month: string; day: string} {
  const dateArray = date.split('-')
  return {year: dateArray[0], month: dateArray[1], day: dateArray[2]}
}

async function s3UploadExcel(buf: string, nickname: string, dateTime: string): Promise<string> {
  try {
    const date = await moment().format('YYYY-MM-DD')
    const requestDate = await moment(dateTime).format('YYYY-MM-DD')
    const dateInfo = await dateToSplit(date)
    const requestDateInfo = await dateToSplit(requestDate)
    const title = `${requestDateInfo.year}년_${requestDateInfo.month}월_예약통계_${nickname}_${dateInfo.year}${
      dateInfo.month
    }${dateInfo.day}_${uuid()}`
    const key = `${title}.xlsx`
    const path = `files/${key}`
    const params = {
      Bucket: config.aws.bucket,
      Key: path,
      ContentType: 'application/vnd.ms-excel',
      ACL: 'public-read',
      Body: buf,
    }
    await s3.putObject(params).promise()
    return path
  }
  catch (e) {
    throw e
  }
}

export {getSecretValue, copyTempObject, generatePreSignedUrl, s3UploadExcel}
