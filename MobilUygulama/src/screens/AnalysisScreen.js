import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

// Coin listesi
const coins = [
  { label: 'Bitcoin (BTC)', value: 'BTCUSDT' },
  { label: 'Ethereum (ETH)', value: 'ETHUSDT' },
  { label: 'Solana (SOL)', value: 'SOLUSDT' },
  { label: 'Binance Coin (BNB)', value: 'BNBUSDT' },
  { label: 'Dogecoin (DOGE)', value: 'DOGEUSDT' },
];

const timeframes = [
  { label: '1 Saat', value: '1h', limit: 24, interval: '1h' },
  { label: '4 Saat', value: '4h', limit: 30, interval: '4h' },
  { label: 'Günlük', value: '1d', limit: 24, interval: '1h' },
  { label: 'Haftalık', value: '1w', limit: 168, interval: '1h' },
  { label: 'Aylık', value: '1M', limit: 720, interval: '1h' },
  { label: 'Yıllık', value: '1y', limit: 8760, interval: '1h' },
];

// EMA hesaplama fonksiyonu
const calculateEMA = (data, period) => {
  const k = 2 / (period + 1);
  let ema = [data[0]];
  
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  
  return ema;
};

// Bollinger Bands hesaplama fonksiyonu
const calculateBollingerBands = (data, period = 20, multiplier = 2) => {
  const sma = [];
  const upper = [];
  const lower = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
      upper.push(null);
      lower.push(null);
      continue;
    }
    
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / period;
    const squaredDiffs = slice.map(price => Math.pow(price - avg, 2));
    const standardDeviation = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / period);
    
    sma.push(avg);
    upper.push(avg + (standardDeviation * multiplier));
    lower.push(avg - (standardDeviation * multiplier));
  }
  
  return { sma, upper, lower };
};

const CandleStickChart = ({ data, width, height, indicators }) => {
  const [scale, setScale] = useState(1);
  const [baseWidth, setBaseWidth] = useState(12);
  const [baseSpacing, setBaseSpacing] = useState(4);

  if (!data || data.length === 0) return null;

  const maxPrice = Math.max(...data.map(d => d.high));
  const minPrice = Math.min(...data.map(d => d.low));
  const priceRange = maxPrice - minPrice;
  const candleWidth = baseWidth * scale;
  const spacing = baseSpacing * scale;
  const chartWidth = data.length * (candleWidth + spacing);

  const onPinchEvent = useCallback((event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const newScale = Math.max(0.5, Math.min(3, event.nativeEvent.scale));
      setScale(newScale);
    }
  }, []);

  // EMA çizgisi için path oluşturucu
  const renderEMAPath = (emaValues, color) => {
    if (!emaValues || emaValues.length < 2) return null;
    let path = '';
    emaValues.forEach((val, i) => {
      if (val === null) return;
      const x = i * (candleWidth + spacing) + candleWidth / 2;
      const y = (maxPrice - val) / priceRange * height;
      path += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    });
    return <Path d={path} stroke={color} strokeWidth={2.5} fill="none" />;
  };

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchEvent}
      onHandlerStateChange={onPinchEvent}
    >
      <View style={styles.chartWrapper}>
        {/* EMA Etiketleri */}
        {indicators?.ema && (
          <View style={{ flexDirection: 'row', position: 'absolute', top: 5, left: 10, zIndex: 10 }}>
            {Object.entries(indicators.ema).map(([period]) => (
              <View key={`ema-label-${period}`} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                <View style={{ width: 16, height: 3, backgroundColor: getEMAColor(period), marginRight: 4, borderRadius: 2 }} />
                <Text style={{ color: getEMAColor(period), fontWeight: 'bold', fontSize: 12 }}>EMA {period}</Text>
              </View>
            ))}
          </View>
        )}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.candleChartScroll}
        >
          <View style={[styles.candleChart, { width: chartWidth, height }]}> 
            {/* Grid Lines */}
            {[...Array(5)].map((_, i) => (
              <View
                key={`grid-${i}`}
                style={[
                  styles.gridLine,
                  {
                    top: (height / 4) * i,
                    width: chartWidth,
                  },
                ]}
              />
            ))}

            {/* EMA Çizgileri (react-native-svg ile) */}
            <Svg style={StyleSheet.absoluteFill} width={chartWidth} height={height}>
              {indicators?.ema && Object.entries(indicators.ema).map(([period, values]) => (
                renderEMAPath(values, getEMAColor(period))
              ))}
            </Svg>

            {/* Bollinger Bands */}
            {indicators?.bollinger && (
              <>
                {indicators.bollinger.upper.map((value, index) => (
                  <View key={`upper-${index}`} style={[styles.indicatorLine, { 
                    width: candleWidth,
                    left: index * (candleWidth + spacing),
                    top: (maxPrice - value) / priceRange * height,
                    borderColor: 'rgba(255, 193, 7, 0.8)',
                    borderWidth: 1.5
                  }]} />
                ))}
                {indicators.bollinger.lower.map((value, index) => (
                  <View key={`lower-${index}`} style={[styles.indicatorLine, { 
                    width: candleWidth,
                    left: index * (candleWidth + spacing),
                    top: (maxPrice - value) / priceRange * height,
                    borderColor: 'rgba(255, 193, 7, 0.8)',
                    borderWidth: 1.5
                  }]} />
                ))}
                {indicators.bollinger.sma.map((value, index) => (
                  <View key={`sma-${index}`} style={[styles.indicatorLine, { 
                    width: candleWidth,
                    left: index * (candleWidth + spacing),
                    top: (maxPrice - value) / priceRange * height,
                    borderColor: 'rgba(255, 193, 7, 0.4)',
                    borderWidth: 1.5
                  }]} />
                ))}
              </>
            )}
            
            {/* Candlesticks */}
            {data.map((candle, index) => {
              const isGreen = candle.close >= candle.open;
              const candleHeight = Math.abs(candle.close - candle.open) / priceRange * height;
              const wickHeight = (candle.high - candle.low) / priceRange * height;
              const candleTop = (maxPrice - Math.max(candle.open, candle.close)) / priceRange * height;
              const wickTop = (maxPrice - candle.high) / priceRange * height;

              return (
                <View key={index} style={[styles.candleContainer, { 
                  left: index * (candleWidth + spacing),
                  width: candleWidth
                }]}> 
                  <View style={[
                    styles.wick,
                    {
                      height: wickHeight,
                      top: wickTop,
                      backgroundColor: isGreen ? '#3ecf4a' : '#ff4d4d',
                      left: candleWidth / 2 - 0.5,
                      width: 1.5
                    }
                  ]} />
                  <View style={[
                    styles.candle,
                    {
                      height: Math.max(candleHeight, 1),
                      top: candleTop,
                      backgroundColor: isGreen ? '#3ecf4a' : '#ff4d4d',
                      width: candleWidth - 4,
                      left: 2,
                      borderWidth: 1,
                      borderColor: isGreen ? '#2eb83e' : '#e63e3e'
                    }
                  ]} />
                </View>
              );
            })}

            {/* Price Labels */}
            {[...Array(5)].map((_, i) => {
              const price = maxPrice - (priceRange / 4) * i;
              return (
                <Text
                  key={`price-${i}`}
                  style={[
                    styles.priceLabel,
                    {
                      top: (height / 4) * i - 10,
                      right: 5,
                    },
                  ]}
                >
                  ${price.toFixed(2)}
                </Text>
              );
            })}
          </View>
        </ScrollView>
        <View style={styles.zoomControls}>
          <TouchableOpacity 
            style={styles.zoomButton} 
            onPress={() => setScale(prev => Math.min(3, prev + 0.2))}
          >
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.zoomButton} 
            onPress={() => setScale(prev => Math.max(0.5, prev - 0.2))}
          >
            <Text style={styles.zoomButtonText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PinchGestureHandler>
  );
};

const getEMAColor = (period) => {
  switch (period) {
    case '5': return '#FF6B6B';  // Canlı kırmızı
    case '10': return '#4ECDC4'; // Turkuaz
    case '25': return '#FFD93D'; // Sarı
    case '50': return '#95E1D3'; // Açık yeşil
    default: return '#FFFFFF';
  }
};

const AnalysisScreen = () => {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
  const [chartData, setChartData] = useState({ labels: [], values: [] });
  const [candleData, setCandleData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [timeframe, setTimeframe] = useState('1d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCandles, setShowCandles] = useState(true);
  const [showIndicators, setShowIndicators] = useState({
    ema5: false,
    ema10: false,
    ema25: false,
    ema50: false,
    bollinger: false
  });
  const [indicators, setIndicators] = useState(null);

  const calculateIndicators = useCallback((prices) => {
    const ema = {};
    if (showIndicators.ema5) ema['5'] = calculateEMA(prices, 5);
    if (showIndicators.ema10) ema['10'] = calculateEMA(prices, 10);
    if (showIndicators.ema25) ema['25'] = calculateEMA(prices, 25);
    if (showIndicators.ema50) ema['50'] = calculateEMA(prices, 50);

    const bollinger = showIndicators.bollinger ? calculateBollingerBands(prices) : null;

    setIndicators({ ema, bollinger });
  }, [showIndicators]);

  const fetchChartData = useCallback(async () => {
    try {
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
      const now = Date.now();
      let allCandles = [];
      let startTime = oneYearAgo;
      let keepFetching = true;
      while (keepFetching) {
        const response = await axios.get(
          `https://api.binance.com/api/v3/klines?symbol=${selectedCoin}&interval=1h&startTime=${startTime}&endTime=${now}&limit=1000`
        );
        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
          break;
        }
        const candles = response.data.map(kline => ({
          time: new Date(kline[0]).getTime(),
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5])
        }));
        allCandles = allCandles.concat(candles);
        if (response.data.length < 1000) {
          keepFetching = false;
        } else {
          // Bir sonraki batch için son mumun zamanını güncelle
          startTime = candles[candles.length - 1].time + 1;
        }
      }

      // En güncel fiyatı çek
      let latestPrice = null;
      try {
        const tickerRes = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${selectedCoin}`);
        if (tickerRes.data && tickerRes.data.price) {
          latestPrice = parseFloat(tickerRes.data.price);
        }
      } catch (e) {}

      // Eğer en güncel fiyat, son mumun kapanışından farklıysa, yeni bir mum ekle
      if (latestPrice && allCandles.length > 0 && allCandles[allCandles.length-1].close !== latestPrice) {
        const lastCandle = allCandles[allCandles.length-1];
        allCandles.push({
          ...lastCandle,
          time: now,
          open: lastCandle.close,
          high: Math.max(lastCandle.close, latestPrice),
          low: Math.min(lastCandle.close, latestPrice),
          close: latestPrice,
          volume: 0
        });
      }

      // Zaman dilimine göre mumları grupla
      let groupedCandles = [];
      if (timeframe === '1d') {
        let day = null;
        let group = [];
        allCandles.forEach(candle => {
          const candleDay = new Date(candle.time).setHours(0,0,0,0);
          if (day === null) day = candleDay;
          if (candleDay !== day) {
            if (group.length > 0) groupedCandles.push(mergeCandles(group));
            group = [];
            day = candleDay;
          }
          group.push(candle);
        });
        if (group.length > 0) groupedCandles.push(mergeCandles(group));
      } else if (timeframe === '1w') {
        let week = null;
        let group = [];
        allCandles.forEach(candle => {
          const d = new Date(candle.time);
          const candleWeek = new Date(d.setDate(d.getDate() - d.getDay() + 1)).setHours(0,0,0,0);
          if (week === null) week = candleWeek;
          if (candleWeek !== week) {
            if (group.length > 0) groupedCandles.push(mergeCandles(group));
            group = [];
            week = candleWeek;
          }
          group.push(candle);
        });
        if (group.length > 0) groupedCandles.push(mergeCandles(group));
      } else if (timeframe === '1M') {
        let month = null;
        let group = [];
        allCandles.forEach(candle => {
          const d = new Date(candle.time);
          const candleMonth = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
          if (month === null) month = candleMonth;
          if (candleMonth !== month) {
            if (group.length > 0) groupedCandles.push(mergeCandles(group));
            group = [];
            month = candleMonth;
          }
          group.push(candle);
        });
        if (group.length > 0) groupedCandles.push(mergeCandles(group));
      } else {
        groupedCandles = allCandles;
      }

      setCandleData(groupedCandles);
      const prices = groupedCandles.map(c => c.close);
      calculateIndicators(prices);
      const labels = groupedCandles.map(candle => {
        const date = new Date(candle.time);
        if (timeframe === '1d') return `${date.getDate()}/${date.getMonth()+1}`;
        if (timeframe === '1w') return `${date.getDate()}/${date.getMonth()+1}`;
        if (timeframe === '1M') return `${date.getMonth()+1}/${date.getFullYear()}`;
        return `${date.getHours()}:00`;
      });
      setChartData({ labels, values: prices });
    } catch (error) {
      console.error('Grafik verisi alınamadı:', error);
      setError('Grafik verisi alınamadı. Lütfen tekrar deneyin.');
    }
  }, [selectedCoin, timeframe, calculateIndicators]);

  const fetchCryptoInfo = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedCoin}`
      );

      if (!response.data) {
        throw new Error('Geçersiz veri formatı');
      }

      setCurrentPrice(parseFloat(response.data.lastPrice));
      setPriceChange(parseFloat(response.data.priceChangePercent));
    } catch (error) {
      console.error('Kripto bilgileri alınamadı:', error);
      setError('Kripto bilgileri alınamadı. Lütfen tekrar deneyin.');
    }
  }, [selectedCoin]);

  const loadData = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchChartData(), fetchCryptoInfo()]);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [fetchChartData, fetchCryptoInfo, isInitialized]);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      loadData();
    }
  }, [isInitialized, loadData]);

  const calculatePrediction = (prices) => {
    if (prices.length < 7) return null;

    const last7 = prices.slice(-7);
    const avg7 = last7.reduce((a, b) => a + b, 0) / 7;
    const lastPrice = prices[prices.length - 1];
    const last3Avg = prices.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const trend = last3Avg > avg7 ? 1 : -1;

    const changes = prices.slice(1).map((p, i) => Math.abs(p - prices[i]));
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

    const prediction = lastPrice + trend * avgChange;
    const percentage = ((prediction - lastPrice) / lastPrice) * 100;

    return {
      predictedPrice: prediction,
      currentPrice: lastPrice,
      changePercentage: percentage
    };
  };

  const handlePrediction = async () => {
    try {
      setLoading(true);
      setPredictionResult(null);

      const response = await axios.get(
        `https://api.binance.com/api/v3/klines?symbol=${selectedCoin}&interval=1d&limit=30`
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Geçersiz veri formatı');
      }

      const prices = response.data.map(kline => parseFloat(kline[4])); // Kapanış fiyatları
      const prediction = calculatePrediction(prices);

      if (!prediction) {
        throw new Error('Yeterli veri yok');
      }

      setPredictionResult(prediction);
    } catch (error) {
      console.error('Tahmin hatası:', error);
      Alert.alert('Hata', 'Tahmin alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Mumları birleştiren fonksiyon
  function mergeCandles(candles) {
    return {
      time: candles[candles.length-1].time, // Kapanış zamanı
      open: candles[0].open,
      high: Math.max(...candles.map(c => c.high)),
      low: Math.min(...candles.map(c => c.low)),
      close: candles[candles.length-1].close,
      volume: candles.reduce((a, b) => a + b.volume, 0)
    };
  }

  if (!isInitialized) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#168aff" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#168aff" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kripto Para Analizi</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCoin}
          onValueChange={(value) => {
            setSelectedCoin(value);
            setLoading(true);
          }}
          style={styles.picker}
        >
          {coins.map((coin) => (
            <Picker.Item key={coin.value} label={coin.label} value={coin.value} />
          ))}
        </Picker>

        <View style={styles.timeframeContainer}>
          {timeframes.map((tf) => (
            <TouchableOpacity
              key={tf.value}
              style={[styles.timeframeButton, timeframe === tf.value && styles.timeframeButtonActive]}
              onPress={() => {
                setTimeframe(tf.value);
                setLoading(true);
              }}
            >
              <Text style={[styles.timeframeText, timeframe === tf.value && styles.timeframeTextActive]}>
                {tf.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.chartTypeButton, showCandles && styles.chartTypeButtonActive]}
          onPress={() => setShowCandles(!showCandles)}
        >
          <Text style={[styles.chartTypeText, showCandles && styles.chartTypeTextActive]}>
            {showCandles ? 'Mum Grafiği' : 'Çizgi Grafik'}
          </Text>
        </TouchableOpacity>
      </View>

      {currentPrice && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Güncel Fiyat:</Text>
          <Text style={styles.priceValue}>${currentPrice.toLocaleString()}</Text>
          {priceChange && (
            <Text style={[styles.priceChange, priceChange >= 0 ? styles.positiveChange : styles.negativeChange]}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </Text>
          )}
        </View>
      )}

      <View style={styles.indicatorContainer}>
        <Text style={styles.indicatorTitle}>Göstergeler</Text>
        <View style={styles.indicatorButtons}>
          <TouchableOpacity
            style={[styles.indicatorButton, showIndicators.ema5 && styles.indicatorButtonActive]}
            onPress={() => setShowIndicators(prev => ({ ...prev, ema5: !prev.ema5 }))}
          >
            <Text style={[styles.indicatorButtonText, showIndicators.ema5 && styles.indicatorButtonTextActive]}>
              EMA 5
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.indicatorButton, showIndicators.ema10 && styles.indicatorButtonActive]}
            onPress={() => setShowIndicators(prev => ({ ...prev, ema10: !prev.ema10 }))}
          >
            <Text style={[styles.indicatorButtonText, showIndicators.ema10 && styles.indicatorButtonTextActive]}>
              EMA 10
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.indicatorButton, showIndicators.ema25 && styles.indicatorButtonActive]}
            onPress={() => setShowIndicators(prev => ({ ...prev, ema25: !prev.ema25 }))}
          >
            <Text style={[styles.indicatorButtonText, showIndicators.ema25 && styles.indicatorButtonTextActive]}>
              EMA 25
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.indicatorButton, showIndicators.ema50 && styles.indicatorButtonActive]}
            onPress={() => setShowIndicators(prev => ({ ...prev, ema50: !prev.ema50 }))}
          >
            <Text style={[styles.indicatorButtonText, showIndicators.ema50 && styles.indicatorButtonTextActive]}>
              EMA 50
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.indicatorButton, showIndicators.bollinger && styles.indicatorButtonActive]}
            onPress={() => setShowIndicators(prev => ({ ...prev, bollinger: !prev.bollinger }))}
          >
            <Text style={[styles.indicatorButtonText, showIndicators.bollinger && styles.indicatorButtonTextActive]}>
              Bollinger
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showCandles ? (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Mum Grafiği</Text>
          <CandleStickChart 
            data={candleData}
            width={Dimensions.get('window').width - 40}
            height={220}
            indicators={indicators}
          />
        </View>
      ) : (
        chartData.labels.length > 0 && (
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [{ data: chartData.values }]
              }}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(22, 138, 255, ${opacity})`,
                style: {
                  borderRadius: 16
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )
      )}

      <TouchableOpacity 
        style={styles.predictButton} 
        onPress={handlePrediction}
        disabled={loading}
      >
        <Text style={styles.predictButtonText}>
          {loading ? 'Yükleniyor...' : 'Tahmin Et'}
        </Text>
      </TouchableOpacity>

      {predictionResult && (
        <View style={styles.predictionContainer}>
          <Text style={styles.predictionTitle}>Tahmin Sonucu</Text>
          <Text style={styles.predictionText}>
            Tahmini Fiyat: ${predictionResult.predictedPrice.toFixed(2)}
          </Text>
          <Text style={[
            styles.predictionText,
            predictionResult.changePercentage >= 0 ? styles.positiveChange : styles.negativeChange
          ]}>
            Değişim: {predictionResult.changePercentage >= 0 ? '+' : ''}
            {predictionResult.changePercentage.toFixed(2)}%
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#181c2f',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#181c2f',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  picker: {
    backgroundColor: '#23284d',
    borderRadius: 8,
    marginBottom: 10,
    color: '#fff',
  },
  timeframeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 5,
  },
  timeframeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#23284d',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  timeframeButtonActive: {
    backgroundColor: '#168aff',
  },
  timeframeText: {
    color: '#fff',
  },
  timeframeTextActive: {
    color: '#fff',
  },
  priceContainer: {
    backgroundColor: '#23284d',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    color: '#b0b8d1',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 5,
  },
  priceChange: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveChange: {
    color: '#3ecf4a',
  },
  negativeChange: {
    color: '#ff4d4d',
  },
  chartContainer: {
    backgroundColor: '#23284d',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  candleChartScroll: {
    paddingHorizontal: 10,
  },
  candleChart: {
    position: 'relative',
    backgroundColor: '#23284d',
    paddingVertical: 10,
    paddingRight: 50,
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    left: 0,
  },
  priceLabel: {
    position: 'absolute',
    color: '#b0b8d1',
    fontSize: 12,
    fontWeight: '500',
  },
  candleContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  candle: {
    position: 'absolute',
    borderRadius: 2,
  },
  wick: {
    position: 'absolute',
  },
  predictButton: {
    backgroundColor: '#168aff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  predictButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  predictionContainer: {
    backgroundColor: '#23284d',
    padding: 15,
    borderRadius: 8,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  predictionText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#b0b8d1',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#b0b8d1',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#168aff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#23284d',
    marginTop: 10,
    alignSelf: 'center',
  },
  chartTypeButtonActive: {
    backgroundColor: '#168aff',
  },
  chartTypeText: {
    color: '#fff',
  },
  chartTypeTextActive: {
    color: '#fff',
  },
  indicatorContainer: {
    backgroundColor: '#23284d',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  indicatorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  indicatorButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  indicatorButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#10132b',
    marginRight: 5,
    marginBottom: 5,
  },
  indicatorButtonActive: {
    backgroundColor: '#168aff',
  },
  indicatorButtonText: {
    color: '#b0b8d1',
    fontSize: 12,
  },
  indicatorButtonTextActive: {
    color: '#fff',
  },
  indicatorLine: {
    position: 'absolute',
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    zIndex: 1,
  },
  chartWrapper: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#23284d',
    borderRadius: 8,
    padding: 10,
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'rgba(35, 40, 77, 0.9)',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  zoomButton: {
    width: 30,
    height: 30,
    backgroundColor: '#168aff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  zoomButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AnalysisScreen;
