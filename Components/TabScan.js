import React, {Component} from 'react'
import {
    View,
    Text,
    Platform,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    PermissionsAndroid,
    NativeModules,
    NativeEventEmitter,
} from 'react-native'
import BleManager from 'react-native-ble-manager';
import _BleHelper from '../BleHelper'
import Theme from '../Theme'
import NavBar from './NavBar'
import Btn from './Btn'
import Peripheral from './Peripheral'

const UiState = {
    idle: 0,
    scanning: 1
}

class TabScan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            peripherals: {},
            uiState: UiState.idle,
        };
    }

    componentDidMount() {
        _BleHelper.requestPermission()
            .then(() => {
                _BleHelper.registerListener({
                    onDiscovery: peripheral => {
                        this.setState({
                            peripherals: {
                                ...this.state.peripherals,
                                [peripheral.id]: peripheral
                            }
                        })
                    },

                    onStopScan: () => {
                        this.setState({ uiState: UiState.idle })
                    }
                })

                BleManager.start({ showAlert: false });
            })
    }

    componentWillUnmount() {
        _BleHelper.unregisterListeners();
    }

    render() {
        let {onConnect} = this.props;
        let {peripherals, uiState} = this.state;

        return (
            <View style={{flex: 1, paddingTop: Theme.navbarHeight}}>
                <StatusBar 
                    backgroundColor={Theme.color}
                    barStyle="light-content"
                />

                <NavBar>
                    <Text style={{color: 'white', fontSize: 20, width: 100, textAlign: 'left', flex: 1}}>React Native BLE Analyzer</Text>
                    { this._renderScanButton() }
                </NavBar>

                {
                    Object.keys(peripherals).length === 0 ? (
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            { uiState === UiState.scanning && <ActivityIndicator size='large' color={Theme.color}/> }
                            <Text style={{marginBottom: 10, fontSize: 18, color: '#999'}}>
                                No Result
                            </Text>
                            { uiState === UiState.idle && <Btn onPress={this._doScan}>Scan Now</Btn> }
                        </View>
                    ) : (
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'stretch' }}>
                            {
                                Object.keys(peripherals).map(key => peripherals[key]).map(
                                    peripheral => (
                                        <Peripheral
                                            key={peripheral.id}
                                            peripheral={peripheral}
                                            onConnect={onConnect}
                                        />
                                    )
                                )
                            }
                        </ScrollView>
                    )
                }
            </View>
        )
    }

    _renderScanButton = () => {
        let {uiState} = this.state;
        if (uiState === UiState.scanning) {
            return <ActivityIndicator color='white'/>
        }
        return (
            <TouchableOpacity onPress={this._doScan}>
                <Text style={{color: 'white', width: 100, textAlign: 'right'}}>Scan</Text>
            </TouchableOpacity>
        )
    }

    _doScan = () => {
        if (this.state.uiState !== UiState.idle) {
            return;
        }

        this.setState({ uiState: UiState.scanning, peripherals: {} });
        BleManager.scan([], 20, true)
            .then(results => {
                console.log('Scanning...');
            })
            .catch(() => {
                this.setState({ uiState: UiState.idle })
            })
    }
}

export default TabScan;
