import React, { useContext } from 'react'
import { DeviceEventEmitter, NativeEventEmitter, NativeModules, Platform } from 'react-native'
import BackgroundGeolocation from 'react-native-background-geolocation'
import BluetoothStateManager from 'react-native-bluetooth-state-manager'
import { beaconLookup } from './beacon-lookup'
import { beaconScanner, bluetoothScanner } from './contact-scanner'

const eventEmitter = new NativeEventEmitter(NativeModules.ContactTracerModule)

interface ContactTracerProps {
  anonymousId: string
  isPassedOnboarding: boolean
  notificationTriggerNumber: number
}

interface ContactTracerState {
  isServiceEnabled: boolean
  isLocationPermissionGranted: boolean
  locationPermissionLevel?: number
  isBluetoothOn: boolean
  anonymousId: string
  statusText: string
  beaconLocationName: any
  notificationTriggerNumber?: number
  enable: () => void
  disable: () => void
}

export const ContractTracerContext = React.createContext<ContactTracerState>(null)

export class ContactTracerProvider extends React.Component<ContactTracerProps, ContactTracerState> {
  private isInited = false
  private statusText = ''
  private beaconLocationName = {}
  private advertiserEventSubscription = null
  private nearbyDeviceFoundEventSubscription = null
  private nearbyBeaconFoundEventSubscription = null

  constructor(props) {
    super(props)
    this.state = {
      isServiceEnabled: false,
      isLocationPermissionGranted: false,
      locationPermissionLevel: 0,
      isBluetoothOn: false,
      anonymousId: '',
      statusText: this.statusText,
      beaconLocationName: this.beaconLocationName,
      enable: this.enable.bind(this),
      disable: this.disable.bind(this),
    }
  }

  componentDidMount() {
    this.registerListeners()

    NativeModules.ContactTracerModule.stopTracerService()
    if (this.props.isPassedOnboarding) {
      // Check if Tracer Service has been enabled
      NativeModules.ContactTracerModule.isTracerServiceEnabled()
        .then((enabled) => {
          this.setState({
            isServiceEnabled: enabled,
          })
          // Refresh Tracer Service Status in case the service is down
          if (enabled) return this.enable()
          return ''
        })
        .then(() => {})
    }
  }

  componentWillUnmount() {
    this.unregisterListeneres()
  }

  /**
   * Initialize Contact Tracer instance
   */
  async init() {
    this.isInited = true
    const anonymousId = this.props.anonymousId
    this.setState({ anonymousId: anonymousId })
    NativeModules.ContactTracerModule.setUserId(anonymousId)

    // Check if Tracer Service has been enabled
    NativeModules.ContactTracerModule.isTracerServiceEnabled()
      .then((enabled) => {
        this.setState({
          isServiceEnabled: enabled,
        })
        // Refresh Tracer Service Status in case the service is down
        NativeModules.ContactTracerModule.refreshTracerServiceStatus()
      })
      .then(() => {})

    // Check if BLE is available
    await NativeModules.ContactTracerModule.initialize()
      .then(() => {
        return NativeModules.ContactTracerModule.isBLEAvailable()
      })
      // For NativeModules.ContactTracerModule.isBLEAvailable()
      .then((isBLEAvailable) => {
        if (isBLEAvailable) {
          this.appendStatusText('BLE is available')
          // BLE is available, continue requesting Location Permission
          // return requestLocationPermission()
        } else {
          // BLE is not available, don't do anything furthur since BLE is required
          this.appendStatusText('BLE is NOT available')
        }
        return !!isBLEAvailable
      })
      // For requestLocationPermission()
      // .then((locationPermissionGranted) => {
      //   this.setState({
      //     isLocationPermissionGranted: locationPermissionGranted,
      //   })
      //   if (locationPermissionGranted) {
      //     // Location permission is granted, try turning on Bluetooth now
      //     this.appendStatusText('Location permission is granted')
      //     return NativeModules.ContactTracerModule.tryToTurnBluetoothOn()
      //   } else {
      //     // Location permission is required, we cannot continue working without this permission
      //     this.appendStatusText('Location permission is NOT granted')
      //   }
      // })
      // For NativeModules.ContactTracerModule.tryToTurnBluetoothOn()
      .then((bluetoothOn) => {
        this.setState({
          isBluetoothOn: bluetoothOn,
        })

        if (bluetoothOn) {
          this.appendStatusText('Bluetooth is On')
          // See if Multiple Advertisement is supported
          // Refresh Tracer Service Status in case the service is down
          NativeModules.ContactTracerModule.refreshTracerServiceStatus()
          return NativeModules.ContactTracerModule.isMultipleAdvertisementSupported()
        } else {
          this.appendStatusText('Bluetooth is Off')
        }
      })
      // For NativeModules.ContactTracerModule.isMultipleAdvertisementSupported()
      .then((supported) => {
        if (supported) this.appendStatusText('Multitple Advertisement is supported')
        else this.appendStatusText('Multitple Advertisement is NOT supported')
      })

    BluetoothStateManager.onStateChange((bluetoothState) => {
      switch (bluetoothState) {
        case 'Unsupported':
        case 'Unauthorized':
        case 'PoweredOff':
          this.setState({
            isBluetoothOn: false,
          })
          break
        case 'PoweredOn':
          this.setState({
            isBluetoothOn: true,
          })
          break

        default:
          break
      }
    }, true)

    console.log('init complete')
  }

  /**
   * Enable Contact Tracer service
   *
   * Could be call only once and it will remember its state in persistant storage
   */
  async enable() {
    console.log('enable tracing')
    if (!this.isInited) {
      await this.init()
    }

    NativeModules.ContactTracerModule.enableTracerService().then(() => {})
    this.setState({
      isServiceEnabled: true,
    })
  }

  /**
   * Disable Contact Tracer service
   *
   * Could be call only once and it will remember its state in persistant storage
   */
  disable() {
    console.log('disable tracing')
    NativeModules.ContactTracerModule.disableTracerService()
    this.setState({
      isServiceEnabled: false,
    })
  }

  /**
   * Read Contact Tracer service latest state
   *
   * Read state, set isServiceEnabled and call enable() to init
   */
  refreshTracerService() {
    NativeModules.ContactTracerModule.isTracerServiceEnabled()
      .then((enabled) => {
        this.setState({
          isServiceEnabled: enabled,
        })
        // Refresh Tracer Service Status in case the service is down
        if (enabled) return this.enable()
        else return ''
      })
      .then(() => {})
  }

  /**
   * Initialize Listeners
   */
  registerListeners() {
    // Register Event Emitter
    if (Platform.OS == 'ios') {
      console.log('add listener')
      this.advertiserEventSubscription = eventEmitter.addListener('AdvertiserMessage', this.onAdvertiserMessageReceived)

      this.nearbyDeviceFoundEventSubscription = eventEmitter.addListener(
        'NearbyDeviceFound',
        this.onNearbyDeviceFoundReceived,
      )

      this.nearbyBeaconFoundEventSubscription = eventEmitter.addListener(
        'NearbyBeaconFound',
        this.onNearbyBeaconFoundReceived,
      )
    } else {
      console.log('add listener')
      this.advertiserEventSubscription = DeviceEventEmitter.addListener(
        'AdvertiserMessage',
        this.onAdvertiserMessageReceived,
      )

      this.nearbyDeviceFoundEventSubscription = DeviceEventEmitter.addListener(
        'NearbyDeviceFound',
        this.onNearbyDeviceFoundReceived,
      )

      this.nearbyBeaconFoundEventSubscription = DeviceEventEmitter.addListener(
        'NearbyBeaconFound',
        this.onNearbyBeaconFoundReceived,
      )
    }

    BackgroundGeolocation.onProviderChange((event) => {
      console.log('[onProviderChange: ', event)

      switch (event.status) {
        case BackgroundGeolocation.AUTHORIZATION_STATUS_DENIED:
          console.log('- Location authorization denied')
          this.setState({ locationPermissionLevel: 0 })
          break
        case BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS:
          console.log('- Location always granted')
          this.setState({ locationPermissionLevel: 3 })
          break
        case BackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE:
          console.log('- Location WhenInUse granted')
          this.setState({ locationPermissionLevel: 4 })
          break
      }
    })
  }

  /**
   * Destroy Listeners
   */
  unregisterListeneres() {
    // Unregister Event Emitter
    if (this.advertiserEventSubscription != null) {
      this.advertiserEventSubscription.remove()
      this.advertiserEventSubscription = null
    }
    if (this.nearbyDeviceFoundEventSubscription != null) {
      this.nearbyDeviceFoundEventSubscription.remove()
      this.nearbyDeviceFoundEventSubscription = null
    }

    if (this.nearbyBeaconFoundEventSubscription != null) {
      this.nearbyBeaconFoundEventSubscription.remove()
      this.nearbyBeaconFoundEventSubscription = null
    }
  }

  /**
   * Append debug text
   *
   * @param text Message to be appended
   */
  appendStatusText(text) {
    // console.log('tracing status', text)
    this.statusText = text + '\n' + this.statusText
    this.setState({
      statusText: this.statusText,
    })
  }

  /**
   * Event Emitting Handler
   */

  onAdvertiserMessageReceived = (e) => {
    this.appendStatusText(e.message)
  }

  onNearbyDeviceFoundReceived = (e) => {
    this.appendStatusText('')
    this.appendStatusText('***** RSSI: ' + e.rssi)
    this.appendStatusText('***** Found Nearby Device: ' + e.name)
    this.appendStatusText('')
    /* broadcast */
    console.log('broadcast:' + e.name)
    bluetoothScanner.add(e.name)
    if (Date.now() - bluetoothScanner.oldestItemTS > 30 * 60 * 1000) {
      bluetoothScanner.upload()
    }
  }

  onNearbyBeaconFoundReceived = async (e: any) => {
    this.appendStatusText('')
    this.appendStatusText('***** Found Beacon: ' + e.uuid)
    this.appendStatusText('***** major: ' + e.major)
    this.appendStatusText('***** minor: ' + e.minor)
    this.appendStatusText('')

    let oldestBeaconFoundTS = beaconScanner.oldestBeaconFoundTS || 0
    if (Date.now() - oldestBeaconFoundTS > 30 * 1000 || !oldestBeaconFoundTS) {
      const { anonymousId, name } = await beaconLookup.getBeaconInfo(e.uuid, e.major, e.minor)
      if (anonymousId) {
        this.appendStatusText('***** anonymousId: ' + anonymousId)
        this.appendStatusText('***** name: ' + name)
        this.setState({
          beaconLocationName: {
            anonymousId,
            name,
            time: Date.now(),
            uuid: e.uuid,
          },
        })
        beaconScanner.maskBeaconFound()
        beaconScanner.add(anonymousId)
      }
    }

    let oldestItemTS = beaconScanner.oldestItemTS || 0
    if (Date.now() - oldestItemTS > 30 * 60 * 1000) {
      beaconScanner.upload()
    }
  }

  render() {
    return (
      <ContractTracerContext.Provider
        value={{
          ...this.state,
          notificationTriggerNumber: this.props.notificationTriggerNumber,
        }}
      >
        {this.props.children}
      </ContractTracerContext.Provider>
    )
  }
}

export const useContactTracer = (): ContactTracerState => {
  return useContext(ContractTracerContext)
}
