import { RSA } from 'react-native-rsa-native'
import { API_URL, SSL_PINNING_CERT_NAME } from '../config'
import { fetch } from 'react-native-ssl-pinning'
import { userPrivateData } from '../state/userPrivateData'

let publicKey: string | undefined
const refetchDDCPublicKey = async () => {
  try {
    const authToken = userPrivateData.getData('authToken')
    const resp = await fetch(API_URL + '/ddc/public_key', {
      method: 'GET',
      sslPinning: {
        certs: [SSL_PINNING_CERT_NAME],
      },
      headers: {
        Authorization: authToken ? 'Bearer ' + authToken : '',
        'Content-Type': 'application/json',
      },
    })
    if (resp.status === 200) {
      return await resp.text()
    }
  } catch (err) {
    console.log('fetch publicKey error', err)
  }
}

export const encryptMessage = async (message: string) => {
  if (!publicKey) {
    publicKey = await refetchDDCPublicKey()
  }
  if (!publicKey) {
    throw new Error('Public key not found')
  }
  return RSA.encrypt(message, publicKey)
}
