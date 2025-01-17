import I18n from 'i18n-js'
import React, { useCallback, useState, useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { normalize } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import { PrimaryButton } from '../../components/Button'
import { FONT_BOLD, FONT_MED, FONT_SIZES, COLORS } from '../../styles'
import { useNavigation } from '@react-navigation/native'
import { WhiteBackground } from '../../components/WhiteBackground'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SelectLanguageOption = [
  {
    label: 'English',
    value: 'en',
    title: 'Choose Language',
  },
  {
    label: 'ภาษาไทย',
    value: 'th',
    title: 'เลือกภาษา',
  },
]

type LangOptions = 'th' | 'en'

type RadioButtonType = {
  isSelected: boolean
  label: string
  value: LangOptions
  onSelect: (value: LangOptions) => void
}

const padding = normalize(16)
const PRIMARY_COLOR = COLORS.BLUE_BUTTON

export const SelectLanguageScreen = () => {
  const inset = useSafeAreaInsets()
  const [selected, setSelected] = useState<LangOptions>('en')
  const [confirmButtonLabel, setConfirmButtonLabel] = useState(I18n.t('next'))
  const navigation = useNavigation()

  const onSelect = useCallback((itemValue: LangOptions) => {
    setSelected(itemValue)
  }, [])

  const onConfirm = async () => {
    navigation.navigate('AgreementPolicy')
  }

  useEffect(() => {
    I18n.locale = selected
    setConfirmButtonLabel(I18n.t('next'))
  }, [selected])

  return (
    <WhiteBackground>
      <View style={[styles.contentContainer, inset]}>
        <View style={{ padding }}>
          <Text style={styles.textQuestion}>Choose Language</Text>
          <Text style={styles.textQuestion}>เลือกภาษา</Text>
        </View>
        {SelectLanguageOption.map((option) => {
          return (
            <RadioButton
              key={`key-${option.value}`}
              isSelected={selected === option.value}
              value={option.value}
              label={option.label}
              onSelect={(itemValue: LangOptions) => onSelect(itemValue)}
            />
          )
        })}
      </View>
      <View style={[styles.footer, { bottom: inset.bottom, left: inset.left, right: inset.right }]}>
        <PrimaryButton
          style={styles.primaryButton}
          containerStyle={styles.fullWidth}
          title={confirmButtonLabel}
          disabled={!selected}
          onPress={onConfirm}
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
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding,
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
    backgroundColor: 'white',
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
    marginBottom: padding,
    paddingHorizontal: padding,
  },
})
