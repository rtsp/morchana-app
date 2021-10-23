import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar, View, Text, StyleSheet } from 'react-native'
import { PrimaryButton } from '../components/Button'
import { useNavigation } from '@react-navigation/native'
import { COLORS, FONT_FAMILY, FONT_BOLD, FONT_SIZES } from '../styles'
import { normalize } from 'react-native-elements'
import { FormHeader } from '../components/Form/FormHeader'
import I18n from '../../i18n/i18n'
import ConsentPolicy from '../components/ConsentPolicy'

export const PrivacyPolicy = () => {
  const navigation = useNavigation()
  const [agree, setAgree] = useState(false)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'white'} barStyle='dark-content' />
      <FormHeader backIcon='close'>
        <View style={styles.header}>
          <Text style={styles.title}>{I18n.t('term_and_conditions')} </Text>
          <Text style={styles.subtitle}>{I18n.t('for_using_service')}</Text>
        </View>
      </FormHeader>
      <ConsentPolicy />
      <View style={styles.footer}>
        <PrimaryButton
          title={I18n.t('close')}
          style={{ width: '100%' }}
          containerStyle={{ width: '100%' }}
          onPress={() => {
            navigation.pop()
          }}
        />
      </View>
    </SafeAreaView>
  )
}

const padding = normalize(16)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 16,
    marginHorizontal: padding,
  },

  title: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
    alignItems: 'center',
    color: COLORS.BLACK_1,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES[500],
    lineHeight: 24,
    alignItems: 'center',
    color: COLORS.SECONDARY_DIM,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: padding,
    marginBottom: 16,
  },
})
