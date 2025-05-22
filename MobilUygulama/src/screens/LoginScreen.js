// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { ScrollView, View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { firebase, db } from '../firebase';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }

    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email.trim(), password);
      const userId = userCredential.user.uid;
      
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        console.log('Giriş başarılı, analiz sayfasına yönlendiriliyor...');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Analysis' }],
        });
      } else {
        setError('Kullanıcı bilgileri bulunamadı.');
      }
    } catch (err) {
      console.error('Giriş hatası:', err);
      setError('E-posta veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Uyarı', 'Lütfen önce e-posta adresinizi girin.');
      return;
    }
    firebase.auth().sendPasswordResetEmail(email.trim())
      .then(() => Alert.alert('Başarılı', 'Şifre sıfırlama e-postası gönderildi.'))
      .catch(() => Alert.alert('Hata', 'Şifre sıfırlama e-postası gönderilemedi.'));
  };

  if (loading) {
    return (
      <View style={[styles.bg, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#168aff" />
        <Text style={[styles.title, { marginTop: 20 }]}>Giriş yapılıyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.bg}>
      <View style={styles.card}>
        <Text style={styles.header}>Morkan</Text>
        <Text style={styles.title}>Giriş Yap</Text>
        <View style={styles.hr} />
        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          placeholder="E-posta adresiniz"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          placeholder="Şifreniz"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
          <Text style={styles.forgot}>Şifremi Unuttum</Text>
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.6 }]} 
          onPress={handleLogin} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bg: { 
    flexGrow: 1, 
    backgroundColor: '#181c2f', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100%' 
  },
  card: { 
    backgroundColor: '#23284d', 
    borderRadius: 12, 
    padding: 24, 
    width: '100%', 
    maxWidth: 500, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 2 } 
  },
  header: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#168aff', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  hr: { 
    borderBottomWidth: 2, 
    borderBottomColor: '#168aff', 
    marginVertical: 10 
  },
  label: { 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 4, 
    marginTop: 8 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 10, 
    backgroundColor: '#f9f9f9', 
    fontSize: 16, 
    color: '#222' 
  },
  forgot: { 
    color: '#168aff', 
    textDecorationLine: 'underline', 
    marginBottom: 10, 
    marginTop: 2 
  },
  button: { 
    backgroundColor: '#168aff', 
    padding: 16, 
    borderRadius: 8, 
    marginTop: 10, 
    marginBottom: 10 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18, 
    textAlign: 'center' 
  },
  error: { 
    color: 'red', 
    marginTop: 8, 
    textAlign: 'center' 
  },
});

export default LoginScreen;
