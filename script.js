// بيانات محلية
let clients = [], workers = [], dailyContracts = [], monthlyContracts = [], manualEntries = [], tasks = [];
let lang = 'ar';

/* ===== مساعدات بسيطة مأخوذة من الكود الأصلي ===== */
function escapeHtml(s){ if(!s) return ''; return s.toString().replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }); }
function isoDate(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function formatDateLocalized(dateStr){ if(!dateStr) return 'غير منتهي'; const d=new Date(dateStr); const pad=(n)=>String(n).padStart(2,'0'); const weekDaysAr=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']; return `${weekDaysAr[d.getDay()]} ${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

/* ===== حفظ/تحميل من localStorage ===== */
function saveData(){
  localStorage.setItem('cleaningClients', JSON.stringify(clients));
  localStorage.setItem('cleaningWorkers', JSON.stringify(workers));
  localStorage.setItem('cleaningContracts_daily', JSON.stringify(dailyContracts));
  localStorage.setItem('cleaningContracts_monthly', JSON.stringify(monthlyContracts));
  localStorage.setItem('cleaningManualEntries', JSON.stringify(manualEntries));
  localStorage.setItem('cleaningTasks', JSON.stringify(tasks));
}
function loadData(){
  clients = JSON.parse(localStorage.getItem('cleaningClients')||'[]');
  workers = JSON.parse(localStorage.getItem('cleaningWorkers')||'[]');
  dailyContracts = JSON.parse(localStorage.getItem('cleaningContracts_daily')||'[]');
  monthlyContracts = JSON.parse(localStorage.getItem('cleaningContracts_monthly')||'[]');
  manualEntries = JSON.parse(localStorage.getItem('cleaningManualEntries')||'[]');
  tasks = JSON.parse(localStorage.getItem('cleaningTasks')||'[]');
  renderClients(); renderWorkers(); renderContracts(); updateContractFormSelects(); updateDailyControls();
}

/* ===== Clients ===== */
document.getElementById('clientForm').onsubmit = function(e){
  e.preventDefault();
  const name = document.getElementById('clientName').value.trim();
  clients.push({ name: name||'', phone: document.getElementById('clientPhone').value, area: document.getElementById('clientArea').value, mapUrl: document.getElementById('clientMapUrl').value });
  saveData(); renderClients(); this.reset(); updateContractFormSelects();
};
function renderClients(){
  const tbody = document.querySelector('#clientsTable tbody'); if(!tbody) return; tbody.innerHTML = '';
  clients.forEach((c,i)=>{ tbody.innerHTML += `<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.phone)}</td><td>${escapeHtml(c.area)}</td><td>${c.mapUrl?`<a target="_blank" href="${escapeHtml(c.mapUrl)}">رابط</a>`:'-'}</td><td><button class="btn-edit" onclick="editClient(${i})">تعديل</button> <button class="btn-danger" onclick="deleteClient(${i})">حذف</button></td></tr>`; });
}
function deleteClient(i){ if(confirm('حذف العميل؟')){ clients.splice(i,1); saveData(); renderClients(); updateContractFormSelects(); } }
function editClient(i){ const c=clients[i]; if(!c) return; document.getElementById('clientName').value=c.name; document.getElementById('clientPhone').value=c.phone; document.getElementById('clientArea').value=c.area; document.getElementById('clientMapUrl').value=c.mapUrl; }

/* ===== Workers ===== */
document.getElementById('workerForm').onsubmit = function(e){ e.preventDefault(); const name=document.getElementById('workerName').value.trim(); workers.push({ name: name||'', phone: document.getElementById('workerPhone').value, nationality: document.getElementById('workerNationality').value }); saveData(); renderWorkers(); this.reset(); updateContractFormSelects(); };
function renderWorkers(){ const tbody=document.querySelector('#workersTable tbody'); tbody.innerHTML=''; workers.forEach((w,i)=>{ tbody.innerHTML+=`<tr><td>${escapeHtml(w.name)}</td><td>${escapeHtml(w.phone)}</td><td>${escapeHtml(w.nationality||'-')}</td><td><button class="btn-edit" onclick="editWorker(${i})">تعديل</button> <button class="btn-danger" onclick="deleteWorker(${i})">حذف</button></td></tr>`; }); }
function deleteWorker(i){ if(confirm('حذف الموظفة؟')){ workers.splice(i,1); saveData(); renderWorkers(); updateContractFormSelects(); } }
function editWorker(i){ const w=workers[i]; if(!w) return; document.getElementById('workerName').value=w.name; document.getElementById('workerPhone').value=w.phone; document.getElementById('workerNationality').value=w.nationality; }

/* ===== Contracts (مبسط للنسخة التجريبية) ===== */
document.getElementById('dailyContractForm').onsubmit = function(e){ e.preventDefault(); const c = { type:'يومي', client: document.getElementById('daily_contractClient').value, clientPhone: document.getElementById('daily_contractClientPhone').value, clientArea: document.getElementById('daily_contractClientArea').value, clientMapUrl: document.getElementById('daily_contractClientMap').value, worker: document.getElementById('daily_contractWorker').value, start: document.getElementById('daily_contractStart').value, end: document.getElementById('daily_contractEnd').value, value: document.getElementById('daily_contractValue').value, payment: document.getElementById('daily_contractPayment').value, notes: document.getElementById('daily_contractNotes').value }; dailyContracts.push(c); saveData(); renderContracts(); this.reset(); renderDailyWeekdayGrid(); };
document.getElementById('monthlyContractForm').onsubmit = function(e){ e.preventDefault(); const c = { type:'شهري', client: document.getElementById('monthly_contractClient').value, clientPhone: document.getElementById('monthly_contractClientPhone').value, clientArea: document.getElementById('monthly_contractClientArea').value, clientMapUrl: document.getElementById('monthly_contractClientMap').value, worker: document.getElementById('monthly_contractWorker').value, period: document.getElementById('monthly_contractPeriod').value||'الكل', start: document.getElementById('monthly_contractStart').value, end: document.getElementById('monthly_contractEnd').value, value: document.getElementById('monthly_contractValue').value, payment: document.getElementById('monthly_contractPayment').value, notes: document.getElementById('monthly_contractNotes').value }; monthlyContracts.push(c); saveData(); renderContracts(); this.reset(); };
function renderContracts(){ const tbodyAll=document.querySelector('#contractsTableAll tbody'); tbodyAll.innerHTML=''; const all=[...dailyContracts,...monthlyContracts]; all.forEach((c,i)=>{ const type=c.type; const endDisplay=c.end? formatDateLocalized(c.end): 'غير منتهي'; tbodyAll.innerHTML+=`<tr><td>${escapeHtml(type)}</td><td>${escapeHtml(c.client||'')}</td><td>${escapeHtml(c.clientPhone||'-')}</td><td>${escapeHtml(c.clientArea||'-')}</td><td>${c.clientMapUrl?`<a target="_blank" href="${escapeHtml(c.clientMapUrl)}">رابط</a>`:'-'}</td><td>${escapeHtml(c.worker||'-')}</td><td>${escapeHtml(c.period||'الكل')}</td><td>${formatDateLocalized(c.start)}</td><td>${escapeHtml(endDisplay)}</td><td>${escapeHtml(c.value||'')}</td><td>${escapeHtml(c.payment||'')}</td><td>${escapeHtml(c.notes||'')}</td><td><button class="btn-edit" onclick="openEditFromAll(${i})">تعديل</button></td></tr>`; }); }

/* ===== واجهة الشبكة وتهيئة عناصر التحكم الصغيرة ===== */
function renderDailyWeekdayGrid(){ const container=document.getElementById('daily_weekdays_grid'); if(!container) return; const names=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']; let html=''; for(let i=0;i<7;i++){ html += `<div class="weekday-row"><div class="day-name">${names[i]}</div><label><input type="checkbox" id="daily_day_${i}_morning"> صباحية</label> <label><input type="checkbox" id="daily_day_${i}_evening"> مسائية</label></div>`; } container.innerHTML=html; }
function updateContractFormSelects(){ const clientOptions = clients.map(c=>`<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('') || `<option value="">-- لا توجد عناصر --</option>`; const workerOptions = workers.map(w=>`<option value="${escapeHtml(w.name)}">${escapeHtml(w.name)}</option>`).join('') || `<option value="">-- لا توجد عناصر --</option>`; document.getElementById('daily_contractWorker').innerHTML = workerOptions; document.getElementById('monthly_contractWorker').innerHTML = workerOptions; document.getElementById('daily_contractClient').innerHTML = clientOptions; document.getElementById('monthly_contractClient').innerHTML = clientOptions; document.getElementById('manualWorker').innerHTML = workerOptions; document.getElementById('dailyWorker').innerHTML = `<option value="">الكل</option>` + workers.map(w=>`<option value="${escapeHtml(w.name)}">${escapeHtml(w.name)}</option>`).join(''); const clientList = document.getElementById('clientList'); clientList.innerHTML = clients.map(c => `<option value="${escapeHtml(c.name)}">`).join(''); }

/* ===== جدول الأعمال اليومي بسيط للعرض ===== */
function renderDailySchedule(){
  const dateStr = document.getElementById('dailyDate').value; if(!dateStr) return;
  const tbody = document.querySelector('#dailyScheduleTable tbody'); tbody.innerHTML = '';
  const rows = manualEntries.filter(m=>m.date===dateStr).concat(tasks.filter(t=>t.date===dateStr));
  if(rows.length===0){ tbody.innerHTML = `<tr><td colspan="14">لا توجد مهام لهذا التاريخ.</td></tr>`; return; }
  rows.forEach(r=>{ tbody.innerHTML+=`<tr><td>${formatDateLocalized(r.date)}</td><td>${escapeHtml(r.client||r.client)}</td><td>${escapeHtml(r.worker||'-')}</td><td class="period-label">${escapeHtml(r.period||'-')}</td><td>${escapeHtml(r.phone||'-')}</td><td>${escapeHtml(r.area||'-')}</td><td>${escapeHtml(r.driver||'-')}</td><td>${escapeHtml(r.amount||'-')}</td><td>${escapeHtml(r.paymentStatus||'-')}</td><td>${escapeHtml(r.paymentMethod||'-')}</td><td>${escapeHtml(r.hours||'-')}</td><td>${escapeHtml(r.notes||'-')}</td><td>${escapeHtml(r.source||'')}</td><td>-</td></tr>`; });
}

/* ===== أدوات الواجهة: التنقل بين الأقسام وأحداث الأزرار ===== */
document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click', e=>{
  document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
  e.target.classList.add('active');
  const id = e.target.getAttribute('data-section');
  document.querySelectorAll('.panel').forEach(p=>p.style.display='none');
  const show = document.getElementById(id); if(show) show.style.display='block';
  if(id === 'dailyScheduleSection') updateDailyControls();
}));
document.getElementById('gotoClients').onclick = ()=>document.querySelector('[data-section="clientsSection"]').click();
document.getElementById('gotoWorkers').onclick = ()=>document.querySelector('[data-section="workersSection"]').click();
document.getElementById('gotoContracts').onclick = ()=>document.querySelector('[data-section="contractsSection"]').click();
document.getElementById('gotoSchedule').onclick = ()=>document.querySelector('[data-section="dailyScheduleSection"]').click();
document.getElementById('gotoDailyTask').onclick = ()=>{ document.querySelector('[data-section="dailyScheduleSection"]').click(); document.getElementById('manualDate').focus(); };

/* ===== وظائف مساعدة للنشر: تصدير Excel مبسط ===== */
function tableToExcel(tableId, filename='export'){
  const table = document.getElementById(tableId);
  if(!table) return alert('لا يوجد جدول للتصدير');
  const html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>'+table.outerHTML+'</body></html>';
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename + '.xls'; a.click(); URL.revokeObjectURL(url);
}
document.getElementById('exportExcel').onclick = ()=>tableToExcel('clientsTable','clients');

/* ===== تحديث تحكمات اليومية ===== */
function updateDailyControls(){ if(!document.getElementById('dailyDate').value) document.getElementById('dailyDate').value = new Date().toISOString().slice(0,10); renderDailySchedule(); }

/* ===== تهيئة صفحة عند التحميل ===== */
function init(){
  renderDailyWeekdayGrid();
  loadData();
  // ربط أزرار التصدير في أماكن متعددة
  document.getElementById('btnExportClients').onclick = ()=>tableToExcel('clientsTable','clients');
  document.getElementById('btnExportWorkers').onclick = ()=>tableToExcel('workersTable','workers');
  document.getElementById('btnExportContracts').onclick = ()=>tableToExcel('contractsTableAll','contracts');
  document.getElementById('btnRenderDaily').onclick = renderDailySchedule;
  document.getElementById('btnRenderWeek').onclick = ()=>{ alert('عرض الأسبوع (تجريبي)'); };
  document.getElementById('btnGeneratePlan').onclick = ()=>{ alert('إنشاء خطة تلقائية من العقود (تجريبي)'); };
  document.getElementById('btnLogin').onclick = ()=>{ alert('نموذج تسجيل الدخول (تجريبي)'); };
}
window.addEventListener('load', init);

/* ===== وظائف بسيطة تحتاج لاحقاً للتكامل الكامل (موجودة في الكود الأصلي) ===== */
function openEditFromAll(idx){ alert('فتح التعديل للعقد رقم ' + idx); }
