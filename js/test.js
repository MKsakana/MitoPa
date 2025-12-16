 // 地図を作るよ
const map = L.map('map', {
  center: [36.3708, 140.4760],
  zoom: 17,
  minZoom: 14, 
  maxZoom: 18,
  maxBounds: [
    [36.34, 140.45],
    [36.40, 140.50]
  ],
  maxBoundsViscosity: 0
});

// OpenStreetMapのタイルを読み込み
// nowrap以降で地図範囲を設定
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  noWrap: true,
  bounds: [
    [36.25, 140.35],
    [36.45, 140.60]
  ]
}).addTo(map);


// 実際の実行
fetch('geo_test.geojson')
  .then(convertToJson)
  .then(processData);

//JSONに変換
function convertToJson(res) {
  return res.json();
}

//JSONデータを処理
function processData(data) {
  L.geoJSON(data, {
    onEachFeature: function(feature, layer) {
      const props = feature.properties;
    }
    });
}

layer.bindPopup(`
          <div class="popup-content">
            <h4>${props.名前}</h4>
           <p>初心者おすすめ: ${props.初心者おす ? props.初心者おす[0] : ""}</p>

          </div>
        `);