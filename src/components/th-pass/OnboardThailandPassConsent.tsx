import { useNavigation } from '@react-navigation/native'
import I18n from 'i18n-js'
import React from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PrimaryButton } from '../Button'
import { WhiteBackground } from '../WhiteBackground'
import { COLORS, FONT_BOLD, FONT_MED, FONT_SIZES } from '../../styles'

const padding = normalize(16)

export const OnboardThailandPassConsent = () => {
  const inset = useSafeAreaInsets()
  const navigation = useNavigation()

  return (
    <WhiteBackground style={styles.background}>
      <View style={[styles.contentContainer, { top: inset.top }]}>
        <Text style={styles.title}>{I18n.t('policy_notice')}</Text>
        <Text style={styles.content}>{I18n.t('thailand_pass_consent_message')}</Text>
      </View>
      <View style={[styles.footer, { bottom: inset.bottom + padding * 2, left: inset.left, right: inset.right }]}>
        <PrimaryButton
          title={I18n.t('proceed')}
          titleStyle={styles.buttonTitle1}
          style={styles.button1}
          containerStyle={styles.fullWidth}
          onPress={() => navigation.navigate('OnboardQrScanner')}
        />
      </View>
    </WhiteBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
    color: COLORS.DARK_BLUE,
  },
  imageContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  content: {
    marginTop: 16,
    fontSize: FONT_SIZES[500],
    fontFamily: FONT_MED,
    color: COLORS.DARK_BLUE,
    lineHeight: 30,
  },
  container: {
    backgroundColor: COLORS.DARK_BLUE,
    height: Dimensions.get('window').height,
  },
  contentContainer: {
    padding,
  },
  imageStyle: {
    marginVertical: 32,
    width: Dimensions.get('window').width - 36,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: padding,
  },
  fullWidth: {
    width: '100%',
  },
  button1: {
    backgroundColor: COLORS.DARK_BLUE,
    width: '100%',
  },
  buttonTitle1: {
    color: 'white',
  },
  button2: {
    backgroundColor: 'white',
    borderColor: COLORS.DARK_BLUE,
    borderWidth: 1,
    borderRadius: 4,
    width: '100%',
    marginTop: padding,
  },
  buttonTitle2: {
    color: COLORS.DARK_BLUE,
  },
})
