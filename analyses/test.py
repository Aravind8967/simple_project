import yfinance as yf
from datetime import datetime, timedelta

def get_nearest_trading_day(symbol, date_str):
    """
    Fetches the stock price of a company on a specific date or the nearest previous trading day.

    Parameters:
    - symbol (str): The stock ticker symbol (e.g., 'AAPL' for Apple)
    - date_str (str): The date in 'YYYY-MM-DD' format
    
    Returns:
    - tuple (date, float): The nearest trading day and the closing stock price, or None if not available
    """
    # Parse the input date string
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        print(type(date))
    except ValueError:
        raise ValueError("Date should be in 'YYYY-MM-DD' format")
    
    # Fetch historical data from Yahoo Finance for a range of 10 days before the target date
    stock = yf.Ticker(symbol)
    start_date = (date - timedelta(days=10)).strftime('%Y-%m-%d')  # start 10 days before the date
    end_date = (date + timedelta(days=1)).strftime('%Y-%m-%d')      # end the day after the date
    print(start_date, end_date)
    data = stock.history(start=start_date, end=end_date)
    
    # If no data available
    if data.empty:
        print(f"No data available for {symbol} around {date_str}")
        return None, None
    
    # Check if the exact date is in the data
    while date.strftime('%Y-%m-%d') not in data.index:
        # If not, go to the previous day
        date -= timedelta(days=1)
        if date < datetime.strptime(start_date, '%Y-%m-%d').date():
            print(f"No trading data available for {symbol} near {date_str}")
            return None, None
    
    # Return the nearest trading day's price
    nearest_date_str = date.strftime('%Y-%m-%d')
    closing_price = data.loc[nearest_date_str]['Close']
    return nearest_date_str, closing_price

# Example Usage:
symbol = 'PFC.NS'  # Apple Inc.
date_str = '2024-09-07'  # A Saturday (non-trading day)
nearest_date, price = get_nearest_trading_day(symbol, date_str)

if price:
    print(f"The nearest trading day for {symbol} was {nearest_date}, and the stock price was: ${price:.2f}")

