import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Input, normalize } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import I18n from '../../../i18n/i18n'
import { COLORS, FONT_BOLD, FONT_MED, FONT_SIZES } from '../../styles'
import { PrimaryButton } from '../Button'
import { WhiteBackground } from '../WhiteBackground'
import RNPickerSelect from 'react-native-picker-select'
import { getNationalityList, getPrefixNameList } from '../../api'

const padding = normalize(16)

type InputBoxType = 'text' | 'select_prefix_name' | 'select_national'

type ThPassFormData = {
  prefix_name: string
  name: string
  surname: string
  nationality: string
  thailand_pass_id: string
  passport_no: string
}

const thPassFieldInfo: { label: string; type: InputBoxType } = [
  { id: 'prefix_name', label: 'prefix_name', type: 'text' },
  { id: 'first_name', label: 'first_name', type: 'text' },
  { id: 'last_name', label: 'last_name', type: 'text' },
  { id: 'nationality', label: 'nationality', type: 'text' },
  { id: 'thailand_pass_id', label: 'thailand_pass_id', type: 'text' },
  { id: 'passport_no', label: 'passport_no', type: 'text' },
]

const InputBox: React.FC<{
  label: string
  value: any
  type: InputBoxType
  onChange?: (value: any) => void
  error?: string
}> = ({ label, value, type, error, onChange }) => {
  const [items, setItems] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    switch (type) {
      case 'select_national':
        getNationalityList().then(setItems)
        break
      case 'select_prefix_name':
        getPrefixNameList().then(setItems)
        break
    }
  }, [type])

  return (
    <View>
      <Text>{label}</Text>
      {type === 'select_national' || type === 'select_prefix_name' ? (
        <RNPickerSelect value={value} items={items} />
      ) : (
        <View>
          <Input
            value={value}
            keyboardType='number-pad'
            label={label}
            // placeholder={I18n.t('coe_reference_id_ex')}
            inputStyle={{ fontFamily: FONT_MED, fontSize: FONT_SIZES[600] }}
            onChangeText={onChange}
            inputContainerStyle={{ ...styles.textInput, borderColor: error ? COLORS.DANGER : COLORS.GRAY_6 }}
            errorMessage={error}
            errorStyle={{ fontFamily: FONT_MED, fontSize: FONT_SIZES[500] }}
          />
        </View>
      )}
    </View>
  )
}

export const OnboardThailandPassProfile = () => {
  const inset = useSafeAreaInsets()
  const navigation = useNavigation()
  const [formData, setFormData] = useState<Partial<ThPassFormData>>({})

  return (
    <WhiteBackground style={styles.background}>
      <ScrollView contentContainerStyle={styles.fillHeight} bounces={false}>
        <View style={[styles.contentContainer, { top: inset.top }]}>
          <Text style={styles.title}>{I18n.t('personal_information')}</Text>
          <View style={styles.content}>
            {thPassFieldInfo.map((datum, i) => {
              return (
                <InputBox
                  key={i}
                  label={I18n.t(datum.label)}
                  value={formData[datum.id]}
                  onChange={(value) => setFormData((data) => ({ ...data, [datum.id]: value }))}
                />
              )
            })}
          </View>
        </View>
        <View style={[styles.footer, { bottom: inset.bottom + padding * 2, left: inset.left, right: inset.right }]}>
          <PrimaryButton
            title={I18n.t('scan_qr_button')}
            titleStyle={styles.buttonTitle1}
            style={styles.button1}
            containerStyle={styles.fullWidth}
            onPress={() => navigation.navigate('OnboardQrScanner')}
          />
          <PrimaryButton
            title={I18n.t('save')}
            titleStyle={styles.buttonTitle2}
            style={styles.button2}
            containerStyle={styles.fullWidth}
            onPress={() => navigation.navigate('OnboardQrScanner')}
          />
        </View>
      </ScrollView>
    </WhiteBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
    color: COLORS.DARK_BLUE,
  },
  imageContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  content: {
    marginTop: 16,
    fontSize: FONT_SIZES[500],
    fontFamily: FONT_MED,
    color: COLORS.DARK_BLUE,
    lineHeight: 30,
  },
  container: {
    backgroundColor: COLORS.DARK_BLUE,
    height: Dimensions.get('window').height,
  },
  contentContainer: {
    padding,
  },
  imageStyle: {
    marginVertical: 32,
    width: Dimensions.get('window').width - 36,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: padding,
  },
  fullWidth: {
    width: '100%',
  },
  button1: {
    backgroundColor: COLORS.DARK_BLUE,
    width: '100%',
  },
  buttonTitle1: {
    color: 'white',
  },
  button2: {
    backgroundColor: 'white',
    borderColor: COLORS.DARK_BLUE,
    borderWidth: 1,
    borderRadius: 4,
    width: '100%',
    marginTop: padding,
  },
  buttonTitle2: {
    color: COLORS.DARK_BLUE,
  },
  fillHeight: {
    flexGrow: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 5,
  },
})
