curl -L \
  "https://arcgisserver.digital.mass.gov/arcgisserver/rest/services/AGOL/Senate2021/FeatureServer/1/query?where=1=1&outFields=*&f=geojson" \
  -o senate_districts_2021_raw.geojson

mapshaper senate_districts_2021_raw.geojson \
  -simplify dp 0.1 keep-shapes \
  -o public/senate_districts_2021.geojson

rm senate_districts_2021_raw.geojson


curl -L \
  "https://arcgisserver.digital.mass.gov/arcgisserver/rest/services/AGOL/House2021/FeatureServer/1/query?where=1=1&outFields=*&f=geojson" \
  -o house_districts_2021_raw.geojson

mapshaper house_districts_2021_raw.geojson \
  -simplify dp 0.1 keep-shapes \
  -o public/house_districts_2021.geojson

rm house_districts_2021_raw.geojson