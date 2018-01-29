import React, {Component} from 'react';
import {
    View,
    Text,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import Theme from '../Theme'
import NavBar from './NavBar'
import Btn from './Btn'
import Peripheral from './Peripheral'
import ConnectionPanel from './ConnectionPanel'

const UiState = {
    idle: 0,
    refreshing: 1,
}

class TabConnected extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uiState: UiState.idle,
            peripherals: [],
            connect: false,
            connectTo: null,
        };
    }

    render() {
        let { uiState, peripherals, connect, connectTo } = this.state;

        return (
            <View style={{flex: 1, paddingTop: Theme.navbarHeight}}>
                <StatusBar 
                    backgroundColor={Theme.color}
                    barStyle="light-content"
                />

                <NavBar>
                    <Text style={{color: 'white', fontSize: 20, width: 100, textAlign: 'left', flex: 1}}>Connected Devices</Text>
                    { this._renderRefreshButton() }
                </NavBar>

                {
                    Object.keys(peripherals).length === 0 ? (
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            { uiState === UiState.refreshing && <ActivityIndicator size='large' color={Theme.color}/> }
                            <Text style={{marginBottom: 10}}>
                                Currently no connected peripherals found
                            </Text>
                            { uiState === UiState.idle && <Btn onPress={this._doRefresh}>Refresh Now</Btn> }
                        </View>
                    ) : (
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'stretch' }}>
                            {
                                Object.keys(peripherals).map(key => peripherals[key]).map(
                                    peripheral => (
                                        <Peripheral
                                            key={peripheral.id}
                                            peripheral={peripheral}
                                            onConnect={connectTo => this.setState({ connect: !connect, connectTo })}
                                        />
                                    )
                                )
                            }
                        </ScrollView>
                    )
                }

                {
                    connect && (
                        <ConnectionPanel 
                            peripheral={connectTo}
                            onClose={() => this.setState({connect: false})}
                        />
                    )
                }
            </View>
        )
    }

    _renderRefreshButton = () => {
        let {uiState} = this.state;
        if (uiState === UiState.refreshing) {
            return <ActivityIndicator color='white'/>
        }
        return (
            <TouchableOpacity onPress={this._doRefresh}>
                <Text style={{color: 'white', width: 100, textAlign: 'right'}}>Refresh</Text>
            </TouchableOpacity>
        )
    }

    _doRefresh = () => {
        this.setState({uiState: UiState.refreshing});
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
    }
}

export default TabConnected;