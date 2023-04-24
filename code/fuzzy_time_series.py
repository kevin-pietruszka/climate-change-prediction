import pandas
from pyFTS.partitioners import Grid
from pyFTS.models import chen

city_temps = pandas.read_csv("./data/city_temps_cleaned.csv")
arhus = city_temps[city_temps.City == "Århus"]
ts = arhus["AverageTemperature"].to_numpy()

#Universe of Discourse Partitioner
partitioner = Grid.GridPartitioner(data=ts,npart=50)
print(partitioner)
# Create an empty model using the Chen(1996) method
model = chen.ConventionalFTS(partitioner=partitioner)

# The training procedure is performed by the method fit
model.fit(ts)

# The forecasting procedure is performed by the method predict
forecasts = model.predict(ts)