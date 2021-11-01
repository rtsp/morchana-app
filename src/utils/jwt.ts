import jwtDecode from 'jwt-decode'
import JwtUtils from 'react-native-jwt-verifier'
import I18n from '../../i18n/i18n'
import { fetchJWKs } from '../api'

let jwks: { x: any; y: any } | undefined

export const verifyToken = async (token: string) => {
  if (!jwks) jwks = (await fetchJWKs()) as { x: any; y: any }
  return jwks && JwtUtils.verify(token, jwks.x, jwks.y)
}

export const decodeJWT = (token: string) => {
  try {
    return jwtDecode(token)
  } catch (e) {
    console.error('decodeJWT', e, token)
    return { error: I18n.t('incorrect_qr') }
  }
}
