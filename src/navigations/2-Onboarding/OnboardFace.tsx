import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Image, ImageURISource, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Avatar, normalize } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import I18n from '../../../i18n/i18n'
import { PrimaryButton } from '../../components/Button'
import Texts from '../../components/Texts'
import { WhiteBackground } from '../../components/WhiteBackground'
import { useHUD } from '../../HudView'
import useCamera from '../../services/use-camera'
import { applicationState } from '../../state/app-state'
import { userPrivateData } from '../../state/userPrivateData'
import { COLORS, FONT_BOLD, FONT_SIZES } from '../../styles'
import { useCameraPermission } from '../../utils/Permission'

const padding = normalize(16)

const ListItem = ({ source, label, onPress }: { source: ImageURISource; label: string; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.wFull} onPress={onPress}>
      <View style={styles.listItem}>
        <Image style={styles.listImage} source={source} width={24} />
        <Texts.Normal style={styles.listLabel}>{label}</Texts.Normal>
      </View>
    </TouchableOpacity>
  )
}

export const OnboardFace = () => {
  const [uri, setUri] = React.useState<string>(userPrivateData.getFace() ?? '')
  const [popupCamera, setPopupCamera] = React.useState(false)
  const area = useSafeAreaInsets()
  const navigation = useNavigation()
  const { openGallery } = useCamera()
  const { showSpinner, hide } = useHUD()
  const { request } = useCameraPermission()

  // React.useEffect(() => {
  //   if (uri) {
  //     RNFS.exists(uri).then((exists) => {
  //       console.log('exists', exists)
  //       if (!exists) {
  //         setUri('')
  //       }
  //     })
  //   }
  // }, [uri])

  React.useEffect(() => {
    const isPassedOnboarding = applicationState.getData('isPassedOnboarding')
    if (isPassedOnboarding) {
      navigation.navigate('OnboardLocation')
    }
  }, [navigation])

  const navigateToCamera = () => {
    setPopupCamera(false)

    request().then((granted) => {
      if (granted) {
        navigation.navigate('OnboardFaceCamera', { setUri })
      } else {
        navigation.navigate('OnboardEnterQuestion')
      }
    })
  }

  const navigateToGallery = () => {
    setPopupCamera(false)
    openGallery().then((asset) => {
      if (!asset?.uri) return
      setUri(asset.uri)
    })
  }

  const setPopupCameraSelector = () => {
    setPopupCamera(!popupCamera)
  }

  const footerStyle = {
    bottom: area.bottom,
    left: area.left,
    right: area.right,
  }

  const footerButtonStyle = popupCamera ? { backgroundColor: COLORS.BACKGROUND } : { backgroundColor: COLORS.DARK_BLUE }
  const footerTitleButtonStyle = popupCamera ? { color: COLORS.DARK_BLUE } : { color: COLORS.BACKGROUND }

  return (
    <WhiteBackground>
      <View style={[styles.container, area]}>
        <StatusBar backgroundColor={COLORS.WHITE} barStyle='dark-content' />
        {/* <PageBackButton label={I18n.t('term_and_conditions')} /> */}
        <View style={styles.header}>
          <Text style={styles.title}>{I18n.t('select_image_profile')}</Text>
        </View>
        <TouchableOpacity style={styles.contentContainer} onPress={() => setPopupCamera(false)}>
          <View style={styles.content}>
            <View style={styles.profileImage}>
              <Avatar size={128} rounded source={uri ? { uri } : require('../../assets/profile_placeholder.png')} />
            </View>
            <Texts.Normal style={styles.photoDescription}>{I18n.t('photo_description')}</Texts.Normal>
          </View>
        </TouchableOpacity>
      </View>
      <View style={[styles.footer, footerStyle]}>
        {popupCamera ? (
          <View style={styles.footerPopup}>
            <ListItem source={require('../../assets/camera.png')} label={I18n.t('camera')} onPress={navigateToCamera} />
            <ListItem
              source={require('../../assets/gallery.png')}
              label={I18n.t('gallery')}
              onPress={navigateToGallery}
            />
            <View style={styles.footerButtonContainer}>
              <PrimaryButton
                style={{ ...styles.primaryButton, ...footerButtonStyle }}
                containerStyle={styles.primaryButtonContainer}
                titleStyle={footerTitleButtonStyle}
                title={I18n.t('cancel')}
                onPress={setPopupCameraSelector}
              />
            </View>
          </View>
        ) : (
          <React.Fragment>
            <View style={styles.footerButtonContainer}>
              <PrimaryButton
                style={uri ? styles.primaryButtonChangProfile : { ...styles.primaryButton, ...footerButtonStyle }}
                containerStyle={styles.primaryButtonContainer}
                titleStyle={uri ? { color: COLORS.DARK_BLUE } : footerTitleButtonStyle}
                title={uri ? I18n.t('change_profile_image') : I18n.t('add_image')}
                onPress={setPopupCameraSelector}
              />
              {uri ? (
                <PrimaryButton
                  style={styles.nextButton}
                  containerStyle={styles.primaryButtonContainer}
                  titleStyle={footerTitleButtonStyle}
                  title={I18n.t('next')}
                  onPress={async () => {
                    if (uri) {
                      showSpinner()
                      try {
                        await userPrivateData.setFace(uri, { isTempUri: true })
                      } catch (e) {
                        console.error(e)
                      }
                      // navigation.navigate('OnboardLocation')
                      setTimeout(() => {
                        hide()
                        navigation.navigate('OnboardEnterQuestion')
                      }, 1000)
                    }
                  }}
                />
              ) : null}
            </View>
          </React.Fragment>
        )}
      </View>
    </WhiteBackground>
  )
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  button: {
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: padding / 2,
    borderColor: COLORS.BLUE,
    paddingHorizontal: padding,
    marginTop: padding,
    borderRadius: padding / 2,
  },
  contentContainer: {
    flex: 1,
    marginBottom: padding,
  },
  content: {
    alignItems: 'center',
    marginTop: padding * 2,
  },
  profileImage: {
    marginBottom: padding * 2,
  },
  footer: {
    marginBottom: padding,
    position: 'absolute',
    width: '100%',
  },
  header: {
    textAlign: 'left',
    marginTop: padding,
    marginBottom: padding,
    marginHorizontal: padding,
  },
  title: {
    fontSize: FONT_SIZES[600],
    color: COLORS.DARK_BLUE,
    fontFamily: FONT_BOLD,
  },
  photoDescription: {
    color: COLORS.DARK_BLUE,
    width: '80%',
    textAlign: 'center',
    lineHeight: 23,
  },
  wFull: {
    width: '100%',
  },
  primaryButtonContainer: {
    width: '100%',
  },
  footerButtonContainer: {
    marginTop: padding,
    paddingLeft: padding,
    paddingRight: padding,
  },
  primaryButton: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: COLORS.DARK_BLUE,
  },
  primaryButtonChangProfile: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: COLORS.DARK_BLUE,
    backgroundColor: COLORS.BACKGROUND,
  },
  nextButton: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: COLORS.DARK_BLUE,
    backgroundColor: COLORS.DARK_BLUE,
    marginTop: padding,
  },
  footerPopup: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: '#E7E7E7',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    paddingTop: 24,
  },
  listItem: {
    flexDirection: 'row',
    height: 44,
    alignItems: 'center',
    marginLeft: 40,
    marginBottom: 8,
  },
  listImage: {
    marginRight: 10,
  },
  listLabel: {
    color: COLORS.DARK_BLUE,
  },
})
