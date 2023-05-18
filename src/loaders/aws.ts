import AWS from 'aws-sdk'
import config from 'config'
import moment from 'moment-timezone'

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

export {getSecretValue, generatePreSignedUrl}
