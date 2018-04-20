import React, {Component} from 'react'
import {
    View, 
    Text,
    ScrollView,
    TouchableOpacity
} from 'react-native'
import JSONTree from 'react-native-json-tree'
import Theme from '../Theme'

let ErrorRegistry = function() {
    let errors = [];
    let callback = null;

    return {
        setCallback: cb => {
            callback = cb;
        },

        listErrors: () => {
            return errors;
        },

        putError: (key, error) => {
            errors.push({ key, value: error});
            callback && callback(errors);
        },

        clearErrors: () => {
            errors = [];
            callback && callback(errors);
        },
    }
}();

class ErrorMessagePanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expand: false
        }

        ErrorRegistry.setCallback(() => this.forceUpdate());
    }

    render() {
        let {expand} = this.state;
        let errors = ErrorRegistry.listErrors();

        if (!expand) {
            return (
                <View style={{ position: 'absolute', bottom: 30, left: 10, backgroundColor: 'rgba(0,0,0,0)' }}>
                    <TouchableOpacity 
                        style={{borderRadius: 25, width: 50, height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: errors.length > 0 ? 'red': Theme.color}}
                        onPress={() => this.setState({expand: true})}
                    >
                        <Text style={{color: 'white'}}>{errors.length}</Text>
                    </TouchableOpacity>
                </View>
            )
        }

        return (
            <View style={{ position: 'absolute', padding: 20, bottom: 0, left: 0, right: 0, backgroundColor: errors.length > 0 ? 'red': Theme.color }}>
                <Text style={{fontSize: 18, marginBottom: 10, color: 'white'}}>{errors.length > 0 ? 'Errors' : 'No Errors'}</Text>

                <View style={{ height: 300, padding: 10, alignSelf: 'stretch' }}>
                    <ScrollView style={{ flex: 1 }}>
                        {
                            errors.map(
                                (error, idx) => (
                                    <View key={idx} style={{marginBottom: 10, borderBottomWidth: 1, borderBottomColor: 'white'}}>
                                        <Text style={{color: 'white', marginBottom: 6}}>{error.key}</Text>
                                        <JSONTree data={error.value} />
                                    </View>
                                )
                            )
                        }
                    </ScrollView>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 15, borderTopWidth: 1, borderTopColor: 'white' }}>
                    <TouchableOpacity 
                        style={{padding: 10, borderColor: 'white', marginRight: 10}} 
                        onPress={() => this.setState({expand: false})}
                    >
                        <Text style={{fontSize: 16, color: 'white'}}>Close</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={{padding: 10, borderColor: 'white', borderWidth: 1, borderRadius: 5}} 
                        onPress={() => {
                            ErrorRegistry.clearErrors();
                            this.setState({expand: false});
                        }} 
                    >
                        <Text style={{fontSize: 16, color: 'white'}}>Clear & Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )        
    }
}

export default ErrorMessagePanel;

export {
    ErrorRegistry
}
