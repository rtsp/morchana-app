import I18n from 'i18n-js'
import React, { useEffect, useState } from 'react'
import { Dimensions, Modal, StyleSheet, Text, View, Alert } from 'react-native'
import { COLORS, FONT_BOLD, FONT_MED, FONT_SIZES } from '../styles'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/core'

export const CountdownTime = (props) => {
  const navigation = useNavigation()
  const timers: number = 300
  const [countdownTimer, setCountdownTime] = useState(timers)
  const [modalValue, setModalValue] = useState<boolean>(false)

  const onResetPhone = () => {
    navigation.pop()
  }
  const onResendOTP = () => {
    props.onResend()
    setCountdownTime(timers)
    setModalValue(false)
    props.onClose()
  }

  useEffect(() => {
    countDown()
  }, [])

  useEffect(() => {
    if (countdownTimer === 0) {
      setModalValue(true)
    }
  }, [countdownTimer])

  function countDown() {
    const interval = setInterval(() => {
      setCountdownTime((second) => (second >= 1 ? second - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }

  function timer() {
    let minutes = Math.floor(countdownTimer / 60).toString()
    let seconds = (countdownTimer % 60).toString()

    if (countdownTimer % 60 < 10) {
      seconds = '0' + seconds
    }
    return minutes + ':' + seconds
  }

  return (
    <>
      <View>
        <Text>{timer()} s</Text>
      </View>
      <Modal onDismiss={() => setModalValue(false)} visible={modalValue} transparent>
        <View style={styles.modalStyle}>
          <View style={styles.modalContainer}>
            <View style={{ alignItems: 'center', paddingTop: 32, paddingHorizontal: 32 }}>
              <Text style={{ fontSize: FONT_SIZES[600], color: COLORS.DARK_BLUE, fontFamily: FONT_BOLD }}>
                {I18n.t('title_timeout_otp')}
              </Text>
              <Text style={{ textAlign: 'center', marginTop: 24, fontSize: FONT_SIZES[500], fontFamily: FONT_MED }}>
                {I18n.t('message_timeout_otp', { numberPhone: props.phone })}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 64,
              }}
            >
              <Button
                type='outline'
                titleStyle={{ color: COLORS.DARK_BLUE, fontFamily: FONT_MED, fontSize: FONT_SIZES[500] }}
                title={I18n.t('change_number')}
                buttonStyle={{ borderColor: COLORS.DARK_BLUE, marginRight: 16 }}
                onPress={() => onResetPhone()}
              />
              <Button
                titleStyle={{ color: COLORS.WHITE, fontFamily: FONT_MED, fontSize: FONT_SIZES[500] }}
                title={I18n.t('resend_the_code')}
                buttonStyle={{ backgroundColor: COLORS.DARK_BLUE, paddingHorizontal: 16 }}
                onPress={() => onResendOTP()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
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
