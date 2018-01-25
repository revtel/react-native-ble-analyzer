import {
    NativeModules,
    NativeEventEmitter,
    Platform,
    PermissionsAndroid,
} from 'react-native'
import BleManager from 'react-native-ble-manager';

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

    registerListener({onDiscovery=null, onStopScan=null}) {
        if (onDiscovery) {
            if (this.onDiscoveryHandler) {
                throw new Error('you should only register one listener using this helper method at a time');
            }
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

export default BleHelper;