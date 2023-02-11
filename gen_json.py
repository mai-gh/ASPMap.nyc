#!/usr/bin/env python3

import fiona
import json
import gzip

current_order = []

days = {
  'mon': [],
  'tue': [],
  'wed': [],
  'thu': [],
  'fri': [],
  'sat': [],
}

with fiona.collection('../../Parking_Regulation_Shapefile/Parking_Regulation_Shapefile.shp', "r") as source:
    for feat in source:
        if 'SANITATION BROOM SYMBOL' in feat['properties']['SIGNDESC']: 
          if current_order and current_order[0]['properties']['SG_ORDER_N'] != feat['properties']['SG_ORDER_N']:
            lst2 = [item['geometry']['coordinates'] for item in current_order]
            # round to 5 decimals, error is about 3ft
            # https://en.wikipedia.org/wiki/Decimal_degrees
            lst3 = [['%.5f'%(inner_matrix[0]), '%.5f'%(inner_matrix[1])] for inner_matrix in lst2] 
            first = lst2[0]

            # we are on to another road, time to push the last one one the stack
            # create the line feat and append it to the appropriate days features
            line_feat = {
              "type": "Feature",
              "properties": {
                "name": current_order[0]['properties']['SG_ORDER_N'],
                "desc": current_order[0]['properties']['SIGNDESC1']
              },
              "geometry": { 
                "type": "LineString",
                "coordinates": lst3
              }
            }

            d = current_order[0]['properties']['SIGNDESC']
            
            if 'MON' in d:
              days['mon'].append(line_feat)
            if 'TUE' in d:
              days['tue'].append(line_feat)
            if 'WED' in d:
              days['wed'].append(line_feat)
            if 'THU' in d:
              days['thu'].append(line_feat)
            if 'FRI' in d:
              days['fri'].append(line_feat)
            if 'SAT' in d:
              days['sat'].append(line_feat)

            current_order = [ feat ]
          else:
            current_order.append(feat)


for dd in ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']:
  layer = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": days[dd]
  }
  with open("{}_flat.json".format(dd), "wt") as f:
    f.write(json.dumps(layer))
