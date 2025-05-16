import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { WebView } from 'react-native-webview';

const coins = [
  { label: 'Bitcoin (BTC)', value: 'BTC' },
  { label: 'Ethereum (ETH)', value: 'ETH' },
  { label: 'Solana (SOL)', value: 'SOL' },
  { label: 'Binance Coin (BNB)', value: 'BNB' },
  { label: 'Dogecoin (DOGE)', value: 'DOGE' },
];
const durations = [
  { label: 'Son 7 Gün', value: '7' },
  { label: 'Son 30 Gün', value: '30' },
  { label: 'Son 90 Gün', value: '90' },
];
const candleTypes = [
  { label: 'Günlük Mum', value: 'daily' },
  { label: 'Saatlik Mum', value: 'hourly' },
];

const AnalysisScreen = () => {
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [selectedCandle, setSelectedCandle] = useState('daily');
  const [indicators, setIndicators] = useState({ ema5: true, ema10: true, ema25: false, ema50: false, bollinger: false });
  const [chartHtml, setChartHtml] = useState('');

  useEffect(() => {
    updateChart();
  }, [selectedCoin, selectedDuration, selectedCandle]);

  const updateChart = () => {
    const timeframe = selectedCandle === 'daily' ? 'D' : '60';
    const symbol = selectedCoin + 'USD';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
          <style>
            html, body, #tradingview_widget {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background: transparent;
            }
            body { overflow: hidden; }
          </style>
        </head>
        <body>
          <div id="tradingview_widget"></div>
          <script type="text/javascript">
            new TradingView.widget({
              "width": "100%",
              "height": "100%",
              "symbol": "${symbol}",
              "interval": "${timeframe}",
              "timezone": "Etc/UTC",
              "theme": "dark",
              "style": "1",
              "locale": "tr",
              "toolbar_bg": "#23284d",
              "enable_publishing": false,
              "allow_symbol_change": true,
              "container_id": "tradingview_widget",
              "studies": [
                "MASimple@tv-basicstudies",
                "BB@tv-basicstudies"
              ]
            });
          </script>
        </body>
      </html>
    `;
    setChartHtml(html);
  };

  // Dummy data for cards
  const currentPrice = '$102.657,05';
  const change30d = '22.73%';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Kripto Para Analizi</Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Kripto Para Seçin:</Text>
          <View style={styles.selectBox}>
            <Picker
              selectedValue={selectedCoin}
              style={styles.picker}
              onValueChange={setSelectedCoin}
              dropdownIconColor="#fff"
            >
              {coins.map((c) => <Picker.Item key={c.value} label={c.label} value={c.value} />)}
            </Picker>
          </View>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Analiz Süresi:</Text>
          <View style={styles.selectBox}>
            <Picker
              selectedValue={selectedDuration}
              style={styles.picker}
              onValueChange={setSelectedDuration}
              dropdownIconColor="#fff"
            >
              {durations.map((d) => <Picker.Item key={d.value} label={d.label} value={d.value} />)}
            </Picker>
          </View>
        </View>
        <View style={[styles.col, { maxWidth: 180 }]}> 
          <Text style={styles.label}>Mum Tipi:</Text>
          <View style={styles.selectBox}>
            <Picker
              selectedValue={selectedCandle}
              style={styles.picker}
              onValueChange={setSelectedCandle}
              dropdownIconColor="#fff"
            >
              {candleTypes.map((c) => <Picker.Item key={c.value} label={c.label} value={c.value} />)}
            </Picker>
          </View>
        </View>
      </View>
      <View style={styles.indicatorRow}>
        <View style={styles.indicatorItem}>
          <Switch value={indicators.ema5} onValueChange={v => setIndicators({ ...indicators, ema5: v })} />
          <Text style={styles.indicatorLabel}>EMA 5</Text>
        </View>
        <View style={styles.indicatorItem}>
          <Switch value={indicators.ema10} onValueChange={v => setIndicators({ ...indicators, ema10: v })} />
          <Text style={styles.indicatorLabel}>EMA 10</Text>
        </View>
        <View style={styles.indicatorItem}>
          <Switch value={indicators.ema25} onValueChange={v => setIndicators({ ...indicators, ema25: v })} />
          <Text style={styles.indicatorLabel}>EMA 25</Text>
        </View>
        <View style={styles.indicatorItem}>
          <Switch value={indicators.ema50} onValueChange={v => setIndicators({ ...indicators, ema50: v })} />
          <Text style={styles.indicatorLabel}>EMA 50</Text>
        </View>
        <View style={styles.indicatorItem}>
          <Switch value={indicators.bollinger} onValueChange={v => setIndicators({ ...indicators, bollinger: v })} />
          <Text style={styles.indicatorLabel}>Bollinger Bandı</Text>
        </View>
      </View>
      <View style={styles.chartBox}>
        <WebView
          source={{ html: chartHtml }}
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
      <View style={styles.cardRow}>
        <View style={styles.infoCard}>
          <Text style={styles.cardLabel}>Güncel Fiyat</Text>
          <Text style={styles.cardValue}>{currentPrice}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.cardLabel}>30 Günlük Değişim</Text>
          <Text style={[styles.cardValue, { color: '#2ee6b7' }]}>{change30d}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.suggestButton}>
        <Text style={styles.suggestButtonText}>Tavsiye Al</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#181c2f', padding: 20 },
  header: { fontSize: 36, fontWeight: 'bold', color: '#e6eaf3', textAlign: 'center', marginBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' },
  col: { flex: 1, minWidth: 180, marginRight: 16 },
  label: { color: '#e6eaf3', fontWeight: 'bold', fontSize: 20, marginBottom: 8 },
  selectBox: { backgroundColor: '#23284d', borderRadius: 8, marginBottom: 8 },
  picker: { color: '#fff', height: 48, width: '100%' },
  indicatorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
  indicatorItem: { flexDirection: 'row', alignItems: 'center', marginRight: 18 },
  indicatorLabel: { color: '#b0b8d1', fontSize: 16, marginLeft: 4 },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
  chartBox: {
    backgroundColor: '#23284d',
    borderRadius: 12,
    height: 400,
    marginBottom: 30,
    overflow: 'hidden',
    width: '100%',
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  infoCard: { backgroundColor: '#23284d', borderRadius: 16, flex: 1, marginHorizontal: 8, padding: 24, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { color: '#b0b8d1', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  cardValue: { color: '#e6eaf3', fontSize: 32, fontWeight: 'bold' },
  suggestButton: { backgroundColor: '#168aff', borderRadius: 10, paddingVertical: 16, paddingHorizontal: 32, alignSelf: 'center', marginTop: 10 },
  suggestButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 20, textAlign: 'center' },
});

export default AnalysisScreen; 