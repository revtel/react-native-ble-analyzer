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

class GattChar extends Component {
    constructor(props) {
        super(props);
        this.notifyHandle = null;
        this.charValue = '---';
        this.state = {
            valueToWrite: null
        };
    }

    componentWillUnmount() {
        let {char, serviceUuid, peripheral} = this.props;
        if (this.notifyHandle) {
            BleHelper.unregisterNotification(this.notifyHandle);
        }
    }

    render() {
        let {char, serviceUuid, extraStyle={}} = this.props;
        let operations = char.properties;

        if (Platform.OS === 'android') {
            // in android, properties is an object rather than array
            operations = Object.keys(char.properties);
        }

        return (
            <View style={{...extraStyle}}>
                <Text>{char.characteristic}</Text>
                <View style={{marginTop: 10, borderTopColor: '#ccc', borderTopWidth: 1}}>
                    { operations.map(this._renderOperation) }
                </View>
            </View>
        )
    }

    _renderOperation = op => {
        if (op === 'Notify') {
            return (
                <View key={op} style={{ padding: 5, flexDirection: 'row' }}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={this._doOperation(op)}>
                        <Text style={{ flex: 1, color: 'blue' }}>{op}</Text>
                    </TouchableOpacity>
                    <Text style={{color: !!this.notifyHandle ? 'blue' : 'black'}}>{this.charValue}</Text>
                </View>
            )
        } else if (op === 'Write') {
            let {valueToWrite} = this.state;

            return (
                <View style={{padding: 5}} key={op}>
                    <TouchableOpacity>
                        <Text style={{ flex: 1, color: 'blue' }}>{op}</Text>
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
                            <Btn onPress={this._doOperation(op)} extraStyle={{marginRight: 5}} >Send</Btn>
                            <Btn onPress={() => this.setState({valueToWrite: null})} extraStyle={{marginRight: 5}} outline>Clear</Btn>
                        </View>
                    </View>
                </View>
            )
        } else {
            return (
                <View key={op} style={{ padding: 5, flexDirection: 'row' }}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={this._doOperation(op)}>
                        <Text style={{ flex: 1, color: 'blue' }}>{op}</Text>
                    </TouchableOpacity>
                    <Text>{this.charValue}</Text>
                </View>
            )
        }
    }

    _doOperation = op => () => {
        let {peripheral, serviceUuid, char} = this.props;

        if (op === 'Notify') {
            if (!this.notifyHandle) {
                BleHelper.registerNotification(peripheral.id, serviceUuid, char.characteristic, this._onCharValue)
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
        } else if (op === 'Write') {
            let {valueToWrite} = this.state;
            let bytes = [];

            if (!valueToWrite) {
                return;
            }

            // ascii
            for (let i = 0; i < valueToWrite.length; i++) {
                bytes.push(valueToWrite.charCodeAt(i));
            }

            BleManager.write(peripheral.id, serviceUuid, char.characteristic, bytes, bytes.length)
                .then(result => 0)
                .catch(err => console.warn(err))
        }
    }

    _onCharValue = ({value}) => {
        console.log(value);
        let valueToDisplay = '???';

        try {
            valueToDisplay = value.reduce(
                (acc, v) => {
                    return acc + String.fromCharCode(v)
                },
                ''
            );
        } catch (ex) {
            valueToDisplay = value.reduce(
                (acc, v) => {
                    return `${acc} ${v.toString(16)}(${v.toString()})`;
                },
                ''
            )
        }

        this.charValue = valueToDisplay;
        this.forceUpdate();
    }
}

export default GattChar;
