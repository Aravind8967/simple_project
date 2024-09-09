from datetime import date, datetime, timedelta
import random
import yfinance as yf
from tradingview_ta import TA_Handler, Interval
import pandas as pd


class analysis:
    def __init__(self, name):
        self.company_name = f'{name}.NS'
        self.company_symbol = name
        self.company_info = yf.Ticker(self.company_name).info
        self.tradingview_data = self.tradingview_connect(name)

    def tradingview_connect(self, symbol):
        handler = TA_Handler(
            symbol=symbol,
            screener="india",
            exchange="NSE",
            interval='1d'
        )
        analysis = handler.get_analysis()
        summary = analysis.summary
        oscillator  = analysis.oscillators
        indicators = analysis.indicators

        data = {
            "summery": summary,
            "oscillator": oscillator,
            "indicators": indicators
        }
        return data
    
    def share_price(self):
        return self.company_info['currentPrice']
    
    def share_price_range_test(self, year=1):
        end_date = datetime.now()
        start_date = end_date - timedelta(days=(year*365))
        share_price_arr = yf.download(self.company_name, start=start_date, end=end_date)
        print(share_price_arr)
        share_price_arr = share_price_arr.reset_index().to_dict(orient='records')

        data = {
            'share_price_arr':share_price_arr
        }
        return data
    
    def share_price_range(self, period='max', interval='1d'):
        symbol = self.company_name
        stock = yf.Ticker(symbol)
        share_price_arr = stock.history(period=period, interval=interval)
        if share_price_arr.empty : return []
        filtered_data = []    
        for index, row in share_price_arr.iterrows():
            date = index.strftime('%Y-%m-%d')
            share_price = round(row['Close'], 2)
            volume = row['Volume']
            filtered_data.append({
                'time': date,
                'share_price': share_price,
                'volume': volume
            })
        return filtered_data

    def fetch_stock_data(self, period='1mo', interval='1d'):
        # Fetch historical data for the given period and interval
        symbol = self.company_name
        stock = yf.Ticker(symbol)
        hist = stock.history(period=period, interval=interval)

        if hist.empty : return []
        formatted_data = []
        print(hist)
        for index, row in hist.iterrows():
            date_str = index.strftime('%Y-%m-%d')  # Format the date
            value = round(row['Close'], 2)  # Assuming 'Close' price is needed
            color = '#26a69a' if random.random() > 0.5 else '#ef5350'  # Randomly set color
            
            formatted_data.append({
                'time': date_str,
                'value': value,
                'color': color
            })
        return formatted_data
    
    def company_data(self):
        row_data_tradingview = self.tradingview_data['indicators']
        row_data_yfinance = self.company_info
        data = {
            'share_price': row_data_yfinance['currentPrice'],
            'change':round(row_data_tradingview['change'], 2),
            'c_name':row_data_yfinance['shortName'],
            'c_symbol':row_data_yfinance['symbol'].split('.')[0]
        }
        return data


if __name__ == "__main__":
    analyse = analysis("DABUR")
    # print(analyse.share_price())
    data = analyse.company_data()

    for key in data.values():
        print(key)