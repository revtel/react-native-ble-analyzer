import {
    NativeModules,
    NativeEventEmitter,
    Platform,
    PermissionsAndroid,
} from 'react-native'
import BleManager from 'react-native-ble-manager';
import {throttle} from 'lodash';

const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

class BleHelper {
    requestPermission() {
        return new Promise(
            (resolve, reject) => {
                if (Platform.OS === 'android' && Platform.Version >= 23) {
                    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                        if (result) {
                            resolve();
                        } else {
                            PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                                if (result) {
                                    resolve();
                                } else {
                                    reject()
                                }
                            });
                        }
                    });
                } else {
                    resolve();
                }
            }
        )
    }

    registerNotification(peripheralId, serviceId, charId, callback) {
        return new Promise(
            (resolve, reject) => {
                BleManager.startNotification(peripheralId, serviceId, charId)
                    .then(() => {
                        resolve(bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', callback));
                    })
                    .catch(err => {
                        console.warn('BleHelper registerNotification', err);
                        reject(err)
                    })
            }
        )
    }

    unregisterNotification(handle) {
        handle.remove();
    }

    registerListener({onDiscovery=null, onStopScan=null}) {
        if (onDiscovery) {
            if (this.onDiscoveryHandler) {
                throw new Error('you should only register one listener using this helper method at a time');
            }
            onDiscovery = throttle(onDiscovery, 250);
            this.onDiscoveryHandler = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', onDiscovery);
        }

        if (onStopScan) {
            if (this.onStopScanHandler) {
                throw new Error('you should only register one listener using this helper method at a time');
            }
            this.onStopScanHandler = bleManagerEmitter.addListener('BleManagerStopScan', onStopScan);
        }
    }

    unregisterListeners() {
        this.onDiscoveryHandler && this.onDiscoveryHandler.remove();
        this.onStopScanHandler && this.onStopScanHandler.remove();
    }
}

export default new BleHelper();