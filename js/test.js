 // ------------------------------------------地図表示
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
    [36.25, 140.35],// 水戸駅周辺を指定
    [36.45, 140.60]
  ]
}).addTo(map);

//--------------------------------------------地図ここまで




//--------------------------------------------初期ピン表示

//駐車場データを入れる関数と新規レイヤ―を作成
var allParkingData = null;
var parkingLayer = L.layerGroup().addTo(map);

  // geojsonファイルの読み込み→関数呼び出し
fetch('geo_test.geojson')
  .then(convertToJson)//　→関数１
  .then(processData);//　→関数２

//関数１：GEOJSONをJSONに変換
function convertToJson(res) {
  return res.json();
}
//関数２：Jsonを関数に保存して、次の関数へ渡す
function processData(data) {
    allParkingData = data; // データを変数に保存
    addMarkers(data);   // 　→関数３
}
//関数３：ピンとポップアップの設定→表示
function addMarkers(dataToDisplay) {
    parkingLayer.clearLayers(); // 一旦シートを真っさらにする
    L.geoJSON(dataToDisplay, {
      //駐車場情報を取得
       onEachFeature: function(feature, layer) {
      const props = feature.properties;
      //駐車場情報を使ってHTMLにポップアップを追加
      layer.bindPopup(`
        <div class="popup-content">
          <h4>${props.名前}</h4>
          <p>初心者おすすめ度:<br> ${props.初心者おす ? props.初心者おす : ""}</p>
          <p>ひとこと:<br>${props.備考 ? props.備考 : ""}</p>
        </div>
      `);
    }
    }).addTo(parkingLayer); // レイヤーにピンを追加
}

//-------------------------------------------初期ピン表示ここまで



//-------------------------------------------ボタン操作

  //#locate-btnにクリックイベントを追加→イベント内に位置情報を取得するプログラムを入れる
  //ボタンを取得する
var btn = document.getElementById('locate-btn');

//ボタンがクリックされた時の予約
btn.addEventListener('click', function() {
    // ボタンが押されたら、ブラウザに位置情報を聞く
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
});

//関数４：位置情報がうまく取れた時の処理
function successCallback(position) {
    // positionの中には、緯度・経度が入っています
    var Ido = position.coords.latitude;  // 緯度
    var Keido = position.coords.longitude; // 経度
    var userPoint= L.latLng(Ido,Keido)//現在地にオブジェクトを作成

    // 500m以内の駐車場を探す処理
    var nearPark = allParkingData.features.filter (function(feature){
     if (!feature.geometry || !feature.geometry.coordinates) {
        return false; 
      }
      var pKeido = feature.geometry.coordinates[0];
      var pIdo = feature.geometry.coordinates[1];
      var parkingPoint = L.latLng(pIdo,pKeido);

      var distance = userPoint.distanceTo(parkingPoint);
      return distance <= 500;
    });
  var filteredData={
    type:"FeatureCollection",
    features: nearPark
  };
  parkingLayer.clearLayers(); // 一旦シートを真っさらにする
  addMarkers(filteredData)
  L.circle([Ido, Keido], { radius: 500 }).addTo(map);
};

//関数５：エラーが起きた時の処理
function errorCallback(error) {
    alert('位置情報が取得できませんでした。設定を確認してください。');
}

//-------------------------------------------ボタン操作ここまで