import React, {Component} from 'react';
import {
    View,
    Text,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import Theme from '../Theme'
import NavBar from './NavBar'
import Btn from './Btn'
import Peripheral from './Peripheral'

const UiState = {
    idle: 0,
    refreshing: 1,
}

const UiFeatures = {
    list_connected: 0,
    list_bonded: 1,
}

const Features = [
    { id: UiFeatures.list_connected, name: 'List connected peripherals', },
    { id: UiFeatures.list_bonded, name: 'List bonded peripherals', },
]

class FeatureList extends Component {
    render() {
        let {selected, onSelect, extraStyle={}} = this.props;

        return (
            <View style={{...extraStyle}}>
                {
                    Features.map(
                        f => (
                            <TouchableOpacity 
                                key={f.id}
                                onPress={() => onSelect(f.id)} 
                                style={{padding: 10, backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderBottomColor: '#ccc'}}
                            >
                                <Text style={{textAlign: 'center', color: selected === f.id ? 'blue' : '#ccc'}}>{f.name}</Text>
                            </TouchableOpacity>
                        )
                    )
                }
            </View>
        ) 

    }
}

class TabFeatures extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uiState: UiState.idle,
            peripherals: [],
            feature: UiFeatures.list_connected,
        };
    }

    render() {
        let { uiState, feature, } = this.state;

        return (
            <View style={{flex: 1, paddingTop: Theme.navbarHeight}}>
                <StatusBar 
                    backgroundColor={Theme.color}
                    barStyle="light-content"
                />

                <NavBar>
                    <Text style={{color: 'white', fontSize: 20, width: 100, textAlign: 'left', flex: 1}}>Features</Text>
                </NavBar>

                <View style={{flex: 1}}>
                    <FeatureList 
                        selected={feature}
                        onSelect={feature => this.setState({feature})}
                    />

                    { this._renderFeature() }
                </View>
            </View>
        )
    }

    _renderFeature = () => {
        let {onConnect} = this.props;
        let {feature, peripherals, uiState} = this.state;
        switch (feature) {
            case UiFeatures.list_connected:
                return (
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'stretch' }}>
                        {
                            Object.keys(peripherals).map(key => peripherals[key]).map(
                                peripheral => (
                                    <Peripheral
                                        key={peripheral.id}
                                        peripheral={peripheral}
                                        onConnect={onConnect}
                                    />
                                )
                            )
                        }

                        <View style={{padding: 20, alignSelf: 'center'}}>
                            {
                                uiState === UiState.refreshing ? (
                                    <ActivityIndicator />
                                ) : (
                                    <Btn onPress={this._listConnected}>List Connected Peripherals</Btn>
                                )
                            }
                        </View>
                    </ScrollView>
                );

            case UiFeatures.list_bonded:
                if (Platform.OS === 'ios') {
                    return (
                        <View style={{flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{color: '#aaa', fontSize: 20, textAlign: 'center'}}>
                                iOS doesn't support listing bonded devices
                            </Text>
                        </View>
                    )
                }

                return (
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'stretch' }}>
                        {
                            Object.keys(peripherals).map(key => peripherals[key]).map(
                                peripheral => (
                                    <Peripheral
                                        key={peripheral.id}
                                        peripheral={peripheral}
                                        onConnect={onConnect}
                                    />
                                )
                            )
                        }

                        <View style={{padding: 20, alignSelf: 'center'}}>
                            {
                                uiState === UiState.refreshing ? (
                                    <ActivityIndicator />
                                ) : (
                                    <Btn onPress={this._listBonded}>List Bonded Peripherals</Btn>
                                )
                            }
                        </View>
                    </ScrollView>
                )
        }
        return null;
    }

    _listConnected = () => {
        this.setState({uiState: UiState.refreshing});
        // manually wait for a whole, let the spinner shows up
        setTimeout(
            () => {
                BleManager.getConnectedPeripherals([])
                    .then(peripherals => {
                        this.setState({
                            uiState: UiState.idle,
                            peripherals,
                        })
                    })
                    .catch(() => {
                        this.setState({
                            uiState: UiState.idle,
                        })
                    })

            }, 1500
        )
    }

    _listBonded = () => {
        this.setState({uiState: UiState.refreshing});
        BleManager.getBondedPeripherals()
            .then(peripherals => {
                this.setState({
                    uiState: UiState.idle,
                    peripherals,
                })
            })
            .catch(() => {
                this.setState({
                    uiState: UiState.idle,
                })
            })
    }
}

export default TabFeatures;