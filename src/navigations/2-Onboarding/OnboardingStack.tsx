import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { OnboardBluetooth } from './OnboardBluetooth'
import { OnboardCoeChecking } from './OnboardCoeChecking'
import { OnboardCoeLanding } from './OnboardCoeLanding'
import { OnboardComplete } from './OnboardComplete'
import { OnboardEnterQuestion } from './OnboardEnterQuestion'
import { OnboardFace } from './OnboardFace'
import { OnboardFaceCamera } from './OnboardFaceCamera'
import { OnboardLocation } from './OnboardLocation'
import { OnboardMotion } from './OnboardMotion'
import { OnboardNotification } from './OnboardNotification'
import { OnboardProgressing } from './OnboardProgressing'
import {
  OnboardThailandPassConsent,
  OnboardThailandPassForm,
  OnboardThailandPassQrScanner,
} from './OnboardThailandPass'

const Stack1 = createStackNavigator()
const OnboardFaceStack = () => {
  return (
    <Stack1.Navigator headerMode='none'>
      <Stack1.Screen name='OnboardFace' component={OnboardFace} />
      <Stack1.Screen name='OnboardFaceCamera' component={OnboardFaceCamera} />
    </Stack1.Navigator>
  )
}

const Stack = createStackNavigator()
export const OnboardingStack = () => {
  return (
    <Stack.Navigator headerMode='none'>
      <Stack.Screen name='OnboardFaceStack' component={OnboardFaceStack} />
      <Stack.Screen name='OnboardLocation' component={OnboardLocation} />
      <Stack.Screen name='OnboardBluetooth' component={OnboardBluetooth} />
      <Stack.Screen name='OnboardMotion' component={OnboardMotion} />
      <Stack.Screen name='OnboardNotification' component={OnboardNotification} />
      <Stack.Screen name='OnboardProgressing' component={OnboardProgressing} />
      <Stack.Screen name='OnboardComplete' component={OnboardComplete} />
      <Stack.Screen name='OnboardEnterQuestion' component={OnboardEnterQuestion} />
      <Stack.Screen name='OnboardThailandPassConsent' component={OnboardThailandPassConsent} />
      <Stack.Screen name='OnboardCoeChecking' component={OnboardCoeChecking} />
      <Stack.Screen name='OnboardThailandPassQrScanner' component={OnboardThailandPassQrScanner} />
      <Stack.Screen name='OnboardThailandPassForm' component={OnboardThailandPassForm} />
      <Stack.Screen name='OnboardCoeLanding' component={OnboardCoeLanding} />
    </Stack.Navigator>
  )
}
