import React, {Component} from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    TextInput
} from 'react-native'
import BleHelper from '../BleHelper'
import BleManager from 'react-native-ble-manager'
import Btn from './Btn'

/** 
    common
    ---------------------------------------------------------
        Broadcast
        Read
        Write
        WriteWithoutResponse
        Notify
        Indicate
        ExtendedProperties
        AuthenticateSignedWrites 
            * ios has a typo on this (AutheticateSignedWrites)
    
    ios only
    ---------------------------------------------------------
        NotifyEncryptionRequired
        IndicateEncryptionRequired
*/

class GattCharProp extends Component {
    constructor(props) {
        super(props);
        this.notifyHandle = null;
        this.notifyValue = '---';
        this.charValue = '---';
        this.state = {
            valueToWrite: null
        };
    }

    componentWillUnmount() {
        if (this.notifyHandle) {
            BleHelper.unregisterNotification(this.notifyHandle);
        }
    }

    render() {
        let {property} = this.props;

        if (property === 'Read') {
            return (
                <View style={{ padding: 5, flexDirection: 'row' }}>
                    <TouchableOpacity style={{marginRight: 5}} onPress={this._doOperation}>
                        <Text style={{ flex: 1, color: 'blue' }}>{property}</Text>
                    </TouchableOpacity>
                    <Text style={{flex: 1, textAlign: 'right', color: !!this.notifyHandle ? 'blue' : 'black'}}>{this.charValue}</Text>
                </View>
            )
        } else if (property.indexOf('Notify') === 0 || property.indexOf('Indicate') === 0) {
            return (
                <View style={{ padding: 5, flexDirection: 'row' }}>
                    <TouchableOpacity style={{marginRight: 5}} onPress={this._doOperation}>
                        <Text style={{ flex: 1, color: 'blue' }}>{property}</Text>
                    </TouchableOpacity>
                    <Text style={{flex: 1, textAlign: 'right', color: !!this.notifyHandle ? 'blue' : 'black'}}>{this.notifyValue}</Text>
                </View>
            )
        } else if (property.indexOf('Write') === 0) {
            let {valueToWrite} = this.state;

            return (
                <View style={{padding: 5}} >
                    <TouchableOpacity>
                        <Text style={{ flex: 1, color: 'blue' }}>{property}</Text>
                    </TouchableOpacity>
                    <View style={{marginTop: 5, paddingTop: 5, paddingLeft: 20, alignItems: 'stretch'}}>
                        <TextInput
                            multiline={true}
                            numberOfLines={2}
                            value={valueToWrite}
                            onChangeText={valueToWrite => this.setState({valueToWrite})}
                            style={{ borderWidth: 1, borderColor: 'lightblue', marginBottom: 5 }}
                        />
                        <View style={{flexDirection: 'row', marginTop: 5, justifyContent: 'flex-end'}}>
                            <Btn onPress={this._doOperation} extraStyle={{marginRight: 5}} >Send</Btn>
                            <Btn onPress={() => this.setState({valueToWrite: null})} extraStyle={{marginRight: 5}} outline>Clear</Btn>
                        </View>
                    </View>
                </View>
            )
        } else {
            return (
                <View style={{ padding: 5, flexDirection: 'row' }}>
                    <TouchableOpacity style={{ flex: 1 }} >
                        <Text style={{ flex: 1, color: 'blue' }}>{property}</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    _doOperation = () => {
        let {peripheral, serviceUuid, char, property} = this.props;

        if (property === 'Read') {
            BleManager.read(peripheral.id, serviceUuid, char.characteristic)
                .then(data => {
                    console.log(data);
                    this.charValue = JSON.stringify(data);
                    this.forceUpdate();
                })
                .catch(err => {
                    console.warn(err);
                })
        } else if (property.indexOf('Notify') === 0 || property.indexOf('Indicate') === 0) {
            if (!this.notifyHandle) {
                BleHelper.registerNotification(peripheral.id, serviceUuid, char.characteristic, this._onCharValueUpdate)
                    .then(handle => {
                        this.notifyHandle = handle;
                        this.forceUpdate();
                    })
                    .catch(err => console.warn(err));
            } else {
                BleHelper.unregisterNotification(this.notifyHandle);
                this.notifyHandle = null;
                this.forceUpdate();
            }
        } else if (property.indexOf('Write') === 0) {
            let {valueToWrite} = this.state;
            let bytes = [];

            if (!valueToWrite) {
                return;
            }

            // ascii
            for (let i = 0; i < valueToWrite.length; i++) {
                bytes.push(valueToWrite.charCodeAt(i));
            }

            if (property === 'Write') {
                BleManager.write(peripheral.id, serviceUuid, char.characteristic, bytes, bytes.length)
                    .then(result => 0)
                    .catch(err => console.warn(err))
            } else { // without response
                BleManager.writeWithoutResponse(peripheral.id, serviceUuid, char.characteristic, bytes, bytes.length)
                    .then(result => 0)
                    .catch(err => console.warn(err))
            }
        }
    }

    _onCharValueUpdate = ({value}) => {
        console.log(value);
        let valueToDisplay = '???';

        // try {
        //     valueToDisplay = value.reduce(
        //         (acc, v) => {
        //             return acc + String.fromCharCode(v)
        //         },
        //         ''
        //     );
        // } catch (ex) {
        //     valueToDisplay = value.reduce(
        //         (acc, v) => {
        //             return `${acc} ${('00' + v.toString(16)).slice(-2)}(${v.toString()})`;
        //         },
        //         ''
        //     )
        // }

        try {
            valueToDisplay = JSON.stringify(value);
        } catch (ex) {
            console.warn(ex);
        }

        this.notifyValue = valueToDisplay;
        this.forceUpdate();
    }
}

export default GattCharProp;