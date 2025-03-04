import express from 'express'
import path from 'path'
import helmet from 'helmet'
import cors from 'cors'
import {assignId, morgan} from '../api/middlewares'
import {logger} from './'
import routes from '../api/routes'

const app = express()

app.enable('trust proxy')
app.set('etag', false)
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'ejs')

app.use(assignId)
app.use(cors())

app.use(
  morgan({
    skip: (req, res) =>
      req.originalUrl.includes('/swagger') || req.originalUrl.includes('/health') || res.statusCode > 300,
    stream: logger.infoStream
  })
)
app.use(
  morgan({
    skip: (req, res) => res.statusCode < 400,
    stream: logger.errorStream
  })
)
app.use(express.json({limit: '1mb'}))
app.use(express.urlencoded({extended: false}))
app.use(helmet())

app.get('/health', (req, res) => res.status(200).end())

routes(app)

export default app
