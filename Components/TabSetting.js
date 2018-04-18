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
import BleManager from 'react-native-ble-manager';
import Theme from '../Theme'
import NavBar from './NavBar'
import Btn from './Btn'
import pkg from '../package.json'
import UsedLibraries from './UsedLibraries'

class TabSetting extends Component {
    render() {
        return (
            <View style={{flex: 1, paddingTop: Theme.navbarHeight}}>
                <StatusBar 
                    backgroundColor={Theme.color}
                    barStyle="light-content"
                />

                <NavBar>
                    <Text style={{color: 'white', fontSize: 20, width: 100, textAlign: 'left', flex: 1}}>Setting</Text>
                </NavBar>

                {
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{}}>
                        <View style={{ padding: 20 }}>
                            <Text style={{fontSize: 20}}>Version</Text>
                            <Text style={{fontSize: 16, marginBottom: 20, color: '#aaa'}}>{`${pkg.version}`}</Text>

                            <Text style={{fontSize: 20}}>Repository</Text>
                            <TouchableOpacity onPress={() => this._openLink('https://github.com/revtel/react-native-ble-analyzer')}>
                                <Text style={{fontSize: 18, paddingTop: 3, color: 'blue'}}>Visit</Text>
                            </TouchableOpacity> 
                            <Text style={{marginTop: 5, fontSize: 12, marginBottom: 20, color: '#aaa'}}>Contributions are welcome!</Text>

                            <Text style={{fontSize: 20}}>OSS Libraries</Text>
                            <UsedLibraries extraStyle={{paddingLeft: 10}}/>
                        </View>
                    </ScrollView>
                }
            </View>
        )
    }

    _openLink = url => {
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    }
}

export default TabSetting;