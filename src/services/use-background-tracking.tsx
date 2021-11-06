import AsyncStorage from '@react-native-community/async-storage'
import moment from 'moment'
import { useCallback } from 'react'
import { useBackgroundTrackingPermission } from '../utils/Permission'
import { backgroundTracking } from './background-tracking'

const TRACKING_PERMISSION_ASK_LATER = 'tracking_permission_ask_later_v1'

export function useBackgroundTracking() {
  const permission = useBackgroundTrackingPermission()

  return useCallback(async () => {
    if ((await permission.check()) === 'granted') {
      backgroundTracking.start()
      return
    }

    const now = moment()
    const s = await AsyncStorage.getItem(TRACKING_PERMISSION_ASK_LATER)
    if (!s) {
      AsyncStorage.setItem(TRACKING_PERMISSION_ASK_LATER, JSON.stringify([0, 1, now.toISOString()]))
      return
    }
    const askLaterInfo = JSON.parse(s)

    const t = now.diff(askLaterInfo[2], 'day')
    if (t < askLaterInfo[0] + askLaterInfo[1]) {
      return
    }

    const f = askLaterInfo[1]
    askLaterInfo[1] = askLaterInfo[0] + askLaterInfo[1]
    askLaterInfo[0] = f
    askLaterInfo[2] = now.toISOString()
    AsyncStorage.setItem(TRACKING_PERMISSION_ASK_LATER, JSON.stringify(askLaterInfo))

    const granted = await permission.request()
    if (!granted) return

    return backgroundTracking.start()
  }, [permission])
}
