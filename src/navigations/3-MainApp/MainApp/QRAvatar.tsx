import React, { useState } from 'react'
import { Dimensions, TouchableWithoutFeedback, View } from 'react-native'
import { CircularProgressAvatar } from '../../../components/CircularProgressAvatar'
import { QR_STATE, SelfQR } from '../../../state/qr'
import { userPrivateData } from '../../../state/userPrivateData'
import { COLORS } from '../../../styles'
import { UpdateProfileButton } from './UpdateProfileButton'

export const QRAvatar = ({ qr, qrState }: { qr: SelfQR; qrState: QR_STATE }) => {
  const [faceURI, setFaceURI] = useState(userPrivateData.getFace())
  // const resetTo = useResetTo()

  const color = qr
    ? qr.getStatusColor()
    : qrState === QR_STATE.NOT_VERIFIED || qrState === QR_STATE.FAILED
    ? COLORS.ORANGE_2
    : COLORS.GRAY_2

  const avatarWidth = Math.min(200, Math.floor((20 / 100) * Dimensions.get('screen').height))

  // useEffect(() => {
  //   RNFS.exists(faceURI).then((exists) => {
  //     console.log('exists', exists)
  //     if (!exists) {
  //       resetTo({
  //         name: 'Onboarding',
  //       })
  //     }
  //   })
  // }, [])
  return (
    <TouchableWithoutFeedback>
      <View
        style={{
          alignItems: 'center',
          position: 'relative',
          marginTop: 20,
        }}
      >
        <View style={{ position: 'relative' }}>
          <CircularProgressAvatar
            key={qr ? qr.getCreatedDate() : 0}
            image={faceURI ? { uri: faceURI } : void 0}
            color={color}
            progress={100}
            width={avatarWidth}
          />
          <UpdateProfileButton
            width={Math.floor(avatarWidth / 6)}
            style={{
              position: 'absolute',
              bottom: Math.floor((8 / 100) * avatarWidth),
              right: Math.floor((8 / 100) * avatarWidth),
            }}
            onChange={setFaceURI}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}
