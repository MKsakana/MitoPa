 // ------------------------------------------地図表示
const map = L.map('map', {
  center: [36.3708, 140.4760],
  zoom: 18,
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
  .then(convertToJson)//　→関数１へ
  .then(processData);//　→関数２へ

//【関数１】GEOJSONをJSONに変換
function convertToJson(res) {
  return res.json();
}
//【関数２】Jsonを関数に保存して、次の関数へ渡す
function processData(data) {
    allParkingData = data; //データを変数に保存
    addMarkers(data);   // 　→関数３
}
//【関数３】ピンと吹き出しの設定→表示
function addMarkers(dataToDisplay) {
    parkingLayer.clearLayers(); //シートを真っさらにする
    L.geoJSON(dataToDisplay, {
      //駐車場情報を取得
       onEachFeature: function(feature, layer) {
      const props = feature.properties;


      
      //駐車場情報を使ってHTMLにポップアップを追加
      layer.bindPopup(`
       <div class="popup-content">
  <img src="image/yuki1.png" class="PinPng">
  <h4>${props.名前}</h4>
  
  <table class="popup-table">
    <tbody>
      <tr>
        <th>🔰おすすめ度</th>
        <td><span class="judge">${props.初心者おす ? props.初心者おす.charAt(0) : ""}</span></td>
      </tr>
      <tr>
        <th>台数</th>
        <td>${props.台数}</td>
      </tr>
      <tr>
        <th>備考</th>
        <td>${props.備考 ? props.備考 : ""}</td>
      </tr>
    </tbody>
  </table>
</div>
      `);
    }
    })
    .addTo(parkingLayer); //用意していたレイヤーにピンを追加
}

//-------------------------------------------初期ピン表示ここまで



//-------------------------------------------近くの駐車場検索

    //--処理の流れのイメージ--
    // 現在地からさがすボタンをタップ
    // 現在地取得 →緯度と経度をゲット
    // 全データをスキャン
    // 地図を書き換え（地図を初期化して、対象だけを表示）

// 絞り込み状態を管理するフラグ
var isFiltered = false;
// 現在地の円を管理する変数（削除するため）
var currentCircle = null;


 //#locate-btnにクリックイベントを追加
 //→イベント内に位置情報を取得するプログラムを入れる

 //機能させたいボタンのIdを取得する
var btn = document.getElementById('locate-btn');

//ボタンのクリックまち
btn.addEventListener('click', function() {
  // 以下ボタンが押された時の処理
  
  // 絞り込みONの場合は、全ピンを表示に戻す
    if (isFiltered) {
        showAllMarkers(); //→関数６へ
    } else {
  // 絞り込みOFFの場合は、位置情報を取得して絞り込み
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback); 
    }
});
//→クリックされたら、位置情報を取得する。
// 成功→関数４　失敗→関数5



//【関数４】位置情報がうまく取れた時の処理
function successCallback(position) {
    var Ido = position.coords.latitude;  // ユーザーの緯度
    var Keido = position.coords.longitude; // ユーザーの経度
    var userPoint= L.latLng(Ido,Keido)//現在地にオブジェクトを作成

  // 500m以内の駐車場を探す処理ここから。
    var nearPark = allParkingData.features.filter (function(feature){
     if (!feature.geometry || !feature.geometry.coordinates) {
        return false;  // 位置情報が見つからないデータについては、以下の処理を無視する（取得エラー防止）
      }
      var pKeido = feature.geometry.coordinates[0];//各駐車場の経度を抽出
      var pIdo = feature.geometry.coordinates[1];//各駐車場の緯度を抽出
      var parkingPoint = L.latLng(pIdo,pKeido); //上で出した緯度経度を距離計算可能なオブジェクトとして変数に格納

      var distance = userPoint.distanceTo(parkingPoint);//distanceTo:指定されたベクトル(各駐車場)からの距離を計算
      return distance <= 300;//500m以内にある駐車場を絞り込んで値を返す
    });

     var filteredData={
    type:"FeatureCollection",
    features: nearPark
    };

  parkingLayer.clearLayers(); // 一旦シートを真っさらにする
  addMarkers(filteredData);
  
  // 既存の円があれば削除
  if (currentCircle) {
    map.removeLayer(currentCircle);
  }
  // 現在地の円を表示
  currentCircle = L.circle([Ido, Keido], { radius: 500 }).addTo(map);
  
  // 絞り込み状態をONに設定
  isFiltered = true;
  // ボタンのスタイルを変更（クラスを追加）
  btn.classList.add('filtered');
  // ボタンのテキストを変更
  btn.textContent = '絞り込みをやめる';
};


//【関数５】エラーが起きた時の処理
function errorCallback(error) {
    alert('位置情報が取得できなかったよ。ごめんね！');
}


//-------------------------------------------駐車場検索ここまで




//-------------------------------------------表示を元に戻すここから

//【関数６】すべてのピンを表示する処理
function showAllMarkers() {
  // 全データを表示
  parkingLayer.clearLayers();
  addMarkers(allParkingData);
  // 現在地の円を削除
  if (currentCircle) {
      map.removeLayer(currentCircle);
      currentCircle = null;
  }
  // 絞り込み状態をOFFに設定
  isFiltered = false;
  // ボタンのスタイルを元に戻す（クラスを削除）
  btn.classList.remove('filtered');
  // ボタンのテキストを元に戻す
  btn.textContent = '現在地からさがす🔍';
}
//-------------------------------------------表示を元に戻すここまで



//-------------------------------------------お気に入りボタンここから（できたら）

//-------------------------------------------お気に入りボタンここまで


//GeoJsonオブジェクトにおけるtypeの指定方法（個人的メモ）
//Point　1つの「点」そのもの。
//Feature　「点」に加えて、「名前」などの属性情報がセットになったもの。
//FeatureCollection　Feature をたくさん集めた「リスト（箱）」のこと。
