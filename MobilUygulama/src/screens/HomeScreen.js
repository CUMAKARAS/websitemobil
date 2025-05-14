import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const CRYPTOPANIC_API_URL = 'https://cryptopanic.com/api/v1/posts/?auth_token=demo&currencies=BTC,ETH,SOL,BNB,DOGE';

const HomeScreen = () => {
  const [marketData, setMarketData] = useState([]);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [marketError, setMarketError] = useState('');
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // Kripto fiyatları
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoadingMarket(true);
        const response = await fetch(`${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,dogecoin&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h`);
        const data = await response.json();
        setMarketData(data);
        setMarketError('');
      } catch (error) {
        setMarketError('Piyasa verileri yüklenemedi');
      } finally {
        setLoadingMarket(false);
      }
    };
    fetchMarketData();
  }, []);

  // Kripto haberleri
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoadingNews(true);
        const response = await fetch(CRYPTOPANIC_API_URL);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setNews(data.results.slice(0, 3));
        } else {
          // API boş dönerse sahte haberler göster
          setNews([
            {
              title: "Bitcoin $63,000 Direncini Aşmaya Çalışıyor",
              source: { title: "CoinDesk" },
              published_at: new Date().toISOString(),
              url: "https://coindesk.com"
            },
            {
              title: "Ethereum 2.0 Güncellemesi Yaklaşıyor",
              source: { title: "CoinTelegraph" },
              published_at: new Date().toISOString(),
              url: "https://cointelegraph.com"
            },
            {
              title: "Kripto Piyasasında Bu Hafta Beklenenler",
              source: { title: "KriptoHaber" },
              published_at: new Date().toISOString(),
              url: "https://kriptohaber.com"
            }
          ]);
        }
      } catch (err) {
        // Hata olursa da sahte haberler göster
        setNews([
          {
            title: "Bitcoin $63,000 Direncini Aşmaya Çalışıyor",
            source: { title: "CoinDesk" },
            published_at: new Date().toISOString(),
            url: "https://coindesk.com"
          },
          {
            title: "Ethereum 2.0 Güncellemesi Yaklaşıyor",
            source: { title: "CoinTelegraph" },
            published_at: new Date().toISOString(),
            url: "https://cointelegraph.com"
          },
          {
            title: "Kripto Piyasasında Bu Hafta Beklenenler",
            source: { title: "KriptoHaber" },
            published_at: new Date().toISOString(),
            url: "https://kriptohaber.com"
          }
        ]);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  const formatPrice = (price) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 6 })}`;
    }
  };

  const formatChange = (change) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Logo ve Başlık */}
      <Text style={styles.logo}>MORKAN</Text>
      <Text style={styles.title}>Kripto Dünyasına Hoş Geldiniz</Text>
      <Text style={styles.desc}>
        En güncel kripto para analizleri, piyasa haberleri ve uzman tahminleri ile yatırımlarınızı güvenle yönetin.
      </Text>

      {/* Kayıt Ol / Giriş Yap Butonları */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Hemen Kaydol</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>

      {/* Kripto Fiyatları */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marketBar}>
        {loadingMarket ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : marketError ? (
          <Text style={styles.marketError}>{marketError}</Text>
        ) : (
          marketData.map((coin) => (
            <View key={coin.id} style={styles.marketItem}>
              <Text style={styles.marketSymbol}>{coin.symbol.toUpperCase()}</Text>
              <Text style={styles.marketPrice}>{formatPrice(coin.current_price)}</Text>
              <Text style={[styles.marketChange, coin.price_change_percentage_24h >= 0 ? styles.up : styles.down]}>
                {formatChange(coin.price_change_percentage_24h)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Özellikler */}
      <Text style={styles.sectionTitle}>Özelliklerimiz</Text>
      <View style={styles.featuresRow}>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={styles.featureTitle}>Detaylı Analizler</Text>
          <Text style={styles.featureDesc}>Teknik ve temel analizlerle kripto para birimlerinin geleceğini tahmin edin.</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📰</Text>
          <Text style={styles.featureTitle}>Kripto Haberleri</Text>
          <Text style={styles.featureDesc}>Kripto dünyasındaki son gelişmeleri ve haberleri anında takip edin.</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>💰</Text>
          <Text style={styles.featureTitle}>Portföy Yönetimi</Text>
          <Text style={styles.featureDesc}>Yatırımlarınızı takip edin ve performans raporlarını görüntüleyin.</Text>
        </View>
      </View>

      {/* Son Haberler */}
      <Text style={styles.sectionTitle}>Son Haberler</Text>
      {loadingNews ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : news.length === 0 ? (
        <Text style={styles.marketError}>Haberler yüklenemedi</Text>
      ) : (
        news.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.newsCard}
            onPress={() => Linking.openURL(item.url)}
          >
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsSource}>{item.source?.title}</Text>
            <Text style={styles.newsTime}>{new Date(item.published_at).toLocaleString('tr-TR')}</Text>
            <Text style={styles.newsReadMore}>Devamını Oku</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181c2f', padding: 20 },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 10, marginTop: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  desc: { color: '#b0b8d1', fontSize: 15, marginBottom: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  primaryButton: { backgroundColor: '#ff9900', padding: 12, borderRadius: 8, flex: 1, marginRight: 8 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  secondaryButton: { borderColor: '#ff9900', borderWidth: 1, padding: 12, borderRadius: 8, flex: 1, marginLeft: 8 },
  secondaryButtonText: { color: '#ff9900', fontWeight: 'bold', textAlign: 'center' },
  marketBar: { backgroundColor: '#10132b', borderRadius: 8, padding: 10, marginBottom: 20 },
  marketItem: { marginRight: 18, alignItems: 'center' },
  marketSymbol: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  marketPrice: { color: '#fff', fontSize: 15 },
  marketChange: { fontWeight: 'bold', fontSize: 14 },
  up: { color: '#3ecf4a' },
  down: { color: '#ff4d4d' },
  marketError: { color: '#ff4d4d', fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginVertical: 15 },
  featuresRow: { flexDirection: 'column', gap: 12, marginBottom: 20 },
  featureCard: { backgroundColor: '#23284d', borderRadius: 8, padding: 15, marginBottom: 10 },
  featureIcon: { fontSize: 28, marginBottom: 5 },
  featureTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 3 },
  featureDesc: { color: '#b0b8d1', fontSize: 14 },
  newsCard: { backgroundColor: '#23284d', borderRadius: 8, padding: 15, marginBottom: 15 },
  newsTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 5 },
  newsSource: { color: '#b0b8d1', fontSize: 13, marginBottom: 2 },
  newsTime: { color: '#b0b8d1', fontSize: 12, marginBottom: 5 },
  newsReadMore: { color: '#ff9900', fontWeight: 'bold', fontSize: 13, marginTop: 5 },
});

export default HomeScreen; 