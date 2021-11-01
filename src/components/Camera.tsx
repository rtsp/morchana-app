import styled from '@emotion/native'
import { useIsFocused } from '@react-navigation/native'
import React, { useRef, useState } from 'react'
// import ImagePicker from 'react-native-image-picker';
import { NativeModules, TouchableOpacity, View } from 'react-native'
import { RNCamera } from 'react-native-camera'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS } from '../styles'
import useCamera from '../services/use-camera'

const ShutterButtonOuter = styled.View`
  width: 72px;
  border-radius: 37px;
  border-style: solid;
  border-width: 4px;
  border-color: white;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
`

const ShutterButtonInner = styled.View`
  background-color: transparent;
  width: 62px;
  border-radius: 31px;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
`

const ShutterButton = styled.TouchableOpacity`
  background-color: ${COLORS.WHITE};
  width: 56px;
  border-radius: 28px;
  aspect-ratio: 1;
`

const FlashButton: React.FC<{
  flashMode: typeof RNCamera.Constants.FlashMode
  setFlashMode: (mode: typeof RNCamera.Constants.FlashMode) => void
}> = ({ flashMode, setFlashMode }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    // style={{ padding: 16 }}
    onPress={() => {
      const sequences = [
        RNCamera.Constants.FlashMode.on,
        RNCamera.Constants.FlashMode.auto,
        RNCamera.Constants.FlashMode.off,
      ]
      setFlashMode(sequences[(sequences.indexOf(flashMode) + 1) % sequences.length])
    }}
  >
    <MaterialCommunityIcons
      name={
        flashMode === RNCamera.Constants.FlashMode.on
          ? 'flash'
          : flashMode === RNCamera.Constants.FlashMode.off
          ? 'flash-off'
          : 'flash-auto'
      }
      color='white'
      size={36}
    />
  </TouchableOpacity>
)

const CameraDirectionButton: React.FC<{
  cameraType: typeof RNCamera.Constants.Type
  setCameraType: (type: typeof RNCamera.Constants.Type) => void
}> = ({ setCameraType, cameraType }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={{ position: 'absolute', left: 0, padding: 16, alignSelf: 'center' }}
    onPress={() => {
      setCameraType(
        cameraType === RNCamera.Constants.Type.front ? RNCamera.Constants.Type.back : RNCamera.Constants.Type.front,
      )
    }}
  >
    <EvilIcons name='refresh' color='white' size={48} />
  </TouchableOpacity>
)

const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    // style={{ padding: 16 }}
    onPress={() => {
      onClose()
    }}
  >
    <EvilIcons name='close' color='white' size={48} />
  </TouchableOpacity>
)

const isImagePickerAvailable = Boolean(NativeModules.ImagePickerManager)
export const SelectImageButton: React.FC<{ onSelectImage: (uri: string) => void }> = ({ onSelectImage }) => {
  const { openGallery } = useCamera()

  if (!isImagePickerAvailable) {
    return null
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{ position: 'absolute', right: 0, padding: 16, alignSelf: 'center' }}
      onPress={() => openGallery().then(onSelectImage)}
    >
      <EntypoIcon name='images' color='white' size={32} />
    </TouchableOpacity>
  )
}

export const Camera: React.FC<{
  defaultType: 'front' | 'back'
  onCapture: (camera: RNCamera) => any
  onClose?: any
  onSelectImage?: (uri: string) => any
}> = ({ onCapture, onClose, onSelectImage, defaultType = 'back', children }) => {
  const cameraRef = useRef<RNCamera | undefined>()
  const handleShutter = () => cameraRef.current && onCapture(cameraRef.current)
  const isFocused = useIsFocused()

  const [cameraType, setCameraType] = useState<typeof RNCamera.Constants.Type>(RNCamera.Constants.Type[defaultType])
  const [flashMode, setFlashMode] = useState<typeof RNCamera.Constants.FlashMode>(RNCamera.Constants.FlashMode.auto)

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {isFocused ? (
        <RNCamera
          ref={cameraRef}
          flashMode={flashMode}
          type={cameraType}
          ratio='4:3'
          style={{ flex: 1, aspectRatio: 3 / 4 }}
          captureAudio={false}
        >
          {children}
        </RNCamera>
      ) : null}
      <View
        style={{
          width: '100%',
          flex: 1,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          position: 'absolute',
        }}
      >
        {onClose ? <CloseButton onClose={onClose} /> : null}
        <FlashButton flashMode={flashMode} setFlashMode={setFlashMode} />
      </View>
      <View
        style={{ flexDirection: 'row', paddingVertical: 8, alignItems: 'flex-end', position: 'absolute', bottom: 0 }}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ShutterButtonOuter>
            <ShutterButtonInner>
              <ShutterButton onPress={handleShutter} />
            </ShutterButtonInner>
          </ShutterButtonOuter>
          <CameraDirectionButton cameraType={cameraType} setCameraType={setCameraType} />
          {isImagePickerAvailable && onSelectImage ? <SelectImageButton onSelectImage={onSelectImage} /> : null}
        </View>
      </View>
    </View>
  )
}
