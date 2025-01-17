import i18n from 'react-native-i18n'
import th from './locales/th'
import en from './locales/en'
// import ma from './locales/ma'
// import lo from './locales/lo'
// import km from './locales/km'
// import id from './locales/id'
import { Platform, NativeModules } from 'react-native'

function getSystemLocale() {
  var locale = ''
  console.log('Platform.OS', Platform.OS)
  if (Platform.OS === 'ios') {
    locale =
      NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] ||
      ''
    console.log('Apple Locale', NativeModules.SettingsManager.settings.AppleLocale)
  } else {
    locale = NativeModules.I18nManager.localeIdentifier || ''
    console.log('Android Locale', locale)
  }

  const lang = locale.indexOf('th') === 0 ? 'th' : 'en'
  console.log('getSystemLocale', lang)

  return lang
}

export const systemLocale = getSystemLocale()

i18n.locale = systemLocale
i18n.defaultLocale = systemLocale
i18n.fallbacks = true

i18n.translations = {
  th,
  en,
  // ma,
  // lo,
  // km,
  // id
}

export default i18n
