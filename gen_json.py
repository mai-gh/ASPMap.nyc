#!/usr/bin/env python3

import fiona
import json
import csv

locations = {}
with open('../../locations.csv', 'r') as csvfile:
  for row in csv.DictReader(csvfile):
    locations[row['order_no'].strip(" ")] = (row['main_st'], row['sos'])

current_order = []
days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
groups = {}

for d in days:
  groups[d+'_multi'] = []
  groups[d+'_single'] = []

def single_or_multi(day, txt):
  check_against = [d.upper() for d in days if d != day]
  return "_multi" if any(d in txt for d in check_against) else "_single"

with fiona.collection('../../Parking_Regulation_Shapefile/Parking_Regulation_Shapefile.shp', "r") as source:
  for feat in source:
    if ('SANITATION BROOM SYMBOL' in feat['properties']['SIGNDESC'] or 'MOON' in feat['properties']['SIGNDESC']) and 'SUN' not in feat['properties']['SIGNDESC'] and 'STANDING' not in feat['properties']['SIGNDESC']: 
      if current_order and current_order[0]['properties']['SG_ORDER_N'] != feat['properties']['SG_ORDER_N']:
        lst2 = [item['geometry']['coordinates'] for item in current_order]
        # round to 5 decimals, error is about 3ft
        # https://en.wikipedia.org/wiki/Decimal_degrees
        lst3 = [['%.5f'%(inner_matrix[0]), '%.5f'%(inner_matrix[1])] for inner_matrix in lst2] 


        desc = current_order[0]['properties']['SIGNDESC']
        order_no = current_order[0]['properties']['SG_ORDER_N']
        if order_no in locations:
          st = locations[order_no][0]
          sos = locations[order_no][1]
        else:
          st = "order_no not found in locations.csv"
          sos = "?"

        # we are on to another road, time to push the last one one the stack
        # create the line feat and append it to the appropriate days features
        #print(desc)
        if 'MOON' in desc and 'MOON & STARS (SYMBOLS) NO PARKING' not in desc and 'HALF MOON / STAR SYMBOLS' not in desc:
          ddesc = current_order[0]['properties']['SIGNDESC1'].split(")")[2]
        else:
          ddesc = current_order[0]['properties']['SIGNDESC1'].split(")")[1]
        line_feat = {
          "type": "Feature",
          "properties": {
            "name": current_order[0]['properties']['SG_ORDER_N'],
            "desc": ddesc,
            "st": st,
            "sos": sos,
          },
          "geometry": { 
            "type": "LineString",
            "coordinates": lst3
          }
        }

        for day in [d for d in days if d.upper() in desc]:
          groups[day + single_or_multi(day, desc)].append(line_feat)


        current_order = [ feat ]
      else:
        current_order.append(feat)


for key in groups:
  layer = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": groups[key]
  }
  with open("data/{}_flat.json".format(key), "wt") as f:
    f.write(json.dumps(layer))
