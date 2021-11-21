import { useNavigation } from '@react-navigation/core'
import { useIsFocused } from '@react-navigation/native'
import { Buffer } from 'buffer'
import jpeg from 'jpeg-js'
import jsQR from 'jsqr'
import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { normalize } from 'react-native-elements'
import { Asset, launchImageLibrary } from 'react-native-image-picker'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import I18n from '../../../i18n/i18n'
import { getThailandPass } from '../../api'
import { PrimaryButton } from '../../components/Button'
import { WhiteBackground } from '../../components/WhiteBackground'
import { useHUD } from '../../HudView'
import { PageBackButton } from '../../navigations/2-Onboarding/components/PageBackButton'
import PopupMessage from '../../navigations/3-MainApp/NewMainApp/PopupMessage'
import { ThailandPassProfile } from '../../services/use-vaccine'
import { COLORS, FONT_BOLD, FONT_MED, FONT_SIZES } from '../../styles'
import { useCameraPermission } from '../../utils/Permission'

const padding = normalize(4)

const decodeImageQR = async (image: Asset) => {
  try {
    // Get the image and its base64 data into a buffer
    if (!image.base64) {
      return null
    }
    const base64Buffer = Buffer.from(image.base64, 'base64')

    let pixelData
    let imageBuffer

    // Handle decoding based on different mimetypes
    if (image.type === 'image/jpeg') {
      pixelData = jpeg.decode(base64Buffer, { useTArray: true }) // --> useTArray makes jpeg-js work on react-native without needing to nodeify it
      imageBuffer = pixelData.data
    } else if (image.type === 'image/png') {
      const PNG = require('pngjs/browser').PNG

      pixelData = PNG.sync.read(base64Buffer)
      imageBuffer = pixelData.data
    } else {
      // you can alert the user here that the format is not supported
      return null
    }

    // Convert the buffer into a clamped array that jsqr uses
    const data = Uint8ClampedArray.from(imageBuffer)

    // Get the QR string from the image
    const code = jsQR(data, image.width ?? 0, image.height ?? 0)
    if (!code) {
      return null
    }

    console.log('qr - values', code)
    return code
  } catch (error) {
    console.error('error')
  }
  return null
}

const ThailandPassQrScanner: React.FC<{
  next: string
}> = ({ next }) => {
  const navigation = useNavigation()
  const [modalMode, setModalMode] = useState<'error' | 'ok' | ''>('')
  const [thPass, setThPass] = useState<ThailandPassProfile | null>(null)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [imageDecoding, setImageDecoding] = useState(false)
  const permission = useCameraPermission()
  const isFocused = useIsFocused()
  const { showSpinner, hide } = useHUD()

  const validateThailandPass = async (uri: string) => {
    try {
      const res = await getThailandPass({ uri })
      if (!res || res.error || !res.data) {
        console.error('thailand pass error', res.error)
        setModalMode('error')
        return
      }

      setThPass(res.data)
      setModalMode('ok')
      return
    } catch (e) {
      console.error('thailand pass error', e)
    }
    return
  }
  const inset = useSafeAreaInsets()

  useEffect(() => {
    isFocused && permission.request().then(setCameraEnabled)
  }, [permission, isFocused])

  return (
    <WhiteBackground>
      <View style={inset}>
        <PageBackButton label={I18n.t('privacy_notice')} />
        <Text style={styles.title}>{I18n.t('scan_qr_code')}</Text>
        <Text style={styles.subTitle}>{I18n.t('scan_description_thailandpass_qr')}</Text>

        <View style={styles.cameraContainer}>
          {isFocused && cameraEnabled && !imageDecoding && (
            <QRCodeScanner
              showMarker
              markerStyle={{
                borderColor: COLORS.WHITE,
              }}
              cameraStyle={styles.cameraStyle}
              onRead={(e) => e.data && validateThailandPass(e.data)}
              fadeIn={false}
              reactivate
              reactivateTimeout={5000}
            />
          )}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ position: 'absolute', bottom: padding * 2, left: padding * 2, padding, alignSelf: 'center' }}
            onPress={async () => {
              setImageDecoding(true)
              showSpinner()

              const { didCancel, assets, errorCode } = await launchImageLibrary({
                selectionLimit: 1,
                mediaType: 'photo',
                includeBase64: true,
              })

              if (didCancel) {
                hide()
                return
              }

              if (errorCode || !assets || !assets.length) {
                // Handle errors here, or separately
                console.error('launchImageLibrary ERROR', didCancel, errorCode)
                hide()
                setImageDecoding(false)
                return
              }

              const code = await decodeImageQR(assets[0])
              if (code) {
                await validateThailandPass(code.data)
              } else {
                setModalMode('error')
              }

              hide()
              setImageDecoding(false)
            }}
          >
            <EntypoIcon name='images' color='white' size={32} />
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title={I18n.t('fill_information_by_yourself')}
          style={styles.button}
          titleStyle={styles.titleButton}
          onPress={() => navigation.navigate(next, { data: null })}
        />
      </View>
      <PopupMessage
        onSelect={async (status) => {
          setModalMode('')
          if (status !== 'ok') {
            setThPass(null)
            return
          }

          if (next) {
            navigation.navigate(next, { data: thPass })
          } else {
            navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] })
          }
        }}
        title={
          modalMode === 'ok' ? (
            <Text style={styles.titleModal}>{I18n.t('record_found')}</Text>
          ) : (
            <View style={styles.errorTitleViewModal}>
              <Icon name='alert-circle-outline' size={32} color={COLORS.RED_WARNING} />
              <Text style={styles.errorTitleModal}>{I18n.t('error')}</Text>
            </View>
          )
        }
        modalVisible={!!modalMode}
        setModalVisible={() => setModalMode('')}
        noOkButton={modalMode === 'error'}
        okLabel={I18n.t('import')}
      >
        {thPass && modalMode === 'ok' ? (
          <>
            <Text style={{ textAlign: 'center' }}>
              {'\n'}
              {I18n.t('firstname_lastname')}
              <Text style={styles.popupText}>
                {'\n'}
                {thPass.first_name + ' ' + thPass.last_name}
              </Text>
              {'\n'}
            </Text>
            <Text style={{ textAlign: 'center' }}>
              {I18n.t('thailand_pass_id')}
              {'\n'}
              <Text style={styles.popupText}>{thPass.thailand_pass_id}</Text>
            </Text>
          </>
        ) : (
          <Text>{I18n.t('incorrect_qr')}</Text>
        )}
      </PopupMessage>
    </WhiteBackground>
  )
}

const windowSize = Dimensions.get('window')
const size = Math.min(windowSize.width, windowSize.height) - padding * 8

const styles = StyleSheet.create({
  cameraContainer: {
    height: size,
    backgroundColor: 'black',
  },
  cameraStyle: {
    height: size,
    width: windowSize.width,
    overflow: 'hidden',
  },
  title: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
    color: COLORS.DARK_BLUE,
    paddingHorizontal: padding * 4,
  },
  subTitle: {
    marginTop: 16,
    fontSize: FONT_SIZES[500],
    fontFamily: FONT_MED,
    color: COLORS.DARK_BLUE,
    lineHeight: 30,
    paddingHorizontal: padding * 4,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: 'white',
    borderColor: COLORS.DARK_BLUE,
    borderWidth: 1,
    marginTop: 20,
    padding,
    margin: padding * 4,
    width: size - padding * 6,
  },
  titleButton: {
    color: COLORS.DARK_BLUE,
  },
  galleryIcon: {},
  popupText: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[500],
    textAlign: 'center',
  },
  titleModal: {
    color: COLORS.DARK_BLUE,
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
  },
  errorTitleModal: {
    color: COLORS.RED_WARNING,
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
  },
  errorTitleViewModal: {
    alignItems: 'center',
  },
})

export default ThailandPassQrScanner
