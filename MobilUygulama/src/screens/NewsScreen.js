import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';

const CRYPTOPANIC_API_URL = 'https://cryptopanic.com/api/v1/posts/?auth_token=demo&currencies=BTC,ETH,SOL,BNB,DOGE';

const NewsScreen = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(CRYPTOPANIC_API_URL);
        const data = await response.json();
        setNews(data.results || []);
        setError('');
      } catch (err) {
        setError('Haberler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Kripto Haberleri</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        news.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => Linking.openURL(item.url)}
          >
            <Text style={styles.headline}>{item.title}</Text>
            <Text style={styles.source}>{item.source?.title}</Text>
            <Text style={styles.time}>{new Date(item.published_at).toLocaleString('tr-TR')}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  headline: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#222',
  },
  source: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  time: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});

export default NewsScreen; 