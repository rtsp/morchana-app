import { useCallback, useMemo } from 'react'
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker'
import { useHUD } from '../HudView'

const DEFAULT_OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo',
  selectionLimit: 1,
}

const useCamera = () => {
  const { showSpinner, hide } = useHUD()

  const openGallery = useCallback(
    async (options?: ImageLibraryOptions) => {
      showSpinner()
      const { didCancel, errorCode, assets } = await launchImageLibrary({ ...DEFAULT_OPTIONS, ...options })
      hide()

      if (didCancel || errorCode || !assets || !assets.length) return

      return assets[0]
    },
    [showSpinner, hide],
  )

  return useMemo(() => ({ openGallery }), [openGallery])
}

export default useCamera
