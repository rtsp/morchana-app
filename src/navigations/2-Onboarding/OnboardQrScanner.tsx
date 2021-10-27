import React, { useState } from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { normalize } from 'react-native-elements'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { PrimaryButton } from '../../components/Button'
import { WhiteBackground } from '../../components/WhiteBackground'
import { COLORS, FONT_BOLD, FONT_MED, FONT_SIZES } from '../../styles'
import { PageBackButton } from './components/PageBackButton'
import { SelectImageButton } from '../../components/Camera'
import { getThailandPass, ThailandPass } from '../../services/use-vaccine'
import AsyncStorage from '@react-native-community/async-storage'
import { useNavigation } from '@react-navigation/native'
import PopupImportVaccine from '../3-MainApp/NewMainApp/PopupImportVaccine'
import I18n from '../../../i18n/i18n'

const padding = normalize(4)

export const OnboardQrScanner = () => {
  const [modalMode, setModalMode] = useState<'error' | 'ok' | ''>('')
  const navigation = useNavigation()
  const [thPass, setThPass] = useState<ThailandPass | null>(null)
  const validateThailandPass = (uri: string) => {
    getThailandPass({ uri })
      .then((res) => {
        if (!res || res.error) {
          console.error('thailand pass error', res.error)
          setModalMode('error')
          return
        }

        setThPass(res)
        setModalMode('ok')
      })
      .catch((e) => {
        console.error('thailand pass error', e)
      })
  }
  const inset = useSafeAreaInsets()

  return (
    <WhiteBackground>
      <View style={inset}>
        <PageBackButton label={I18n.t('privacy_notice')} />
        <Text style={styles.title}>{I18n.t('scan_qr_code')}</Text>
        <Text style={styles.subTitle}>{`Scan Thailand Pass's QR code to get information.`}</Text>

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
          onPress={async () => {}}
        />
      </View>
      <PopupImportVaccine
        onSelect={async (status) => {
          setModalMode('')
          if (status !== 'ok') {
            setThPass(null)
            return
          }

          console.log('onSelect')
          await AsyncStorage.setItem('th-pass', JSON.stringify(thPass))
          navigation.navigate('OnboardCoeLanding')
        }}
        title={
          modalMode === 'ok' ? (
            <Text style={styles.titleModal}>{I18n.t('record_found')}</Text>
          ) : (
            <Text style={styles.errorTitleModal}>{I18n.t('error')}</Text>
          )
        }
        modalVisible={!!modalMode}
        setModalVisible={() => setModalMode('')}
        noOkButton={modalMode === ''}
        okLabel={I18n.t('import')}
      >
        {thPass ? (
          <>
            <Text style={{}}>
              {I18n.t('firstname_lastname')}
              <Text style={styles.textBold}>
                {'  '}
                {thPass.f_name + ' ' + thPass.l_nmae}
              </Text>
              {'\n\n'}
            </Text>
            <Text>
              {I18n.t('thailand_pass_id')}
              {'  '}
              <Text style={styles.textBold}>{thPass.id}</Text>
              {'\n\n'}
            </Text>
          </>
        ) : (
          <Text>{I18n.t('incorrect_qr')}</Text>
        )}
      </PopupImportVaccine>
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
  },
  errorTitleModal: {
    color: COLORS.RED_WARNING,
  },
})
