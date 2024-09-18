import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

def linear_regretion():
    # Simulate stock prices
    data = np.random.rand(100) * 100  # Random prices for 100 days
    df = pd.DataFrame(data, columns=['Price'])

    # Create features (previous day prices) and target (next day prices)
    df['Next_Price'] = df['Price'].shift(-1)
    df.dropna(inplace=True)

    # Split data
    X = df[['Price']].values  # Features
    y = df['Next_Price'].values  # Target
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    # Train linear regression
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Predict the next price
    predicted_price = model.predict([[df.iloc[-1, 0]]])
    print(f"Predicted price: {predicted_price[0]:.2f}")


if __name__ == '__main__':
    linear_regretion()