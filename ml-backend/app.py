from flask import Flask, request, jsonify
import joblib
import pandas as pd
from ta.trend import EMAIndicator
from ta.volatility import BollingerBands

app = Flask(__name__)

# Daha önce kaydettiğin modeli yükle
model = joblib.load('btc_model.pkl')  # model dosya adını kendi dosyana göre değiştir

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    # Gelen veri örn: [{"timestamp": "...", "close": 50000}, {...}, ...]
    df = pd.DataFrame(data)

    # Teknik indikatörleri ekle
    df['EMA_5'] = EMAIndicator(df['close'], window=5).ema_indicator()
    df['EMA_10'] = EMAIndicator(df['close'], window=10).ema_indicator()
    df['EMA_25'] = EMAIndicator(df['close'], window=25).ema_indicator()
    df['EMA_50'] = EMAIndicator(df['close'], window=50).ema_indicator()

    bb = BollingerBands(close=df['close'], window=20, window_dev=2)
    df['bb_upper'] = bb.bollinger_hband()
    df['bb_lower'] = bb.bollinger_lband()

    # Eksik değerleri doldur
    df.fillna(method='ffill', inplace=True)
    df.fillna(method='bfill', inplace=True)

    # Özellik sütunları
    feature_cols = ['close', 'EMA_5', 'EMA_10', 'EMA_25', 'EMA_50', 'bb_upper', 'bb_lower']

    # Son satırdaki verilere göre tahmin yap
    X = df[feature_cols].values
    prediction = model.predict([X[-1]])[0]

    return jsonify({'prediction': float(prediction)})

if __name__ == '__main__':
    app.run(debug=True)
