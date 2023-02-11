//import {Feature, Map, Overlay, View} from 'ol/index.js';
//import {OSM, Vector as VectorSource} from 'ol/source.js';
//import {Point, LineString} from 'ol/geom.js';
//import {Point} from 'ol/geom.js';
//import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
//import {useGeographic} from 'ol/proj.js';
//import {Stroke, Style} from 'ol/style.js';
//import GeoJSON from 'ol/format/GeoJSON.js';

const Feature = ol.Feature;
const Map = ol.Map;
const Overlay = ol.Overlay;
const View = ol.View;
const OSM = ol.source.OSM;
const VectorSource = ol.source.Vector;
const LineString = ol.geom.LineString;
const TileLayer = ol.layer.Tile;
const VectorLayer = ol.layer.Vector;
const useGeographic = ol.proj.useGeographic;
const Stroke = ol.style.Stroke;
const Style = ol.style.Style;
const GeoJSON = ol.format.GeoJSON;


//https://mai-gh.github.io/streetparker2/wed_flatz.geojson.gz/

//const response = await fetch('wz.json', {
//const response = await fetch('./wed_flat.geojson.gz', {
//  method: 'GET',
//  headers: {
//    'Content-Type': 'application/json',
//    'Accept-Encoding': 'gzip'
//  },
//})


//console.log("response", response)

//var strData     = atob(response.body)

// Convert binary string to character-number array
//var charData    = strData.split('').map(function(x){return x.charCodeAt(0);});

// Turn number array into byte-array
//var binData     = new Uint8Array(charData);

// Pako magic
//var data        = pako.inflate(binData);

// Convert gunzipped byteArray back to ascii string:
//var strData     = String.fromCharCode.apply(null, new Uint16Array(data));

// Output to console
//console.log(strData);



//const rrr = await response.blob()

//console.log(rrr)



//const bbb = await pako.ungzip(new Uint8Array(rrr))
//const bbb = await pako.ungzip(new Uint8Array(response.body), {"to": "string"})
//const bbb = await pako.ungzip(response.body, {"to": "string"})

//console.log('bbb', bbb)
//JSON.parse(bbb)


//const mon_geojson = response.json()
//console.log(mon_geojson);


//console.dir(ol)

useGeographic();

//const place = [-110, 45];

//const point = new Point(place);


//const place2 = [-73.9526703782031, 40.8240388586191];
//const place3 = [-73.9539370904452, 40.8245674824837];

//const point2 = new Point(place2);
//const point3 = new Point(place3);

//const line = new LineString([point2, point3]);



function lineStyleFunction(feature, resolution) {
  return new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 8,
    }),
  });
}


// Points
//function pointStyleFunction(feature, resolution) {
//  return new Style({
//    image: new CircleStyle({
//      radius: 10,
//      fill: new Fill({color: 'rgba(255, 0, 0, 0.1)'}),
//      stroke: new Stroke({color: 'red', width: 8}),
//    }),
//    text: createTextStyle(feature, resolution, myDom.points),
//  });
//}
//
//const vectorPoints = new VectorLayer({
//  source: new VectorSource({
//    url: 'dbf_to_geojson/my_layer.json',
//    format: new GeoJSON(),
//  }),
//  style: pointStyleFunction,
//});


//const vectorLines = new VectorLayer({
//  source: new VectorSource({
//    //url: './line-samples.geojson',
//    //url: './try-line-samples.geojson',
//    url: 'dbf_to_geojson/my_layer.json',
//    format: new GeoJSON(),
//  }),
//  //style: lineStyleFunction,
//  style: new Style({
//    stroke: new Stroke({
//      color: 'blue',
//      width: 8,
//    }),
//  })
//});

const monLines = new VectorLayer({
  source: new VectorSource({
    url: './mon_flat.json',
    format: new GeoJSON(),
  }),
  style: new Style({
    stroke: new Stroke({
      color: [255, 255, 0, .5], // yellow
      width: 8,
    }),
  })
});

const tueLines = new VectorLayer({
  source: new VectorSource({
    url: './tue_flat.json',
    format: new GeoJSON(),
  }),
  style: new Style({
    stroke: new Stroke({
      color: [0, 255, 0, .5], // green
      width: 8,
    }),
  })
});

const wedLines = new VectorLayer({
  source: new VectorSource({
    url: './wed_flat.json',
    format: new GeoJSON(),
  }),
  style: new Style({
    stroke: new Stroke({
      color: 'orange',
      color: [255, 165, 0, .5], // orange
      width: 8,
    }),
  })
});

const thuLines = new VectorLayer({
  source: new VectorSource({
    url: './thu_flat.json',
    format: new GeoJSON(),
  }),
  style: new Style({
    stroke: new Stroke({
      color: [80, 0, 80, .5], // purple
      width: 8,
    }),
  })
});

const friLines = new VectorLayer({
  source: new VectorSource({
    url: './fri_flat.json',
    format: new GeoJSON(),
  }),
  style: new Style({
    stroke: new Stroke({
      color: [0, 0, 255, .5], // blue
      width: 8,
    }),
  })
});

const satLines = new VectorLayer({
  source: new VectorSource({
    url: './sat_flat.json',
    format: new GeoJSON(),
  }),
  style: new Style({
    stroke: new Stroke({
      color: [0, 0, 0, .5], // black
      width: 8,
    }),
  })
});

window.monLines = monLines;
window.tueLines = tueLines;
window.wedLines = wedLines;
window.thuLines = thuLines;
window.friLines = friLines;
window.satLines = satLines;


const map = new Map({
  target: 'map',
  view: new View({
    center: [-73.9449975, 40.645244],
    zoom: 16,
  }),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    //vectorLines,
    monLines,
    tueLines,
    wedLines,
    thuLines,
    friLines,
    satLines,
  ],
});

const element = document.getElementById('popup');

const popup = new Overlay({
  element: element,
  stopEvent: false,
});
map.addOverlay(popup);

function formatCoordinate(coordinate, text) {
  return `
    <div>
      ${text}
    </div>`;
}

//const info = document.getElementById('info');
//map.on('moveend', function () {
//  const view = map.getView();
//  const center = view.getCenter();
//  info.innerHTML = formatCoordinate(center);
//});

let popover;
map.on('click', function (event) {
  if (popover) {
    popover.dispose();
    popover = undefined;
  }
  const feature = map.getFeaturesAtPixel(event.pixel)[0];
  if (!feature) {
    return;
  }
  const coordinate = feature.getGeometry().getCoordinates();
  const name = feature.get('name');
  const desc = feature.get('desc');
  console.log('aaa', coordinate[0]);
  const mid_lon = coordinate[0][0] - ((coordinate[0][0] - coordinate[1][0]) / 2);
  const mid_lat = coordinate[0][1] - ((coordinate[0][1] - coordinate[1][1]) / 2);
  popup.setPosition([

    //coordinate[0][0] + Math.round(event.coordinate[0] / 360) * 360,
    //coordinate[0][1],
    mid_lon + Math.round(event.coordinate[0] / 360) * 360,
    mid_lat,
  ]);

  popover = new bootstrap.Popover(element, {
    container: element.parentElement,
    content: formatCoordinate(coordinate, `${name} : ${desc}`),
    html: true,
    offset: [0, 20],
    placement: 'top',
    sanitize: false,
  });
  popover.show();
});

map.on('pointermove', function (event) {
  const type = map.hasFeatureAtPixel(event.pixel) ? 'pointer' : 'inherit';
  map.getViewport().style.cursor = type;
});


const monCB = document.getElementById("mon_cb");
monCB.addEventListener("change", e => {
  if (monCB.checked) {
    monLines.setVisible(true)
  } else {
    monLines.setVisible(false)
  }
})

const tueCB = document.getElementById("tue_cb");
tueCB.addEventListener("change", e => {
  if (tueCB.checked) {
    tueLines.setVisible(true)
  } else {
    tueLines.setVisible(false)
  }
})

const wedCB = document.getElementById("wed_cb");
wedCB.addEventListener("change", e => {
  if (wedCB.checked) {
    wedLines.setVisible(true)
  } else {
    wedLines.setVisible(false)
  }
})

const thuCB = document.getElementById("thu_cb");
thuCB.addEventListener("change", e => {
  if (thuCB.checked) {
    thuLines.setVisible(true)
  } else {
    thuLines.setVisible(false)
  }
})

const friCB = document.getElementById("fri_cb");
friCB.addEventListener("change", e => {
  if (friCB.checked) {
    friLines.setVisible(true)
  } else {
    friLines.setVisible(false)
  }
})

const satCB = document.getElementById("sat_cb");
satCB.addEventListener("change", e => {
  if (satCB.checked) {
    satLines.setVisible(true)
  } else {
    satLines.setVisible(false)
  }
})




