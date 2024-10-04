// 初始化 Leaflet 地圖，中心點設為台灣 (可以根據需求調整經緯度)
const map = L.map('map').setView([25.03236, 121.51813], 10);

// 設定地圖圖層，這裡使用 OpenStreetMap 圖層
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 創建兩個 LayerGroup：一個是磅秤資訊，另一個是地磅資訊
const scaleLayer = L.layerGroup();
const storeLayer = L.layerGroup();

// 定義自定義的圖示
const greenIcon = L.icon({
    iconUrl: 'images/marker-icon-2x-green.png',  // 這裡你需要提供一個綠色圖示的 URL預設為地秤圖
    iconSize: [25, 41], // 標記圖示的大小
    iconAnchor: [12, 41], // 標記的錨點位置
    popupAnchor: [1, -34], // 彈出視窗的錨點位置
});

const blueIcon = L.icon({
    iconUrl: 'images/marker-icon-2x-blue.png',  // 這裡你需要提供一個藍色圖示的 URL預設為磅秤圖
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const redIcon = L.icon({
    iconUrl: 'images/marker-icon-2x-red.png',  // 這裡你需要提供一個紅色圖示的 URL預設為不合格圖
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// 計算磅秤和地磅的數量
let scaleCount = 0;
let storeCount = 0;

// 自定義控制器來顯示磅秤和地磅數量
const infoControl = L.control({ position: 'bottomright' });

infoControl.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-control-info');
    div.innerHTML = `<b>磅秤數量:</b> ${scaleCount}<br><b>地秤數量:</b> ${storeCount}`;
    return div;
};

// 將控制器添加到地圖
infoControl.addTo(map);

// 更新數量顯示
function updateInfoControl() {
    const infoDiv = document.querySelector('.leaflet-control-info');
    if (infoDiv) {
        infoDiv.innerHTML = `<b>磅秤數量:</b> ${scaleCount}<br><b>地秤數量:</b> ${storeCount}`;
    }
}

// 初始化時更新控制欄框
updateInfoControl();

// 讀取磅秤和地磅資料並篩選
let scaleData = [];
let weighbridgeData = [];

fetch('scale-data.json')
    .then(response => response.json())
    .then(data => {
        scaleData = data;
        applyFilter(); // 初次讀取後顯示資料
    })
    .catch(error => {
        console.error('Error loading the scale-data.json file:', error);
    });

fetch('weighbridge-data.json')
    .then(response => response.json())
    .then(data => {
        weighbridgeData = data;
        applyFilter(); // 初次讀取後顯示資料
    })
    .catch(error => {
        console.error('Error loading the weighbridge-data.json file:', error);
    });

// 添加篩選條件並顯示資料
document.getElementById('apply-filter').addEventListener('click', applyFilter);

function applyFilter() {
    // 清空圖層和計數
    scaleLayer.clearLayers();
    storeLayer.clearLayers();
    scaleCount = 0;
    storeCount = 0;

    const selectedCities = Array.from(document.getElementById('city-filter').selectedOptions).map(option => option.value);
    const selectedLayer = document.getElementById('layer-filter').value;

    // 過濾磅秤資料
    if (selectedLayer === 'all' || selectedLayer === 'scale') {
        scaleData.forEach(item => {
            if (selectedCities.includes(item.縣市)) {
                const checkResult = String(item.檢查合格與否).trim().toUpperCase();
                const markerIcon = checkResult === "N" ? redIcon : blueIcon;
                
                const scaleMarker = L.marker([item.latitude, item.longitude], { icon: markerIcon }).addTo(scaleLayer);
                scaleMarker.bindPopup(`
                    <h2>市場磅秤</h2>
                    <b>${item.店名 || '無'}</b><br>
                    廠牌: ${item.廠牌 || '無'}<br>
                    型式: ${item.型式 || '無'}<br>
                    器號: ${item.器號 || '無'}<br>
                    Max (kg): ${item.Max_kg || '無'}<br>
                    e (g): ${item.e_g || '無'}<br>
                    檢定日期: ${item.檢定日期 || '無'}<br>
                    檢定合格單號: ${item.檢定合格單號 || '無'}<br>
                    檢查日期: ${item.檢查日期 || '無'}<br>
                    檢查合格單號: ${item.檢查合格單號 || '無'}<br>
                    檢查合格與否: ${item.檢查合格與否 || '無'}
                `);
                scaleCount++;
            }
        });
    }

    // 過濾地磅資料
    if (selectedLayer === 'all' || selectedLayer === 'weighbridge') {
        weighbridgeData.forEach(item => {
            if (selectedCities.includes(item.縣市)) {
                const weighbridgeMarker = L.marker([item.latitude, item.longitude], { icon: greenIcon }).addTo(storeLayer);
                weighbridgeMarker.bindPopup(`
                    <h2>市場地磅</h2>
                    <b>${item.店名 || '無'}</b><br>
                    廠牌: ${item.廠牌 || '無'}<br>
                    型式: ${item.型式 || '無'}<br>
                    器號: ${item.器號 || '無'}<br>
                    Max (kg): ${item.Max_kg || '無'}<br>
                    e (g): ${item.e_g || '無'}<br>
                    檢定日期: ${item.檢定日期 || '無'}<br>
                    檢定合格單號: ${item.檢定合格單號 || '無'}<br>
                    檢查日期: ${item.檢查日期 || '無'}<br>
                    檢查合格單號: ${item.檢查合格單號 || '無'}<br>
                    檢查合格與否: ${item.檢查合格與否 || '無'}
                `);
                storeCount++;
            }
        });
    }

    // 將圖層添加到地圖
    if (selectedLayer === 'all' || selectedLayer === 'scale') {
        scaleLayer.addTo(map);
    }
    if (selectedLayer === 'all' || selectedLayer === 'weighbridge') {
        storeLayer.addTo(map);
    }

    // 更新資訊顯示
    updateInfoControl();
}

