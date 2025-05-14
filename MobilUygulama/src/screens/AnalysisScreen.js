import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';

const user = {
  firstName: 'Ali',
  lastName: 'Yılmaz',
  email: 'ali.yilmaz@example.com',
  id: '123456',
  googleId: false,
};

const AnalysisScreen = () => {
  const handleAnalysis = () => {
    Alert.alert('Bilgi', 'Kripto Analiz Aracı yakında mobilde!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Kripto Analiz Dashboard</Text>
      <View style={styles.card}>
        <Text style={styles.welcome}>Hoş geldiniz, {user.firstName} {user.lastName}</Text>
        <Text style={styles.info}>Hesabınıza başarıyla giriş yaptınız!</Text>
        <TouchableOpacity style={styles.button} onPress={handleAnalysis}>
          <Text style={styles.buttonText}>Kripto Analiz Aracını Kullan</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Hesap Bilgileriniz</Text>
        <Text style={styles.profile}><Text style={styles.label}>Ad Soyad:</Text> {user.firstName} {user.lastName}</Text>
        <Text style={styles.profile}><Text style={styles.label}>E-posta:</Text> {user.email}</Text>
        <Text style={styles.profile}><Text style={styles.label}>Hesap ID:</Text> {user.id}</Text>
        <Text style={styles.profile}><Text style={styles.label}>Giriş Yöntemi:</Text> {user.googleId ? 'Google ile Giriş' : 'E-posta/Şifre'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1877f2',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1877f2',
  },
  info: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#1877f2',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1877f2',
  },
  profile: {
    fontSize: 16,
    marginBottom: 6,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AnalysisScreen; 