import nanoid from 'nanoid'
import DeviceInfo from 'react-native-device-info'
import { fetch } from 'react-native-ssl-pinning'
import i18n from '../i18n/i18n'
import {
  API_URL,
  SHOP_API_KEY,
  SHOP_API_NAME,
  SHOP_API_URL,
  SHOP_QR_PINNING_CERT,
  SSL_PINNING_CERT_NAME,
} from './config'
import { DEFAULT_NATIONALITIES, DEFAULT_PREFIX_NAME } from './navigations/const'
import { userPrivateData } from './state/userPrivateData'
import { encryptMessage } from './utils/crypto'
import { ThailandPassProfile, ThailandPassResponse } from './services/use-vaccine'

export const getAnonymousHeaders = () => {
  const authToken = userPrivateData.getData('authToken')
  if (!authToken) {
    throw new Error('no authToken')
  }
  return {
    Authorization: 'Bearer ' + authToken,
    'X-TH-ANONYMOUS-ID': userPrivateData.getAnonymousId(),
    'Content-Type': 'application/json',
    'Content-Language': i18n.locale === 'th' ? 'th-TH' : 'en-US',
  }
}

export const fetchJWKs = async () => {
  const resp = await fetch(API_URL + `/.well-known/jwks.json`, {
    method: 'GET',
    sslPinning: {
      certs: [SSL_PINNING_CERT_NAME],
    },
    headers: {
      'X-TH-ANONYMOUS-ID': userPrivateData.getAnonymousId(),
      'Content-Type': 'application/json',
    },
  })
  if (resp.status === 200) {
    return resp.json()
  }
}

export const registerDevice = async (): Promise<{
  userId: string
  anonymousId: string
  token: string
}> => {
  const resp = await fetch(API_URL + `/registerDevice`, {
    method: 'POST',
    sslPinning: {
      certs: [SSL_PINNING_CERT_NAME],
    },
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ deviceId: DeviceInfo.getUniqueId() }),
  })
  const result = await resp.json()
  if (!result.anonymousId) {
    throw new Error('RegisterDevice failed')
  }

  return { anonymousId: result.anonymousId, token: result.token, userId: '' }
}

export const requestOTP = async (mobileNo: string) => {
  const resp = await fetch(API_URL + `/requestOTP`, {
    method: 'POST',
    sslPinning: {
      certs: [SSL_PINNING_CERT_NAME],
    },
    headers: getAnonymousHeaders(),
    body: JSON.stringify({
      mobileNo /* use to send sms only, store only hashed phone number in server */,
    }),
  })
  const result = await resp.json()

  return result.status === 'ok'
}

/*
   verify otp and save encryptedMobileNo
 */
export const mobileParing = async (mobileNo: string, otpCode: string) => {
  const encryptedMobileNo = await encryptMessage(mobileNo)
  const resp = await fetch(API_URL + `/mobileParing`, {
    method: 'POST',
    sslPinning: {
      certs: [SSL_PINNING_CERT_NAME],
    },
    headers: getAnonymousHeaders(),
    body: JSON.stringify({ otpCode, encryptedMobileNo }),
  })
  const result = await resp.json()
  if (result.status === 'ok') {
    userPrivateData.setData('authToken', result.token)
    return true
  }
  return false
}

export const updateUserData = async (data: { [key: string]: any }) => {
  if (!userPrivateData.getData('authToken')) return null

  const resp = await fetch(API_URL + `/userdata`, {
    method: 'POST',
    sslPinning: {
      certs: [SSL_PINNING_CERT_NAME],
    },
    headers: getAnonymousHeaders(),
    body: JSON.stringify({ data }),
  })
  return resp.json()
}

export const getQRData = async () => {
  const resp = await fetch(API_URL + `/qr`, {
    method: 'GET',
    sslPinning: {
      certs: [SSL_PINNING_CERT_NAME],
    },
    headers: getAnonymousHeaders(),
  })
  const result = await resp.json()

  return result
}

export const getTagData = async () => {
  const resp = await fetch(API_URL + `/tags`, {
    method: 'GET',
    sslPinning: {
      certs: [SSL_PINNING_CERT_NAME],
    },
    headers: getAnonymousHeaders(),
  })
  if (resp.status !== 200) {
    throw new Error('Invalid')
  }
  const result = await resp.json()

  return result as any
}

export const scan = async (
  anonymousList: string[],
  location: { latitude: number; longitude: number; accuracy: number },
  type: 'bluetooth' | 'qrscan',
) => {
  return fetch(API_URL + '/scan', {
    method: 'POST',
    sslPinning: {
      certs: [SSL_PINNING_CERT_NAME],
    },
    headers: getAnonymousHeaders(),
    body: JSON.stringify({
      meetId: nanoid(),
      timestamp: new Date().toISOString(),
      meetWithIds: anonymousList,
      location,
      type,
    }),
  })
}

export const getUserLinkedStatus = async (aId: string) => {
  const resp = await fetch(API_URL + '/get-user-linked-status', {
    method: 'POST',
    sslPinning: {
      certs: [SSL_PINNING_CERT_NAME],
    },
    headers: getAnonymousHeaders(),
    body: JSON.stringify({
      aId,
    }),
  })
  const result = await resp.json()

  return result as any
}

export const beaconinfo = async (uuid: string, major: string, minor: string) => {
  const resp = await fetch(
    SHOP_API_URL +
      '/beaconinfo?' +
      new URLSearchParams({
        uuid,
        major,
        minor,
      }),
    {
      method: 'GET',
      headers: {
        'X-TH-SHOP-API-USER': SHOP_API_NAME,
        'X-TH-SHOP-API-KEY': SHOP_API_KEY,
      },
      sslPinning: {
        certs: [SHOP_QR_PINNING_CERT],
      },
    },
  )
  const result = await resp.json()
  return result as any
}

export const getPrefixNameList = async () => {
  try {
    const resp = await fetch(`${API_URL}/prefix-name`, {
      method: 'GET',
      sslPinning: {
        certs: [SSL_PINNING_CERT_NAME],
      },
      headers: getAnonymousHeaders(),
    })

    if (resp.status !== 200) return DEFAULT_PREFIX_NAME[i18n.locale]
    const items = (await resp.json()) as { label: string; value: string }[]
    if (!Array.isArray(items)) return []
    return items
  } catch (e) {
    console.error('error_get_prefix_name', e)
  }
  return DEFAULT_PREFIX_NAME[i18n.locale]
}

export const getNationalityList = async () => {
  try {
    const resp = await fetch(`${API_URL}/nationalities`, {
      method: 'GET',
      sslPinning: {
        certs: [SSL_PINNING_CERT_NAME],
      },
      headers: getAnonymousHeaders(),
    })

    if (resp.status !== 200) return DEFAULT_NATIONALITIES
    const items = (await resp.json()) as { label: string; value: string }[]
    if (!Array.isArray(items)) return []
    return items
  } catch (e) {
    console.error('error_get_nationality', e)
  }
  return DEFAULT_NATIONALITIES
}

export const sendThailandPassForm = async (data: ThailandPassProfile): Promise<ThailandPassResponse> => {
  try {
    const resp = await fetch(`${API_URL}/th-pass-form`, {
      method: 'POST',
      sslPinning: {
        certs: [SSL_PINNING_CERT_NAME],
      },
      headers: getAnonymousHeaders(),
      body: JSON.stringify(data),
    })

    return (await resp.json()) as ThailandPassResponse
  } catch (e) {
    console.error('error_send_th_pass_form', e)
  }
  return { status: 'error', error: i18n.t('system_error') }
}

export const getThailandPass = async (param: { uri: string }): Promise<ThailandPassResponse> => {
  try {
    const resp = await fetch(`${API_URL}/th-pass`, {
      method: 'POST',
      sslPinning: {
        certs: [SSL_PINNING_CERT_NAME],
      },
      headers: getAnonymousHeaders(),
      body: JSON.stringify(param),
    })
    return (await resp.json()) as ThailandPassResponse
  } catch (e) {
    console.error(e)
  }

  return { status: 'error', error: i18n.t('system_error') }
}
