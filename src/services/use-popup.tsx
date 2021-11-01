import React, { createContext, useContext, useState, ReactNode } from 'react'
import PopupMessage, { PopupMessageProps } from '../navigations/3-MainApp/NewMainApp/PopupMessage'

type PopupContextProps = Omit<PopupMessageProps, 'modalVisible' | 'setModalVisible'> & { content?: ReactNode }

export const PopupContext = createContext<{
  showPopup: (props: PopupContextProps) => void
  setModalVisible: (visible: boolean) => void
}>({
  showPopup: () => undefined,
  setModalVisible: () => undefined,
})

export const PopupContextProvider: React.FC = ({ children }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [popup, setPopup] = useState<PopupContextProps>({})

  const showPopup = (props: PopupContextProps) => {
    setModalVisible(true)
    setPopup(props)
  }

  return (
    <PopupContext.Provider value={{ showPopup, setModalVisible }}>
      {children}
      <PopupMessage {...popup} modalVisible={modalVisible} setModalVisible={setModalVisible}>
        {popup.content}
      </PopupMessage>
    </PopupContext.Provider>
  )
}

const usePopup = () => useContext(PopupContext)

export default usePopup
