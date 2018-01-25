import React, {Component} from 'react'
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
} from 'react-native'
import BleManager from 'react-native-ble-manager';
import JSONTree from 'react-native-json-tree'
import Btn from './Btn'

class ConnectionPanel extends Component {
    constructor(props) {
        super(props);
        this.initialState = {
            connecting: false,
            connected: false,
            hint: null,
            serviceInfo: null,
        };

        this.state = {
            ...this.initialState,
        }
    }

    componentDidMount() {
        this._tryConnect();
    }

    render() {
        let {onClose, peripheral} = this.props;
        let {connected, connecting, hint, serviceInfo} = this.state;

        return (
            <View style={{ position: 'absolute', padding: 20, top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <View style={{ flex: 1, alignSelf: 'stretch', backgroundColor: 'white', padding: 20}}>
                    {
                        connecting && (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                <ActivityIndicator size='large' />
                                <Text style={{ marginTop: 10 }}>{hint}</Text>
                            </View>
                        )
                    }

                    {
                        connected && (
                            <ScrollView style={{ flex: 1 }}>
                                {hint && <Text>{hint}</Text>}

                                {serviceInfo && (
                                    <View>
                                        <Text style={{ fontWeight: 'bold' }}>{peripheral.name || 'N/A'}</Text>
                                        <Text style={{ marginBottom: 5, color: 'grey' }}>id: {peripheral.id}</Text>
                                        <View style={{ backgroundColor: '#ccc', height: 1}}></View>

                                        <Text style={{ marginTop: 10, marginBottom: 5 }}>GATT Services</Text>
                                        <JSONTree data={serviceInfo.services} />

                                        <Text style={{ marginTop: 10, marginBottom: 5 }}>GATT Characteristics</Text>
                                        <JSONTree data={serviceInfo.characteristics} />
                                    </View>
                                )}
                            </ScrollView>
                        )
                    }

                    {
                        !connecting && !connected && (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                <Text>{hint}</Text>
                            </View>
                        )
                    }
                    
                    {
                        !connecting && (
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                                <Btn onPress={connected ? this._tryDisconnect : this._tryConnect}>
                                    {`${connected ? 'Disconnect' : 'Connect'}`}
                                </Btn>

                                <View style={{ width: 15 }}></View>

                                <Btn onPress={onClose} outline>
                                    Close
                            </Btn>
                            </View>
                        )
                    }
                </View>
            </View>
        )
    }

    _tryConnect = () => {
        let { peripheral } = this.props;

        console.log('conneting to ', peripheral);

        this.setState({
            ...this.initialState,
            connecting: true,
            hint: 'Connecting...',
        });

        // BleManager.getConnectedPeripherals(peripherals => {
        //     if (peripherals.find(p => p.id === peripheral.id)) {
        //         this.setState({hint: 'Already connected, skip the connectioin...'})
        //         return;
        //     }
        //     this.setState({hint: 'Connecting...'})
        //     return BleManager.connect(peripheral.id);
        // })
        BleManager.connect(peripheral.id)
            .then(() => new Promise(resolve => setTimeout(resolve, 1200)))
            .then(() => {
                this.setState({hint: 'Retrieving GATT services...'})
                return BleManager.retrieveServices(peripheral.id)
            })
            .then(serviceInfo => {
                this.setState({
                    connecting: false,
                    connected: true,
                    hint: null,
                    serviceInfo
                });
            })
            .catch(err => {
                this.setState({
                    connected: false,
                    connecting: false,
                    hint: `Err: ${JSON.stringify(err)}`
                })
                BleManager.disconnect(peripheral.id); // ignore failure
            })

    }

    _tryDisconnect = () => {
        let {peripheral} = this.props;
        this.setState({
            ...this.initialState,
            hint: 'Not connected'
        });
        BleManager.disconnect(peripheral.id); // ignore failure
    }
}

export default ConnectionPanel;