import multer from 'multer'
import {v4 as uuid} from 'uuid'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp')
  },
  filename: (req, file, cb) => {
    cb(null, uuid())
  }
})

const upload = multer({ storage: storage })

export default (names) => {
  if (names.length === 1) {
    return upload.array(names[0])
  }
  return upload.fields(names.map(name => ({name})))
}