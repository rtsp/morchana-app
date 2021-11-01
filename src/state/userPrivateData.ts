import { RELATIVE_FACE_PATH } from './../navigations/const'
import RNFS from 'react-native-fs'
import SInfo from 'react-native-sensitive-info'
import { HookState, createUseHookState } from '../utils/hook-state'
import { Platform } from 'react-native'
import { registerDevice } from '../api'

const USER_DATA_KEY = '@USER_PRIVATE_DATA'

type valueof<T> = T[keyof T]
interface UserData {
  id: string
  anonymousId: string
  coeNo?: string
  coeRfNo?: string
  faceURI?: string
  version?: number
  authToken?: string
}

const SINFO_OPTIONS = {
  sharedPreferencesName: 'ThaiAlert.UserPrivateData',
  keychainService: '@ThaiAlert/UserPrivateData',
}
const LATEST_VERSION = 3

class UserPrivateData extends HookState {
  data: UserData
  constructor() {
    super('UserPrivateData')
    // @ts-ignore
    this.data = {}
  }

  async save() {
    super.save()
    try {
      return SInfo.setItem(USER_DATA_KEY, JSON.stringify(this.data), SINFO_OPTIONS)
    } catch (e) {
      console.log('save failed')
    }
  }
  async load() {
    const userDataString = await SInfo.getItem(USER_DATA_KEY, SINFO_OPTIONS)
    if (userDataString) {
      this.data = JSON.parse(userDataString)
    }

    if (!this.data) {
      this.data = {
        anonymousId: '',
        id: '',
      }
    }

    try {
      const { userId, anonymousId, token } = await registerDevice()
      this.data.id = userId
      this.data.anonymousId = anonymousId
      this.data.version = LATEST_VERSION
      this.data.authToken = token
      return this.save()
    } catch (e) {
      console.error('ERROR REGISTER :', e)
    }

    return null
  }

  getId = () => {
    return this.data.id
  }
  getAnonymousId = () => {
    return this.data.anonymousId
  }
  getData = (key: keyof UserData) => {
    return this.data && this.data[key]
  }
  getFace() {
    const uri = this.getData('faceURI')
    if (!uri) return null
    const dataPath = `${RNFS.DocumentDirectoryPath}/${uri}`
    if (Platform.OS === 'android') {
      return 'file://' + dataPath
    }
    return dataPath
  }
  setData(key: keyof UserData, value: valueof<UserData>) {
    ;(this.data as any)[key] = value
    return this.save()
  }
  setFace(uri: string, { isTempUri }: { isTempUri: boolean }) {
    if (!uri) {
      throw new Error('Uri not found')
    }
    if (isTempUri) {
      const newFilePath = `${Date.now()}-${RELATIVE_FACE_PATH}`
      let dataPath = `${RNFS.DocumentDirectoryPath}/${newFilePath}`
      dataPath = Platform.OS === 'android' ? `file://${dataPath}` : dataPath
      RNFS.copyFile(uri, dataPath)
      return this.setData('faceURI', newFilePath)
    }
    return this.setData('faceURI', uri)
  }
}

export const userPrivateData = new UserPrivateData()
export const useUserPrivateData = createUseHookState<UserData>(userPrivateData)
