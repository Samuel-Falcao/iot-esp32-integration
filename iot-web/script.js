import { firebaseConfig } from "./config.js";

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, query, limitToLast, onChildAdded, off, push } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

if (!getApps().length) initializeApp(firebaseConfig);
const db = getDatabase();

const deviceIdInput = document.getElementById('deviceId');
const deviceLabel = document.getElementById('deviceLabel');
const connBadge = document.getElementById('connBadge');

const tempVal = document.getElementById('tempVal');
const humVal = document.getElementById('humVal');
const tempState = document.getElementById('tempState');
const humState = document.getElementById('humState');
const lastTs = document.getElementById('lastTs');
const historyList = document.getElementById('historyList');
const limitSelect = document.getElementById('limit');
const pointsLabel = document.getElementById('pointsLabel');

const btnClear = document.getElementById('btnClear');
const btnSim = document.getElementById('btnSim');
const btnExport = document.getElementById('btnExport');
const btnReconnect = document.getElementById('btnReconnect');
const simIntervalInput = document.getElementById('simInterval');

let readingsRef = null;
let childListener = null;
let pointLimit = Number(limitSelect.value || 60);
let chart, chartData;
let simulate = false, simIntervalId = null;
let history = [];

function applyThemeFromSystem() {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.removeAttribute('data-theme');
}
if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => applyThemeFromSystem());
}
applyThemeFromSystem();

const ctx = document.getElementById('mainChart').getContext('2d');
chartData = {
  labels: [],
  datasets: [
    { label: 'Temperatura (°C)', data: [], borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.08)', borderWidth: 2, tension:0.3, pointRadius:2 },
    { label: 'Umidade (%)', data: [], borderColor: '#fb7185', backgroundColor: 'rgba(251,113,133,0.06)', borderWidth: 2, tension:0.3, pointRadius:2 }
  ]
};
chart = new Chart(ctx, {
  type: 'line',
  data: chartData,
  options: {
    animation:false,
    responsive:true,
    plugins:{ legend:{ labels:{ color:'#94a3b8' } } },
    scales:{
      x:{ ticks:{ color:'#94a3b8' } },
      y:{ ticks:{ color:'#94a3b8' } }
    }
  }
});

function setConn(status){
  connBadge.className = 'badge ' + (status === 'ok' ? 'ok' : status === 'warn' ? 'warn' : status === 'bad' ? 'bad' : 'neutral');
  connBadge.textContent = status === 'ok' ? 'Conectado' : status === 'warn' ? 'Conectado (atenção)' : status === 'bad' ? 'Erro' : 'Conectando...';
}
function tempQual(t){ if (t >= 18 && t <= 27) return ['Confortável','ok']; if (t < 18) return ['Frio','warn']; return ['Quente','bad']; }
function humQual(h){ if (h >= 30 && h <= 60) return ['Adequada','ok']; if (h < 30) return ['Baixa','warn']; return ['Alta','bad']; }

function pushReading(obj){
  const t = Number(obj.temperature);
  const h = Number(obj.humidity);
  const ts = obj.ts ? new Date(obj.ts * 1000) : new Date();
  const tsLabel = ts.toLocaleString();

  tempVal.textContent = `${t.toFixed(2)} °C`;
  humVal.textContent = `${h.toFixed(2)} %`;

  const [ttxt,tcls] = tempQual(t);
  const [htxt,hcls] = humQual(h);
  tempState.textContent = ttxt; tempState.className = `card-sub ${tcls}`;
  humState.textContent = htxt; humState.className = `card-sub ${hcls}`;

  lastTs.textContent = tsLabel;

  chartData.labels.push(ts.toLocaleTimeString());
  chartData.datasets[0].data.push(t);
  chartData.datasets[1].data.push(h);
  while(chartData.labels.length > pointLimit){
    chartData.labels.shift();
    chartData.datasets.forEach(ds => ds.data.shift());
  }
  chart.update();
  pointsLabel.textContent = `Pontos: ${chartData.labels.length}`;

  const item = { t: t.toFixed(2), h: h.toFixed(2), ts: tsLabel };
  history.unshift(item);
  if (history.length > 20) history.pop();
  renderHistory();
}

function renderHistory(){
  historyList.innerHTML = '';
  history.forEach(it => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${it.ts}</span><span>${it.t}°C • ${it.h}%</span>`;
    historyList.appendChild(li);
  });
}

function startListener(){
  stopListener();
  const deviceId = deviceIdInput.value.trim() || 'esp32-lab-001';
  deviceLabel.textContent = deviceId;
  try {
    const dbRef = ref(db, `/devices/${deviceId}/readings`);
    readingsRef = query(dbRef, limitToLast(pointLimit));
    childListener = onChildAdded(readingsRef, (snap) => {
      const val = snap.val();
      pushReading({ temperature: val.temperature, humidity: val.humidity, ts: val.ts || Math.floor(Date.now()/1000) });
      setConn('ok');
    }, (err) => {
      console.error('Listener error', err);
      setConn('bad');
    });
  } catch (err) {
    console.error('startListener', err);
    setConn('bad');
  }
}
function stopListener(){
  if (readingsRef && childListener){
    off(readingsRef, 'child_added', childListener);
    readingsRef = null; childListener = null;
  }
}

btnClear.addEventListener('click', () => {
  chartData.labels = []; chartData.datasets.forEach(ds => ds.data = []); chart.update();
  history = []; renderHistory(); pointsLabel.textContent = 'Pontos: 0';
});

btnReconnect.addEventListener('click', () => {
  setConn('neutral'); startListener();
});

btnSim.addEventListener('click', () => {
  simulate = !simulate;
  btnSim.textContent = simulate ? 'Desativar Simulação' : 'Ativar Simulação';
  if (simulate) startSimulation(); else stopSimulation();
});

btnExport.addEventListener('click', () => {
  const rows = [['timestamp','temperature','humidity']];
  for (let i=0;i<chartData.labels.length;i++){
    rows.push([chartData.labels[i], chartData.datasets[0].data[i], chartData.datasets[1].data[i]]);
  }
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `readings_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
});

function startSimulation() {
  const interval = Number(simIntervalInput.value) || 3000;
  const deviceId = deviceIdInput.value.trim() || 'esp32-lab-001';
  const dbRef = ref(db, `/devices/${deviceId}/readings`);

  if (simIntervalId) clearInterval(simIntervalId);
  simIntervalId = setInterval(() => {
    const newReading = {
      temperature: 19 + Math.random() * 10,
      humidity: 30 + Math.random() * 50,
      ts: Math.floor(Date.now() / 1000)
    };
    push(dbRef, newReading)
      .catch(err => console.error("Erro na simulação:", err));
  }, interval);
}
function stopSimulation(){ if (simIntervalId) clearInterval(simIntervalId); simIntervalId = null; }

limitSelect.addEventListener('change', () => { pointLimit = Number(limitSelect.value); startListener(); });
deviceIdInput.addEventListener('change', () => startListener());

startListener();
setTimeout(()=> setConn('neutral'), 600);

window.__iot = { pushReading, startListener, stopListener, startSimulation, stopSimulation };