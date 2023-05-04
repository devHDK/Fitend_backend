import {init as initLoaders} from '../src/loaders'

export const mochaHooks = {
  async beforeAll(): Promise<void> {
    await initLoaders()
  }
}
