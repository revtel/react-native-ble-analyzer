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

const UiFormat = {
    ARRAY_OF_DEC: 'DEC',
    ARRAY_OF_HEX: 'HEX',
    ASCII: 'ASCII',
}

class GattChar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            format: UiFormat.ARRAY_OF_DEC
        }
    }

    render() {
        let {peripheral, serviceUuid, char, extraStyle={}} = this.props;
        let {format} = this.state;
        let properties = char.properties;

        if (Platform.OS === 'android') {
            // in android, properties is an object rather than array
            properties = Object.keys(char.properties);
        }

        return (
            <View style={{...extraStyle}}>
                <Text>{char.characteristic}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                    {
                        Object.keys(UiFormat).map(
                            k => (
                                <TouchableOpacity key={k} style={{ marginLeft: 8 }} onPress={() => this.setState({format: UiFormat[k]})}>
                                    <Text style={{ fontSize: 12, color: format === UiFormat[k] ? 'blue' : '#ccc' }}>{UiFormat[k]}</Text>
                                </TouchableOpacity>
                            )
                        )
                    }
                </View>
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
                                    format={format}
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
