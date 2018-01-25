import React, {Component} from 'react'
import {
    Text,
    TouchableOpacity,
} from 'react-native'
import Theme from '../Theme'

class Btn extends Component {
    render() {
        let {outline=false} = this.props;
        return (
            <TouchableOpacity 
                    style={{borderWidth: 1, borderRadius: 5, borderColor: Theme.color, padding: 10, backgroundColor: outline ? 'white' : Theme.color}}
                    onPress={this.props.onPress}>
                    <Text style={{color: outline ? Theme.color : 'white'}}>{this.props.children}</Text>
            </TouchableOpacity>
        )
    }
}

export default Btn;