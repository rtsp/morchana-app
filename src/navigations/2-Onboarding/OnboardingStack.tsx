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
import { OnboardNotification } from './OnboardNotification'
import { OnboardProgressing } from './OnboardProgressing'
import { OnboardQrScanner } from './OnboardQrScanner'
import { OnboardThailandPassConsent } from '../../components/th-pass/OnboardThailandPassConsent'

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
      <Stack.Screen name='OnboardNotification' component={OnboardNotification} />
      <Stack.Screen name='OnboardProgressing' component={OnboardProgressing} options={{ gesturesEnabled: false }} />
      <Stack.Screen name='OnboardComplete' component={OnboardComplete} options={{ gesturesEnabled: false }} />
      <Stack.Screen name='OnboardEnterQuestion' component={OnboardEnterQuestion} options={{ gesturesEnabled: false }} />
      <Stack.Screen
        name='OnboardThailandPassConsent'
        component={OnboardThailandPassConsent}
        options={{ gesturesEnabled: false }}
      />
      <Stack.Screen name='OnboardCoeChecking' component={OnboardCoeChecking} />
      <Stack.Screen name='OnboardQrScanner' component={OnboardQrScanner} />
      <Stack.Screen name='OnboardCoeLanding' component={OnboardCoeLanding} />
    </Stack.Navigator>
  )
}
