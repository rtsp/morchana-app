import React from 'react'
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native'
import { normalize } from 'react-native-elements'
import I18n from 'i18n-js'
import { COLORS, FONT_BOLD, FONT_SIZES, FONT_MED } from '../styles'
import { WhiteBackground } from '../components/WhiteBackground'
import { PageBackButton } from './2-Onboarding/components/PageBackButton'

const padding = normalize(16)

export const OnboardCoeEx = () => {
  return (
    <WhiteBackground>
      <PageBackButton label={I18n.t('personal_information')} />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{I18n.t('coe_prepare_title')}</Text>
        <Text style={styles.content}>{I18n.t('coe_exam_text')}</Text>
        <Image style={styles.imageStyle} source={require('./coeExam.png')} />
      </View>
    </WhiteBackground>
  )
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[600],
    color: COLORS.BLUE_BUTTON,
  },
  content: {
    fontSize: FONT_SIZES[500],
    fontFamily: FONT_MED,
    color: COLORS.BLUE_BUTTON,
  },
  contentContainer: {
    padding,
  },
  imageStyle: {
    marginVertical: 32,
    width: Dimensions.get('window').width - 36,
  },
})
