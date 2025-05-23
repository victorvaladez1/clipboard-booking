import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { app } from '../services/firebase';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    console.log('Register button pressed'); // 🔍 Debug 1

    const auth = getAuth(app);
    console.log('Got auth:', auth); // 🔍 Debug 1.5

    try {
      console.log('Attempting registration with:', email, password); // 🔍 Debug 2

      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      console.log('User created:', userCredential.user); // 🔍 Debug 3

      Alert.alert('Success', 'Account created!');
      navigation.navigate('Login');
    } catch (error) {
      console.log('Registration error:', error); // 🔍 Debug 4
      Alert.alert('Registration Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Register" onPress={handleRegister} />
      <View style={{ marginTop: 10 }}>
        <Button
          title="Already have an account? Login"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
});
