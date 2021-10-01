import { useNavigation } from '@react-navigation/native'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Button } from 'react-native-elements'
import { SafeAreaView } from 'react-native-safe-area-context'
import AntIcon from 'react-native-vector-icons/AntDesign'
import { CountdownTime } from '../../components/CountdownTimer'
import I18n from '../../../i18n/i18n'
import { mobileParing, requestOTP } from '../../api'
import { Link } from '../../components/Base'
import { PrimaryButton } from '../../components/Button'
import { FormHeader } from '../../components/Form/FormHeader'
import { useHUD } from '../../HudView'
import { applicationState } from '../../state/app-state'
import { COLORS, FONT_BOLD, FONT_FAMILY, FONT_MED, FONT_SIZES } from '../../styles'
import { useResetTo } from '../../utils/navigation'
import { PageBackButton } from '../2-Onboarding/components/PageBackButton'
import FeatherIcon from 'react-native-vector-icons/Feather'

function formatPhoneNumber(phoneNumberString) {
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return match[1] + '-' + match[2] + '-' + match[3]
  }
  return null
}

export const AuthOTP = ({ route }) => {
  const { showSpinner, hide } = useHUD()
  const [modalValue, setModalValue] = useState<boolean>(false)
  const navigation = useNavigation()
  const phone = route.params?.phone
  const triggerOTP = route.params?.triggerOTP
  const [otp, setOtp] = useState('')
  const resetTo = useResetTo()
  const onSubmit = async () => {
    showSpinner()
    try {
      const bool = await mobileParing(phone.replace(/-/g, ''), otp)
      if (!bool) {
        Alert.alert(I18n.t('wrong_pwd'))
        hide()
        return
      }
      hide()
      applicationState.setData('isRegistered', true)
      if (applicationState.getData('isPassedOnboarding')) {
        resetTo({ name: 'MainApp' })
      } else {
        resetTo({ name: 'MainApp' })
      }
    } catch (err) {
      setModalValue(true)
      console.log(err)
      hide()
    }
  }

  const onCloseModal = () => {
    setModalValue(false)
  }

  useEffect(() => {
    if (otp.length === 4) {
      onSubmit()
    }
  }, [otp])

  const sendOTP = async () => {
    showSpinner()
    try {
      await requestOTP(phone)
      hide()
    } catch (err) {
      Alert.alert(I18n.t('error'))
      hide()
    }
  }

  useEffect(() => {
    if (triggerOTP) {
      sendOTP()
    }
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1, width: '100%' }}>
        <StatusBar backgroundColor={COLORS.WHITE} barStyle='dark-content' />
        <PageBackButton label={I18n.t('mobile_verification')} />
        <View style={styles.header}>
          <Text style={styles.title}>{I18n.t('enter_otp_from_otp')}</Text>
          <Text style={styles.subtitle}>
            {I18n.t('send_to_phone_no')} {formatPhoneNumber(phone)}
          </Text>
        </View>
        {/* </FormHeader> */}
        <View style={styles.content}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              width: 280,
              maxWidth: '100%',
            }}
          >
            <OTPInputView
              keyboardType={'phone-pad'}
              codeInputFieldStyle={{
                backgroundColor: COLORS.WHITE,
                borderRadius: 4,
                borderColor: COLORS.GRAY_2,
                borderWidth: 1,
                fontSize: FONT_SIZES[700],
                fontFamily: FONT_FAMILY,
                color: COLORS.BLACK_1,
                margin: 4,
                height: 60,
                width: 60,
              }}
              style={{ height: 60 }}
              onCodeFilled={(code) => setOtp(code)}
              pinCount={4}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <CountdownTime
              style={{ fontSize: FONT_SIZES[300], color: COLORS.DARK_BLUE }}
              onResend={sendOTP}
              phone={formatPhoneNumber(phone)}
              onClose={onCloseModal}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.textotp}> {I18n.t('did_not_receive_an_otp')} </Text>
            <TouchableOpacity
              onPress={sendOTP}
              style={{
                alignItems: 'center',
              }}
            >
              <Text style={styles.text}> {I18n.t('resend_the_code')} </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            disabled={otp.length !== 4}
            style={{ width: '100%' }}
            containerStyle={{ width: '100%' }}
            title={I18n.t('verify')}
            onPress={onSubmit}
          />
        </View>
        <Modal onDismiss={() => setModalValue(false)} visible={modalValue} transparent>
          <View style={styles.modalStyle}>
            <View style={styles.modalContainer}>
              <View style={{ alignItems: 'center', paddingTop: 32, paddingHorizontal: 32 }}>
                <FeatherIcon name='alert-circle' size={48} color={COLORS.RED_WARNING} />
                <Text style={{ fontSize: FONT_SIZES[600], color: COLORS.RED_WARNING, fontFamily: FONT_BOLD }}>
                  {I18n.t('coe_alert_title_error')}
                </Text>
                <Text style={{ textAlign: 'center', marginTop: 24, fontSize: FONT_SIZES[500], fontFamily: FONT_MED }}>
                  {I18n.t('incorrect_otp_code')}
                </Text>
              </View>
              <View style={{ bottom: 32, left: 0, right: 0, position: 'absolute' }}>
                <Button
                  type='outline'
                  titleStyle={{ color: COLORS.DARK_BLUE, fontFamily: FONT_MED, fontSize: FONT_SIZES[500] }}
                  title={I18n.t('close')}
                  buttonStyle={{ width: 80, borderColor: COLORS.DARK_BLUE }}
                  containerStyle={{ alignItems: 'center' }}
                  onPress={() => onCloseModal()}
                />
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    marginBottom: 16,
    marginHorizontal: 24,
  },
  title: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
    alignItems: 'center',
    color: COLORS.DARK_BLUE,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES[500],
    lineHeight: 24,
    alignItems: 'center',
    color: COLORS.DARK_BLUE,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_BLUE,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: COLORS.BORDER_LIGHT_BLUE,
  },

  container: { flex: 1, backgroundColor: COLORS.WHITE },
  text: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[500],
    lineHeight: 32,
    marginLeft: 8,
    color: COLORS.BLUE,
  },
  textotp: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES[500],
    lineHeight: 32,
    marginLeft: 8,
    color: COLORS.DARK_BLUE,
  },
  errorText: {
    color: COLORS.RED,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
    paddingHorizontal: 24,
  },
  modalStyle: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 20,
    borderColor: COLORS.GRAY_3,
    borderWidth: 1,
    backgroundColor: '#fff',
    width: Dimensions.get('window').width - 64,
    height: Dimensions.get('window').height / 2.5,
  },
})
