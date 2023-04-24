# Climate change: Surface temperature prediction and visualization
--------------------------------------------------------------------------------

We use a virtual environment to run all the code and corresponding visualization. 
Please follow the intructions below to setup and run the code. 

1. To setup the environment

pip -m venv env
pip install -r requirements.txt 

2. Download the dataset files from the given kaggle link and put them in the code/data/ directory. 
https://www.kaggle.com/datasets/berkeleyearth/climate-change-earth-surface-temperature-data

3. Clean the dataset and bring it to an appropriate format using the following command: 

python data_clean.py 

4. Train the model and generate the predictions. 
To do this, Open the file predictions-rf.ipynb in jupyter notebook or jupyter lab and run all the sections. 

You can alternatively download the prediction data from our trained model on this website: 
https://zenodo.org/record/7834328

There is a separate .csv file for each year, which will aid in loading the appropriate file for the 
selected year in the visualization code. 

We have trained and tested a bunch of other models also apart from Random Forest, 
which can be found in the various .ipynb files present in the code directory. 

5. Run the visualization. This can be done by going inside the visualization directory 
and running a python server to serve files from there. After you have the python server running, 
going to localhost:8000/climate_visualization.html will allow you to interact with the tool. 
