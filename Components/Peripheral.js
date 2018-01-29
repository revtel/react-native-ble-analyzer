import React, {Component} from 'react'
import {
    View,
    Text,
    Platform,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    PermissionsAndroid,
    NativeModules,
    NativeEventEmitter,
} from 'react-native'
import JSONTree from 'react-native-json-tree'
import Btn from './Btn'

class Peripheral extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false
        }
    }

    render() {
        let {expanded} = this.state;
        let {peripheral, onConnect=(() => 0)} = this.props;
        return (
            <View style={{borderBottomColor: 'lightgrey', borderBottomWidth: 1, alignItems: 'stretch'}}>
                <View style={{flexDirection: 'row', alignItems: 'center', padding: 15}}>
                    <View style={{flex: 1}}>
                        <Text>{`${peripheral.name || 'N/A'}`}</Text>
                        <Text>{`${peripheral.id}`}</Text>
                        <Text>{`${peripheral.rssi || '---'} dBm`}</Text>
                    </View>

                    <Btn onPress={() => this.setState({expanded: !expanded})} outline>
                        {`${expanded ? 'See Less' : 'See More'}`}
                    </Btn>
                </View>

                {
                    expanded && (
                        <View style={{padding: 15}}>
                            <View style={{minHeight: 50, marginBottom: 10}}>
                                <Text style={{fontWeight: 'bold'}}>Raw Data</Text>
                                <JSONTree 
                                    data={peripheral} 
                                />
                            </View>

                            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                                <Btn onPress={() => onConnect(peripheral)}>
                                    {`Connect`}
                                </Btn>
                            </View>
                        </View>
                    )
                }
            </View>
        )
    }
}

export default Peripheral;