import React, { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import PopupMessage, { PopupMessageProps } from '../navigations/3-MainApp/NewMainApp/PopupMessage'

type PopupContextProps = Omit<PopupMessageProps, 'modalVisible' | 'setModalVisible'> & { content?: ReactNode }

export const PopupContext = createContext<{
  showPopup: (props: PopupContextProps) => void
  setModalVisible: (visible: boolean) => void
}>({
  showPopup: () => undefined,
  setModalVisible: () => undefined,
})

export const PopupContextProvider: React.FC = memo(({ children }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [popup, setPopup] = useState<PopupContextProps>({})

  const showPopup = useCallback((props: PopupContextProps) => {
    setModalVisible(true)
    setPopup(props)
  }, [])

  const value = useMemo(() => ({ showPopup, setModalVisible }), [showPopup])

  return (
    <PopupContext.Provider value={value}>
      {children}
      <PopupMessage {...popup} modalVisible={modalVisible} setModalVisible={setModalVisible}>
        {popup.content}
      </PopupMessage>
    </PopupContext.Provider>
  )
})

const usePopup = () => useContext(PopupContext)

export default usePopup
