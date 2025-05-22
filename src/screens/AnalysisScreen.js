import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { LineChart } from 'react-native-chart-kit';

// Makine öğrenimi modeli eğitimi ve tahmin fonksiyonu
const trainModel = async (data) => {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

  const xs = tf.tensor2d(data.map((_, i) => [i]), [data.length, 1]);
  const ys = tf.tensor2d(data.map((val) => [val]), [data.length, 1]);

  await model.fit(xs, ys, { epochs: 100 });
  return model;
};

const predictWithModel = async (model, input) => {
  const prediction = model.predict(tf.tensor2d([input], [1, 1]));
  return prediction.dataSync()[0];
};

// Tahmin almak için buton
const handleGetPrediction = async () => {
  try {
    const selectedCrypto = selectedCoin; // Seçilen kripto para
    const historicalData = await fetchHistoricalData(selectedCrypto); // Geçmiş verileri al
    if (historicalData.length === 0) {
      alert('Geçmiş veriler alınamadı. Lütfen tekrar deneyin.');
      return;
    }
    const model = await trainModel(historicalData);
    const prediction = await predictWithModel(model, historicalData.length);
    alert(`Tahmin: ${prediction}`);
  } catch (error) {
    console.error('Tahmin yapılırken bir hata oluştu:', error);
    alert('Tahmin yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

// Geçmiş verileri almak için fonksiyon
const fetchHistoricalData = async (crypto) => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=30`);
    if (!response.data || !response.data.prices) {
      console.error('Geçmiş veriler alınamadı: Yanıt formatı hatalı');
      return [];
    }
    return response.data.prices.map(price => price[1]); // Fiyat verilerini döndür
  } catch (error) {
    console.error('Geçmiş veriler alınamadı:', error);
    return []; // Hata durumunda boş dizi döndür
  }
};

const updateCryptoInfo = async (crypto) => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${crypto}`);
    const { current_price, price_change_percentage_24h } = response.data;
    setCurrentPrice(current_price);
    setPriceChange(price_change_percentage_24h);
  } catch (error) {
    console.error('Kripto bilgileri alınamadı:', error);
  }
};

const [selectedCoin, setSelectedCoin] = useState('bitcoin'); // Varsayılan olarak Bitcoin

// Kripto para seçildiğinde güncelleme yap
const handleCoinChange = (coin) => {
  setSelectedCoin(coin);
};

// Kripto para değiştiğinde bilgileri güncelle
useEffect(() => {
  if (selectedCoin) {
    updateCryptoInfo(selectedCoin);
  }
}, [selectedCoin]);

const [currentPrice, setCurrentPrice] = useState(null);
const [priceChange, setPriceChange] = useState(null);

const MyChart = ({ data }) => {
  return (
    <LineChart
      data={{
        labels: data.labels,
        datasets: [
          {
            data: data.values,
          },
        ],
      }}
      width={350}
      height={220}
      chartConfig={{
        backgroundColor: '#23284d',
        backgroundGradientFrom: '#23284d',
        backgroundGradientTo: '#23284d',
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16,
        },
      }}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  );
};

const updateChart = () => {
  const timeframe = selectedCandle === 'daily' ? 'D' : '60';
  const symbol = selectedCoin + 'USD';

  // Geçmiş verileri al
  fetchHistoricalData(symbol).then((data) => {
    const chartData = {
      labels: data.map((_, index) => index.toString()),
      values: data,
    };

    // Grafik bileşenini güncelle
    setChartData(chartData);
  });
};

<TouchableOpacity style={styles.button} onPress={() => handleCoinChange('ethereum')}>
  <Text style={styles.buttonText}>Ethereum</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button} onPress={() => handleCoinChange('bitcoin')}>
  <Text style={styles.buttonText}>Bitcoin</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.button} onPress={handleGetPrediction}>
  <Text style={styles.buttonText}>Tahmin Al</Text>
</TouchableOpacity>

// Grafik bileşenini render et
<MyChart data={chartData} /> 