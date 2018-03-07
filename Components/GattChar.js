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
import GattCharProp from './GattCharProp'

class GattChar extends Component {
    render() {
        let {peripheral, serviceUuid, char, extraStyle={}} = this.props;
        let properties = char.properties;

        if (Platform.OS === 'android') {
            // in android, properties is an object rather than array
            properties = Object.keys(char.properties);
        }

        return (
            <View style={{...extraStyle}}>
                <Text>{char.characteristic}</Text>
                <View style={{marginTop: 10, borderTopColor: '#ccc', borderTopWidth: 1}}>
                    {  
                        properties.map(
                            property => (
                                <GattCharProp 
                                    key={property}
                                    peripheral={peripheral}
                                    serviceUuid={serviceUuid}
                                    char={char}
                                    property={property}
                                />
                            )
                        )
                    }
                </View>
            </View>
        )
    }
}

export default GattChar;
