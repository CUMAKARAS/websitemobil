import pandas as pd
import requests
import time
from ta.trend import EMAIndicator, MACD
from ta.volatility import BollingerBands

def get_binance_ohlcv(symbol='BTCUSDT', interval='1d', limit=100):
    url = f'https://api.binance.com/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}'
    response = requests.get(url)
    data = response.json()
    df = pd.DataFrame(data, columns=[
        'timestamp', 'open', 'high', 'low', 'close', 'volume',
        'close_time', 'quote_asset_volume', 'trades', 'taker_buy_base', 'taker_buy_quote', 'ignore'
    ])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    df['close'] = df['close'].astype(float)
    return df[['timestamp', 'close']]

def add_technical_indicators(df):
    df['EMA_5'] = EMAIndicator(df['close'], window=5).ema_indicator()
    df['EMA_10'] = EMAIndicator(df['close'], window=10).ema_indicator()
    df['EMA_25'] = EMAIndicator(df['close'], window=25).ema_indicator()
    df['EMA_50'] = EMAIndicator(df['close'], window=50).ema_indicator()
    
    bb = BollingerBands(close=df['close'], window=20, window_dev=2)
    df['bb_upper'] = bb.bollinger_hband()
    df['bb_lower'] = bb.bollinger_lband()
    return df

if __name__ == "__main__":
    df = get_binance_ohlcv(symbol='BTCUSDT', interval='1d', limit=90)
    df = add_technical_indicators(df)
    print(df.tail())
    df.to_csv('btc_data.csv', index=False)
