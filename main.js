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

useGeographic();

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
