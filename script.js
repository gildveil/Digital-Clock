// ======= NAVIGATION =======
const navButtons = document.querySelectorAll('.nav-btn');
const sections = {
  clock: document.getElementById('clock-container'),
  stopwatch: document.getElementById('stopwatch-container'),
  timer: document.getElementById('timer-container'),
  alarm: document.getElementById('alarm-container')
};

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.values(sections).forEach(sec => sec.classList.add('hidden'));
    sections[btn.id.replace('nav-','')].classList.remove('hidden');
  });
});

// ======= CLOCK =======
function updateClock() {
  const now = new Date();
  let hours = now.getHours(), minutes = now.getMinutes(), seconds = now.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  document.getElementById("clock").textContent =
    `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')} ${ampm}`;
  document.getElementById("date").textContent = now.toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
}
setInterval(updateClock, 1000);
updateClock();

// ======= STOPWATCH =======
let stopwatchInterval, stopwatchSeconds = 0;
const stopwatchDisplay = document.getElementById('stopwatch');

function formatTime(sec) {
  const hrs = Math.floor(sec/3600), mins = Math.floor((sec%3600)/60), secs = sec%60;
  return [hrs, mins, secs].map(x => x.toString().padStart(2,'0')).join(':');
}

document.getElementById('startStopwatch').addEventListener('click', () => {
  if (!stopwatchInterval) stopwatchInterval = setInterval(() => {
    stopwatchSeconds++; stopwatchDisplay.textContent = formatTime(stopwatchSeconds);
  },1000);
});

document.getElementById('pauseStopwatch').addEventListener('click', () => {
  clearInterval(stopwatchInterval); stopwatchInterval = null;
});

document.getElementById('resetStopwatch').addEventListener('click', () => {
  clearInterval(stopwatchInterval); stopwatchInterval = null; stopwatchSeconds = 0;
  stopwatchDisplay.textContent = "00:00:00";
});

// ======= TIMER =======
let timerInterval, remainingSeconds = 0;
const hourSpan = document.getElementById('hours'),
      minSpan = document.getElementById('minutes'),
      secSpan = document.getElementById('seconds');

function setEditable(state){
  [hourSpan, minSpan, secSpan].forEach(span => {
    span.contentEditable = state;
    if(!state) span.classList.add('disabled');
    else span.classList.remove('disabled');
  });
}

function updateTimerDisplay(sec){
  const hrs=Math.floor(sec/3600), mins=Math.floor((sec%3600)/60), secs=sec%60;
  hourSpan.textContent = hrs.toString().padStart(2,'0');
  minSpan.textContent = mins.toString().padStart(2,'0');
  secSpan.textContent = secs.toString().padStart(2,'0');
}

function parseTimerInput(){
  let hrs=parseInt(hourSpan.textContent)||0,
      mins=parseInt(minSpan.textContent)||0,
      secs=parseInt(secSpan.textContent)||0;
  mins=Math.min(mins,59); secs=Math.min(secs,59);
  hourSpan.textContent = hrs.toString().padStart(2,'0');
  minSpan.textContent = mins.toString().padStart(2,'0');
  secSpan.textContent = secs.toString().padStart(2,'0');
  return hrs*3600 + mins*60 + secs;
}

document.getElementById('startTimer').addEventListener('click', ()=>{
  if(!timerInterval){
    remainingSeconds = parseTimerInput();
    if(remainingSeconds<=0) return;
    setEditable(false);
    timerInterval = setInterval(()=>{
      remainingSeconds--;
      updateTimerDisplay(remainingSeconds);
      if(remainingSeconds<=0){
        clearInterval(timerInterval); timerInterval=null; setEditable(true);
        alert("⏰ Time’s up!");
      }
    },1000);
  }
});

document.getElementById('pauseTimer').addEventListener('click', ()=>{
  clearInterval(timerInterval); timerInterval=null; setEditable(true);
});

document.getElementById('resetTimer').addEventListener('click', ()=>{
  clearInterval(timerInterval); timerInterval=null; remainingSeconds=0;
  hourSpan.textContent=minSpan.textContent=secSpan.textContent="00";
  setEditable(true);
});

[hourSpan, minSpan, secSpan].forEach(span=>{
  span.addEventListener('blur', ()=>{
    let val=parseInt(span.textContent)||0;
    if(span===minSpan||span===secSpan) val=Math.min(val,59);
    span.textContent = val.toString().padStart(2,'0');
  });
  span.addEventListener('input', ()=>{span.textContent=span.textContent.replace(/\D/g,'');});
});

// ======= ALARM =======
const addAlarmBtn=document.getElementById('addAlarm'), alarmList=document.getElementById('alarm-list');
let alarms=[];

addAlarmBtn.addEventListener('click', ()=>{
  const date=document.getElementById('alarm-date').value,
        time=document.getElementById('alarm-time').value;
  if(!date||!time) return alert("Please select date and time");
  const alarmDate=new Date(`${date}T${time}:00`);
  if(alarmDate<=new Date()) return alert("Alarm time must be in the future");
  alarms.push(alarmDate); renderAlarms();
});

function renderAlarms(){
  alarmList.innerHTML='';
  alarms.forEach((alarmTime,index)=>{
    const li=document.createElement('li');
    li.textContent=alarmTime.toLocaleString();
    const delBtn=document.createElement('button');
    delBtn.textContent='Delete';
    delBtn.addEventListener('click',()=>{alarms.splice(index,1); renderAlarms();});
    li.appendChild(delBtn);
    alarmList.appendChild(li);
  });
}

setInterval(()=>{
  const now=new Date();
  alarms.forEach((alarmTime,index)=>{
    if(now>=alarmTime){
      alert("⏰ Alarm! "+alarmTime.toLocaleString());
      if(navigator.vibrate) navigator.vibrate([500,200,500]);
      alarms.splice(index,1); renderAlarms();
    }
  });
},1000);
