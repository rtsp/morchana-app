import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Dimensions, StatusBar } from 'react-native'
import NotificationPopup from 'react-native-push-notification-popup'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { SafeAreaView } from 'react-native-safe-area-context'
import I18n from '../../../i18n/i18n'
import { Header, Subtitle, Title } from '../../components/Base'
import { backgroundTracking } from '../../services/background-tracking'
import { scanManager } from '../../services/contact-scanner'
import { useVaccine } from '../../services/use-vaccine'
import { useApplicationState } from '../../state/app-state'
import { QRResult, tagManager } from '../../state/qr'
import { COLORS } from '../../styles'
import { decodeJWT, verifyToken } from '../../utils/jwt'
import { useCameraPermission } from '../../utils/Permission'
import PopupMessage from './NewMainApp/PopupMessage'
import { QRPopupContent } from './QRPopupContent'

export const QRCodeScan = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const { requestVaccine, resetVaccine, isVaccineURL, vaccineList, getVaccineUserName } = useVaccine()
  const isFocused = useIsFocused()
  const [qrResult, setQRResult] = useState<QRResult | null>(null)
  const popupRef = useRef<NotificationPopup>()
  const [, setData] = useApplicationState()
  const vaccine = vaccineList && vaccineList[0]
  const [name, setName] = useState('')
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const { request } = useCameraPermission()

  useEffect(() => {
    vaccine && getVaccineUserName && getVaccineUserName(vaccine).then(setName)
  }, [vaccine, getVaccineUserName])

  useEffect(() => {
    tagManager.update()
  }, [isFocused])

  useEffect(() => {
    if (qrResult) {
      popupRef.current?.show({
        appTitle: I18n.t('risk_level'),
        title: qrResult.getLabel(),
        timeText: qrResult.getTag()?.title,
      })
      scanManager.add(qrResult.anonymousId)
    }
  }, [qrResult])

  useEffect(() => {
    isFocused && request().then(setCameraEnabled)
  }, [request, isFocused])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.WHITE} />
      {isFocused && cameraEnabled ? (
        <QRCodeScanner
          showMarker
          markerStyle={{
            borderColor: COLORS.WHITE,
          }}
          cameraStyle={{
            marginLeft: 8,
            marginRight: 8,
            height: Dimensions.get('window').height / 2,
            width: Dimensions.get('window').width - 16,
            overflow: 'hidden',
          }}
          onRead={async (e) => {
            try {
              const url = e?.data
              if (url && (url + '').startsWith('https://qr.thaichana.com/?appId')) {
                const closeStr = 'closeBtn=true'
                const uri = e?.data?.includes('?') ? e?.data + '&' + closeStr : e?.data + '?' + closeStr
                navigation.navigate('Webview', {
                  uri,
                  onClose: () => {
                    navigation.pop()
                  },
                })
                backgroundTracking.getLocation({
                  extras: { triggerType: 'thaichana', url: e.data },
                })
              } else if (requestVaccine && isVaccineURL && (await isVaccineURL(url))) {
                const result = await requestVaccine(url)
                try {
                  if (result.status === 'ERROR') {
                    Alert.alert(result.errorTitle || '', result.errorMessage || '')
                    return
                  }

                  setModalVisible(true)
                } catch (err) {
                  console.warn('qr scan catch', err)
                }
              } else {
                await verifyToken(e?.data)
                const decoded = decodeJWT(e?.data)
                if (!decoded?._) {
                  throw new Error('Invalid')
                }
                setQRResult(new QRResult(decoded))
              }
            } catch (err) {
              Alert.alert(I18n.t('wrong_data'))
            }
          }}
          fadeIn={false}
          reactivate
          reactivateTimeout={5000} //Use this to configure how long it should take before the QRCodeScanner should reactivate.
          containerStyle={{ flex: 1 }}
          topContent={
            <Header>
              <Title>{I18n.t('scan_qr')}</Title>
              <Subtitle>{I18n.t('record_contact_and_estimate_risk')}</Subtitle>
            </Header>
          }
        />
      ) : null}
      <NotificationPopup
        ref={popupRef as any}
        renderPopupContent={(props) => <QRPopupContent {...props} qrResult={qrResult} />}
      />
      {modalVisible ? (
        <PopupMessage
          title={I18n.t('record_found')}
          message={`${I18n.t('vaccination_record_of')}\n\n${name}\n\n${I18n.t('vaccination_found')}\n\n${I18n.t(
            'import_this_record',
          )}`}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          onSelect={(status) => {
            if (status === 'ok') {
              setData('card', 1)
              navigation.navigate('Home')
            } else {
              resetVaccine && resetVaccine()
            }
          }}
        />
      ) : null}
    </SafeAreaView>
  )
}
