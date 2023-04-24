import pandas
from statsmodels.tsa.stattools import acf
import statsmodels.api as sm

city_temps = pandas.read_csv("./data/city_temps_cleaned.csv")
arhus = city_temps[city_temps.City == "Århus"]
dates = arhus[["dt", "AverageTemperature"]]

ts = arhus["AverageTemperature"].to_numpy()
model = sm.tsa.statespace.SARIMAX(ts, order=(1,1,1), seasonal_order=(1,1,1,12), enforce_stationarity=False, enforce_invertibility=False)
result = model.fit()

print(result.summary())