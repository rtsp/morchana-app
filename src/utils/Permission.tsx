import AsyncStorage from '@react-native-community/async-storage'
import React, { ReactNode, useCallback, useMemo } from 'react'
import { Image, Platform, View } from 'react-native'
import { normalize } from 'react-native-elements'
import { check, Permission, PERMISSIONS, PermissionStatus, request } from 'react-native-permissions'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import I18n from '../../i18n/i18n'
import { Title } from '../components/Base'
import { useHUD } from '../HudView'
import usePopup from '../services/use-popup'
import { COLORS } from '../styles'

function usePermission({
  permission,
  title,
  content,
  falseRequest,
}: {
  permission: Permission | Permission[] | undefined
  title: ReactNode
  content: ReactNode
  falseRequest?: boolean
}) {
  const { showPopup } = usePopup()
  const { showSpinner, hide } = useHUD()

  const checkPermission = useCallback(async () => {
    if (!permission) return 'unavailable'

    console.log('checking', permission)
    let val: PermissionStatus
    if (Array.isArray(permission)) {
      val = 'granted'
      for (const perm of permission) {
        const s = await check(perm)
        console.log('check', perm, s)
        if (s !== 'granted') {
          val = s
        }
      }
    } else {
      val = await check(permission)
    }
    console.log('checked', permission, val)
    return val
  }, [permission])

  const requestPermission = useCallback(async () => {
    const status = await checkPermission()
    console.log('permission status', status)
    if (status === 'granted') return true

    console.log('permission requesting', permission)

    return new Promise<boolean>((granted) => {
      AsyncStorage.setItem('location_ask', new Date().toString())
      showPopup({
        onSelect: async (buttonStatus) => {
          if (buttonStatus === 'ok') {
            if (falseRequest || !permission) {
              granted(true)
              return
            }

            showSpinner()

            let val: PermissionStatus = 'granted'
            if (Array.isArray(permission)) {
              const delayRequest = (per: Permission) => {
                return new Promise<PermissionStatus>((success) => {
                  setTimeout(() => {
                    request(per).then(success)
                  }, 300)
                })
              }
              for (const perm of permission) {
                const s = await delayRequest(perm)
                console.log('request', perm, '=>', s)
                if (s !== 'granted') {
                  val = s
                }
              }
            } else {
              val = await request(permission)
            }
            hide()
            console.log('requested', permission, '=>', val)
            granted(val === 'granted')
          } else {
            granted(false)
          }
        },
        okLabel: I18n.t('grant_permission'),
        cancelLabel: I18n.t('not_now'),
        title,
        content,
      })
    })
  }, [checkPermission, content, falseRequest, hide, permission, showPopup, showSpinner, title])

  return useMemo(() => ({ request: requestPermission, check: checkPermission }), [checkPermission, requestPermission])
}

export const useLocationPermission = () => {
  const perm = useMemo(() => {
    const permissions =
      Platform.OS === 'android'
        ? [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION]
        : PERMISSIONS.IOS.LOCATION_ALWAYS

    return {
      permission: permissions,
      title: (
        <View style={{ flexDirection: 'column', alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
          <Image
            source={require('../assets/perm-location-icon.png')}
            resizeMode='contain'
            style={{ width: normalize(32) }}
          />
          <Title>{I18n.t('your_position')}</Title>
        </View>
      ),
      content: I18n.t('help_notify_if_you_get_near_risky_person_or_area'),
    }
  }, [])

  return usePermission(perm)
}

export const useCameraPermission = () => {
  const perm = useMemo(() => {
    const CAMERA_PERMISSION = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    })
    return {
      permission: CAMERA_PERMISSION,
      title: (
        <View style={{ flexDirection: 'column', alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
          <MaterialCommunityIcons name='camera' color={COLORS.DARK_BLUE} size={36} />
          <Title>{I18n.t('access_camera')}</Title>
        </View>
      ),
      content: I18n.t('photo_permission_description'),
    }
  }, [])

  return usePermission(perm)
}

export const useMotionPermission = () => {
  const perm = useMemo(() => {
    const MOTION_PERMISSION = Platform.select({
      ios: PERMISSIONS.IOS.MOTION,
      android: PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION,
    })

    return {
      permission: MOTION_PERMISSION,
      title: (
        <View style={{ flexDirection: 'column', alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
          <Image
            source={require('../assets/perm-motion-icon.png')}
            resizeMode='contain'
            style={{ width: normalize(40) }}
          />
          <Title>{I18n.t('your_motion')}</Title>
        </View>
      ),
      content: I18n.t('your_motion_permission'),
    }
  }, [])

  return usePermission(perm)
}

export const useBluetoothPermission = () => {
  return usePermission(
    useMemo(
      () => ({
        permission: Platform.OS === 'android' ? undefined : PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
        title: (
          <View style={{ flexDirection: 'column', alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
            <Image
              source={require('../assets/perm-bluetooth-icon.png')}
              resizeMode='contain'
              style={{ width: normalize(40) }}
            />
            <Title>{I18n.t('track_with_bluetooth')}</Title>
          </View>
        ),
        content: I18n.t('consume_low_energy_and_can_detect_closed_contact'),
      }),
      [],
    ),
  )
}

export const useBackgroundTrackingPermission = () => {
  const perm = useMemo(() => {
    const permissions =
      Platform.OS === 'android'
        ? [
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
            PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION,
          ]
        : [PERMISSIONS.IOS.LOCATION_ALWAYS, PERMISSIONS.IOS.MOTION]

    return {
      falseRequest: true,
      permission: permissions,
      title: (
        <View style={{ flexDirection: 'column', alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
          <Image
            source={require('../assets/perm-location-icon.png')}
            resizeMode='contain'
            style={{ width: normalize(32) }}
          />
          <Title>{I18n.t('your_position')}</Title>
        </View>
      ),
      content: I18n.t('help_notify_if_you_get_near_risky_person_or_area'),
    }
  }, [])

  return usePermission(perm)
}
