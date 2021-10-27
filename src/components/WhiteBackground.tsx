import React from 'react'
import { StatusBar, StyleProp, View, ViewStyle } from 'react-native'
import { COLORS } from '../styles'

const defaultStyle = { backgroundColor: COLORS.BACKGROUND, flex: 1 }

export const WhiteBackground: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ children, style }) => {
  return (
    <View style={[defaultStyle, style]}>
      <StatusBar backgroundColor={'white'} barStyle='dark-content' />
      {children}
    </View>
  )
}
