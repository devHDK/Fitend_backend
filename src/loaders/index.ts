import * as aws from './aws'
import * as logger from './logger'
import * as mysql from './mysql'
import * as firebase from './firebase'
import express from './express'

export async function init(): Promise<void> {
  await Promise.all([mysql.init(), firebase.init()])
}

export {aws, logger, mysql as db, firebase, express}
