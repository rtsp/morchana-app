import React from 'react'
import { COLORS, FONT_BOLD, FONT_SIZES, FONT_MED } from '../../styles'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import I18n from 'i18n-js'
import { WhiteBackground } from '../../components/WhiteBackground'
import { PageBackButton } from './components/PageBackButton'
import { normalize } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PrimaryButton } from '../../components/Button'

const padding = normalize(4)

export const OnboardQrScanner = () => {
  const onScan = () => console.log('on scan naja')
  const inset = useSafeAreaInsets()

  return (
    <WhiteBackground>
      <View style={inset}>
        <PageBackButton label={I18n.t('privacy_notice')} />
        <Text style={styles.title}>{I18n.t('scan_qr_code')}</Text>
        <Text style={styles.subTitle}>{'Scan QR code Thailand pass for get information.'}</Text>

        <View style={styles.cameraContainer}>
          <QRCodeScanner
            showMarker
            markerStyle={{
              borderColor: COLORS.WHITE,
            }}
            cameraStyle={styles.cameraStyle}
            onRead={onScan}
            fadeIn={false}
            reactivate
            reactivateTimeout={5000}
          />
        </View>
        <PrimaryButton
          title={I18n.t('select_image_from_gallery')}
          style={styles.button}
          titleStyle={styles.titleButton}
          onPress={async () => {}}
        />
      </View>
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
})
