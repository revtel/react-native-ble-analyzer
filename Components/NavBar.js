import React, {Component} from 'react'
import {
    View,
} from 'react-native'
import Theme from '../Theme'

class NavBar extends Component {
    render() {
        return (
            <View style={{
                position: 'absolute', left: 0, top: 0, right: 0, height: Theme.navbarHeight, 
                paddingTop: Theme.navbarPaddingTop, paddingLeft: 12, paddingRight: 12,
                backgroundColor: Theme.color, flexDirection: 'row', alignItems: 'center'
            }}>
                { this.props.children }
            </View>
        )
    }
}

export default NavBar; 