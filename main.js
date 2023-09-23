const Map = ol.Map;
const Overlay = ol.Overlay;
const View = ol.View;
const OSM = ol.source.OSM;
const LineString = ol.geom.LineString;
const TileLayer = ol.layer.Tile;
const useGeographic = ol.proj.useGeographic;
const Stroke = ol.style.Stroke;
const Style = ol.style.Style;
const GeoJSON = ol.format.GeoJSON;
const Link = ol.interaction.Link;
const VectorTileLayer = ol.layer.VectorTile;
const VectorTileSource = ol.source.VectorTile;
const Projection = ol.proj.Projection;
const Attribution = ol.control.Attribution;
const defaultControls = ol.control.defaults.defaults;
useGeographic();

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

const hexToArr = (s) => {
  const [r, g, b] = s.split("#")[1].match(/.{1,2}/g);
  const a = 0.5;
  const c = [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), a];
  return c;
};

const getColorArray = (day) => {
  const isHexColor = (i) => !!(i.length == 7 && i.match(/^#[0-9A-Fa-f]{6}$/g));
  const searchParams = new URLSearchParams(window.location.search.substring(1));
  const paramColor = searchParams.get(`${day}_cs`);
  const defaultColorStr = document.getElementById(`${day}_cs`).value;
  if (paramColor && isHexColor(paramColor)) {
    return hexToArr(paramColor);
  } else if (isHexColor(defaultColorStr)) {
    return hexToArr(defaultColorStr);
  } else {
    // this area should never be reached so long as html has correct colors
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    console.log(`setting ${day} to ${randomColor}`);
    return hexToArr(randomColor);
  }
};

const vectors = {};
const days = ["mon", "tue", "wed", "thu", "fri", "sat"];
const colors = {
  mon: getColorArray("mon"),
  tue: getColorArray("tue"),
  wed: getColorArray("wed"),
  thu: getColorArray("thu"),
  fri: getColorArray("fri"),
  sat: getColorArray("sat"),
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
};

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
  document.getElementById(`${day}_cs`).addEventListener("change", async (e) => {
    vectors[`${day}_single`].getStyle().getStroke().setColor(hexToArr(e.target.value));
    vectors[`${day}_multi`].getStyle().getStroke().setColor(hexToArr(e.target.value));
    // we have to regenerate the vector tile source as geojson-vt doesnt currently support individual tile changes
    // https://github.com/mapbox/geojson-vt/issues/26
    for (let sm of ["single", "multi"]) {
      let vts = await generateVectorTileSource(day, sm);
      vectors[`${day}_${sm}`].setSource(vts);
    }
  });
}

const attributionsHTML =
  '<a href="https://ko-fi.com/mai_dev"><b>Donate!</b></a>' +
  "<br />" +
  "<br />" +
  '<a href="https://github.com/mai-gh/ASPMap.nyc"><b>Fork me on GitHub</b></a>' +
  "<br />" +
  "<br />" +
  '<a href="https://data.cityofnewyork.us/Transportation/Parking-Regulation-Locations-and-Signs/xswq-wnv9">NYC OpenData</a>' +
  "<br />" +
  '<a href="https://www.openstreetmap.org/">OpenStreetMap</a>' +
  "<br />" +
  '<a href="https://openlayers.org/">OpenLayers</a>' +
  "<br />" +
  '<a href="https://github.com/mapbox/geojson-vt">GeoJSON-VT</a>' +
  "<br />" +
  '<a href="https://github.com/Toblerity/Fiona">Fiona</a>' +
  "";

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
  controls: defaultControls({ attribution: false }).extend([attribution]),
  layers: [
    new TileLayer({
      source: new OSM({
        attributions: attributionsHTML,
      }),
    }),
    ...Object.values(vectors),
  ],
});

(async () => {
  map.getTargetElement().classList.add("spinner");

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

const container = document.getElementById("popup");
const content = document.getElementById("popup-content");
const closer = document.getElementById("popup-closer");

const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});
map.addOverlay(overlay);

closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

map.on("singleclick", function (evt) {
  const feature = map.getFeaturesAtPixel(evt.pixel, {hitTolerance: 1})[0];

  if (!feature) {
    overlay.setPosition(undefined);
    return;
  }

  const coordinate = evt.coordinate;

  const name = feature.get("name");
  const desc = feature.get("desc");
  const st = feature.get("st");
  const sos = feature.get("sos");
  const streetViewURL = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coordinate[1]},${coordinate[0]}`;

  const infoHTML = `
    <div>
      <table>
        <tr><td>Order #:</td><td>${name}</td></tr>
        <tr><td>Street:</td><td>${st}</td></tr>
        <tr><td>Side:</td><td>${sos}</td></tr>
      </table>
      <br>
      <div>${desc}</div>
      <div><a href="${streetViewURL}" target="_blank" >Street View</a></div>
    </div>
  `;

  content.innerHTML = infoHTML;
  overlay.setPosition(coordinate);
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
