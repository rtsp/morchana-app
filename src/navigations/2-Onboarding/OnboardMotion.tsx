import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Platform, SafeAreaView, StatusBar, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'
import { check, PERMISSIONS, request } from 'react-native-permissions'
import I18n from '../../../i18n/i18n'
import { Title } from '../../components/Base'
import { PrimaryButton } from '../../components/Button'
import { useHUD } from '../../HudView'
import { backgroundTracking } from '../../services/background-tracking'
import usePopup from '../../services/use-popup'
import { COLORS } from '../../styles'
import { doctorSize, styles } from './const'
import { OnboardHeader } from './OnboadHeader'

const ACTIVITY_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.MOTION, // NOT SURE
  android: PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION,
})

export const OnboardMotion = () => {
  const navigation = useNavigation()

  const [activityPerm, setActivityPerm] = useState('checking')
  const { showPopup } = usePopup()

  const { showSpinner, hide } = useHUD()

  useEffect(() => {
    ACTIVITY_PERMISSION &&
      check(ACTIVITY_PERMISSION).then((perms) => {
        if (perms === 'granted') {
          backgroundTracking.start().then(() => navigation.navigate('OnboardBluetooth'))
        } else {
          perms && setActivityPerm(perms)
        }
      })
  }, [navigation])

  const handleSubmit = () => {
    showPopup({
      onSelect: async (status) => {
        if (status === 'ok') {
          showSpinner()

          ACTIVITY_PERMISSION && (await request(ACTIVITY_PERMISSION))
          hide()

          setTimeout(() => {
            navigation.navigate('OnboardBluetooth')
          }, 1000)
        } else {
          navigation.navigate('OnboardBluetooth')
        }
      },
      okLabel: I18n.t('grant_permission'),
      cancelLabel: I18n.t('skip'),
      title: (
        <View style={{ flexDirection: 'column', alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
          <Image
            source={require('../../assets/perm-motion-icon.png')}
            resizeMode='contain'
            style={{ width: normalize(40) }}
          />
          <Title>{I18n.t('your_motion')}</Title>
        </View>
      ),
      content: I18n.t('to_manage_mobile_energy_efficiently'),
    })
  }

  if (activityPerm === 'checking') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.WHITE,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size='large' />
      </View>
    )
  }

  return (
    <>
      <SafeAreaView
        style={{
          backgroundColor: COLORS.BLUE,
        }}
      />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: COLORS.WHITE,
          // paddingHorizontal: 20
        }}
      >
        <StatusBar backgroundColor={COLORS.WHITE} barStyle='dark-content' />
        <OnboardHeader
          style={{
            backgroundColor: COLORS.BLUE,
          }}
        />
        <View style={styles.topContainer}>
          <View
            style={{
              padding: 8,
              paddingHorizontal: 30,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={require('../../assets/morchana-permission-location.png')}
              resizeMode='contain'
              style={{ height: doctorSize }}
            />
            <Text style={I18n.currentLocale() == 'en' ? styles.titleEN : styles.title}>
              {I18n.t('pls_grant_permission')}
            </Text>
            <Text style={styles.subtitle}>{I18n.t('let_doc_estimate_your_risk')}</Text>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ paddingRight: 16 }}>
              <Image
                source={require('../../assets/perm-motion-icon.png')}
                resizeMode='contain'
                style={{ width: normalize(40) }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{I18n.t('your_motion')}</Text>
              <Text style={styles.description}>{I18n.t('to_manage_mobile_energy_efficiently')}</Text>
            </View>
          </View>
          <PrimaryButton
            containerStyle={{ width: '100%' }}
            title={I18n.t('grant_permission')}
            style={{
              marginTop: 30,
              alignSelf: 'center',
              width: '100%',
              backgroundColor: COLORS.BLUE_BUTTON,
            }}
            onPress={() => handleSubmit()}
          />
        </View>
      </SafeAreaView>
    </>
  )
}
