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
import {ErrorRegistry} from './ErrorMessagePanel'

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
        let displayCharValue = this._formatValue(this.charValue);
        let displayNotifyValue = this._formatValue(this.notifyValue);

        if (property === 'Read') {
            return (
                <View style={{ padding: 5, flexDirection: 'row' }}>
                    <TouchableOpacity style={{marginRight: 5}} onPress={this._doOperation}>
                        <Text style={{ flex: 1, color: 'blue' }}>{property}</Text>
                    </TouchableOpacity>
                    <Text style={{flex: 1, textAlign: 'right', color: !!this.notifyHandle ? 'blue' : 'black'}}>{displayCharValue}</Text>
                </View>
            )
        } else if (property.indexOf('Notify') === 0 || property.indexOf('Indicate') === 0) {
            return (
                <View style={{padding: 5}}>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={{marginRight: 5}} onPress={this._doOperation}>
                            <Text style={{ flex: 1, color: 'blue' }}>{property}</Text>
                        </TouchableOpacity>
                        <Text style={{flex: 1, textAlign: 'right'}}>{displayNotifyValue}</Text>
                    </View>

                    {!!this.notifyHandle && (
                        <TouchableOpacity style={{ marginTop: 5, flexDirection: 'row', justifyContent: 'flex-end' }} onPress={this._doOperation}>
                            <Text style={{color: 'blue'}}>Unsubscribe</Text>
                        </TouchableOpacity>
                    )}
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
                            value={valueToWrite}
                            onChangeText={valueToWrite => this.setState({valueToWrite})}
                            style={{ borderWidth: 1, borderColor: 'lightblue', marginBottom: 5, height: 30 }}
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
        let {peripheral, serviceUuid, char, property, format} = this.props;

        if (property === 'Read') {
            BleManager.read(peripheral.id, serviceUuid, char.characteristic)
                .then(data => {
                    console.log(data);
                    this.charValue = data;
                    this.forceUpdate();
                })
                .catch(err => {
                    console.warn(err);
                    ErrorRegistry.putError('GATT Read', err);
                })
        } else if (property.indexOf('Notify') === 0 || property.indexOf('Indicate') === 0) {
            if (!this.notifyHandle) {
                BleHelper.registerNotification(peripheral.id, serviceUuid, char.characteristic, this._onCharValueUpdate)
                    .then(handle => {
                        this.notifyHandle = handle;
                        this.forceUpdate();
                    })
                    .catch(err => {
                        console.warn(err)
                        ErrorRegistry.putError('GATT Register Notification', err);
                    });
            } else {
                BleHelper.unregisterNotification(this.notifyHandle)
                    .catch(err => {
                        console.warn(err)
                        ErrorRegistry.putError('GATT Unregister Notification', err);
                    })
                this.notifyHandle = null;
                this.forceUpdate();
            }
        } else if (property.indexOf('Write') === 0) {
            let bytes = this._formatValueToWrite();
            if (property === 'Write') {
                BleManager.write(peripheral.id, serviceUuid, char.characteristic, bytes, bytes.length)
                    .then(result => 0)
                    .catch(err => {
                        console.warn(err);
                        ErrorRegistry.putError('GATT Write', err);
                    })
            } else { // without response
                BleManager.writeWithoutResponse(peripheral.id, serviceUuid, char.characteristic, bytes, bytes.length)
                    .then(result => 0)
                    .catch(err => {
                        console.warn(err);
                        ErrorRegistry.putError('GATT WriteWithourResponse', err);
                    })
            }
        }
    }

    _formatValueToWrite = () => {
        let {format} = this.props;
        let {valueToWrite} = this.state;
        let bytes = [];

        if (!valueToWrite) {
            return null;
        }

        try {
            if (format === 'ASCII') {
                for (let i = 0; i < valueToWrite.length; i++) {
                    bytes.push(valueToWrite.charCodeAt(i));
                }
            } else if (format === 'DEC') {
                bytes = valueToWrite.split().map(v => parseInt(v, 10));
            } else if (format === 'HEX') {
                bytes = valueToWrite.split().map(v => parseInt(v, 16));
            }
        } catch (ex) {
            console.warn(ex);
            return null;
        }

        return bytes;
    }

    _formatValue = data => {
        // TODO: this is bad, remove it later
        if (data === '---') {
            return data;
        }

        let {format} = this.props;
        try {
            switch (format) {
                case 'DEC':
                    return (
                        data && data.map(v => v.toString(10)).reduce((acc, v) => `${acc} ${v}`, '')
                    ) || '???';
                case 'HEX':
                    return ( 
                        data && data.map(v => v.toString(16)).reduce((acc, v) => `${acc} ${v}`, '')
                    ) || '???';
                case 'ASCII':
                    return (
                        data && data.map(v => String.fromCharCode(v)).reduce((acc, v) => `${acc}${v}`, '')
                    ) || '???';
            } 
        } catch (ex) {
            return JSON.stringify(data) + '(fail to parse)';
        }
        return JSON.stringify(data);
    }

    _onCharValueUpdate = ({value}) => {
        let valueToDisplay = '???';

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