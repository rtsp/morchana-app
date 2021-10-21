import React from 'react'
import { SafeAreaView, StatusBar, StyleProp, ViewStyle } from 'react-native'
import { COLORS } from '../styles'

const defaultStyle = { backgroundColor: COLORS.WHITE, flex: 1 }

export const WhiteBackground: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ children, style }) => {
  return (
    <SafeAreaView style={[defaultStyle, style]}>
      <StatusBar backgroundColor={'white'} barStyle='dark-content' />
      {children}
    </SafeAreaView>
  )
}
