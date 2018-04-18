import React, {Component} from 'react'
import {
    View,
    Text,
    TouchableOpacity
} from 'react-native'
import GattChar from './GattChar'

class GattService extends Component {
    render() {
        let {service: {uuid, chars=[]}, peripheral, extraStyle={}} = this.props;

        return (
            <View style={{padding: 10, borderTopColor: '#ccc', borderTopWidth: 1, ...extraStyle}}>
                <Text style={{fontWeight: 'bold'}}>{uuid}</Text>
                <View style={{paddingLeft: 20, marginTop: 5}}>
                    {
                        chars.map(
                            c => (
                                <GattChar
                                    key={c.characteristic}
                                    char={c}
                                    serviceUuid={uuid}
                                    peripheral={peripheral}
                                    extraStyle={{marginBottom: 10}}
                                />
                            )
                        )
                    }
                </View>
            </View>
        )
    }
}

export default GattService;