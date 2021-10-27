import React from 'react'
import ThailandPassConsent from '../../components/th-pass/ThailandPassConsent'
import ThailandPassForm from '../../components/th-pass/ThailandPassForm'
import ThailandPassQrScanner from '../../components/th-pass/ThailandPassQrScanner'

export const EditThailandPassConsent: React.FC = () => {
  return <ThailandPassConsent next='EditThailandPassQRScanner' backLabel='settings' />
}

export const EditThailandPassQRScanner: React.FC = () => {
  console.log('EditThailandPassQRScanner')
  return <ThailandPassQrScanner next='EditThailandPassForm' />
}

export const EditThailandPassForm: React.FC = (props) => {
  return <ThailandPassForm {...props} />
}
