// src/screens/RegisterScreen.js

import React, { useState } from 'react';
import { ScrollView, View, TextInput, Button, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, firebase } from '../firebase';
import Checkbox from 'expo-checkbox';

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const getFriendlyError = (code, message) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda.';
      case 'auth/invalid-email':
        return 'Geçerli bir e-posta adresi girin.';
      case 'auth/weak-password':
        return 'Şifreniz zayıf. Lütfen daha güçlü bir şifre belirleyin.';
      case 'auth/network-request-failed':
        return 'İnternet bağlantınızda sorun var.';
      default:
        return message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  };

  const openTerms = async () => {
    const url = 'https://www.google.com';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      setError('Bağlantı açılamıyor.');
    }
  };

  const handleRegister = async () => {
    if (loading) return;

    setError('');
    setSuccess('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !passwordRepeat) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== passwordRepeat) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (!accepted) {
      setError('Kullanım koşullarını kabul etmelisiniz.');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      const userId = auth.currentUser.uid;
      await db.collection('users').doc(userId).set({
        firstName,
        lastName,
        email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      setSuccess('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setPasswordRepeat('');
      setAccepted(false);
    } catch (err) {
      console.log('Kayıt Hatası:', err);
      setError(getFriendlyError(err.code, err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Morkan</Text>
        <Text style={styles.title}>Morkan'a Üye Olun</Text>
        <View style={styles.hr} />
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Morkan'a hoş geldiniz! Hesap oluşturmak için lütfen aşağıdaki bilgileri doldurun.</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Adınız <Text style={styles.required}>*</Text></Text>
            <TextInput style={styles.input} placeholder="Adınız" value={firstName} onChangeText={setFirstName} />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Soyadınız <Text style={styles.required}>*</Text></Text>
            <TextInput style={styles.input} placeholder="Soyadınız" value={lastName} onChangeText={setLastName} />
          </View>
        </View>
        <Text style={styles.label}>E-posta Adresiniz <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} placeholder="ornek@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Text style={styles.label}>Şifre <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} placeholder="En az 6 karakter" value={password} onChangeText={setPassword} secureTextEntry />
        <Text style={styles.label}>Şifre Tekrarı <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} placeholder="Şifrenizi tekrar girin" value={passwordRepeat} onChangeText={setPasswordRepeat} secureTextEntry />
        <View style={styles.checkboxRow}>
          <Checkbox value={accepted} onValueChange={setAccepted} />
          <Text style={styles.checkboxText}>
            <Text onPress={openTerms} style={styles.link}>Kullanım koşullarını ve gizlilik politikasını</Text> okudum ve kabul ediyorum
          </Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}
        <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>Hesabımı Oluştur</Text>
        </TouchableOpacity>
        <Text style={styles.loginText}>
          Zaten bir hesabınız var mı?{' '}
          <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>Giriş Yapın</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181c2f', padding: 20 },
  card: { backgroundColor: '#23284d', borderRadius: 12, padding: 24, width: '100%', maxWidth: 500, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, marginTop: 30, marginBottom: 30 },
  header: { fontSize: 32, fontWeight: 'bold', color: '#168aff', textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  hr: { borderBottomWidth: 2, borderBottomColor: '#168aff', marginVertical: 10 },
  infoBox: { backgroundColor: 'rgba(22,138,255,0.08)', borderRadius: 8, padding: 12, marginBottom: 18 },
  infoText: { color: '#168aff', fontSize: 16, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 10, backgroundColor: 'transparent' },
  inputCol: { flex: 1, backgroundColor: 'transparent' },
  label: { fontWeight: 'bold', color: '#fff', marginBottom: 4, marginTop: 8 },
  required: { color: 'red' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#f9f9f9', fontSize: 16, color: '#222' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  checkboxText: { marginLeft: 8, color: '#fff', flex: 1, flexWrap: 'wrap' },
  link: { color: '#168aff', textDecorationLine: 'underline' },
  button: { backgroundColor: '#168aff', padding: 16, borderRadius: 8, marginTop: 10, marginBottom: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center' },
  loginText: { textAlign: 'center', color: '#fff', marginTop: 10 },
  loginLink: { color: '#168aff', fontWeight: 'bold', textDecorationLine: 'underline' },
  error: { color: 'red', marginTop: 8, textAlign: 'center' },
  success: { color: 'green', marginTop: 8, textAlign: 'center' },
});

export default RegisterScreen;
