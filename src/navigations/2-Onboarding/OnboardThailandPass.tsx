import React from 'react'
import ThailandPassConsent from '../../components/th-pass/ThailandPassConsent'
import ThailandPassForm from '../../components/th-pass/ThailandPassForm'
import ThailandPassQrScanner from '../../components/th-pass/ThailandPassQrScanner'

export const OnboardThailandPassConsent = () => (
  <ThailandPassConsent next='OnboardThailandPassQrScanner' backLabel='research' />
)

export const OnboardThailandPassQrScanner = () => <ThailandPassQrScanner next='OnboardThailandPassForm' />

export const OnboardThailandPassForm: React.FC = (props) => <ThailandPassForm next='OnboardCoeLanding' {...props} />
