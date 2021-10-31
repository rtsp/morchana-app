import { useNavigation, RouteProp } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import RNPickerSelect from 'react-native-picker-select'
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Input, normalize } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import I18n from '../../../i18n/i18n'
import { getNationalityList, getPrefixNameList, sendThailandPassForm } from '../../api'
import { PageBackButton } from '../../navigations/2-Onboarding/components/PageBackButton'
import PopupImportVaccine from '../../navigations/3-MainApp/NewMainApp/PopupImportVaccine'
import { ThailandPassProfile } from '../../services/use-vaccine'
import { COLORS, FONT_BOLD, FONT_MED, FONT_SIZES } from '../../styles'
import { PrimaryButton } from '../Button'
import { WhiteBackground } from '../WhiteBackground'
import AsyncStorage from '@react-native-community/async-storage'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const padding = normalize(16)

type InputBoxType = 'text' | 'select_prefix_name' | 'select_national'

const thPassFieldInfo: { id: keyof ThailandPassProfile; label: string; type: InputBoxType; required?: boolean }[] = [
  { id: 'prefix_name', label: 'prefix_name', type: 'select_prefix_name', required: true },
  { id: 'first_name', label: 'first_name', type: 'text', required: true },
  { id: 'last_name', label: 'last_name', type: 'text', required: true },
  { id: 'nationality', label: 'nationality', type: 'select_national', required: true },
  { id: 'thailand_pass_id', label: 'thailand_pass_id', type: 'text', required: true },
  { id: 'passport_no', label: 'passport_no', type: 'text', required: true },
]

const InputBox: React.FC<{
  label: string
  value: any
  type: InputBoxType
  onChange?: (value: any) => void
  disabled?: boolean
  error?: boolean
}> = ({ label, value = null, type, error, onChange, disabled }) => {
  const [items, setItems] = useState<{ label: string; value: string }[]>([])
  const timerRef = useRef(0)

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
    <View style={{ paddingBottom: padding / 2 }}>
      {type === 'select_national' || type === 'select_prefix_name' ? (
        <View style={{ paddingHorizontal: padding / 2 }}>
          <Text style={styles.textLabel}>{label}</Text>
          <View
            style={[
              styles.textInputBox,
              { borderColor: error && !disabled ? COLORS.DANGER : COLORS.GRAY_6 },
              disabled && styles.disabledView,
            ]}
          >
            <RNPickerSelect
              key={type}
              value={value}
              items={items || []}
              itemKey='value'
              style={{
                inputIOS: { ...styles.textSelect, ...(disabled && styles.disabledTextPicker) },
                inputAndroid: { ...styles.textSelect, ...(disabled && styles.disabledTextPicker) },
              }}
              placeholder={{ value: '', label: '' }}
              onValueChange={(value) => {
                if (timerRef.current) clearTimeout(timerRef.current)
                timerRef.current = setTimeout(() => {
                  timerRef.current = 0
                  onChange && onChange(value)
                }, 200)
              }}
              disabled={disabled}
            />
          </View>
        </View>
      ) : (
        <Input
          value={value}
          label={label}
          inputStyle={{ ...styles.textValue, ...(disabled && styles.disabledText) }}
          labelStyle={styles.textLabel}
          onChangeText={onChange}
          inputContainerStyle={{
            ...styles.textInputBox,
            borderColor: error && !disabled ? COLORS.DANGER : COLORS.GRAY_6,
            ...(disabled && styles.disabledView),
          }}
          disabled={disabled}
        />
      )}
    </View>
  )
}

const ThailandPassForm: React.FC<{
  next?: string
  route?: RouteProp<{ data: ThailandPassProfile }, 'MainApp'>
}> = ({ next, route }) => {
  const initData = route?.params?.data as ThailandPassProfile
  const inset = useSafeAreaInsets()
  const navigation = useNavigation()
  const [formData, setFormData] = useState<Partial<ThailandPassProfile>>(initData || {})
  const [formMode, setFormMode] = useState<'edit' | 'submit'>('edit')
  const [errorModalMessage, setErrorModalMessage] = useState<string | undefined>()
  const [warnEmpty, setWarnEmpty] = useState(false)

  useEffect(() => {
    if (!initData) return

    setFormMode('submit')
    setFormData(initData)
  }, [initData])

  const formRef = useRef<Partial<ThailandPassProfile>>(formData)

  return (
    <WhiteBackground style={styles.background}>
      <View style={[styles.background, inset]}>
        <PageBackButton label={I18n.t('scan_qr_code')} />
        <ScrollView>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{I18n.t('personal_information')}</Text>
            <View style={styles.content}>
              {thPassFieldInfo.map((datum) => {
                return (
                  <InputBox
                    error={warnEmpty && !formData[datum.id]}
                    key={datum.id}
                    type={datum.type}
                    label={I18n.t(datum.label)}
                    value={formData[datum.id]}
                    disabled={formMode === 'submit'}
                    onChange={(value) => {
                      if (formRef.current[datum.id] === value) return
                      formRef.current[datum.id] = value
                      setFormData({ ...formRef.current, [datum.id]: value })
                    }}
                  />
                )
              })}
              {warnEmpty ? <Text style={styles.errorText}>{I18n.t('fill_error_message')}</Text> : null}
              <PrimaryButton
                title={formMode === 'edit' ? I18n.t('scan_qr_button') : I18n.t('edit')}
                titleStyle={styles.buttonTitle1}
                style={styles.button1}
                containerStyle={styles.fullWidth}
                onPress={() => {
                  if (formMode === 'edit') {
                    navigation.pop()
                  } else {
                    setFormMode('edit')
                  }
                }}
              />
              <PrimaryButton
                title={formMode === 'edit' ? I18n.t('save') : I18n.t('confirm')}
                titleStyle={styles.buttonTitle2}
                style={styles.button2}
                containerStyle={styles.fullWidth}
                onPress={async () => {
                  switch (formMode) {
                    case 'edit':
                      for (let item of thPassFieldInfo) {
                        if (item.required && !formData[item.id] && (!initData || initData[item.id])) {
                          setWarnEmpty(true)
                          return
                        }
                      }
                      setWarnEmpty(false)
                      setFormMode('submit')
                      break

                    case 'submit':
                      let res = await sendThailandPassForm(formData as ThailandPassProfile)

                      if (res.status === 'error' || res.error) {
                        setErrorModalMessage(res.error || res.message || I18n.t('system_error'))
                        return
                      }

                      AsyncStorage.setItem('th-pass', JSON.stringify(res.data))

                      if (next) {
                        navigation.navigate(next)
                      } else {
                        navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] })
                      }
                      break
                  }
                }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
      <PopupImportVaccine
        title={
          <View style={styles.errorTitleViewModal}>
            <Icon name='alert-circle-outline' size={32} color={COLORS.RED_WARNING} />
            <Text style={styles.errorTitleModal}>{I18n.t('error')}</Text>
          </View>
        }
        modalVisible={!!errorModalMessage}
        setModalVisible={() => setErrorModalMessage('')}
        noCancelButton
      >
        {errorModalMessage}
      </PopupImportVaccine>
    </WhiteBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
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
    paddingBottom: padding * 2,
  },
  imageStyle: {
    marginVertical: 32,
    width: Dimensions.get('window').width - 36,
  },
  fullWidth: {
    width: '100%',
  },
  button1: {
    backgroundColor: 'white',
    borderColor: COLORS.DARK_BLUE,
    borderWidth: 1,
    borderRadius: 4,
    marginTop: padding,
    width: '100%',
  },
  buttonTitle1: {
    color: COLORS.DARK_BLUE,
  },
  button2: {
    marginTop: padding / 2,
    backgroundColor: COLORS.DARK_BLUE,
    width: '100%',
  },
  buttonTitle2: {
    color: 'white',
  },
  fillHeight: {
    flex: 1,
  },
  textInputBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 5,
    height: 48,
  },
  textLabel: {
    color: COLORS.TEXT,
    fontFamily: FONT_MED,
    fontWeight: 'normal',
    fontSize: FONT_SIZES[500],
  },
  textValue: {
    fontFamily: FONT_MED,
    fontSize: FONT_SIZES[500],
    fontWeight: 'normal',
    paddingHorizontal: 8,
  },
  textSelect: {
    color: COLORS.TEXT,
    fontFamily: FONT_MED,
    fontSize: FONT_SIZES[500],
    fontWeight: 'normal',
    height: '100%',
    paddingHorizontal: 8,
  },
  errorTitleViewModal: {
    alignItems: 'center',
  },
  errorTitleModal: {
    color: COLORS.RED_WARNING,
  },
  errorText: { fontFamily: FONT_MED, fontSize: FONT_SIZES[500], color: COLORS.RED_WARNING },
  disabledText: {
    color: '#5f5f5f',
  },
  disabledTextPicker: {
    color: '#8A8A8A',
  },
  disabledView: {
    backgroundColor: COLORS.GRAY_6,
  },
})

export default ThailandPassForm
