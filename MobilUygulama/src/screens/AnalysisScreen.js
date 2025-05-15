import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { firebase, db } from '../firebase';

const AnalysisScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleAnalysis = () => {
    Alert.alert('Bilgi', 'Kripto Analiz Aracı yakında mobilde!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.header}>Kripto Analiz Dashboard</Text>
        {loading ? (
          <ActivityIndicator color="#168aff" style={{ marginLeft: 16 }} />
        ) : userData ? (
          <View style={styles.userBox}>
            <Text style={styles.userName}>{userData.firstName} {userData.lastName}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.card}>
        <Text style={styles.welcome}>Hoş geldiniz, {userData ? userData.firstName : ''} {userData ? userData.lastName : ''}</Text>
        <Text style={styles.info}>Hesabınıza başarıyla giriş yaptınız!</Text>
        <TouchableOpacity style={styles.button} onPress={handleAnalysis}>
          <Text style={styles.buttonText}>Kripto Analiz Aracını Kullan</Text>
        </TouchableOpacity>
      </View>
      {userData && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Hesap Bilgileriniz</Text>
          <Text style={styles.profile}><Text style={styles.label}>Ad Soyad:</Text> {userData.firstName} {userData.lastName}</Text>
          <Text style={styles.profile}><Text style={styles.label}>E-posta:</Text> {userData.email}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#181c2f',
    flexGrow: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#168aff',
    textAlign: 'left',
    flex: 1,
  },
  userBox: {
    backgroundColor: '#23284d',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'flex-end',
    minWidth: 120,
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userEmail: {
    color: '#b0b8d1',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#23284d',
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
    color: '#168aff',
  },
  info: {
    fontSize: 16,
    marginBottom: 15,
    color: '#fff',
  },
  button: {
    backgroundColor: '#168aff',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
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
    color: '#168aff',
  },
  profile: {
    fontSize: 16,
    marginBottom: 6,
    color: '#fff',
  },
  label: {
    fontWeight: 'bold',
    color: '#168aff',
  },
});

export default AnalysisScreen; 