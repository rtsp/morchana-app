import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { Alert, AsyncStorage, KeyboardAvoidingView, StatusBar, StyleSheet, Text, View } from 'react-native'
import { TextInputMask } from 'react-native-masked-text'
import { SafeAreaView } from 'react-native-safe-area-context'
import I18n from '../../../i18n/i18n'
import { requestOTP } from '../../api'
import { PrimaryButton } from '../../components/Button'
import { useHUD } from '../../HudView'
import { COLORS, FONT_BOLD, FONT_FAMILY, FONT_SIZES } from '../../styles'
import { PageBackButton } from '../2-Onboarding/components/PageBackButton'

const OTP_RETRY_LIMIT = 10

export const AuthPhone = ({ route }) => {
  const navigation = useNavigation()
  const { showSpinner, hide } = useHUD()
  const [phone, setPhone] = useState('')
  const isValidPhone = useMemo(() => phone.replace(/-/g, '').match(/^(0|1)[0-9]{9}$/), [phone])
  const [retryOTPCount, setRetryOTPCount] = useState(0)

  useEffect(() => {
    Promise.all([AsyncStorage.getItem('retryOTPCount'), AsyncStorage.getItem('retryOTPTime')]).then(([count, time]) => {
      if (time && moment(time).diff(moment(), 'minutes') > 10) {
        setRetryOTPCount(0)
      } else {
        count && setRetryOTPCount(+count)
      }
    })
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1, width: '100%' }}>
        <StatusBar backgroundColor={COLORS.WHITE} barStyle='dark-content' />
        <PageBackButton label={I18n.t('research')} />
        <View style={styles.header}>
          <Text style={styles.title}>{I18n.t('pls_input_phone_no')}</Text>
          <Text style={styles.subtitle}>{I18n.t('confirm_otp_from_sms')}</Text>
        </View>
        <View style={styles.content}>
          <View
            style={{
              backgroundColor: COLORS.WHITE,
              borderWidth: 1,
              borderColor: COLORS.GRAY_2,
              borderRadius: 4,
              height: 60,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <TextInputMask
              type='custom'
              options={{
                mask: '999-999-9999',
              }}
              onChangeText={(text) => {
                setPhone(text.trim())
              }}
              value={phone}
              autoFocus
              placeholder={I18n.t('your_phone_no')}
              maxLength={12}
              keyboardType={'phone-pad'}
              style={{
                textAlign: 'center',
                fontSize: FONT_SIZES[600],
                fontFamily: FONT_FAMILY,
                letterSpacing: 2,
              }}
            />
          </View>
          <Text style={{ fontSize: FONT_SIZES[300], marginTop: 5, color: COLORS.GRAY_4 }}>
            {I18n.t('thailand_number_only')}
          </Text>
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            disabled={!isValidPhone}
            title={I18n.t('send')}
            style={styles.primaryButton}
            containerStyle={{ width: '100%' }}
            onPress={async () => {
              const isExceeded = retryOTPCount > OTP_RETRY_LIMIT
              if (isExceeded) {
                Alert.alert(I18n.t('wrong_pwd'))
                return
              }
              showSpinner()

              await Promise.all([
                AsyncStorage.setItem('retryOTPCount', retryOTPCount + 1 + ''),
                AsyncStorage.setItem('retryOTPTime', moment().toString()),
              ])

              const mobileNumber = phone.replace(/-/g, '')
              try {
                await requestOTP(mobileNumber)
                hide()
                navigation.navigate({
                  name: 'AuthOTP',
                  params: { phone: mobileNumber },
                })
              } catch (err) {
                console.log(err)
                Alert.alert(I18n.t('error'))
                hide()
              }
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.WHITE },
  primaryButton: {
    width: '100%',
    borderColor: COLORS.DARK_BLUE,
    backgroundColor: COLORS.DARK_BLUE,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 16,
    marginHorizontal: 24,
  },
  title: {
    color: COLORS.DARK_BLUE,
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
    alignItems: 'center',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES[600],
    lineHeight: 24,
    alignItems: 'center',
    color: COLORS.DARK_BLUE,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.RED,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.LIGHT_BLUE,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: COLORS.BORDER_LIGHT_BLUE,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
})
