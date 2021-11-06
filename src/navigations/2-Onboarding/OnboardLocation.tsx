import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, SafeAreaView, StatusBar, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'
import I18n from '../../../i18n/i18n'
import { PrimaryButton } from '../../components/Button'
import { COLORS } from '../../styles'
import { useLocationPermission } from '../../utils/Permission'
import { doctorSize, styles } from './const'
import { OnboardHeader } from './OnboadHeader'

export const OnboardLocation = () => {
  const navigation = useNavigation()
  const permission = useLocationPermission()

  const [locationPerm, setLocationPerm] = useState<string | undefined>('checking')

  useEffect(() => {
    permission.check().then((perms) => {
      if (perms === 'granted') {
        navigation.navigate('OnboardMotion')
      } else {
        setLocationPerm(perms)
      }
    })
  }, [navigation, permission])

  const handleSubmit = () => {
    permission.request().then((granted) => {
      if (granted) {
        setTimeout(() => {
          navigation.navigate('OnboardMotion')
        }, 1000)
      } else {
        navigation.navigate('OnboardBluetooth')
      }
    })
  }

  if (locationPerm === 'checking') {
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
            <Text style={I18n.currentLocale() === 'en' ? styles.titleEN : styles.title}>
              {I18n.t('pls_grant_permission')}
            </Text>
            <Text style={styles.subtitle}>{I18n.t('let_doc_estimate_your_risk')}</Text>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ paddingRight: 16 }}>
              <Image
                source={require('../../assets/perm-location-icon.png')}
                resizeMode='contain'
                style={{ width: normalize(40) }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{I18n.t('your_position')}</Text>
              <Text style={styles.description}>{I18n.t('help_notify_if_you_get_near_risky_person_or_area')}</Text>
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
