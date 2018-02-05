import React, {Component} from 'react'
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native'
import BleManager from 'react-native-ble-manager';
import JSONTree from 'react-native-json-tree'
import Btn from './Btn'
import GattService from './GattService'

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
        let gattServices = this._restructureServices(serviceInfo);
        console.log('gattServices', gattServices);

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

                                <View>
                                    <Text style={{ fontWeight: 'bold' }}>{peripheral.name || 'N/A'}</Text>
                                    <Text style={{ marginBottom: 5, color: 'grey' }}>id: {peripheral.id}</Text>
                                </View>

                                {gattServices && (
                                    <View>
                                        <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>GATT Services</Text>
                                        {
                                            gattServices.map(
                                                s => (
                                                    <GattService
                                                        key={s.uuid}
                                                        service={s}
                                                        peripheral={peripheral}
                                                    />
                                                )
                                            )

                                        }
                                    </View>
                                )}

                                {serviceInfo && (
                                    <View>
                                       <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>(Raw JSON) Services</Text>
                                        <JSONTree data={serviceInfo.services} />

                                        <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>(Raw JSON) Characteristics</Text>
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
                console.log(serviceInfo);
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

    _restructureServices = (serviceInfo) => {
        if (!serviceInfo) {
            return null;
        }

        let {characteristics, services} = serviceInfo;
        if (Platform.OS === 'ios') {
            // in ios, the services array is just a array of string 
            // and each string is the uuid of that service, not an object
            return services.reduce(
                (acc, service) => {
                    acc.push({
                        uuid: service, 
                        chars: characteristics.filter(c => c.service === service)
                    });
                    return acc;
                },
                []
            );
        } else { // android
            return services.reduce(
                (acc, service) => {
                    acc.push({
                        ...service,
                        chars: characteristics.filter(c => c.service === service.uuid)
                    });
                    return acc;
                },
                []
            );
        }
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