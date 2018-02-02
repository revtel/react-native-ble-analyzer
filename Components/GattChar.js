import React, {Component} from 'react'
import {
    View,
    Text,
    TouchableOpacity
} from 'react-native'

class GattChar extends Component {
    render() {
        let {char: {characteristic, properties={}, service}, extraStyle={}} = this.props;
        let operations = Object.keys(properties);
        return (
            <View style={{...extraStyle}}>
                <Text>{characteristic}</Text>
                <View style={{marginTop: 10, borderTopColor: '#ccc', borderTopWidth: 1}}>
                    { operations.map(this._renderOperation) }
                </View>
            </View>

        )
    }

    _renderOperation = op => {
        return (
            <View key={op} style={{ padding: 5, flexDirection: 'row' }}>
                <TouchableOpacity style={{ flex: 1 }}>
                    <Text style={{ flex: 1, color: 'blue' }}>{op}</Text>
                </TouchableOpacity>
                <Text>---</Text>
            </View>
        )
    }
}

export default GattChar;
