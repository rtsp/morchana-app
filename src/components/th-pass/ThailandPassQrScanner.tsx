import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { Dimensions, PermissionsAndroid, StyleSheet, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import I18n from '../../../i18n/i18n'
import { getThailandPass } from '../../api'
import { PrimaryButton } from '../../components/Button'
import { WhiteBackground } from '../../components/WhiteBackground'
import { PageBackButton } from '../../navigations/2-Onboarding/components/PageBackButton'
import PopupMessage from '../../navigations/3-MainApp/NewMainApp/PopupMessage'
import usePopup from '../../services/use-popup'
import { ThailandPassProfile } from '../../services/use-vaccine'
import { COLORS, FONT_BOLD, FONT_MED, FONT_SIZES } from '../../styles'

const padding = normalize(4)

const ThailandPassQrScanner: React.FC<{
  next: string
}> = ({ next }) => {
  const navigation = useNavigation()
  const { showPopup } = usePopup()
  const [modalMode, setModalMode] = useState<'error' | 'ok' | ''>('')
  const [thPass, setThPass] = useState<ThailandPassProfile | null>(null)
  const validateThailandPass = (uri: string) => {
    getThailandPass({ uri })
      .then((res) => {
        if (!res || res.error || !res.data) {
          console.error('thailand pass error', res.error)
          setModalMode('error')
          return
        }

        setThPass(res.data)
        setModalMode('ok')
      })
      .catch((e) => {
        console.error('thailand pass error', e)
      })
  }
  const inset = useSafeAreaInsets()

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Cool Photo App Camera Permission',
          message: 'Cool Photo App needs access to your camera ' + 'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        })
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the camera')
        } else {
          console.log('Camera permission denied')
        }
      } catch (err) {
        console.warn(err)
      }
    }
    requestCameraPermission()
  }, [])

  return (
    <WhiteBackground>
      <View style={inset}>
        <PageBackButton label={I18n.t('privacy_notice')} />
        <Text style={styles.title}>{I18n.t('scan_qr_code')}</Text>
        <Text style={styles.subTitle}>{I18n.t('scan_description_thailandpass_qr')}</Text>

        <View style={styles.cameraContainer}>
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
        </View>

        {/* <TouchableOpacity onPress={()=> {

          }}>
          [><Image source={require('../../assets/gallery.png')} resizeMode='contain' style={styles.galleryIcon} /><]
          <MaterialCommunityIcons name='insert-photo-outlined' color='white' size={36} />
        </TouchableOpacity> */}

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

          // console.log('onSelect')
          // await AsyncStorage.setItem('th-pass', JSON.stringify(thPass))
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
            <Text style={{}}>
              {I18n.t('firstname_lastname')}
              <Text style={styles.textBold}>
                {'  '}
                {thPass.first_name + ' ' + thPass.last_name}
              </Text>
              {'\n\n'}
            </Text>
            <Text>
              {I18n.t('thailand_pass_id')}
              {'  '}
              <Text style={styles.textBold}>{thPass.thailand_pass_id}</Text>
              {'\n\n'}
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
const size = Math.min(windowSize.width, windowSize.height) - padding - padding

const styles = StyleSheet.create({
  cameraContainer: {
    textAlign: 'center',
    padding,
    height: size + padding + padding,
  },
  cameraStyle: {
    height: size,
    width: size,
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
  textBold: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[500],
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
