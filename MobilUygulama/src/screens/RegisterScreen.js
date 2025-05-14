// src/screens/RegisterScreen.js

import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Şifre" secureTextEntry onChangeText={setPassword} />
      <Button title="Kayıt Ol" onPress={handleRegister} />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      {success ? <Text style={{ color: 'green' }}>{success}</Text> : null}
    </View>
  );
};

export default RegisterScreen;
