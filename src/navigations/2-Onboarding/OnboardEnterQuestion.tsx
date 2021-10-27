import { useNavigation } from '@react-navigation/native'
import I18n from 'i18n-js'
import React, { useCallback, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { normalize } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome'
import { PrimaryButton } from '../../components/Button'
import { WhiteBackground } from '../../components/WhiteBackground'
import { COE_ENABLED } from '../../constants'
import { COLORS, FONT_BOLD, FONT_MED, FONT_SIZES } from '../../styles'
import { PageBackButton } from './components/PageBackButton'

type SelectValueType = boolean | string

type RadioButtonType = {
  isSelected: boolean
  label: string
  value: SelectValueType
  onSelect: (value: SelectValueType) => void
}

const padding = normalize(16)
const PRIMARY_COLOR = COLORS.BLUE_BUTTON

export const OnboardEnterQuestion = () => {
  const [selected, setSelected] = useState<SelectValueType>(true)
  const onChange = (value: SelectValueType) => setSelected(value)
  const navigation = useNavigation()
  const inset = useSafeAreaInsets()

  const onSelect = useCallback((itemValue: SelectValueType) => {
    onChange(itemValue)
  }, [])

  const onSubmit = () => {
    if (selected) {
      if (COE_ENABLED) {
        navigation.navigate('OnboardCoeChecking')
      } else {
        navigation.navigate('OnboardThailandPassConsent')
      }
      return
    }
    navigation.navigate('AuthPhone')
  }

  const selectOptions = [
    { value: true, label: I18n.t('yes') },
    { value: false, label: I18n.t('no') },
  ]

  return (
    <WhiteBackground>
      <View style={[styles.container, inset]}>
        <PageBackButton label={I18n.t('select_image_profile')} />

        <View style={styles.contentContainer}>
          <View style={{ ...styles.flexRow, padding }}>
            <Text style={styles.textQuestion}>{I18n.t('planning_to_enter_thailand_question')}</Text>
          </View>
          {selectOptions.map((option) => {
            return (
              <RadioButton
                key={`key-${option.value}`}
                isSelected={selected === option.value}
                value={option.value}
                label={option.label}
                onSelect={(itemValue: SelectValueType) => onSelect(itemValue)}
              />
            )
          })}
        </View>
      </View>
      <View style={[styles.footer, { bottom: inset.bottom }]}>
        <PrimaryButton
          style={styles.primaryButton}
          containerStyle={styles.fullWidth}
          title={I18n.t('confirm')}
          onPress={onSubmit}
        />
      </View>
    </WhiteBackground>
  )
}

const RadioButton = (props: RadioButtonType) => {
  const { label, value, isSelected, onSelect } = props

  const buttonContainerStyle = () => {
    const coreStyle = styles.buttonContainer
    return !isSelected ? coreStyle : { ...coreStyle, ...styles.buttonContainerIsSelected }
  }
  const buttonTextStyle = () => {
    const coreStyle = { ...styles.label, flex: 1 }
    return { ...coreStyle, color: PRIMARY_COLOR }
  }
  return (
    <TouchableOpacity onPress={() => onSelect(value)}>
      <View style={buttonContainerStyle()}>
        <Text style={buttonTextStyle()}>{label}</Text>
        {isSelected ? <Icon name='check' size={20} color={PRIMARY_COLOR} /> : null}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    padding,
    paddingTop: 180,
  },
  buttonContainerIsSelected: {
    borderColor: PRIMARY_COLOR,
    borderWidth: 2,
    marginBottom: 7,
  },
  buttonContainer: {
    paddingVertical: 12,
    borderColor: COLORS.DARK_BLUE,
    borderWidth: 1,
    marginBottom: 6,
    paddingHorizontal: padding,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 5,
    shadowOffset: { width: 1, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: FONT_MED,
    fontSize: FONT_SIZES[600],
  },
  textQuestion: {
    color: PRIMARY_COLOR,
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[600],
  },
  primaryButton: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: COLORS.DARK_BLUE,
    backgroundColor: COLORS.DARK_BLUE,
  },
  footer: {
    width: '100%',
    position: 'absolute',
    alignItems: 'center',
    marginBottom: padding,
    paddingHorizontal: padding,
  },
})
