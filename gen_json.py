#!/usr/bin/env python3


#import fiona
#from fiona.crs import from_epsg

#source = fiona.open('../../Parking_Regulation_Shapefile/Parking_Regulation_Shapefile.shp', 'r', encoding = 'utf-8')

#with fiona.open('./geojson_fiona.json','w',  driver ="GeoJSON", schema=source.schema, encoding = 'utf-8', crs=fiona.crs.from_epsg(4326)) as geojson:
#     geojson.write(feat)


# ---------------------------------------


import fiona
import json
import gzip

features = []
crs = None
i = 0 
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
        #print(feat)
        #print(feat['properties']['SG_ORDER_N'])
        #feat['properties'].update(...) # with your attributes
        if 'SANITATION BROOM SYMBOL' in feat['properties']['SIGNDESC']: 
          #if any(c for c in feat['properties']['SIGNDESC'] if c.islower()): # check for lower case, there are non
          #  print(feat)
          #if 'SUNDAY' in feat['properties']['SIGNDESC']:
          #  print(feat['properties']['SG_ORDER_N'], ": ", feat['properties']['SIGNDESC'] )
          #if 'MON' in feat['properties']['SIGNDESC']:
          #  #print(feat['properties']['SG_ORDER_N'], ": ", feat['properties']['SIGNDESC'] )
          #  print(feat['properties']['SIGNDESC1'] )
          #if feat['properties']['SG_ORDER_N'] == 'S-01278010': # portal wednesday
          #if feat['properties']['SG_ORDER_N'] ==  'S-01278000': # left side portal, sould be correct
          #if feat['properties']['SG_ORDER_N'] ==  'S-01536298': # left side portal, sould be correct
          #  print("GOOD?", feat)
          #if feat['properties']['SG_ORDER_N'] ==  'S-01338584': # left side portal, sould be correct
          #  print("BAD!", feat)
          #print(feat['properties'])
          if current_order and current_order[0]['properties']['SG_ORDER_N'] != feat['properties']['SG_ORDER_N']:
            #print("gggggg", current_order)
            lst2 = [item['geometry']['coordinates'] for item in current_order]

            # round to 5 decimals, error is about 3ft
            # https://en.wikipedia.org/wiki/Decimal_degrees
            lst3 = [['%.5f'%(inner_matrix[0]), '%.5f'%(inner_matrix[1])] for inner_matrix in lst2] 
            #print("yyyyy")
            #print(*lst2, sep='\n')
            #lst2.sort()
            #print("zzzzz")
            #print(*lst2, sep='\n')
            first = lst2[0]
            #exit()
            # we are on to another road, time to push the last one one the stack
            #create the line feat and append it to features
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
            #if 'SUN' in d or 'MON' in d:
            #  days['mon'].append(line_feat)
            #if 'SUN' in d or 'TUE' in d:
            #  days['tue'].append(line_feat)
            #if 'SUN' in d or 'WED' in d:
            #  days['wed'].append(line_feat)
            #if 'SUN' in d or 'THU' in d:
            #  days['thu'].append(line_feat)
            #if 'SUN' in d or 'FRI' in d:
            #  days['fri'].append(line_feat)
            #if 'SUN' in d or 'SAT' in d:
            #  days['sat'].append(line_feat)
            
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
            

            #features.append(line_feat)
            current_order = [ feat ]
          else:
            current_order.append(feat)
          #if i == 30:
          #    break
          #else:
          #    i += 1
    crs = " ".join("+%s=%s" % (k,v) for k,v in source.crs.items())

#my_layer = {
#    "type": "FeatureCollection",
#    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
#    "features": features
#}
#    "crs": {
#        "type": "link", 
#        "properties": {"href": "my_layer.crs", "type": "proj4"} }}


for dd in ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']:
  layer = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": days[dd]
  }
  #with gzip.open("{}_flatz.geojson.gz".format(dd), "wt") as f:
  with open("{}_flat.json".format(dd), "wt") as f:
    #f.write(json.dumps(layer, indent=4))
    f.write(json.dumps(layer))
#with open("my_layer.crs", "w") as f:
#    f.write(crs)
