import React, {Component} from 'react'
import {
    Platform,
} from 'react-native'

const Theme = {
    color: '#4FC3F7',
    navbarHeight: Platform.OS === 'ios' ? 64 : 72,
    navbarPaddingTop: Platform.OS === 'ios' ? 20 : 0,
};

export default Theme;
