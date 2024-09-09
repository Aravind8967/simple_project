from datetime import datetime, timedelta
import pandas as pd
from tradingview_ta import TA_Handler, Interval
import yfinance as yf
import mpld3
import matplotlib.pyplot as plt

def data_from_tradingview(symbol):
    handler = TA_Handler(
        symbol=symbol,
        screener="india",
        exchange="NSE",
        interval=Interval.INTERVAL_1_MONTH
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

def data_from_yfinance(symbol):
    data = yf.Ticker(f'{symbol}.NS')
    information = data.info
    name = information["longName"]
    short_name = information["shortName"]
    symbol = information["symbol"]
    current_price = information["currentPrice"]
    previous_close = information["previousClose"]
    phone = information["phone"]
    website = information["website"]
    industry = information["industry"]
    bussiness_summary = information["longBusinessSummary"]
    day_high = information["dayHigh"]
    day_low = information["dayLow"]
    high_52_weeks = information["fiftyTwoWeekHigh"]
    low_52_weeks = information["fiftyTwoWeekLow"]
    sector = information["sector"]
    market_cap = information["marketCap"]
    book_val = round(information["bookValue"], 2)
    price_to_book = round(information["priceToBook"], 2)
    day_percent = percent(previous_close, current_price)
    shares_count = data.get_shares_full(start=datetime.now() - timedelta(days=7) ,end=datetime.now())
    total_shares = shares_count.iloc[-1]   # current share counts
    income =  pd.DataFrame(data.income_stmt).to_numpy()[-4][::-1]  # gives last 4 years income data [2021_income, 2022_income, 2023_income, 2024_income]
    revenue =  pd.DataFrame(data.income_stmt).to_numpy()[-2][::-1] # gives last 4 years revenue data [2021_revenue, 2022_revenue, 2023_revenue, 2024_revenue]
    yearly_keys = pd.DataFrame(data.income_stmt).keys().year.to_list()[::-1]
    income_quarter = pd.DataFrame(data.quarterly_income_stmt).to_numpy()[-4][::-1]    # gives last 4 quarter income data [2023-03-30, 2023-06-30, 2023-09-30, 2023-12-30]
    revenue_quarter = pd.DataFrame(data.quarterly_income_stmt).to_numpy()[-2][::-1]   # gives last 4 quarter revenue data [2023-03-30, 2023-06-30, 2023-09-30, 2023-12-30]
    quaterly_keys = pd.DataFrame(data.quarterly_income_stmt).keys().strftime('%Y-%m-%d').to_list()[::-1]
    combained_data = {
        "name": name,
        "short_name": short_name,
        "symbol": symbol,
        "current_price": current_price,
        "total_shares": total_shares,
        "phone": phone,
        "website": website,
        "industry": industry,
        "sector": sector,
        "bussiness_summary": bussiness_summary,
        "day_high": day_high,
        "day_low": day_low,
        "high_52_weeks": high_52_weeks,
        "low_52_weeks": low_52_weeks,
        "market_cap": market_cap,
        "book_val": book_val,
        "price_to_book": price_to_book,
        "income": income,
        "yearly_keys": yearly_keys,
        "quaterly_keys": quaterly_keys,
        "revenue": revenue,
        "income_quarter": income_quarter,
        "revenue_quarter": revenue_quarter,
        "day_percent": day_percent
    }
    return combained_data

def stock_price(symbol):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    data = yf.download(f"{symbol}.NS", start=start_date, end=end_date)
    price = [round(date,2) for date in data['Close']]

    return price

def line_plot(symbol,signal="nutral"):
    price_arr = stock_price(symbol)
    x_axis = [i for i in range(len(price_arr))]
    if signal == 'BUY' or signal == 'STRONG_BUY':
        color = "#00FF00"
        background_color = "#154915"
    elif signal == 'SELL' or signal == 'STRONG_SELL':
        color = "#FF0000"
        background_color = "#461414"
    else:
        color = "#E0E0E0"
        background_color = "#404040"
    
    fig, graph = plt.subplots(figsize=(15, 8))          # Graph size
    line = graph.plot(price_arr, color=color, linewidth=3)
    graph.set_facecolor(background_color)
    line_to_html =  mpld3.fig_to_html(fig)
    return line_to_html

def bar_plot(x_axis, y_axis, name):
    x_axis = [str(val) for val in x_axis]

    y_axis = [val_converter(val) for val in y_axis]
    fig, graph = plt.subplots(figsize=(6, 3))
    graph.bar(x_axis, y_axis, color='green', width=0.5, tick_label = x_axis)
    graph.set_facecolor("#252A54")
    bar_to_html = mpld3.fig_to_html(fig)
    return bar_to_html

def percent(prev, present):
    return round(((100*present)/prev)-100, 2)

def val_converter(val):
    ans = ""
    if val > 1000 and val < 100000:
        ans = str(round(val / 1000, 2)) + " k"
    elif val > 100000 and val < 10000000:
        ans = str(round(val / 100000, 2)) + " L"
    elif val > 10000000:
        ans = str(round(val / 10000000, 2)) + " Cr"
    return ans

def converter(val_arr):
    val = val_arr[-1]
    ans = ""
    if val > 1000 and val < 100000:
        ans = str(round(val / 1000, 2)) + " k"
    elif val > 100000 and val < 10000000:
        ans = str(round(val / 100000, 2)) + " L"
    elif val > 10000000:
        ans = str(round(val / 10000000, 2)) + " Cr"
    return ans

def technical_analysis(data, price):
    recomendation = data['summery'].get('RECOMMENDATION')
    rsi = data['oscillator'].get('COMPUTE').get('RSI')
    macd = data['oscillator'].get('COMPUTE').get('MACD')
    adx = data['oscillator'].get('COMPUTE').get('ADX')
    buy_level = 0

def analysis(symbol):
    row_data_tradingview = data_from_tradingview(symbol)
    row_data_yfinance = data_from_yfinance(symbol)
    # ============== data from trading-view ==============================
    recommendation = row_data_tradingview['summery'].get('RECOMMENDATION')
    
    # ==== RSI indicator ====
    rsi = row_data_tradingview['oscillator'].get('COMPUTE').get('RSI')
    macd = row_data_tradingview['oscillator'].get('COMPUTE').get('MACD')
    adx = row_data_tradingview['oscillator'].get('COMPUTE').get('ADX')
    
    # ==== Simple moving Avarages ====
    sma_50 = row_data_tradingview['indicators'].get('SMA50')      #simple moving avarage 100
    sma_100 = row_data_tradingview['indicators'].get('SMA100')      #simple moving avarage 200
    sma_200 = row_data_tradingview['indicators'].get('SMA200')      #simple moving avarage 200
    if sma_200:
        sma_200 = round(sma_200, 2)
    else:
        sma_200 = None
    # ==== Pivot Points ====
    pivot_s1_fibo = row_data_tradingview['indicators'].get('Pivot.M.Fibonacci.S1')
    pivot_s2_fibo = row_data_tradingview['indicators'].get('Pivot.M.Fibonacci.S2')      
    pivot_s3_fibo = row_data_tradingview['indicators'].get('Pivot.M.Fibonacci.S3')      
    pivot_middle_fibo = row_data_tradingview['indicators'].get('Pivot.M.Fibonacci.Middle')
    pivot_r1_fibo = row_data_tradingview['indicators'].get('Pivot.M.Fibonacci.R1')
    pivot_r2_fibo = row_data_tradingview['indicators'].get('Pivot.M.Fibonacci.R2')      
    pivot_r3_fibo = row_data_tradingview['indicators'].get('Pivot.M.Fibonacci.R3')      
    
    pivot_s1_classic = row_data_tradingview['indicators'].get('Pivot.M.Classic.S1')
    pivot_s2_classic = row_data_tradingview['indicators'].get('Pivot.M.Classic.S2')      
    pivot_s3_classic = row_data_tradingview['indicators'].get('Pivot.M.Classic.S3')      
    pivot_middle_classic = row_data_tradingview['indicators'].get('Pivot.M.FibonacClassic')
    pivot_r1_classic = row_data_tradingview['indicators'].get('Pivot.M.Classic.R1')
    pivot_r2_classic = row_data_tradingview['indicators'].get('Pivot.M.Classic.R2')      
    pivot_r3_classic = row_data_tradingview['indicators'].get('Pivot.M.Classic.R3')      

    line_graph = line_plot(symbol, recommendation)
    # income_graph = bar_plot(row_data_yfinance['yearly_keys'], row_data_yfinance['income'], "Income Growth")
    # revenue_graph = bar_plot(row_data_yfinance['yearly_keys'], row_data_yfinance["revenue"], "Revenue Growth")
    data = {
        "name": row_data_yfinance["name"],
        "short_name": row_data_yfinance["short_name"],
        "symbol": row_data_yfinance["symbol"],
        "current_price": row_data_yfinance["current_price"],
        "total_shares": converter([0, row_data_yfinance["total_shares"]]),
        "phone": row_data_yfinance["phone"],
        "website": row_data_yfinance["website"],
        "industry": row_data_yfinance["industry"],
        "sector": row_data_yfinance["sector"],
        "description": row_data_yfinance["bussiness_summary"],
        "day_high": row_data_yfinance["day_high"],
        "day_low": row_data_yfinance["day_low"],
        "day_percent": row_data_yfinance["day_percent"],
        "high_52_weeks": row_data_yfinance["high_52_weeks"],
        "low_52_weeks": row_data_yfinance["low_52_weeks"],
        "market_cap": converter([0,row_data_yfinance["market_cap"]]),
        "book_val": row_data_yfinance["book_val"],
        "price_to_book": row_data_yfinance["price_to_book"],
        "income": row_data_yfinance["income"],
        "last_income": converter(row_data_yfinance["income"]),
        "revenue": row_data_yfinance["revenue"],
        "last_revenue": converter(row_data_yfinance["revenue"]),
        "yearly_keys":row_data_yfinance["yearly_keys"],
        "income_quarter": row_data_yfinance["income_quarter"],
        "last_income_quarter": converter(row_data_yfinance["income_quarter"]),
        "revenue_quarter": row_data_yfinance["revenue_quarter"],
        "last_revenue_quarter": converter(row_data_yfinance["revenue_quarter"]),
        "quaterly_keys":row_data_yfinance["quaterly_keys"],
        "recommendation": recommendation,
        "rsi": rsi,
        "macd": macd,
        "adx": adx,
        "sma_50": sma_50,
        "sma_100": sma_100,
        "sma_200": sma_200,
        "pivot_s1_fibo": pivot_s1_fibo,
        "pivot_s2_fibo": pivot_s2_fibo,
        "pivot_s3_fibo": pivot_s3_fibo,
        "pivot_r1_fibo": pivot_r1_fibo,
        "pivot_r2_fibo": pivot_r2_fibo,
        "pivot_r3_fibo": pivot_r3_fibo,
        "pivot_middle_fibo": pivot_middle_fibo,
        "pivot_s1_classic": pivot_s1_classic,
        "pivot_s2_classic": pivot_s2_classic,
        "pivot_s3_classic": pivot_s3_classic,
        "pivot_r1_classic": pivot_r1_classic,
        "pivot_r2_classic": pivot_r2_classic,
        "pivot_r3_classic": pivot_r3_classic,
        "pivot_middle_classic": pivot_middle_classic,
        "line_graph": line_graph,
        # "income_graph": income_graph,
        # "revenue_graph": revenue_graph
    }
    return data

def main_1():
    symbol = "TCS"
    ana = data_from_tradingview(symbol)
    for index, val in ana.items():
        print(index, " : ", val)
        print()

def main_2():
    symbol = "ITC"
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    stock_price_as_per_dates = stock_price(symbol, start_date, end_date)

    line_plot(stock_price_as_per_dates)

if __name__ == '__main__':
    symbol = "ITC"
    x = analysis(symbol)
    print(x)