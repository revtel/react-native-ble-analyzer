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
import Theme from './Theme'
import NavBar from './Components/NavBar'
import Btn from './Components/Btn'
import Peripheral from './Components/Peripheral'
import ConnectionPanel from './Components/ConnectionPanel'
import BleHelper from './BleHelper'

let _BleHelper = new BleHelper();

const UiState = {
    idle: 0,
    scanning: 1
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connect: false,
            peripherals: {},
            uiState: UiState.idle,
            connectTo: null,
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
        let {connect, peripherals, uiState, connectTo} = this.state;

        return (
            <View style={{flex: 1, paddingTop: Theme.navbarHeight}}>
                <StatusBar 
                    backgroundColor={Theme.color}
                    barStyle="light-content"
                />

                <NavBar>
                    <Text style={{color: 'white', fontSize: 20, width: 100, textAlign: 'left', flex: 1}}>Open BLE Analyzer</Text>
                    { this._renderScanButton() }
                </NavBar>

                {
                    Object.keys(peripherals).length === 0 ? (
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            { uiState === UiState.scanning && <ActivityIndicator size='large' color={Theme.color}/> }
                            <Text style={{marginBottom: 10}}>
                                Currently no peripherals found
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
                                            onConnect={connectTo => this.setState({ connect: !connect, connectTo })}
                                        />
                                    )
                                )
                            }
                        </ScrollView>
                    )
                }

                {
                    connect && (
                        <ConnectionPanel 
                            peripheral={connectTo}
                            onClose={() => this.setState({connect: false})}
                        />
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
        BleManager.scan([], 10, true)
            .then(results => {
                console.log('Scanning...');
            })
            .catch(() => {
                this.setState({ uiState: UiState.idle })
            })
    }
}

export default App;
