from datetime import date, datetime, timedelta
import numpy as np
import yfinance as yf
from tradingview_ta import TA_Handler, Interval
import pandas as pd
import requests


class analysis:
    def __init__(self, name):
        self.company_name = f'{name}.NS'
        self.yf_api_fetch = yf.Ticker(self.company_name)
        self.company_info = self.yf_api_fetch.info
        self.company_symbol = name
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
    
    def share_price_range(self, period='max', interval='1d'):
        stock = self.yf_api_fetch
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

    # using for company_section in webpage 
    def company_data(self):
        row_data_tradingview = self.tradingview_data['indicators']
        row_data_yfinance = self.yf_api_fetch.info
        data = {
            'share_price': row_data_yfinance['currentPrice'],
            'change':round(row_data_tradingview['change'], 2),
            'c_name':row_data_yfinance['shortName'],
            'c_symbol':row_data_yfinance['symbol'].split('.')[0]
        }
        return data

class yfinance:
    def __init__(self, name):
        self.company_name = f'{name}.NS'
        self.yf_api_fetch = yf.Ticker(self.company_name)
        self.company_info = self.yf_api_fetch.info
        self.company_symbol = name
    
    # need to work on it detailes saved on notes.
    def calender(self):
        data = self.yf_api_fetch
        calender = data.calendar
        return calender

    def get_nearest_shareprice(self, date):
        date = datetime.strptime(date, '%Y-%m-%d').date()
        start_date = (date - timedelta(days=5)).strftime('%Y-%m-%d')  # start 10 days before the date
        end_date = (date + timedelta(days=5)).strftime('%Y-%m-%d')
        shareprice = self.yf_api_fetch.history(start=start_date, end=end_date)
        return round((shareprice['Close'].iloc[0]), 2)

    # operating profit margin
    def opm(self, revenue, net_income):
        opm = []
        for rev, ni in zip(revenue, net_income):
            if rev != 0 and ni != 0:
                opm.append(round(((ni / rev) * 100), 2))
            else:
                opm.append(0)
        return opm
    
    def roe(self, net_income, shareholder_equity):
        roe = []
        for ni, sh_qr in zip(net_income, shareholder_equity):
            if ni != 0 and sh_qr != 0:
                roe.append(round(((ni / sh_qr) * 100), 2))
            else:
                roe.append(0)
        return roe

    def pe(self, eps):
        dates = self.yf_api_fetch.income_stmt.columns
        dates = [date.strftime('%Y-%m-%d') for date in dates][::-1]
        dates_quater = self.yf_api_fetch.quarterly_income_stmt.columns
        dates_quater = [date.strftime('%Y-%m-%d') for date in dates_quater][::-1]
        
        shareprice_arr = [self.get_nearest_shareprice(shareprice) for shareprice in dates]
        shareprice_arr_quater = [self.get_nearest_shareprice(shareprice) for shareprice in dates_quater]
        pe = []
        for shares, price in zip(shareprice_arr, eps):
            if price != 0:
                pe.append(shares / price)
            else:
                pe.append(0)
        return pe

    def yfinance_data(self):
        income = self.yf_api_fetch.income_stmt
        income_quater = self.yf_api_fetch.quarterly_income_stmt

        balence = self.yf_api_fetch.balance_sheet
        balence_quater = self.yf_api_fetch.quarterly_balancesheet

        cashflow = self.yf_api_fetch.cash_flow
        cashflow_quater = self.yf_api_fetch.quarterly_cash_flow

        # =================== extracting required data from income and income quater ==================================
        dates = [date.strftime('%Y') for date in income.columns][::-1]
        dates_quater = [date.strftime('%Y-%m') for date in income_quater.columns][::-1]
        revenue = [data if not pd.isna(data) else 0 for data in income.loc['Total Revenue']][::-1]
        revenue_quater = [data if not pd.isna(data) else 0 for data in income_quater.loc['Total Revenue']][::-1]
        operating_expence = [data if not pd.isna(data) else 0 for data in income.loc['Operating Expense']][::-1]
        operating_expence_quater = [data if not pd.isna(data) else 0 for data in income_quater.loc['Operating Expense']][::-1]
        net_income = [data if not pd.isna(data) else 0 for data in income.loc['Net Income']][::-1]
        net_income_quater = [data if not pd.isna(data) else 0 for data in income_quater.loc['Net Income']][::-1]
        eps = [data if not pd.isna(data) else 0 for data in income.loc['Basic EPS']][::-1]
        eps_quater = [data if not pd.isna(data) else 0 for data in income_quater.loc['Basic EPS']][::-1]
        
        # ================== extracting required data from balence and blaence quater =================================
        total_debt = [data if not pd.isna(data) else 0 for data in balence.loc['Total Debt']][::-1]
        total_debt_quater = [data if not pd.isna(data) else 0 for data in balence_quater.loc['Total Debt']][::-1]
        shareholders_equity = [data if not pd.isna(data) else 0 for data in balence.loc['Stockholders Equity']][::-1]
        shareholders_equity_quater = [data if not pd.isna(data) else 0 for data in balence_quater.loc['Stockholders Equity']][::-1]
        total_assets = [data if not pd.isna(data) else 0 for data in balence.loc['Total Assets']][::-1]
        total_assets_quater = [data if not pd.isna(data) else 0 for data in balence_quater.loc['Total Assets']][::-1]
        total_liabilities = [data if not pd.isna(data) else 0 for data in balence.loc['Total Liabilities Net Minority Interest']][::-1]
        total_liabilities_quater = [data if not pd.isna(data) else 0 for data in balence_quater.loc['Total Liabilities Net Minority Interest']][::-1]
        cash_equivalents = [data if not pd.isna(data) else 0 for data in balence.loc['Cash And Cash Equivalents']][::-1]
        cash_equivalents_quater = [data if not pd.isna(data) else 0 for data in balence_quater.loc['Cash And Cash Equivalents']][::-1]
  
        # ================== extracting required data from cashflow and cashflow quater =================================

        free_cashflow = [data if not pd.isna(data) else 0 for data in cashflow.loc['Free Cash Flow']][::-1]
        operating_cashflow = [data if not pd.isna(data) else 0 for data in cashflow.loc['Operating Cash Flow']][::-1]
        financing_cashflow = [data if not pd.isna(data) else 0 for data in cashflow.loc['Financing Cash Flow']][::-1]
        investing_cashflow = [data if not pd.isna(data) else 0 for data in cashflow.loc['Investing Cash Flow']][::-1]

        cashflow_quater_columns = [date.strftime('%Y-%m') for date in cashflow_quater.columns][::-1]
        if len(cashflow_quater) > 0:
            free_cashflow_quater = [data if not pd.isna(data) else 0 for data in cashflow_quater.loc['Free Cash Flow']][::-1]
            operating_cashflow_quater = [data if not pd.isna(data) else 0 for data in cashflow_quater.loc['Operating Cash Flow']][::-1]
            financing_cashflow_quater = [data if not pd.isna(data) else 0 for data in cashflow_quater.loc['Financing Cash Flow']][::-1]
            investing_cashflow_quater = [data if not pd.isna(data) else 0 for data in cashflow_quater.loc['Investing Cash Flow']][::-1]
        else:
            free_cashflow_quater = [None] * 5
            operating_cashflow_quater = [None] * 5
            financing_cashflow_quater = [None] * 5
            investing_cashflow_quater = [None] * 5

        profit_margin = self.opm(revenue, net_income)
        profit_margin_quater = self.opm(revenue_quater, net_income_quater)
        
        roe = self.roe(net_income, shareholders_equity)
        roe_quater = self.roe(net_income_quater, shareholders_equity_quater)

        holding = self.holding()
        data = {
            'dates' : dates,
            'dates_quater' : dates_quater,
            'revenue' : revenue,
            'revenue_quater' : revenue_quater,
            'operating_expence' : operating_expence,
            'operating_expence_quater' : operating_expence_quater,
            'net_income' : net_income,
            'net_income_quater' : net_income_quater,
            'eps' : eps,
            'eps_quater' : eps_quater,
            'profit_margin' : profit_margin,
            'profit_margin_quater' : profit_margin_quater,
            'total_debt' : total_debt,
            'total_debt_quater' : total_debt_quater,
            'shareholders_equity' : shareholders_equity,
            'shareholders_equity_quater' : shareholders_equity_quater,
            'total_assets' : total_assets,
            'total_assets_quater' : total_assets_quater,
            'total_liabilities' : total_liabilities,
            'total_liabilities_quater' : total_liabilities_quater,
            'cash_equivalents': cash_equivalents,
            'cash_equivalents_quater': cash_equivalents_quater,
            'roe' : roe,
            'roe_quater' : roe_quater,
            'cashflow_quater_columns' : cashflow_quater_columns,
            'free_cashflow' : free_cashflow,
            'free_cashflow_quater' : free_cashflow_quater,
            'operating_cashflow' : operating_cashflow,
            'operating_cashflow_quater' : operating_cashflow_quater,
            'investing_cashflow' : investing_cashflow,
            'investing_cashflow_quater' : investing_cashflow_quater,
            'financing_cashflow' : financing_cashflow,
            'financing_cashflow_quater' : financing_cashflow_quater,
            'holding' : holding
        }
        return data
    
    # need to work on it where we can use feature excepecially eps_trend
    def estimation(self):
        msft = self.yf_api_fetch

        d1 = msft.analyst_price_targets
        growth_estimation = msft.earnings_estimate
        d3 = msft.revenue_estimate
        d4 = msft.earnings_history
        d5 = msft.eps_trend
        d7 = msft.growth_estimates
        d8 = msft.isin
        d9 = msft.options
        d10 = msft.news
        return d10

    # Holding patterns for the institution and promotor
    def holding(self):
        # mutual_fund = self.yf_api_fetch.mutualfund_holders          #shows all mutual funds
        # institution = self.yf_api_fetch.institutional_holders
        major_holders = self.yf_api_fetch.major_holders

        insider = round(major_holders.loc['insidersPercentHeld', 'Value'] * 100, 2)
        instituation = round(major_holders.loc['institutionsPercentHeld', 'Value']*100, 2)
        public = round(100 - (insider + instituation), 2)
        return [insider, instituation, public]
    
class tradingview:
    def __init__(self, name) -> None:
        self.company_name = f'{name}.NS'
        self.yf_api_fetch = yf.Ticker(self.company_name)
        self.company_info = self.yf_api_fetch.info
        self.company_symbol = name
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



if __name__ == "__main__":
    # Example usage
    company_symbol = 'PFC'                             #RELIANCE
    data = yfinance(company_symbol)
    income_stmt = data.yfinance_data()    
    # print("=================== income ========================")
    # print(income_stmt['dates'])
    # print("revenue : ", income_stmt['revenue'])
    # print("operating_expence : ", income_stmt['operating_expence'])
    # print("net_income : ", income_stmt['net_income'])
    # print("eps : ", income_stmt['eps'])
    # print("profit_margin : ", income_stmt['profit_margin'])
    # print("total_debt : ", income_stmt['total_debt'])
    # print("shareholders_equity : ", income_stmt['shareholders_equity'])
    # print("total_assets : ", income_stmt['total_assets'])
    # print("total_liabilities : ", income_stmt['total_liabilities'])
    # print("roe : " , income_stmt['roe'])
    # print("free_cashflow : " , income_stmt['free_cashflow'])
    # print("operating_cashflow : " , income_stmt['operating_cashflow'])
    # print("financing_cashflow : " , income_stmt['financing_cashflow'])
    # print("investing_cashflow : " , income_stmt['investing_cashflow'])
    # print("cash_equivalents : " , income_stmt['cash_equivalents'])
    # print()
    # print("================ income quater ====================")
    # print(income_stmt['dates_quater'])
    # print("revenue_quater : ", income_stmt['revenue_quater'])
    # print("operating_expence_quater : ", income_stmt['operating_expence_quater'])
    # print("net_income_quater : ", income_stmt['net_income_quater'])
    # print("eps_quater : ", income_stmt['eps_quater'])
    # print("profit_margin_quater : ", income_stmt['profit_margin_quater'])
    # print("total_debt_quater : ", income_stmt['total_debt_quater'])
    # print("shareholders_equity_quater : ", income_stmt['shareholders_equity_quater'])
    # print("total_assets_quater : ", income_stmt['total_assets_quater'])
    # print("total_liabilities_quater : ", income_stmt['total_liabilities_quater'])
    # print("roe_quater : " , income_stmt['roe_quater'])
    # print("free_cashflow_columns : " , income_stmt['cashflow_quater_columns'])
    # print("free_cashflow_quater : " , income_stmt['free_cashflow_quater'])
    # print("operating_cashflow_quater : " , income_stmt['operating_cashflow_quater'])
    # print("financing_cashflow_quater : " , income_stmt['financing_cashflow_quater'])
    # print("investing_cashflow_quater : " , income_stmt['investing_cashflow_quater'])
    # print("cash_equivalents_quater : " , income_stmt['cash_equivalents_quater'])
