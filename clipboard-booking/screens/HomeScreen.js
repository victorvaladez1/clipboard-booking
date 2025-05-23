import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
    return (
        <View style={style.container}>
            <Text>Welcome to ClipBoard</Text>
        </View>
    );
}

const style = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});