// 初始化 Leaflet 地圖，中心點設為台灣 (可以根據需求調整經緯度)
const map = L.map('map').setView([25.03236, 121.51813], 16);

// 設定地圖圖層，這裡使用 OpenStreetMap 圖層
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 創建兩個 LayerGroup：一個是磅秤資訊，另一個是商家資訊
const scaleLayer = L.layerGroup().addTo(map);
const storeLayer = L.layerGroup().addTo(map);

// 從 data.json 讀取磅秤資料並在地圖上顯示
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            // 在磅秤圖層中標記每個磅秤的位置
            const scaleMarker = L.marker([item.latitude, item.longitude]).addTo(scaleLayer);

            // 為每個標記綁定 Popup，顯示磅秤資訊
            scaleMarker.bindPopup(`
                <b>${item.店名}</b><br>
                廠牌: ${item.廠牌}<br>
                型式: ${item.型式}<br>
                器號: ${item.器號}<br>
                檢查合格日期: ${item.檢查合格日期}<br>
                檢定合格日期: ${item.檢定合格日期}
            `);
        });
    })
    .catch(error => {
        console.error('Error loading the JSON file:', error);
    });

// 添加商家資訊到商家圖層（可以是靜態資訊或來自另一個 API）
L.marker([25.03, 121.51])
    .addTo(storeLayer)
    .bindPopup("夢時代購物中心")
    .openPopup();

// 添加圖層控制，讓用戶可以選擇顯示哪些圖層
const baseLayers = {};
const overlays = {
    "磅秤資訊": scaleLayer,
    "商家資訊": storeLayer
};

L.control.layers(baseLayers, overlays).addTo(map);
