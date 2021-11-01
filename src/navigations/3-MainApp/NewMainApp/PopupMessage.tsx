import React from 'react'
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import I18n from '../../../../i18n/i18n'
import { Title } from '../../../components/Base'
import { FONT_BOLD, FONT_FAMILY } from '../../../styles'

export interface PopupMessageProps {
  modalVisible: boolean
  cancelLabel?: string
  noCancelButton?: boolean
  noOkButton?: boolean
  okLabel?: string
  onSelect?: (status: 'ok' | 'cancel') => void
  setModalVisible: (visible: boolean) => void
  title?: React.ReactNode
}

const PopupMessage: React.FC<PopupMessageProps> = ({
  onSelect,
  modalVisible,
  setModalVisible,
  title,
  okLabel,
  cancelLabel,
  children,
  noOkButton,
  noCancelButton,
}) => {
  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.')
        setModalVisible(false)
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {typeof title === 'string' ? <Title>{title}</Title> : title}
          {typeof children === 'string' ? <Text style={styles.description}>{children}</Text> : children}
          <View style={styles.buttonSection}>
            {!noCancelButton && (
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => {
                  setModalVisible(false)
                  onSelect && onSelect('cancel')
                }}
              >
                <Text style={[styles.textStyle, styles.textCancelButton]}>{cancelLabel || I18n.t('cancel')}</Text>
              </TouchableOpacity>
            )}
            {!noOkButton && (
              <TouchableOpacity
                style={[styles.button, styles.buttonOk]}
                onPress={() => {
                  setModalVisible(false)
                  onSelect && onSelect('ok')
                }}
              >
                <Text style={[styles.textStyle, styles.textOkButton]}>{okLabel || I18n.t('ok')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '77.7%',
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 5,
    elevation: 2,
    paddingVertical: 5,
    width: 115,
  },
  textStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    textAlign: 'center',
  },
  textOkButton: {
    color: '#fff',
  },
  textCancelButton: {
    color: '#1E4E87',
  },
  title: {
    color: '#1E4E87',
    fontFamily: FONT_BOLD,
    fontSize: 32,
    marginTop: 15,
    textAlign: 'center',
  },
  description: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    marginTop: 16,
    textAlign: 'center',
  },
  buttonSection: {
    flexDirection: 'row',
    marginTop: 48,
    marginRight: 24,
    marginLeft: 24,
    marginBottom: 24,
  },
  buttonOk: {
    marginLeft: 10,
    backgroundColor: '#1E4E87',
    color: '#fff',
  },
  buttonCancel: {
    marginRight: 10,
    backgroundColor: '#fff',
    borderColor: '#1E4E87',
    borderWidth: 1,
  },
})

export default PopupMessage
