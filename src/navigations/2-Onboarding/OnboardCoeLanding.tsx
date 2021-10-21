import I18n from 'i18n-js'
import React, { useEffect } from 'react'
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PrimaryButton } from '../../components/Button'
import { applicationState } from '../../state/app-state'
import { userPrivateData } from '../../state/userPrivateData'
import { COLORS, FONT_BOLD, FONT_MED, FONT_SIZES } from '../../styles'
import { useResetTo } from '../../utils/navigation'

const padding = normalize(16)

export const OnboardCoeLanding = () => {
  const faceURI = userPrivateData.getFace()
  const resetTo = useResetTo()
  const inset = useSafeAreaInsets()

  useEffect(() => {
    applicationState.setData('isPassedOnboarding', true)
  }, [])

  const onFinishLanding = () => {
    resetTo({ name: 'MainApp' })
  }

  return (
    <View style={styles.container}>
      <View style={[styles.container, inset]}>
        <View style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: faceURI }}
              style={{
                width: 58,
                height: 58,
                borderRadius: 999,
              }}
            />
          </View>
          <Text style={styles.title}>{I18n.t('landing_welcome_title')}</Text>
          <Text style={styles.content}>{I18n.t('landing_welcome_text')}</Text>
          <Text style={styles.detailText}>{I18n.t('landing_enjoy')}</Text>
        </View>
        <View style={[styles.footer, { bottom: inset.bottom + (Dimensions.get('window').height * 10) / 100 }]}>
          <PrimaryButton
            title={I18n.t('start')}
            titleStyle={{
              color: COLORS.DARK_BLUE,
            }}
            style={{ width: '100%', backgroundColor: 'white' }}
            onPress={onFinishLanding}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
    color: COLORS.WHITE,
  },
  imageContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  content: {
    marginTop: 16,
    fontSize: FONT_SIZES[500],
    fontFamily: FONT_MED,
    color: COLORS.WHITE,
    lineHeight: 30,
  },
  detailText: {
    marginTop: 24,
    fontSize: FONT_SIZES[500],
    fontFamily: FONT_MED,
    color: COLORS.WHITE,
  },
  container: {
    backgroundColor: COLORS.DARK_BLUE,
    height: Dimensions.get('window').height,
    padding,
  },
  contentContainer: {
    paddingVertical: padding,
  },
  imageStyle: {
    marginVertical: 32,
    width: Dimensions.get('window').width - 36,
  },
  footer: {
    alignContent: 'center',
    position: 'absolute',
    padding,
    left: 0,
    right: 0,
  },
})
