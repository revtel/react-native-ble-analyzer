import React, {Component} from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    Platform
} from 'react-native'
import BleHelper from '../BleHelper'

class GattChar extends Component {
    constructor(props) {
        super(props);
        this.notifyHandle = null;
        this.charValue = '---';
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
        return (
            <View key={op} style={{ padding: 5, flexDirection: 'row' }}>
                <TouchableOpacity style={{ flex: 1 }} onPress={this._doOperation(op)}>
                    <Text style={{ flex: 1, color: 'blue' }}>{op}</Text>
                </TouchableOpacity>
                <Text style={{color: !!this.notifyHandle ? 'blue' : 'black'}}>{this.charValue}</Text>
            </View>
        )
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
