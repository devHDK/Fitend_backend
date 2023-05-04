import {ApiRouter} from '../../default'
import * as ctrl from './files-ctrl'

const getFilesUpload = new ApiRouter({
  name: 'upload',
  method: 'get',
  summary: 'Get pre-signed url',
  schema: 'common/files/GetFilesUploadRequest',
  tags: ['Files'],
  responses: {
    200: {schema: 'common/files/GetFilesUploadResponse'}
  },
  handler: ctrl.getFilesUpload
})

export {getFilesUpload}
