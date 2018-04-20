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
import TabFeatures from './Components/TabFeatures'
import TabSetting from './Components/TabSetting'
import ConnectionPanel from './Components/ConnectionPanel'
import ErrorMessagePanel, {ErrorRegistry} from './Components/ErrorMessagePanel'

const Tabs = {
    scan: 0,
    features: 1,
    setting: 2,
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
                        renderIcon={() => <Text style={{color: '#ccc'}}>SCAN</Text>}
                        renderSelectedIcon={() => <Text style={{fontWeight: 'bold', color: Theme.color}}>SCAN</Text>}
                        onPress={() => this.setState({ selectedTab: Tabs.scan })}>
                        <TabScan onConnect={connectTo => this.setState({connectTo})}/>
                    </TabNavigator.Item>
                    <TabNavigator.Item
                        selected={selectedTab === Tabs.features}
                        renderIcon={() => <Text style={{color: '#ccc'}}>FEATURES</Text>}
                        renderSelectedIcon={() => <Text style={{fontWeight: 'bold', color: Theme.color}}>FEATURES</Text>}
                        onPress={() => this.setState({ selectedTab: Tabs.features })}>
                        <TabFeatures onConnect={connectTo => this.setState({connectTo})}/>
                    </TabNavigator.Item>
                    <TabNavigator.Item
                        selected={selectedTab === Tabs.setting}
                        renderIcon={() => <Text style={{color: '#ccc'}}>SETTING</Text>}
                        renderSelectedIcon={() => <Text style={{fontWeight: 'bold', color: Theme.color}}>SETTING</Text>}
                        onPress={() => this.setState({ selectedTab: Tabs.setting })}>
                        <TabSetting />
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

                {
                    <ErrorMessagePanel />
                }
            </View>
        )
    }
}

export default App;
