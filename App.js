import React, {Component} from 'react'
import {
    View,
    Text,
    Platform,
    TouchableOpacity,
    StatusBar,
} from 'react-native'
import TabNavigator from 'react-native-tab-navigator';
import Theme from './Theme'
import TabScan from './Components/TabScan'
import TabConnected from './Components/TabConnected'
import ConnectionPanel from './Components/ConnectionPanel'

const Tabs = {
    scan: 0,
    connected: 1,
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: Tabs.scan,
            connectTo: null,
        };
    }

    render() {
        let {selectedTab, connectTo} = this.state;

        return (
            <View style={{flex: 1}}>
                <TabNavigator>
                    <TabNavigator.Item
                        selected={selectedTab === Tabs.scan}
                        renderIcon={() => <Text style={{color: '#ccc'}}>Scan</Text>}
                        renderSelectedIcon={() => <Text style={{fontWeight: 'bold', color: Theme.color}}>Scan</Text>}
                        onPress={() => this.setState({ selectedTab: Tabs.scan })}>
                        <TabScan onConnect={connectTo => this.setState({connectTo})}/>
                    </TabNavigator.Item>
                    <TabNavigator.Item
                        selected={selectedTab === Tabs.connected}
                        renderIcon={() => <Text style={{color: '#ccc'}}>Connected</Text>}
                        renderSelectedIcon={() => <Text style={{fontWeight: 'bold', color: Theme.color}}>Connected</Text>}
                        onPress={() => this.setState({ selectedTab: Tabs.connected })}>
                        <TabConnected onConnect={connectTo => this.setState({connectTo})}/>
                    </TabNavigator.Item>
                </TabNavigator>

                {
                    connectTo && (
                        <ConnectionPanel 
                            peripheral={connectTo}
                            onClose={() => this.setState({connectTo: null})}
                        />
                    )
                }
            </View>
        )
    }
}

export default App;
