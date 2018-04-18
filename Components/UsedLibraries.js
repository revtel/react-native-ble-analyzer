import React, {Component} from 'react';
import {
    View,
    Text,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking
} from 'react-native';

const libraries = [
    { name: 'react-native-ble-manager', link: 'https://github.com/innoveit/react-native-ble-manager'},
    { name: 'react-native-json-tree', link: 'https://github.com/Dean177/react-native-json-tree'},
    { name: 'react-native-tab-navigator', link: 'https://github.com/happypancake/react-native-tab-navigator'},
    { name: 'react-native-vector-icons', link: 'https://github.com/oblador/react-native-vector-icons'},
];

class UsedLibrary extends Component {
    render() {
        let {lib: {name, link}} = this.props;
        return (
            <View style={{flexDirection: 'row', padding: 10, borderBottomWidth: 1, alignItems: 'center', borderBottomColor: '#ccc'}}>
                <Text style={{flex: 1, color: '#aaa'}}>{name}</Text>
                <TouchableOpacity style={{marginLeft: 10}} onPress={() => this._openLink(link)}>
                    <Text style={{color: 'blue'}}>Visit</Text>
                </TouchableOpacity> 
            </View>
        )
    }

    _openLink = url => {
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    }
}

class UsedLibraries extends Component {
    render() {
        let {extraStyle} = this.props;
        return (
            <View style={extraStyle}>
                {
                    libraries.map(
                        lib => (
                            <UsedLibrary key={lib.name} lib={lib} />
                        )
                    )
                }
            </View>
        )
    }
}

export default UsedLibraries;