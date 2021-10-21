import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS } from '../styles'

const defaultStyle = { backgroundColor: COLORS.WHITE, flex: 1 }
const safeAreaStyle = { flex: 1 }

export const WhiteBackground: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ children, style }) => {
  const inset = useSafeAreaInsets()
  return (
    <View style={[defaultStyle, style]}>
      <View style={[safeAreaStyle, inset]}>{children}</View>
    </View>
  )
}
