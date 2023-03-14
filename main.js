//import {Feature, Map, Overlay, View} from 'ol/index.js';
//import {OSM, Vector as VectorSource} from 'ol/source.js';
//import {Point, LineString} from 'ol/geom.js';
//import {Point} from 'ol/geom.js';
//import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
//import {useGeographic} from 'ol/proj.js';
//import {Stroke, Style} from 'ol/style.js';
//import GeoJSON from 'ol/format/GeoJSON.js';
//import Link from 'ol/interaction/Link.js';

const Feature = ol.Feature;
const Map = ol.Map;
const Overlay = ol.Overlay;
const View = ol.View;
const OSM = ol.source.OSM;
const VectorSource = ol.source.Vector;
const LineString = ol.geom.LineString;
const TileLayer = ol.layer.Tile;
//const VectorLayer = ol.layer.Vector;
const useGeographic = ol.proj.useGeographic;
const Stroke = ol.style.Stroke;
const Style = ol.style.Style;
const GeoJSON = ol.format.GeoJSON;
const Link = ol.interaction.Link;

//import VectorTileLayer from 'ol/layer/VectorTile.js';
//import VectorTileSource from 'ol/source/VectorTile.js';
//import Projection from 'ol/proj/Projection.js';
const VectorTileLayer = ol.layer.VectorTile;
const VectorTileSource = ol.source.VectorTile;
const Projection = ol.proj.Projection;
//const Fill = ol.style.Fill;
const toLonLat = ol.proj.toLonLat;
//import {Attribution, defaults as defaultControls} from 'ol/control.js';
const Attribution = ol.control.Attribution;
const defaultControls = ol.control.defaults.defaults;


// Converts geojson-vt data to GeoJSON
const replacer = function (key, value) {
  if (!value || !value.geometry) {
    return value;
  }

  let type;
  const rawType = value.type;
  let geometry = value.geometry;
  if (rawType === 1) {
    type = "MultiPoint";
    if (geometry.length == 1) {
      type = "Point";
      geometry = geometry[0];
    }
  } else if (rawType === 2) {
    type = "MultiLineString";
    if (geometry.length == 1) {
      type = "LineString";
      geometry = geometry[0];
    }
  } else if (rawType === 3) {
    type = "Polygon";
    if (geometry.length > 1) {
      type = "MultiPolygon";
      geometry = [geometry];
    }
  }

  return {
    type: "Feature",
    geometry: {
      type: type,
      coordinates: geometry,
    },
    properties: value.tags,
  };
};

const attributions =
  '<a href="https://github.com/mai-gh/streetparker2"><b>Fork me on GitHub</b></a>' + 
  '<br />' +
  '<br />' +
  '<a href="https://data.cityofnewyork.us/Transportation/Parking-Regulation-Locations-and-Signs/xswq-wnv9">NYC OpenData</a>' +
  '<br />' +
  '<a href="https://www.openstreetmap.org/">OpenStreetMap</a>' +
  '<br />' +
  '<a href="https://openlayers.org/">OpenLayers</a>' +
  '<br />' +
  '<a href="https://github.com/Toblerity/Fiona">Fiona</a>' +
  '<br />' +
  '<a href="https://github.com/mapbox/geojson-vt">GeoJSON-VT</a>' +
  '';


const vectors = {};
const days = ["mon", "tue", "wed", "thu", "fri", "sat"];
const colors = {
  mon: [255, 0, 0, 0.5], // red
  tue: [0, 255, 0, 0.5], // green
  wed: [255, 165, 0, 0.5], // orange
  thu: [80, 0, 80, 0.5], // purple
  fri: [0, 0, 255, 0.5], // blue
  sat: [0, 0, 0, 0.5], // black
};

const scb = document.getElementById(`single_cb`);
scb.addEventListener("change", (e) => {
  for (let day of days) {
    if (scb.checked && document.getElementById(`${day}_cb`).checked) {
      vectors[`${day}_multi`].setVisible(false);
    } else if (!scb.checked && document.getElementById(`${day}_cb`).checked) {
      vectors[`${day}_multi`].setVisible(true);
    }
  }
});

const generateVectorTileSource = async (day, sm) => {
  const json = await fetch(`./data/${day}_${sm}_flat.json`).then((r) =>
    r.json()
  );
  const tileIndex = geojsonvt(json, {
    extent: 4096,
    maxZoom: 20,
  });
  const format = new GeoJSON({
    // Data returned from geojson-vt is in tile pixel units
    dataProjection: new Projection({
      code: "TILE_PIXELS",
      units: "tile-pixels",
      extent: [0, 0, 4096, 4096],
    }),
  });
  const vectorSource = new VectorTileSource({
    tileUrlFunction: function (tileCoord) {
      // Use the tile coordinate as a pseudo URL for caching purposes
      return JSON.stringify(tileCoord);
    },
    tileLoadFunction: function (tile, url) {
      const tileCoord = JSON.parse(url);
      const data = tileIndex.getTile(tileCoord[0], tileCoord[1], tileCoord[2]);
      const geojson = JSON.stringify(
        {
          type: "FeatureCollection",
          features: data ? data.features : [],
        },
        replacer
      );
      const features = format.readFeatures(geojson, {
        extent: vectorSource.getTileGrid().getTileCoordExtent(tileCoord),
        featureProjection: map.getView().getProjection(),
      });
      tile.setFeatures(features);
    },
  });

  return vectorSource;
};

const toggleLayerFromCB = (day) => (e) => {
    const cb = document.getElementById(`${day}_cb`);
    if (!scb.checked) {
      // meaning show single AND multi
      if (cb.checked) {
        vectors[`${day}_single`].setVisible(true);
        vectors[`${day}_multi`].setVisible(true);
      } else {
        vectors[`${day}_single`].setVisible(false);
        vectors[`${day}_multi`].setVisible(false);
      }
    } else {
      // show ONLY single
      if (cb.checked) {
        vectors[`${day}_single`].setVisible(true);
        vectors[`${day}_multi`].setVisible(false);
      } else {
        vectors[`${day}_single`].setVisible(false);
        vectors[`${day}_multi`].setVisible(false);
      }
    }
}

useGeographic();
for (let day of days) {
  for (let sm of ["single", "multi"]) {
    vectors[`${day}_${sm}`] = new VectorTileLayer({
      style: new Style({
        stroke: new Stroke({
          color: colors[day],
          width: 8,
        }),
      }),
      visible: false,
    });
  }

  document.getElementById(`${day}_cb`).addEventListener("change", toggleLayerFromCB(day));
}


const attribution = new Attribution({
  collapsible: true,
});

const map = new Map({
  target: "map",
  view: new View({
    center: [-73.9449975, 40.645244],
    maxZoom: 20,
    minZoom: 12,
    zoom: 12,
    enableRotation: false,
    extent: [-74.15, 40.535, -73.65, 40.945],
    constrainResolution: true,
  }),
  controls: defaultControls({attribution: false}).extend([attribution]),
  layers: [
    new TileLayer({
      source: new OSM({
        attributions: attributions,
      }),
    }),
    ...Object.values(vectors),
  ],
});

(async () => {
  map.getTargetElement().classList.add('spinner');

  for (let day of days) {
    for (let sm of ["single", "multi"]) {
      let vts = await generateVectorTileSource(day, sm);
      vectors[`${day}_${sm}`].setSource(vts);
    }
    toggleLayerFromCB(day)(); // set layers now based on initial "checked" state
  }

  // add these after our async loading so we can show the spinner always until async stuff is done
  map.on("loadstart", function () {
    map.getTargetElement().classList.add("spinner");
  });

  map.on("loadend", function () {
    map.getTargetElement().classList.remove("spinner");
  });

})();

// ---------------- pop over stuff ---------------- //

const element = document.getElementById("popup");
const popup = new Overlay({
  element: element,
  stopEvent: false,
});
map.addOverlay(popup);

function formatCoordinate(text) {
  return `
    <dl>
      <dt>ORDER#:</dt><dd>${text.name}</dd>
      <dt>STREET:</dt><dd>${text.st}</dd>
      <dt>SIDE:</dt><dd>${text.sos}</dd>
      <dt>TEXT:</dt><dd>${text.desc}</dd>
    </dl>`;
}

let popover;
map.on("click", function (event) {
  if (popover) {
    popover.dispose();
    popover = undefined;
  }

  const feature = map.getFeaturesAtPixel(event.pixel)[0];

  if (!feature) {
    return;
  }

  const coordinate = feature.getGeometry().getCoordinates();
  const name = feature.get("name");
  const desc = feature.get("desc");
  const st = feature.get("st");
  const sos = feature.get("sos");
  const [mid_lon, mid_lat] = toLonLat([
    coordinate[0][0] - (coordinate[0][0] - coordinate[1][0]) / 2,
    coordinate[0][1] - (coordinate[0][1] - coordinate[1][1]) / 2,
  ]);

  popup.setPosition([
    mid_lon + Math.round(event.coordinate[0] / 360) * 360,
    mid_lat,
  ]);

  popover = new bootstrap.Popover(element, {
    container: element.parentElement,
    content: formatCoordinate({ name, desc, st, sos }),
    html: true,
    offset: [0, 20],
    placement: "top",
    sanitize: false,
  });
  popover.show();
});

map.on("pointermove", function (event) {
  const type = map.hasFeatureAtPixel(event.pixel) ? "pointer" : "inherit";
  map.getViewport().style.cursor = type;
});


map.addInteraction(new Link());

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("l")) {
  let la = urlParams.get("l").split("");
  if (la[1] === "1") document.getElementById(`mon_cb`).checked = true;
  if (la[3] === "1") document.getElementById(`tue_cb`).checked = true;
  if (la[5] === "1") document.getElementById(`wed_cb`).checked = true;
  if (la[7] === "1") document.getElementById(`thu_cb`).checked = true;
  if (la[9] === "1") document.getElementById(`fri_cb`).checked = true;
  if (la[11] === "1") document.getElementById(`sat_cb`).checked = true;

  // check if multiday is set for monday, if not, set for single day
  if (la[2] === "0") document.getElementById(`single_cb`).checked = true;
}


//document.querySelector('.ol-attribution').innerHTML= '' 

let bbb = document.querySelector(".ol-attribution button")
document.querySelector('.ol-attribution').replaceChildren(bbb)
let uuu = document.createElement("ul")

let l1 = document.createElement("li")
l1.innerHTML = '<a href="https://github.com/mai-gh/streetparker2"><b>Fork me on GitHub</b></a>'; 
uuu.appendChild(l1);
uuu.appendChild(document.createElement("br"))
uuu.appendChild(document.createElement("br"))

let l2 = document.createElement("li")
l2.innerHTML = '<a href="https://data.cityofnewyork.us/Transportation/Parking-Regulation-Locations-and-Signs/xswq-wnv9">NYC OpenData</a>'; 
uuu.appendChild(l2);
uuu.appendChild(document.createElement("br"))

let l3 = document.createElement("li")
l3.innerHTML = '<a href="https://www.openstreetmap.org/">OpenStreetMap</a>'; 
uuu.appendChild(l3);
uuu.appendChild(document.createElement("br"))

let l4 = document.createElement("li")
l4.innerHTML = '<a href="https://openlayers.org/">OpenLayers</a>'; 
uuu.appendChild(l4);
uuu.appendChild(document.createElement("br"))

let l5 = document.createElement("li")
l5.innerHTML = '<a href="https://github.com/mapbox/geojson-vt">GeoJSON-VT</a>'; 
uuu.appendChild(l5);
uuu.appendChild(document.createElement("br"))

let l6 = document.createElement("li")
l6.innerHTML = '<a href="https://github.com/Toblerity/Fiona">Fiona</a>'; 
uuu.appendChild(l6);

document.querySelector('.ol-attribution').appendChild(uuu);








