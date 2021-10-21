import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { StatusBar, StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import { normalize } from 'react-native-elements'
import { SafeAreaView } from 'react-native-safe-area-context'
import I18n from '../../i18n/i18n'
import { PrimaryButton } from '../components/Button'
import { COLORS, FONT_BOLD, FONT_FAMILY, FONT_SIZES } from '../styles'
import { changeLangTo } from '../utils/change-lang'

export const ChangeLanguageScreen = () => {
  const navigation = useNavigation()
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'white'} barStyle='dark-content' />
      <View style={styles.header}>
        <Text style={styles.title}>{I18n.t('change_lang')} </Text>
      </View>
      <View style={styles.content}>
        <TouchableHighlight
          onPress={async () => {
            changeLangTo('th')
          }}
        >
          <View style={styles.section}>
            <Text style={styles.sectionText}>ไทย</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={async () => {
            changeLangTo('en')
          }}
        >
          <View style={styles.section}>
            <Text style={styles.sectionText}>English</Text>
          </View>
        </TouchableHighlight>
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          title={I18n.t('close')}
          style={{ width: '100%' }}
          containerStyle={{ width: '100%' }}
          onPress={() => {
            navigation.pop()
          }}
        />
      </View>
    </SafeAreaView>
  )
}

const padding = normalize(16)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionHeader: {
    height: 56,
    justifyContent: 'flex-end',
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    color: '#AAAAAA',
    fontSize: FONT_SIZES[600],
    fontFamily: FONT_FAMILY,
  },
  settingsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  header: {
    alignItems: 'flex-start',

    marginHorizontal: padding,
  },

  title: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
    alignItems: 'center',
    color: COLORS.BLACK_1,
    textAlign: 'center',
  },

  subtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES[500],
    lineHeight: 24,
    alignItems: 'center',
    color: COLORS.SECONDARY_DIM,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: FONT_SIZES[600],
    color: '#000000',
    fontFamily: FONT_FAMILY,
  },
  sectionDescription: {
    marginTop: 4,
    fontSize: FONT_SIZES[500],
    color: '#888888',
    fontFamily: FONT_FAMILY,
  },
  mediumText: {
    fontSize: FONT_SIZES[600],
    color: '#000000',
  },
  largeText: {
    fontSize: FONT_SIZES[700],
    color: '#000000',
    fontFamily: FONT_FAMILY,
  },
  sectionTitle: {
    fontSize: FONT_SIZES[700],
    fontWeight: '600',
    color: '#000000',
    fontFamily: FONT_FAMILY,
  },
  scrollView: {},
  content: {
    flex: 1,
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: padding,
    marginBottom: 16,
  },
})
