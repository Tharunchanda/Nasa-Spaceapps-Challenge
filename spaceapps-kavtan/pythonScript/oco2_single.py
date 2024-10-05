import requests
import folium
import folium.plugins
import time
import warnings
from flask import Flask, send_file, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Provide the STAC and RASTER API endpoints
STAC_API_URL = "https://earth.gov/ghgcenter/api/stac"
RASTER_API_URL = "https://earth.gov/ghgcenter/api/raster"
collection_name = "oco2-mip-co2budget-yeargrid-v1"

# Fetch the collection metadata from the STAC API
collection = requests.get(f"{STAC_API_URL}/collections/{collection_name}").json()

# Define the function to get item count
def get_item_count(collection_id):
    count = 0
    items_url = f"{STAC_API_URL}/collections/{collection_id}/items"
    while True:
        response = requests.get(items_url)
        if not response.ok:
            print("Error getting items")
            exit()
        stac = response.json()
        count += int(stac["context"].get("returned", 0))
        next = [link for link in stac["links"] if link["rel"] == "next"]
        if not next:
            break
        items_url = next[0]["href"]
    return count

@app.route('/co2',methods=['GET'])
def generate_map():
    # Fetch the number of items
    number_of_items = get_item_count(collection_name)
    items = requests.get(f"{STAC_API_URL}/collections/{collection_name}/items?limit={number_of_items}").json()["features"]

    # Create a dictionary where the start datetime values for each granule are more explicitly queried by year
    items_by_year = {item["properties"]["start_datetime"][:4]: item for item in items}

    # Set the asset name for fossil fuel ("ff")
    asset_name = "ff"

    # Rescale values for visualization (adjusted as per GHG Center scale)
    rescale_values = {"max": 450, "min": 0}
    color_map = "purd"

    # Input: User provides a year
    input_year = request.args.get('year', 2020)  # Default year is 2020 if not provided

    # Check if the year exists in the dataset
    if input_year in items_by_year:
        item = items_by_year[input_year]

        # Fetch CO2 flux data for the input year
        co2_flux = requests.get(
            f"{RASTER_API_URL}/collections/{item['collection']}/items/{item['id']}/tilejson.json?"
            f"&assets={asset_name}"
            f"&color_formula=gamma+r+1.05&colormap_name={color_map}"
            f"&rescale={rescale_values['min']},{rescale_values['max']}"
        ).json()

        # Set the location (latitude and longitude of the area of interest, California here)
        map_ = folium.Map(location=(34, -118), zoom_start=6)

        # Define the map layer for the chosen year
        map_layer = folium.TileLayer(
            tiles=co2_flux["tiles"][0],  # Path to the tile
            attr="GHG",  # Attribution
            opacity=0.5,  # Transparency
        )

        # Add the layer to the map
        map_layer.add_to(map_)

        # Save the map as an HTML file (adjust path for Linux/Ubuntu)
        map_file_path = "E:/Web Development/Projects-IIT/Nasa-Spaceapps-Challenge/spaceapps-kavtan\public\co2.html"  # Use a relative path
        map_.save(map_file_path)
        
        print(f"Map for {input_year} has been saved as 'co2_map.html'.")

        return send_file(map_file_path)
      
    else:
        print(f"No data available for the year {input_year}.")
        return jsonify({"error": f"No data available for the year {input_year}."}), 404
