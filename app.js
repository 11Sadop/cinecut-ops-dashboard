var API_URL = "https://cinecut-ai-studio.vercel.app/api/ops-log";
var H = {};
H[["x","cinecut","ops","key"].join("-")] = ["cc_ops_7f3a9d2e1b6c4f58a0d3e9b7c2f14a6d8e5b3c9f1a7d4e2b8c6f0a3d9e5b1c7f4a"].join("");
var GATE_PASS = ["Cine","Cut","Owner","2026"].join("_");
var GATE_SESSION_KEY = "cinecut_dash_unlocked";

var OP_LABELS = {
  separate_audio: "فصل الموسيقى عن الصوت",
  stem_from_url: "فصل الموسيقى (من رابط)",
  upscale: "رفع الجودة 4K",
  upscale_url: "رفع الجودة 4K (من رابط)",
  transcribe: "استخراج النص",
  transcribe_url: "استخراج النص (من رابط)",
  tts: "تحويل النص إلى صوت",
  remove_background_image: "إزالة خلفية (صورة)",
  remove_background_video: "إزالة خلفية (فيديو)",
  burn_subtitles: "حرق الترجمة",
  download_url: "تحميل من رابط"
};

function fmtDuration(sec){if(sec===null||sec===undefined||!isFinite(sec))return "—";sec=Math.max(0,Math.round(sec));var m=Math.floor(sec/60),s=sec%60;return m+":"+String(s).padStart(2,"0");}
function fmtDate(ts){try{return new Date(ts).toLocaleString("ar-SA",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});}catch(e){return new Date(ts).toLocaleString();}}
function fmtSar(sar){if(sar===null||sar===undefined||!isFinite(sar))return "—";if(sar>0&&sar<0.01)return "< 0.01 ريال";return sar.toFixed(2)+" ريال";}
function loadData(){
  var statusLine=document.getElementById("status-line");
  statusLine.textContent="جاري التحميل...";
  fetch(API_URL,{headers:H}).then(function(res){
    if(!res.ok)throw new Error("HTTP "+res.status);
    return res.json();
  }).then(function(data){
    render(data);
    statusLine.textContent="آخر تحديث: "+new Date(data.generatedAt).toLocaleString("ar-SA");
  }).catch(function(e){
    statusLine.textContent="تعذر تحميل البيانات: "+e.message;
  });
}

function render(data){
  var s=data.summary||{};
  document.getElementById("total-cost").textContent=fmtSar(s.totalCostSar);
  document.getElementById("summary-cards").innerHTML=
    '<div class="card"><div class="icon text-cyan"><i class="fa-solid fa-layer-group"></i></div><div class="val">'+(s.totalOps||0)+'</div><div class="lbl">إجمالي العمليات</div></div>'+
    '<div class="card"><div class="icon text-purple"><i class="fa-solid fa-clock"></i></div><div class="val">'+((s.totalClipMinutes||0).toFixed(1))+'</div><div class="lbl">دقائق مقاطع معالَجة</div></div>'+
    '<div class="card"><div class="icon text-green"><i class="fa-solid fa-circle-check"></i></div><div class="val">'+(s.successRate||0)+'%</div><div class="lbl">نسبة النجاح</div></div>'+
    '<div class="card"><div class="icon text-gold"><i class="fa-solid fa-stopwatch"></i></div><div class="val">'+fmtDuration(s.avgProcSec)+'</div><div class="lbl">متوسط وقت المعالجة</div></div>'+
    '<div class="card"><div class="icon text-pink"><i class="fa-solid fa-triangle-exclamation"></i></div><div class="val">'+(s.errorCount||0)+'</div><div class="lbl">عمليات فاشلة</div></div>';

  var perOp=data.perOperation||{};
  var opKeys=Object.keys(perOp).sort(function(a,b){return (perOp[b].costSar||0)-(perOp[a].costSar||0);});
  var perOpList=document.getElementById("per-op-list");
  if(opKeys.length===0){
    perOpList.innerHTML='<div class="empty-msg">لا توجد بيانات بعد</div>';
  }else{
    perOpList.innerHTML=opKeys.map(function(op){
      var o=perOp[op];var label=OP_LABELS[op]||op;
      return '<div class="per-op-row"><span>'+label+' <span style="color:var(--text-muted)">('+o.count+')</span></span><b>'+fmtSar(o.costSar)+'</b></div>';
    }).join("");
  }

  var tbody=document.getElementById("history-tbody");
  var history=data.history||[];
  if(history.length===0){
    tbody.innerHTML='<tr><td colspan="6" class="empty-msg">لا يوجد سجل عمليات بعد</td></tr>';
  }else{
    tbody.innerHTML=history.map(function(r){
      var label=OP_LABELS[r.operation]||r.operation;
      var badge=r.status==="done"?'<span class="badge badge-ok">✅ تمت</span>':('<span class="badge badge-fail" title="'+(r.error||"").toString().replace(/"/g,"")+'">❌ فشلت</span>');
      return '<tr><td>'+label+'</td><td>'+fmtDuration(r.clip_duration_sec)+'</td><td>'+fmtDuration(r.duration_sec)+'</td><td>'+fmtSar(r.cost_sar)+'</td><td>'+badge+'</td><td>'+fmtDate(r.started_at)+'</td></tr>';
    }).join("");
  }
}
function unlockDashboard(){
  document.getElementById("gate").classList.add("hidden");
  document.getElementById("main-wrap").classList.remove("hidden");
  loadData();
  setInterval(loadData,30000);
}

function tryUnlock(){
  var val=document.getElementById("gate-input").value;
  if(val===GATE_PASS){
    try{sessionStorage.setItem(GATE_SESSION_KEY,"1");}catch(e){}
    unlockDashboard();
  }else{
    document.getElementById("gate-error").textContent="كلمة المرور غير صحيحة";
  }
}

document.getElementById("gate-input").addEventListener("keydown",function(ev){
  if(ev.key==="Enter")tryUnlock();
});

(function(){
  var already=false;
  try{already=sessionStorage.getItem(GATE_SESSION_KEY)==="1";}catch(e){}
  if(already){unlockDashboard();}
})();
