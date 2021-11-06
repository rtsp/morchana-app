import { useCallback, useMemo } from 'react'
import { Platform } from 'react-native'
import RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'
import { useHUD } from '../HudView'

const DEFAULT_OPTIONS = {
  mediaType: 'photo',
  quality: 1.0,
  title: 'Select Avatar',
}

const useCamera = () => {
  const { showSpinner, hide } = useHUD()

  const openGallery = useCallback(
    (options: any = {}) => {
      return new Promise((resolved: (uri: string) => void) => {
        showSpinner()

        const ImagePicker = require('react-native-image-picker')
        ImagePicker.launchImageLibrary({ ...DEFAULT_OPTIONS, ...options }, (response: any) => {
          hide()
          // console.log(response)
          if (Platform.OS === 'android' && 'data' in response) {
            const newFilePath = `${Date.now()}-tmp`
            let tmpPath = `${RNFS.CachesDirectoryPath}/${newFilePath}`
            RNFetchBlob.fs.writeFile(tmpPath, response.data, 'base64').finally(() => {
              const uri = 'file://' + tmpPath
              resolved(uri)
            })
          } else {
            const uri = response.uri + ''
            resolved(uri)
          }
        })
      })
    },
    [showSpinner, hide],
  )

  return useMemo(() => ({ openGallery }), [openGallery])
}

export default useCamera
