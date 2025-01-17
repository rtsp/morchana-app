import AsyncStorage from '@react-native-community/async-storage'
import _ from 'lodash'
import moment from 'moment-timezone'
import 'moment/locale/th'
import { useCallback, useEffect, useReducer, useRef } from 'react'
import I18n from '../../i18n/i18n'
import { getQRData, getTagData } from '../api'

type StatusCode = 'green' | 'yellow' | 'orange' | 'red'
type DecodedStatusCode = 'G' | 'Y' | 'O' | 'R'

interface QRData {
  data: {
    anonymousId: string
    code: StatusCode
    tag?: Tag
  }
  qr: {
    type: string
    base64: string
  }
}

export enum QR_STATE {
  LOADING = 'loading',
  FAILED = 'failed',
  NORMAL = 'normal',
  OUTDATE = 'outdate',
  EXPIRE = 'expire',
  NOT_VERIFIED = 'not_verified',
}

enum QR_ACTION {
  UPDATE = 'update',
  LOADING = 'loading',
}

type SelfQRType = {
  isLinked: boolean
  qrData?: SelfQR | null
  qrState?: QR_STATE
  error?: any
}

export const useSelfQR = () => {
  const [state, dispatch] = useReducer(
    (prevState: SelfQRType, action: { type: QR_ACTION; payload?: Partial<SelfQRType> }) => {
      switch (action.type) {
        case QR_ACTION.LOADING:
          return { ...prevState, qrState: QR_STATE.LOADING }
        case QR_ACTION.UPDATE:
          return { ...prevState, ...action.payload }
        default:
          return prevState
      }
    },
    {
      isLinked: false,
      qrData: null,
      qrState: QR_STATE.LOADING,
      error: null,
    },
  )
  const tlRef = useRef(0)

  const refreshQR = useCallback(async () => {
    clearTimeout(tlRef.current)
    dispatch({
      type: QR_ACTION.LOADING,
    })

    let error = null
    let isLinked = false
    let qrData = null
    let qrState
    try {
      const _qrData = (await getQRData()) as QRData
      qrData = _qrData ? await SelfQR.setCurrentQRFromQRData(_qrData) : null
    } catch (e) {
      console.error('cannot load qr', error)
      error = e
    }

    // try {
    //   const {
    //     data: { linked },
    //   } = await getUserLinkedStatus(userPrivateData.getAnonymousId())
    //   isLinked = linked
    // } catch (e) {
    //   console.error('cannot linked error', e)
    // }

    try {
      qrState = SelfQR.getCurrentState()
    } catch (e) {
      console.error('Cannot get qr', error)
      error = e
    }

    if (error && !qrData) {
      dispatch({
        type: QR_ACTION.UPDATE,
        payload: { qrState, error, isLinked },
      })
      tlRef.current = +setTimeout(refreshQR, 10 * 1000) // Retry after 10 sec
    } else {
      dispatch({
        type: QR_ACTION.UPDATE,
        payload: { qrData, qrState, error, isLinked },
      })
      tlRef.current = +setTimeout(refreshQR, 2 * 60 * 1000) // Update after 2 min
    }
  }, [])

  useEffect(() => {
    const setQRFromStorage = async () => {
      const qrData = await SelfQR.getCurrentQR()
      dispatch({ type: QR_ACTION.UPDATE, payload: { qrData } })
    }
    setQRFromStorage().then(() => refreshQR())
    return () => {
      clearTimeout(tlRef.current)
    }
  }, [refreshQR])

  return { ...state, refreshQR }
}

class QR {
  code: StatusCode = 'green'
  constructor(_code: keyof typeof STATUS_COLORS) {
    this.code = _code
  }
  getStatusColor() {
    return STATUS_COLORS[this.code]
  }
  getLevel() {
    return LEVELS[this.code]
  }
  getScore() {
    return SCORES[this.code]
  }
  getLabel() {
    return getLabel(this.code)
  }
}

interface Tag {
  id: string
  title: string
  description: string
  tagRole?: TagRole
  tagRoleId?: string
}

type TagRole = {
  id: string
  title: string
  color?: string
}

export class SelfQR extends QR {
  qrData: QRData
  tag?: Tag
  timestamp: number

  private static currentQR: SelfQR

  public static async getCurrentQR() {
    if (!this.currentQR) {
      try {
        const selfQRData = await AsyncStorage.getItem('selfQRData')
        if (selfQRData) {
          this.currentQR = new SelfQR(JSON.parse(selfQRData))
        }
      } catch (error) {}
    }
    return this.currentQR
  }

  public static async setCurrentQRFromQRData(qrData: QRData) {
    try {
      await AsyncStorage.setItem('selfQRData', JSON.stringify(qrData))
    } catch (error) {}
    this.currentQR = new SelfQR(qrData)
    return this.currentQR
  }

  public static getCurrentState() {
    if (!this.currentQR) {
      return QR_STATE.FAILED
    }
    const time = Date.now() - this.currentQR.timestamp
    if (time < 3 * 60 * 1000) {
      return QR_STATE.NORMAL
    }
    if (time < 10 * 60 * 1000) {
      return QR_STATE.OUTDATE
    }
    return QR_STATE.EXPIRE
  }

  constructor(qrData: QRData) {
    // console.log('SelfQR', qrData)
    super(qrData.data.code)
    this.qrData = qrData
    this.timestamp = Date.now()
    this.tag = qrData.data?.tag
  }
  getAnonymousId() {
    return this.qrData.data.anonymousId
  }
  getQRImageURL() {
    return `data:${this.qrData.qr.type};base64,` + this.qrData.qr.base64
  }
  getCreatedDate(): moment {
    return moment(this.timestamp).locale(I18n.locale || 'th')
  }
  getTagTitle(): string | undefined {
    return this.tag?.title
  }
  getTagDescription(): string | undefined {
    return this.tag?.tagRole?.title
  }
  getTagColor() {
    return this.tag?.tagRole?.color
  }
}

interface DecodedResult {
  _: [string, DecodedStatusCode, string | undefined, string | undefined]
  iat: number
  iss: string
}

export class QRResult extends QR {
  iat: number
  anonymousId: string
  tagId?: string
  age?: string
  iss: string
  constructor(decodedResult: DecodedResult) {
    super(CODE_MAP[decodedResult._[1]])
    this.anonymousId = decodedResult._[0]
    this.tagId = decodedResult._[2]
    this.age = decodedResult._[3]
    this.iat = decodedResult.iat
    this.iss = decodedResult.iss
  }
  getUserCreatedDate() {
    if (!this.age) {
      return null
    }
    return moment()
      .subtract(this.age, 'days')
      .locale(I18n.locale || 'th')
  }
  getCreatedDate(): moment {
    return moment(this.iat * 1000).locale(I18n.locale || 'th')
  }
  getTag(): Tag | undefined {
    if (!this.tagId) {
      return
    }
    return tagManager.getTag(this.tagId)
  }
  getAge(): string {
    return resolveAge(this.age)
  }
}
const resolveAge = (age: string) => {
  if (!age) return
  const mapAge = [
    ['y', I18n.t('year')],
    ['w', I18n.t('week')],
    ['d', I18n.t('day')],
    ['h', I18n.t('hour')],
    ['m', I18n.t('minute')],
    ['s', I18n.t('second')],
  ]
  return _.reduce(
    mapAge,
    (p, c) => {
      return p.replace(c[0], c[1])
    },
    age,
  )
}

const CODE_MAP: Record<DecodedStatusCode, StatusCode> = {
  G: 'green',
  Y: 'yellow',
  O: 'orange',
  R: 'red',
}

const STATUS_COLORS = {
  green: '#27C269',
  yellow: '#E5DB5C',
  orange: '#E18518',
  red: '#EC3131',
} as const

const LEVELS = {
  green: 1,
  yellow: 2,
  orange: 3,
  red: 4,
} as const

const SCORES = {
  green: 100,
  yellow: 80,
  orange: 50,
  red: 30,
} as const

const getLabel = (code: keyof typeof LEVELS) => {
  // console.log('getLabel', code)
  return {
    green: I18n.t('very_low_risk'),
    yellow: I18n.t('low_risk'),
    orange: I18n.t('medium_risk'),
    red: I18n.t('high_risk'),
  }[code]
}

type TagMeta = {
  tags: Tag[]
  tagRoles: TagRole[]
}

class TagManager {
  tagMeta?: TagMeta
  mapRoles: { [name: string]: TagRole } = {}
  mapTags: { [name: string]: Tag } = {}
  constructor() {
    this.load()
  }
  async load() {
    const str = await AsyncStorage.getItem('TagMeta')
    if (str) {
      this.tagMeta = JSON.parse(str)
    }
  }
  async update() {
    const result: TagMeta = await getTagData()
    this.tagMeta = result
    this.mapRoles = _.mapKeys(result.tagRoles, (r) => r.id)
    this.mapTags = _.mapKeys(result.tags, (r) => r.id)

    AsyncStorage.setItem('TagMeta', JSON.stringify(this.tagMeta))
  }
  getTag(tagId: string) {
    if (!this.tagMeta) {
      return
    }
    const resolveTag = (tag: Tag): Tag => {
      if (tag) {
        const r = {
          ...tag,
          tagRole: this.mapRoles[tag.tagRoleId + ''] || this.mapRoles.GEN,
        }
        delete r.tagRoleId
        return r
      }
      return tag
    }
    const tag = this.mapTags[tagId]
    return resolveTag(tag)
  }
}

export const tagManager = new TagManager()
