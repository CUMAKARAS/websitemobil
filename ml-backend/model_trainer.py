import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
from ta.trend import EMAIndicator
from ta.volatility import BollingerBands

# Veriyi oku
df = pd.read_csv('btc_data.csv')

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

# Özellikler ve hedef
feature_cols = ['close', 'EMA_5', 'EMA_10', 'EMA_25', 'EMA_50', 'bb_upper', 'bb_lower']
X = df[feature_cols].values

# Target: bir sonraki günün kapanış fiyatı (shift -1)
y = df['close'].shift(-1).fillna(method='ffill').values

# Modeli oluştur ve eğit
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# Modeli kaydet
joblib.dump(model, 'btc_price_predictor.pkl')
print("Model kaydedildi: btc_price_predictor.pkl")
