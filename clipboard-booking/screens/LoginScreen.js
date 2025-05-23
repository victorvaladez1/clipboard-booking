import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function LoginScreen ({ navigation }) {
    return (
        <View style={styles.container}>
            <Text>Login Screen</Text>
            <Button title="Go to Register" onPress={() => navigation.navigate('Register')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});