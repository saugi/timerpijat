const minutesInput = document.getElementById('minutesInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const timeDisplay = document.getElementById('timeDisplay');
const quickButtons = document.querySelectorAll('.quick button');

let totalSeconds = parseInt(minutesInput.value || 15) * 60;
let remaining = totalSeconds;
let timerId = null;
let running = false;
let endTimestamp = null;

function formatTime(s){
  const mm = Math.floor(s/60).toString().padStart(2,'0');
  const ss = Math.floor(s%60).toString().padStart(2,'0');
  return `${mm}:${ss}`;
}

function updateDisplay(){
  timeDisplay.textContent = formatTime(Math.max(0, Math.ceil(remaining)));
}

function tick(){
  const now = Date.now();
  remaining = Math.max(0, Math.round((endTimestamp - now)/1000));
  updateDisplay();
  if(remaining <= 0){
    stopTimer(false);
    finished();
  }
}

function startTimer(){
  if(running) return;
  totalSeconds = Math.max(0, Math.floor((parseFloat(minutesInput.value) || 0) * 60));
  if(totalSeconds <= 0) totalSeconds = 60;
  endTimestamp = Date.now() + totalSeconds * 1000;
  remaining = totalSeconds;
  updateDisplay();
  timerId = setInterval(tick, 250);
  running = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
}

function pauseTimer(){
  if(!running) return;
  clearInterval(timerId);
  timerId = null;
  // calculate remaining based on timestamp
  remaining = Math.max(0, Math.round((endTimestamp - Date.now())/1000));
  running = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function stopTimer(resetToInput = true){
  clearInterval(timerId);
  timerId = null;
  running = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  if(resetToInput){
    totalSeconds = Math.max(0, Math.floor((parseFloat(minutesInput.value) || 0) * 60));
    remaining = totalSeconds;
    updateDisplay();
    resetBtn.disabled = true;
  }
}

function resetTimer(){
  stopTimer(true);
}

function finished(){
  // play sound
  beep();
  // vibrate if supported
  if(navigator.vibrate){
    navigator.vibrate([200,100,200]);
  }
  alert('Waktu pijat selesai!');
  resetBtn.disabled = false;
}

function beep(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
    o.stop(ctx.currentTime + 1.05);
    // close context after finished to release audio device
    setTimeout(()=>ctx.close(), 1200);
  }catch(e){
    // fallback: simple alert beep (some browsers block)
    console.warn('beep error', e);
  }
}

/* events */
startBtn.addEventListener('click', () => startTimer());
pauseBtn.addEventListener('click', () => pauseTimer());
resetBtn.addEventListener('click', () => resetTimer());

minutesInput.addEventListener('change', () => {
  const m = Math.max(0, Math.floor(parseFloat(minutesInput.value) || 0));
  minutesInput.value = m;
  if(!running){
    totalSeconds = m * 60;
    remaining = totalSeconds;
    updateDisplay();
  }
});

quickButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const m = parseInt(btn.dataset.min, 10) || 0;
    minutesInput.value = m;
    totalSeconds = m * 60;
    remaining = totalSeconds;
    updateDisplay();
    if(running){
      // restart with new duration
      endTimestamp = Date.now() + totalSeconds * 1000;
    }
  });
});

// initialize display
remaining = Math.max(0, Math.floor((parseFloat(minutesInput.value) || 15) * 60));
updateDisplay();
