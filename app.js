// 初始化 Leaflet 地圖，中心點設為台灣
const map = L.map('map').setView([25.03236, 121.51813], 10);

// 設定地圖圖層，使用 OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 創建 LayerGroup：磅秤與地磅
const scaleLayer = L.layerGroup();
const weighbridgeLayer = L.layerGroup();

// 定義自定義圖示
const greenIcon = L.icon({
    iconUrl: 'images/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
const blueIcon = L.icon({
    iconUrl: 'images/marker-icon-2x-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
const redIcon = L.icon({
    iconUrl: 'images/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

// 加入圖層控制
const baseLayers = {};
const overlays = {
    "磅秤": scaleLayer,
    "地秤": weighbridgeLayer
};
L.control.layers(baseLayers, overlays).addTo(map);

// 初始化數量
let scaleCount = 0;
let weighbridgeCount = 0;

// 計算磅秤和地磅的數量並顯示在右下角
const infoControl = L.control({ position: 'bottomright' });
infoControl.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-control-info');
    div.innerHTML = `<b>磅秤數量:</b> ${scaleCount}<br><b>地秤數量:</b> ${weighbridgeCount}`;
    return div;
};
infoControl.addTo(map);

// 更新數量顯示
function updateInfoControl() {
    const infoDiv = document.querySelector('.leaflet-control-info');
    if (infoDiv) {
        infoDiv.innerHTML = `<b>磅秤數量:</b> ${scaleCount}<br><b>地秤數量:</b> ${weighbridgeCount}`;
    }
}

// 讀取 JSON 資料
let scaleData = [];
let weighbridgeData = [];

// 一開始讀取全部資料，並顯示在地圖上
fetch('scale-data.json')
    .then(response => response.json())
    .then(data => {
        scaleData = data;
        applyFilter();  // 初始顯示全部資料
    })
    .catch(error => console.error('Error loading scale data:', error));

fetch('weighbridge-data.json')
    .then(response => response.json())
    .then(data => {
        weighbridgeData = data;
        applyFilter();  // 初始顯示全部資料
    })
    .catch(error => console.error('Error loading weighbridge data:', error));

// 添加篩選功能
document.getElementById('apply-filter').addEventListener('click', applyFilter);

function applyFilter() {
    // 清空圖層與計數
    scaleLayer.clearLayers();
    weighbridgeLayer.clearLayers();
    scaleCount = 0;
    weighbridgeCount = 0;

    // 獲取多選的縣市
    const selectedCities = Array.from(document.getElementById('city-filter').selectedOptions).map(option => option.value);
    const selectedLayer = document.getElementById('layer-filter').value;
      

    // 如果沒有選擇縣市，預設顯示臺北市、新北市與基隆市
    const defaultCities = ['臺北市', '新北市', '基隆市'];
    const citiesToFilter = selectedCities.length > 0 ? selectedCities : defaultCities;
    

    // 過濾並顯示磅秤資料
    if (selectedLayer === 'all' || selectedLayer === 'scale') {
        scaleData.forEach(item => {
            if (citiesToFilter.includes(item.縣市)) { // 如果磅秤資料屬於選擇的縣市之一
                // 將 "檢查合格與否" 強制轉換為字串並進行 trim 操作
                const checkResult = String(item.檢查合格與否).trim().toUpperCase();
                const markerIcon = item.檢查合格與否 === 'N' ? redIcon : blueIcon;
                const marker = L.marker([item.latitude, item.longitude], { icon: markerIcon }).addTo(scaleLayer);
                marker.bindPopup(`
                <h2>市場磅秤</h2>
                <b>${item.店名 || '無'}</b><br>
                廠牌: ${item.廠牌 || '無'}<br>
                型號: ${item.型號 || '無'}<br>
                器號: ${item.器號 || '無'}<br>
                Max (kg): ${item.Max_kg || '無'}<br>
                e (g): ${item.e_g || '無'}<br>
                檢定日期: ${item.檢定日期 || '無'}<br>
                檢定合格單號: ${item.檢定合格單號 || '無'}<br>
                檢查日期: ${item.檢查日期 || '無'}<br>
                檢查合格(停用)單號: ${item.檢查合格_停用_單號 || '無'}<br>
                檢查合格與否: ${item.檢查合格與否 || '無'}
                `);
                scaleCount++;
            }
        });
    }

    // 過濾並顯示地磅資料
    if (selectedLayer === 'all' || selectedLayer === 'weighbridge') {
        weighbridgeData.forEach(item => {
            if (citiesToFilter.includes(item.縣市)) {
                // 將 "檢查合格與否" 強制轉換為字串並進行 trim 操作
                const checkResult = String(item.檢查合格與否).trim().toUpperCase();
                const markerIcon = item.檢查合格與否 === 'N' ? redIcon : greenIcon;
                const weighbridgemarker = L.marker([item.latitude, item.longitude], { icon: markerIcon }).addTo(weighbridgeLayer);
                weighbridgemarker.bindPopup(`
                <h2>固定地秤</h2>  <!-- 添加"固定地秤"標題 -->
                <b>${item.所有人 || '無'}</b><br>
                地址: ${item.地址 || '無'}<br>
                廠牌: ${item.廠牌 || '無'}<br>
                型號: ${item.型號 || '無'}<br>
                器號: ${item.器號 || '無'}<br>
                Max (t): ${item.Max_t || '無'}<br>
                e (kg): ${item.e_kg || '無'}<br>
                檢定合格期限: ${item.檢定合格期限 || '無'}<br>
                檢定合格單號: ${item.檢定合格單號 || '無'}<br>
                檢查日期: ${item.檢查日期 || '無'}<br>
                檢查合格(停用)單號: ${item.檢查合格_停用_單號 || '無'}<br>
                檢查合格與否: ${item.檢查合格與否 || '無'}
                `);
                weighbridgeCount++;
            }
        });
    }

    // 更新數量顯示
    updateInfoControl();

    // 將圖層添加到地圖
    
        scaleLayer.addTo(map);
    
        weighbridgeLayer.addTo(map);
 }




