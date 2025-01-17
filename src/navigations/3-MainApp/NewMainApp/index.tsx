import { useIsFocused, useNavigation } from '@react-navigation/native'
import I18n from 'i18n-js'
import moment from 'moment'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Button, normalize } from 'react-native-elements'
import { TouchableOpacity } from 'react-native-gesture-handler'
import GPSState from 'react-native-gps-state'
import { PERMISSIONS } from 'react-native-permissions'
import NotificationPopup from 'react-native-push-notification-popup'
import { useSafeArea } from 'react-native-safe-area-view'
import FeatherIcon from 'react-native-vector-icons/Feather'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Carousel from '../../../../src/components/Carousel'
import { CircularProgressAvatar } from '../../../../src/components/CircularProgressAvatar'
import { applicationState, useApplicationState } from '../../../../src/state/app-state'
import { userPrivateData } from '../../../../src/state/userPrivateData'
import { COE_ENABLED } from '../../../constants'
import { useContactTracer } from '../../../services/contact-tracing-provider'
import { pushNotification } from '../../../services/notification'
import { useVaccine } from '../../../services/use-vaccine'
import { QR_STATE, SelfQR, useSelfQR } from '../../../state/qr'
import { COLORS, FONT_BOLD, FONT_FAMILY, FONT_MED, FONT_SIZES } from '../../../styles'
import { requestLocationPermission } from '../../../utils/Permission'
import { BeaconFoundPopupContent } from '../BeaconFoundPopup'
import QRCard from './QRCard'
import { UpdateProfileButton } from './UpdateProfileButton'
import VaccineCard from './VaccineCard'
import WorkFromHomeCard from './WorkFromHomeCard'
import { useBackgroundTracking } from '../../../services/use-background-tracking'

const LOCATION_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
  android: PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
})

const padding = normalize(16)
// const carouselItems = ['qr', 'vaccine'] //, 'wfh']
const carouselItems = ['qr']

// Can change up to 3 picture a week.
export const MAX_CHANGE_PROFILE_LIMIT = 3
const mapQrStatusColor = (qr?: SelfQR, qrState?: QR_STATE) =>
  qr
    ? qr.getStatusColor()
    : qrState === QR_STATE.NOT_VERIFIED || qrState === QR_STATE.FAILED
    ? COLORS.ORANGE_2
    : COLORS.GRAY_2

export const MainApp = () => {
  const inset = useSafeArea()
  const { qrData, qrState, isLinked } = useSelfQR()
  const { beaconLocationName, isBluetoothOn, enable } = useContactTracer()
  const [location, setLocation] = useState('')
  const popupRef = useRef<NotificationPopup | any>()
  const activeDotAnim = useRef(new Animated.Value(0)).current
  const { getName, vaccineList } = useVaccine()
  const [{ updateProfileDate, changeCount, card }] = useApplicationState()
  const navigation = useNavigation()
  const [modalValue, setModalValue] = useState<boolean>(false)
  const [alertModalData, SetAlertModalData] = useState<{ title: string; text: string }>({
    title: '',
    text: '',
  })
  const [[firstName, lastName], setName] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const isFocused = useIsFocused()
  const backgroundTrackingStart = useBackgroundTracking()

  const windowWidth = Dimensions.get('window').width

  const [triggerGps, setTriggerGps] = useState<number>(0)
  const gpsRef = React.useRef({ triggerGps })

  const initALertData = () => {
    if (applicationState.getData('coeAutoAlert')) {
      setModalValue(true)
    }
    const coeNo = userPrivateData.getData('coeNo')
    const coeRfNo = userPrivateData.getData('coeRfNo')
    if (!coeNo && !coeRfNo) {
      SetAlertModalData({
        title: I18n.t('no_coe_alert_title'),
        text: I18n.t('no_coe_alert_text'),
      })
    } else if (coeNo && coeRfNo) {
      SetAlertModalData({
        title: I18n.t('coe_alert_title'),
        text: I18n.t('coe_alert_text'),
      })
    }
  }

  React.useEffect(() => {
    const updateGPS = async () => {
      const status = await GPSState.getStatus()

      if (gpsRef.current.triggerGps !== status) {
        gpsRef.current.triggerGps = status

        setTriggerGps(status)
      }
    }
    COE_ENABLED && initALertData()
    updateGPS()
    const timer = setInterval(updateGPS, 2000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setLocation(beaconLocationName.name)
    if (location && popupRef && popupRef.current) {
      popupRef.current.show({
        slideOutTime: 20 * 1000,
      })
    }
  }, [beaconLocationName, location])

  const isLeftAvatar = () => {
    return !isLinked && userPrivateData.getData('coeRfNo') && userPrivateData.getData('coeNo')
  }

  const startAnimated = useCallback(
    () =>
      Animated.timing(activeDotAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        activeDotAnim.setValue(0)
        startAnimated()
      }),
    [activeDotAnim],
  )

  useEffect(() => {
    if (!isFocused || isInitialized) return
    setIsInitialized(true)
    pushNotification.requestPermissions()
    backgroundTrackingStart()
  }, [backgroundTrackingStart, isFocused, isInitialized])

  useEffect(() => {
    startAnimated()
  }, [startAnimated])

  useEffect(() => {
    getName && getName().then(setName)
  }, [getName])

  let profileStyle = { justifyContent: firstName || lastName ? 'flex-start' : 'center' } as const

  const vaccineNumber = vaccineList?.length

  const generateCircularTransform = (
    snapshot = 500,
    radius = 50,
  ): [
    {
      translateX: Animated.AnimatedInterpolation
      translateY: Animated.AnimatedInterpolation
    },
  ] => {
    let target = 1.8 //per round
    let rounds = 5
    let snapshotPerRound = snapshot / rounds

    let k = snapshotPerRound / target
    const inputRangeX = []
    const outputRangeX = []
    var value = 0
    for (let i = 0; i <= snapshot; ++i) {
      value += (Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / snapshotPerRound) + 1) / k
      let move = Math.sin(value * Math.PI * 2) * radius
      inputRangeX.push(i / snapshot)
      outputRangeX.push(move)
    }

    const translateX = activeDotAnim.interpolate({
      inputRange: inputRangeX,
      outputRange: outputRangeX,
    })

    const inputRangeY = []
    const outputRangeY = []
    value = 0
    for (let i = 0; i <= snapshot; ++i) {
      value += (Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / snapshotPerRound) + 1) / k
      let move = -Math.cos(value * Math.PI * 2) * radius
      inputRangeY.push(i / snapshot)
      outputRangeY.push(move)
    }

    const translateY = activeDotAnim.interpolate({
      inputRange: inputRangeY,
      outputRange: outputRangeY,
    })

    return [{ translateX, translateY }]
  }

  const transform = generateCircularTransform()

  const containerStyle = {
    marginTop: inset.top,
    marginLeft: inset.left,
    marginRight: inset.right,
    backgroundColor: '#F9F9F9',
    flex: 1,
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={containerStyle}>
        <StatusBar barStyle='dark-content' backgroundColor={COLORS.WHITE} />
        <View style={styles.containerTop}>
          <View style={styles.containerHeader}>
            <View style={styles.iconStatusContainer}>
              <TouchableOpacity onPress={enable}>
                <FontAwesome
                  name='map-marker'
                  color={triggerGps === 3 ? '#10A7DC' : '#C1C1C1'}
                  size={24}
                  style={styles.iconStatusButton}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={requestLocationPermission}>
                <FontAwesome
                  name='bluetooth-b'
                  color={isBluetoothOn ? '#10A7DC' : '#C1C1C1'}
                  size={24}
                  style={styles.iconStatusButton}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.profileHeader, profileStyle, isLeftAvatar() ? { alignItems: 'flex-start' } : {}]}>
            <View style={styles.profileContainer}>
              {qrData && qrState && (
                <>
                  <Animated.View style={[{ transform }]}>
                    <UserActiveDot color={mapQrStatusColor(qrData, qrState)} />
                  </Animated.View>
                  <AvatarProfile
                    qr={qrData}
                    qrState={qrState}
                    changeCount={changeCount}
                    updateProfileDate={updateProfileDate}
                  />
                  {isLeftAvatar() ? (
                    <>
                      <View style={{ marginLeft: padding / 2 }}>
                        <View style={styles.flexRow}>
                          <Text style={styles.textDarkBlue}>COE CODE</Text>
                          <TouchableOpacity onPress={() => setModalValue(true)}>
                            <FeatherIcon name='help-circle' style={[styles.textDarkBlue, styles.iconPadding]} />
                          </TouchableOpacity>
                        </View>
                        <View>
                          <Text style={[styles.coeTitle, styles.textDarkBlue]}>{userPrivateData.getData('coeNo')}</Text>
                        </View>
                        <View>
                          <TouchableOpacity
                            style={styles.flexRow}
                            onPress={() => navigation.navigate('EditCoePersonalInformation')}
                          >
                            <Text style={styles.textBlue}>{I18n.t('edit')}</Text>
                            <FontAwesome name='edit' style={[styles.textBlueIcon, styles.iconPadding]} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </>
                  ) : (
                    <View />
                  )}
                </>
              )}
            </View>
            <View style={styles.w100}>
              {firstName ? (
                <Text style={styles.firstNameText} numberOfLines={1}>
                  {firstName}
                </Text>
              ) : null}
              {lastName ? (
                <Text style={styles.lastNameText} numberOfLines={1}>
                  {lastName}
                </Text>
              ) : null}
              <View style={styles.w100}>
                {vaccineNumber ? <Text style={styles.vaccineText}>{vaccineNumber}</Text> : null}
              </View>
            </View>
          </View>
          {windowWidth && (
            <Carousel
              data={carouselItems}
              pageIndex={card || 0}
              setPageIndex={(index) => {
                applicationState.setData('card', index)
              }}
              renderItem={(index) => {
                switch (index) {
                  case 'qr':
                    return <QRCard key={index} />
                  case 'vaccine':
                    return <VaccineCard key={index} />
                  case 'wfh':
                    return <WorkFromHomeCard key={index} />
                }
                return <View />
              }}
            />
          )}
          <NotificationPopup
            ref={popupRef}
            renderPopupContent={(props) => <BeaconFoundPopupContent {...props} result={location} />}
          />
        </View>
      </View>
      <Modal visible={modalValue} transparent>
        <View style={styles.modalStyle}>
          <View style={styles.modalContainer}>
            <View style={{ alignItems: 'center', paddingTop: 32, paddingHorizontal: 32 }}>
              <Text style={{ fontSize: FONT_SIZES[700], color: COLORS.DARK_BLUE, fontFamily: FONT_BOLD }}>
                {alertModalData.title}
              </Text>
              <Text style={{ textAlign: 'center', marginTop: 24, fontFamily: FONT_MED, fontSize: FONT_SIZES[500] }}>
                {alertModalData.text}
              </Text>
            </View>
            <View style={styles.bottomContainer}>
              <Button
                type='outline'
                title={I18n.t('close')}
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={{ alignItems: 'center' }}
                onPress={() => {
                  if (applicationState.getData('coeAutoAlert')) {
                    applicationState.setData('coeAutoAlert', false)
                  }
                  setModalValue(false)
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#F9F9F9',
    flex: 1,
  },
  iconStatusContainer: { flexDirection: 'row', paddingTop: padding, height: 45 },
  iconStatusButton: { marginRight: 10 },
  containerTop: { flex: 1, flexDirection: 'column' },
  containerHeader: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 0,
    paddingLeft: padding,
    paddingRight: padding,
    height: 0,
  },
  circularButton: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    backgroundColor: 'white',
    borderColor: 'rgba(16, 170, 174, 0.2)',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2.84,
  },
  textHeader: {
    marginTop: padding / 2,
    lineHeight: FONT_SIZES[600],
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES[600],
    textAlign: 'center',
    color: COLORS.BLACK_1,
  },
  flexRow: { flexDirection: 'row' },
  coeTitle: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[800],
    textTransform: 'uppercase',
  },
  textVerticalBottom: {
    textAlignVertical: 'bottom',
  },
  textDarkBlue: {
    color: COLORS.DARK_BLUE,
  },
  textBlue: {
    color: COLORS.BLUE,
    fontFamily: FONT_MED,
    fontSize: FONT_SIZES[500],
  },
  textBlueIcon: {
    color: COLORS.BLUE,
    fontFamily: FONT_MED,
    fontSize: FONT_SIZES[400],
  },
  modalStyle: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: padding / 2,
    borderColor: COLORS.GRAY_3,
    borderWidth: 1,
    backgroundColor: '#fff',
    width: Dimensions.get('window').width - 64,
    height: Dimensions.get('window').height / 2,
  },
  iconPadding: { marginLeft: padding / 4, marginTop: padding / 4 },
  profileHeader: {
    height: 180,
    marginLeft: padding,
    marginRight: padding,
    marginBottom: padding,
    marginTop: padding,
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  greenDot: {
    width: 10,
    height: 10,
    backgroundColor: COLORS.GREEN,
    position: 'absolute',
    borderRadius: 50,
    borderTopWidth: Math.floor((4 / 100) * 24),
    right: Math.floor((8 / 100) * 50),
  },
  userActiveDot: {
    width: 10,
    height: 10,
    borderRadius: 100 / 2,
    position: 'absolute',
    top: 45,
    left: 45,
  },
  firstNameText: {
    color: COLORS.TEXT,
    fontFamily: FONT_BOLD,
    fontSize: 40,
    paddingTop: 3,
    width: '100%',
  },
  lastNameText: {
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILY,
    fontSize: 28,
    fontWeight: 'normal',
    width: '100%',
  },
  w100: {
    width: '100%',
  },
  vaccineText: {
    fontFamily: FONT_BOLD,
    position: 'absolute',
    color: '#26C8FF',
    opacity: 0.2,
    fontSize: 135,
    right: 0,
    bottom: -40,
  },
  flex1: {
    flex: 1,
  },
  bottomContainer: {
    bottom: 32,
    left: 0,
    right: 0,
    position: 'absolute',
  },
  buttonStyle: {
    width: 80,
    borderColor: COLORS.DARK_BLUE,
  },
  buttonTitleStyle: {
    color: COLORS.DARK_BLUE,
    fontFamily: FONT_MED,
    fontSize: FONT_SIZES[500],
  },
})

const AvatarProfile = ({
  qr,
  qrState,
  changeCount,
  updateProfileDate,
}: {
  qr: SelfQR
  qrState: QR_STATE
  updateProfileDate?: string
  changeCount?: number
}) => {
  const [faceURI, setFaceURI] = useState(userPrivateData.getFace())

  const color = qr
    ? qr.getStatusColor()
    : qrState === QR_STATE.NOT_VERIFIED || qrState === QR_STATE.FAILED
    ? COLORS.ORANGE_2
    : COLORS.GRAY_2

  // const avatarWidth = Math.min(
  //   100,
  //   Math.floor((20 / 100) * Dimensions.get('screen').height),
  // )

  const avatarWidth = 100
  // useEffect(() => {
  //   RNFS.exists(faceURI).then((exists) => {
  //     // if (!exists) {
  //     //   resetTo({
  //     //     name: 'Onboarding',
  //     //   })
  //     // }
  //   })
  // }, [faceURI, resetTo])

  const buttonStyle = {
    position: 'absolute',
    bottom: Math.floor((4 / 100) * avatarWidth),
    right: Math.floor((4 / 100) * avatarWidth),
  } as const
  const navigation = useNavigation()

  const today = moment()
  const isSameWeek = today.isSame(updateProfileDate || new Date().toISOString(), 'weeks')
  const days = moment().endOf('weeks').diff(today, 'days')
  const isLock = (changeCount || 0) >= MAX_CHANGE_PROFILE_LIMIT && isSameWeek
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (isLock) {
          Alert.alert(
            I18n.t('can_not_change_picture'),
            I18n.t('can_change_pic_again_in') + (days || 1) + I18n.t('day_s'),
          )
        } else {
          navigation.navigate('MainAppFaceCamera', {
            setUri: (uri: string) => {
              applicationState.setData2({
                changeCount: (changeCount || 0) + 1,
                updateProfileDate: new Date().toISOString(),
              })
              setFaceURI(uri)
            },
            // setUri: (uri) => {
            //   if (daySinceCreated >= 3) {
            //     Alert.alert(
            //       I18n.t('are_you_sure'),
            //       `${I18n.t(
            //         'after_changed_pic_you_will_not_be_able_to_change_until',
            //       )} ${DEFAULT_PERIODS} ${I18n.t('day_s_have_passed')}`,
            //       [
            //         { text: I18n.t('cancel'), style: 'cancel' },
            //         {
            //           text: I18n.t('confirm'),
            //           onPress: () => {
            //             onChange(uri)
            //           },
            //         },
            //       ],
            //     )
            //   } else {
            //     onChange(uri)
            //   }
            // },
          })
        }
      }}
    >
      <View>
        <CircularProgressAvatar
          key={qr ? qr.getCreatedDate() : 0}
          image={faceURI ? { uri: faceURI } : undefined}
          color={color}
          progress={100}
          width={avatarWidth}
        />
        <UpdateProfileButton width={Math.floor(avatarWidth / 4)} style={buttonStyle} onChange={setFaceURI} />
      </View>
    </TouchableWithoutFeedback>
  )
}

const UserActiveDot: React.FC<{ color: string }> = ({ color }) => (
  <View
    style={{
      ...styles.userActiveDot,
      backgroundColor: color,
    }}
  />
)
