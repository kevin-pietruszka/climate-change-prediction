import pandas
import numpy

df = pandas.read_csv("./data/GlobalLandTemperaturesByCity.csv")
new_df = pandas.DataFrame()

cities = df["City"].unique()
for city in cities:

    # Grab values related to city
    city_block = df[df.City == city]
    num_values = city_block.shape[0]

    # Fix null values with interpolation
    fix_temps = city_block["AverageTemperature"].interpolate()
    city_block["AverageTemperature"] = fix_temps

    # Update new df
    new_df = pandas.concat([new_df, city_block])
    
new_df.to_csv("./data/city_temps_cleaned.csv")

# For global temps
df = pandas.read_csv("./data/GlobalTemperatures.csv")
fixed_land_temps = df["LandAverageTemperature"].interpolate()
df["LandAverageTemperature"] = fixed_land_temps

df.to_csv("./data/global_temps_cleaned.csv")
