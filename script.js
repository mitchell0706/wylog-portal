// ============================================================
// SECURECHECK PRO v3.0
// - IndexedDB local (funciona sin internet)
// - Supabase sync en tiempo real (cuando hay internet)
// - Respaldo firmado SHA-256 cada 15 min (antirrobo)
// - Cola offline: guarda y sincroniza cuando vuelve conexión
// - Drawer admin: muestra resumen real de empleados activos
// ============================================================

// ============ CONFIGURACIÓN — EDITAR ESTOS VALORES ============
const TALLER={lat:34.1940,lng:-118.5834};
const RADIO=0.2;
// ⚠️ El usuario "admin" existe en la tabla employees de Supabase.
// No se guarda la contraseña en el código. La identidad "admin" solo
// sirve para habilitar la UI de administración tras un login verificado.
const ADMIN_USER='admin';
// ADMIN_PASS eliminado por seguridad — login ahora contra DB vía verify_login RPC
const MAX_USERS_PER_DEVICE=2;
const MAX_FACE_ATTEMPTS=5;
const LUNCH_MINUTES=30;
const LUNCH_TOLERANCE_MINUTES=5;
const FACE_MATCH_THRESHOLD=0.5;
const BACKUP_INTERVAL_MS=15*60*1000; // 15 minutos

// ⚠️ SUPABASE — Reemplaza con tus credenciales al crear el proyecto
// Instrucciones abajo en este mismo archivo (busca "SETUP SUPABASE")
const SUPABASE_URL='https://zcufbrdsapraplnytwbd.supabase.co';       // ej: https://xyzabc.supabase.co
const SUPABASE_ANON_KEY='sb_publishable_KH9Z7o1Uo7agMI8SGLbQrA_-wWRMHO4'; // ej: eyJhbGci...
// ==============================================================

// face-api.js eliminado — ahora se usa biometría nativa del dispositivo

// ============================================================
// IDIOMA / LANGUAGE  (ES | EN)
// ============================================================
// Auto-detect device system language on first launch (if no preference saved yet)
let currentLang=localStorage.getItem('sc_lang')||
  ((navigator.language||navigator.userLanguage||'es').toLowerCase().startsWith('en')?'en':'es');

const TRANSLATIONS={
  es:{
    // Login
    appSubtitle:'v3.0 · Sistema de Control de Asistencia',
    username:'Usuario',usernamePh:'nombre de usuario',
    password:'Contraseña',
    loginBtn:'Iniciar Sesión',
    loginFooter:'Sistema de control de asistencia seguro',
    // Change password screen
    firstAccess:'Primer acceso',
    firstAccessSub:'Crea tu contraseña personal para continuar',
    newPassword:'Nueva contraseña',minChars:'Mínimo 4 caracteres',
    confirmPassword:'Confirmar contraseña',repeatPass:'Repite la contraseña',
    saveAndContinue:'Guardar y continuar',
    // Admin tabs
    tabDashboard:'Dashboard',tabRecords:'Registros',tabLive:'En vivo',
    tabEmployees:'Empleados',tabReport:'Reporte',tabCode:'Código',tabConfig:'Config',
    // Admin panel
    adminPanelTitle:'Panel Admin',
    searchPlaceholder:'Buscar trabajador por nombre o ID...',
    addEmployee:'Crear empleado',
    addNewEmp:'Agregar nuevo empleado',
    newUser:'Usuario',newPass:'Contraseña',
    userLabel:'Usuario',usernamePh2:'nombre.apellido',
    tempPassLabel:'Contraseña temp.',tempPassPh2:'••••••',
    createAccount:'Crear cuenta',
    registeredEmps:'Empleados registrados',
    activityToday:'Actividad hoy',
    activeNow:'Empleados activos ahora',
    // Employee actions
    resetPassTitle:'Restablecer contraseña',
    resetPassFor:'Nueva contraseña para',
    resetPassSub:'El empleado deberá crear una nueva contraseña en su próximo ingreso.',
    tempPass:'Contraseña temporal',tempPassPh:'ej: temp1234',
    resetPassBtn:'Restablecer',
    cancel:'Cancelar',
    delete:'Eliminar',
    // Work cycle buttons
    btnEntrada:'ENTRADA',btnEntrSub:'Iniciar jornada',
    btnLunch:'ALMUERZO',btnLunchSub:'Tomar descanso',
    btnReturn:'VOLVER',btnReturnSub:'Regresar al trabajo',
    btnSalida:'SALIDA',btnSalSub:'Terminar jornada',
    tapConfirm:'Toca para confirmar',
    todayRecords:'Registros de hoy',
    noEntryToday:'Sin registro de entrada hoy',
    shiftDone:'JORNADA COMPLETADA — Toca para desbloquear',
    // Report period buttons
    periodToday:'Hoy',periodWeek:'Semana',periodMonth:'Mes',
    selectPeriod:'Seleccionar período',
    searchEmp:'Buscar empleado...',
    // GPS
    gpsOk:'Dentro del área de trabajo',
    gpsOut:'Fuera del área',gpsWait:'Obteniendo ubicación...',
    // Toasts / errors
    passResetOk:'✓ Contraseña restablecida. El empleado deberá crear una nueva.',
    passResetErr:'Error al restablecer contraseña',
    empCreated:'✓ Empleado creado',empDeleted:'Empleado eliminado',
    passMin:'Mínimo 4 caracteres',passNoMatch:'Las contraseñas no coinciden',
    fillAll:'Completa usuario y contraseña',
    loginErr:'Usuario o contraseña incorrectos',
    loginErrConn:'Error de conexión',
    // Report / export
    reportTitle:'Reporte de Asistencia',periodFrom:'Desde',periodTo:'Hasta',
    generate:'Generar',exportPDF:'Exportar PDF',exportCSV:'Exportar CSV',
    // Table headers
    thEmployee:'Empleado',thDays:'Días',thGross:'Horas Brutas',
    thNet:'Horas Netas',thLunch:'Almuerzo',
    // Live tab
    liveEmpty:'Nadie activo en este momento.',
    liveTitle:'Empleados activos ahora',
    // Dashboard
    dashPresent:'Presentes hoy',dashAbsent:'Ausentes',
    dashOnTime:'A tiempo',dashLate:'Tarde',
    // Code tab
    codeTitle:'Código de emergencia',codeCopy:'Copiar código',
    codeExpires:'Expira en',codeSecs:'seg',
    // Misc
    noRecords:'Sin registros',loading:'Cargando...',
    area:'Área',hours:'horas',days:'días',
    syncLabel:'Sync',
  },
  en:{
    // Login
    appSubtitle:'v3.0 · Attendance Control System',
    username:'Username',usernamePh:'username',
    password:'Password',
    loginBtn:'Log In',
    loginFooter:'Secure attendance control system',
    // Change password screen
    firstAccess:'First access',
    firstAccessSub:'Create your personal password to continue',
    newPassword:'New password',minChars:'Minimum 4 characters',
    confirmPassword:'Confirm password',repeatPass:'Repeat password',
    saveAndContinue:'Save and continue',
    // Admin tabs
    tabDashboard:'Dashboard',tabRecords:'Records',tabLive:'Live',
    tabEmployees:'Employees',tabReport:'Report',tabCode:'Code',tabConfig:'Config',
    // Admin panel
    adminPanelTitle:'Admin Panel',
    searchPlaceholder:'Search employee by name or ID...',
    addEmployee:'Add employee',
    addNewEmp:'Add new employee',
    newUser:'Username',newPass:'Password',
    userLabel:'Username',usernamePh2:'first.last',
    tempPassLabel:'Temp. password',tempPassPh2:'••••••',
    createAccount:'Create account',
    registeredEmps:'Registered employees',
    activityToday:"Today's activity",
    activeNow:'Active employees now',
    // Employee actions
    resetPassTitle:'Reset password',
    resetPassFor:'New password for',
    resetPassSub:'The employee will be required to create a new password on next login.',
    tempPass:'Temporary password',tempPassPh:'e.g. temp1234',
    resetPassBtn:'Reset',
    cancel:'Cancel',
    delete:'Delete',
    // Work cycle buttons
    btnEntrada:'CLOCK IN',btnEntrSub:'Start shift',
    btnLunch:'LUNCH',btnLunchSub:'Take break',
    btnReturn:'RETURN',btnReturnSub:'Back to work',
    btnSalida:'CLOCK OUT',btnSalSub:'End shift',
    tapConfirm:'Tap to confirm',
    todayRecords:"Today's records",
    noEntryToday:'No clock-in today',
    shiftDone:'SHIFT COMPLETE — Tap to unlock',
    // Report period buttons
    periodToday:'Today',periodWeek:'Week',periodMonth:'Month',
    selectPeriod:'Select period',
    searchEmp:'Search employee...',
    // GPS
    gpsOk:'Inside work area',
    gpsOut:'Outside area',gpsWait:'Getting location...',
    // Toasts / errors
    passResetOk:'✓ Password reset. Employee must create a new one.',
    passResetErr:'Error resetting password',
    empCreated:'✓ Employee created',empDeleted:'Employee deleted',
    passMin:'Minimum 4 characters',passNoMatch:'Passwords do not match',
    fillAll:'Enter username and password',
    loginErr:'Incorrect username or password',
    loginErrConn:'Connection error',
    // Report / export
    reportTitle:'Attendance Report',periodFrom:'From',periodTo:'To',
    generate:'Generate',exportPDF:'Export PDF',exportCSV:'Export CSV',
    // Table headers
    thEmployee:'Employee',thDays:'Days',thGross:'Gross Hours',
    thNet:'Net Hours',thLunch:'Lunch',
    // Live tab
    liveEmpty:'No active employees right now.',
    liveTitle:'Active employees now',
    // Dashboard
    dashPresent:'Present today',dashAbsent:'Absent',
    dashOnTime:'On time',dashLate:'Late',
    // Code tab
    codeTitle:'Emergency code',codeCopy:'Copy code',
    codeExpires:'Expires in',codeSecs:'sec',
    // Misc
    noRecords:'No records',loading:'Loading...',
    area:'Area',hours:'hours',days:'days',
    syncLabel:'Sync',
  }
};

function t(key){
  return (TRANSLATIONS[currentLang]&&TRANSLATIONS[currentLang][key])
      || (TRANSLATIONS['es'][key])
      || key;
}

function applyLang(){
  // Update all data-i18n text content
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.getAttribute('data-i18n');
    const val=t(key);
    if(val) el.textContent=val;
  });
  // Update all data-i18n-ph placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    const key=el.getAttribute('data-i18n-ph');
    const val=t(key);
    if(val) el.placeholder=val;
  });
  // Update lang label buttons
  const nextLang=currentLang==='es'?'EN':'ES';
  document.querySelectorAll('[id^="lang-label"]').forEach(el=>{el.textContent=nextLang;});
  // Update html lang attribute
  document.getElementById('html-root')?.setAttribute('lang',currentLang);
  // Update dynamic work cycle buttons if visible
  _updateWorkBtnsLang();
}

function _updateWorkBtnsLang(){
  // All work button text is now handled via data-i18n in applyLang()
  // This function kept for compatibility but applyLang() covers everything
}

function toggleLang(){
  currentLang=currentLang==='es'?'en':'es';
  localStorage.setItem('sc_lang',currentLang);
  applyLang();
}

// ============================================================
// ADMIN — RESET EMPLOYEE PASSWORD
// ============================================================
let _pendingResetUser=null;

function resetEmpPassword(u){
  _pendingResetUser=u;
  const nm=document.getElementById('modal-reset-emp-name');
  if(nm) nm.textContent=u;
  const inp=document.getElementById('reset-pass-inp');
  if(inp) inp.value='';
  applyLang(); // apply translations to modal
  openModal('modal-reset-pass');
}

async function confirmResetEmpPassword(){
  const u=_pendingResetUser;
  if(!u) return;
  const inp=document.getElementById('reset-pass-inp');
  const newPass=(inp?.value||'').trim();
  if(!newPass||newPass.length<4){showToast(t('passMin'));return;}

  closeModal('modal-reset-pass');
  showLoader(t('loading'));
  try{
    const newHash=await hashPass(newPass);
    // Update locally + Supabase: new hash + firstLogin=true (forces password change on next login)
    await updateEmployee(u,{pass:newPass,pass_hash:newHash,firstLogin:true});
    // Also PATCH directly to Supabase to ensure it propagates
    if(supabaseAvailable){
      await sbCall(`/rest/v1/employees?usuario=eq.${encodeURIComponent(u)}`,{
        method:'PATCH',
        prefer:'return=minimal',
        body:JSON.stringify({pass_hash:newHash,first_login:true})
      });
    }
    logAudit('PASSWORD_RESET',u);
    hideLoader();
    showToast(t('passResetOk'));
  }catch(e){
    hideLoader();
    console.error('resetEmpPassword error:',e);
    showToast(t('passResetErr'));
  }
  _pendingResetUser=null;
}

let currentUser=null,isAdmin=false,userCoords=null,gpsOk=false;
let pendingTipo=null,cameraStream=null;
let clockInt=null,codeInt=null,lunchInt=null,backupInt=null,syncInt=null;
let gpsWatchId=null;
let allRecords=[];
let employees={};
let deviceId=localStorage.getItem('sc_device_id')||''; // se actualiza con hardware ID en init()
let currentDeviceModel='Desconocido'; // se detecta en init() con Capacitor Device API
let lunchStartTime=null,lunchExtended=0;
let biometricReady=false;
let db=null;
let supabaseAvailable=false;
let syncQueue=[];
let activeCycleStep=0; // rastrea el paso activo del ciclo para proteger la sesión

// ============================================================
// INDEXEDDB — Base de datos local (versión 4)
// ============================================================
function initDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open('SecureCheckPro',5);
    req.onupgradeneeded=e=>{
      const d=e.target.result;
      if(!d.objectStoreNames.contains('employees')){
        d.createObjectStore('employees',{keyPath:'usuario'});
      }
      if(!d.objectStoreNames.contains('records')){
        const rs=d.createObjectStore('records',{keyPath:'id',autoIncrement:true});
        rs.createIndex('usuario','usuario',{unique:false});
        rs.createIndex('fecha','fecha',{unique:false});
        rs.createIndex('tipo','tipo',{unique:false});
        rs.createIndex('synced','synced',{unique:false});
      }
      if(!d.objectStoreNames.contains('faceData')){
        d.createObjectStore('faceData',{keyPath:'usuario'});
      }
      if(!d.objectStoreNames.contains('cycleState')){
        d.createObjectStore('cycleState',{keyPath:'usuario'});
      }
      if(!d.objectStoreNames.contains('settings')){
        d.createObjectStore('settings',{keyPath:'key'});
      }
      if(!d.objectStoreNames.contains('backups')){
        d.createObjectStore('backups',{keyPath:'id',autoIncrement:true});
      }
      if(!d.objectStoreNames.contains('syncQueue')){
        d.createObjectStore('syncQueue',{keyPath:'id',autoIncrement:true});
      }
      // v5: proyectos para auditoría
      if(!d.objectStoreNames.contains('proyectos')){
        d.createObjectStore('proyectos',{keyPath:'id',autoIncrement:true});
      }
    };
    req.onsuccess=e=>{db=e.target.result;resolve(db);};
    req.onerror=()=>reject(req.error);
  });
}

function dbGet(store,key){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly');
    const req=tx.objectStore(store).get(key);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
function dbPut(store,obj){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');
    const req=tx.objectStore(store).put(obj);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
function dbDelete(store,key){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');
    const req=tx.objectStore(store).delete(key);
    req.onsuccess=()=>resolve();
    req.onerror=()=>reject(req.error);
  });
}
function dbGetAll(store){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly');
    const req=tx.objectStore(store).getAll();
    req.onsuccess=()=>resolve(req.result||[]);
    req.onerror=()=>reject(req.error);
  });
}
function dbGetByIndex(store,indexName,value){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly');
    const idx=tx.objectStore(store).index(indexName);
    const req=idx.getAll(value);
    req.onsuccess=()=>resolve(req.result||[]);
    req.onerror=()=>reject(req.error);
  });
}
function dbAdd(store,obj){
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');
    const req=tx.objectStore(store).add(obj);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

// ============================================================
// SHA-256 — Firma digital para integridad de datos
// ============================================================
async function sha256(text){
  if(typeof crypto!=='undefined'&&crypto.subtle){
    const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  // Fallback simple si crypto.subtle no está disponible
  let hash=0;
  for(let i=0;i<text.length;i++){hash=((hash<<5)-hash)+text.charCodeAt(i);hash|=0;}
  return 'fallback_'+Math.abs(hash).toString(16);
}

async function signRecord(record){
  const data=JSON.stringify({
    usuario:record.usuario,
    tipo:record.tipo,
    fecha:record.fecha,
    hora:record.hora,
    timestamp:record.timestamp,
    coords:record.coords,
    device:record.device
  });
  return await sha256(data+'|SECURECHECK_SALT_2026');
}

async function verifyRecord(record){
  if(!record.firma)return true; // registros viejos sin firma son válidos
  const expected=await signRecord(record);
  return expected===record.firma;
}

// ============================================================
// BACKUP AUTOMÁTICO — cada 15 min, firmado e inalterable
// ============================================================
async function createSignedBackup(){
  try{
    const records=await getAllRecords();
    const emps=await dbGetAll('employees');
    const snapshot={
      version:'3.0',
      deviceId,
      timestamp:new Date().toISOString(),
      totalRecords:records.length,
      records:records,
      employees:emps.map(e=>({...e,pass:'[PROTECTED]',biometricId:'[PROTECTED]'}))
    };
    // Firmar todo el snapshot
    const snapshotStr=JSON.stringify(snapshot);
    const firma=await sha256(snapshotStr+'|BACKUP_INTEGRITY_KEY');
    const backup={
      timestamp:snapshot.timestamp,
      firma,
      deviceId,
      totalRecords:records.length,
      data:snapshotStr
    };
    // Guardar en IndexedDB (máximo 96 backups = 24h de historial)
    const all=await dbGetAll('backups');
    if(all.length>=96){
      // Borrar el más antiguo
      const oldest=all.sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp))[0];
      if(oldest&&oldest.id)await dbDelete('backups',oldest.id);
    }
    await dbAdd('backups',backup);
    // Guardar también en localStorage como capa adicional
    try{
      localStorage.setItem('sc_last_backup_'+deviceId,JSON.stringify({
        timestamp:backup.timestamp,
        firma:backup.firma,
        totalRecords:backup.totalRecords
      }));
    }catch(e){}
    console.log('✓ Backup firmado creado:',backup.timestamp,'registros:',backup.totalRecords);
    // Intentar subir a Supabase si hay conexión
    if(supabaseAvailable&&SUPABASE_URL){
      await uploadBackupToSupabase(backup);
    }
    return backup;
  }catch(e){
    console.error('Error creando backup:',e);
    return null;
  }
}

async function verifyLastBackup(){
  try{
    const all=await dbGetAll('backups');
    if(!all.length)return{ok:false,msg:'Sin backups'};
    const last=all.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp))[0];
    const expected=await sha256(last.data+'|BACKUP_INTEGRITY_KEY');
    const ok=expected===last.firma;
    return{ok,timestamp:last.timestamp,totalRecords:last.totalRecords,
      msg:ok?'✓ Integridad verificada':'⚠ ADVERTENCIA: Backup modificado externamente'};
  }catch(e){return{ok:false,msg:'Error verificando backup'};}
}

async function getLastBackups(limit=5){
  const all=await dbGetAll('backups');
  return all.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).slice(0,limit);
}

function startBackupSchedule(){
  clearInterval(backupInt);
  // Primer backup inmediato
  createSignedBackup();
  // Luego cada 15 minutos
  backupInt=setInterval(createSignedBackup,BACKUP_INTERVAL_MS);
}

// ============================================================
// SUPABASE — Sincronización en la nube
// ============================================================

// ============================================================
// BITÁCORA — AUDIT TRAIL (Append-Only, Supabase)
// ============================================================
async function logAudit(action, targetUser, details){
  // Best-effort: solo se registra cuando hay conexión
  if(!supabaseAvailable) return;
  try{
    await sbCall('/rest/v1/audit_log',{
      method:'POST',
      prefer:'return=minimal',
      body:JSON.stringify({
        admin_user:currentUser||'admin',
        action,
        target_user:targetUser||null,
        details:details||null,
        device_id:deviceId||null
      })
    });
  }catch(e){ console.warn('[Bitácora] No se pudo registrar:',action,e.message); }
}

const AUDIT_META={
  'ADMIN_LOGIN':      {color:'#3b82f6',bg:'rgba(59,130,246,0.12)',  label:'Login Admin',      icon:'🔑'},
  'EMPLOYEE_CREATED': {color:'#10b981',bg:'rgba(16,185,129,0.12)',  label:'Empleado Creado',  icon:'👤'},
  'EMPLOYEE_DELETED': {color:'#ef4444',bg:'rgba(239,68,68,0.12)',   label:'Empleado Eliminado',icon:'🗑️'},
  'DEVICE_UNLINK':    {color:'#f97316',bg:'rgba(249,115,22,0.12)',  label:'Dispositivo Desvinculado',icon:'📵'},
  'PASSWORD_RESET':   {color:'#8b5cf6',bg:'rgba(139,92,246,0.12)', label:'Contraseña Reseteada',icon:'🔒'},
  'PAYMENT_MARKED':   {color:'#10b981',bg:'rgba(16,185,129,0.12)', label:'Pago Confirmado',   icon:'✅'},
  'PAYMENT_UNMARKED': {color:'#f59e0b',bg:'rgba(245,158,11,0.12)', label:'Pago Revertido',    icon:'↩️'},
  'GPS_EXCEPTION':    {color:'#06b6d4',bg:'rgba(6,182,212,0.12)',   label:'Excepción GPS',     icon:'📍'},
};

let _bitFilter='';

function _bitRelTime(dt){
  const diffMs=Date.now()-dt.getTime();
  const diffMin=Math.floor(diffMs/60000);
  if(diffMin<1)return'hace unos segundos';
  if(diffMin<60)return`hace ${diffMin} min`;
  const diffH=Math.floor(diffMin/60);
  if(diffH<24)return`hace ${diffH}h`;
  return'';
}

function _bitDayLabel(dt){
  const today=new Date();
  const yesterday=new Date(today);yesterday.setDate(today.getDate()-1);
  const isSameDay=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
  if(isSameDay(dt,today))return'Hoy';
  if(isSameDay(dt,yesterday))return'Ayer';
  return dt.toLocaleDateString('es-US',{weekday:'long',month:'long',day:'numeric'});
}

async function renderBitacora(){
  const el=document.getElementById('bitacora-list');
  const countEl=document.getElementById('bit-count');
  if(!el)return;
  if(!supabaseAvailable){
    el.innerHTML=`<div class="bit-empty">⚠️ Sin conexión a Supabase.<br><span style="font-size:11px">La Bitácora requiere internet para funcionar.</span></div>`;
    return;
  }
  el.innerHTML=`<div class="bit-loading">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" style="animation:spin 1s linear infinite;flex-shrink:0"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0" stroke-linecap="round"/></svg>
    Cargando bitácora...
  </div>`;
  try{
    let url='/rest/v1/audit_log?order=created_at.desc&limit=300';
    if(_bitFilter)url+=`&action=eq.${encodeURIComponent(_bitFilter)}`;
    const res=await sbCall(url,{method:'GET',extraHeaders:{'Accept':'application/json','Prefer':''}});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();
    if(!Array.isArray(data)||!data.length){
      el.innerHTML=`<div class="bit-empty">📋 Sin eventos registrados${_bitFilter?' para este filtro':''}.<br><span style="font-size:11px">Los eventos aparecerán aquí cuando el admin realice acciones.</span></div>`;
      if(countEl)countEl.textContent='0 eventos';
      return;
    }
    const nowStr=new Date().toLocaleTimeString('es-US',{hour:'2-digit',minute:'2-digit',hour12:true});
    if(countEl)countEl.textContent=data.length+(data.length>=300?'+':'')+' eventos · '+nowStr;
    // Agrupar por día para insertar separadores
    let lastDayKey='';
    const rows=data.map(r=>{
      const meta=AUDIT_META[r.action]||{color:'#94a3b8',bg:'rgba(148,163,184,0.08)',label:r.action,icon:'📌'};
      const dt=new Date(r.created_at);
      const dayKey=dt.toDateString();
      const timeStr=dt.toLocaleTimeString('es-US',{hour:'2-digit',minute:'2-digit',hour12:true});
      const relTime=_bitRelTime(dt);
      const detailStr=r.details
        ?Object.entries(r.details).filter(([,v])=>v!=null&&v!=='').map(([k,v])=>`${k}: <b>${String(v).slice(0,80)}</b>`).join(' &nbsp;·&nbsp; ')
        :'';
      const devStr=r.device_id
        ?`<span class="bit-device" title="Device: ${r.device_id}">${r.device_id.slice(0,6)}…</span>`
        :'';
      let sep='';
      if(dayKey!==lastDayKey){
        sep=`<div class="bit-day-sep"><span>${_bitDayLabel(dt)}</span></div>`;
        lastDayKey=dayKey;
      }
      return sep+`<div class="bit-row">
        <div class="bit-left">
          <span class="bit-badge" style="background:${meta.bg};color:${meta.color};border-color:${meta.color}44">${meta.icon} ${meta.label}</span>
          <div class="bit-who">👤 <b>${r.admin_user}</b>${r.target_user?` → <span class="bit-target">${r.target_user}</span>`:''} ${devStr}</div>
          ${detailStr?`<div class="bit-detail">${detailStr}</div>`:''}
        </div>
        <div class="bit-when">
          <span class="bit-time">${timeStr}</span>
          ${relTime?`<span class="bit-rel">${relTime}</span>`:''}
        </div>
      </div>`;
    }).join('');
    el.innerHTML=rows;
  }catch(e){
    el.innerHTML=`<div class="bit-empty">⚠️ Error al cargar: ${e.message}</div>`;
    console.error('[Bitácora]',e);
  }
}

function setBitFilter(f){
  _bitFilter=f;
  document.querySelectorAll('.bit-filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.f===f));
  renderBitacora();
}

// Helper para llamadas Supabase REST
function sbCall(path,opts={}){
  return fetch(SUPABASE_URL+path,{
    ...opts,
    headers:{
      'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY,
      'Content-Type':'application/json','Prefer':opts.prefer||'',
      ...(opts.extraHeaders||{})
    }
  });
}

// ── SYNC PROYECTOS ────────────────────────────────────────────
async function syncProyectoToSupabase(p){
  if(!supabaseAvailable)return null;
  try{
    const payload={
      nombre:p.nombre,fecha_inicio:p.fechaInicio||null,fecha_fin:p.fechaFin||null,
      estado:p.estado||'activo',notas:p.notas||'',
      empleados:p.empleados||[],horas_cache:parseFloat(p.horasCache||0)
    };
    if(p.supabaseId){
      await sbCall('/rest/v1/proyectos?id=eq.'+p.supabaseId,{method:'PATCH',prefer:'return=minimal',body:JSON.stringify(payload)});
      return p.supabaseId;
    }else{
      const r=await sbCall('/rest/v1/proyectos',{method:'POST',prefer:'return=representation',body:JSON.stringify(payload)});
      if(r.ok){const d=await r.json();return d[0]?.id;}
      return null;
    }
  }catch(e){console.warn('syncProyectoToSupabase:',e);return null;}
}

async function syncFotoToSupabase(proySupabaseId,dataUrl,nota,usuario,hora,fecha){
  if(!supabaseAvailable||!proySupabaseId)return false;
  try{
    const compressed=await compressImageForSync(dataUrl);
    const r=await sbCall('/rest/v1/proyecto_fotos',{
      method:'POST',prefer:'return=minimal',
      body:JSON.stringify({proyecto_id:proySupabaseId,data_url:compressed,nota:nota||'',subido_por:usuario,hora,fecha})
    });
    return r.ok||r.status===201;
  }catch(e){console.warn('syncFotoToSupabase:',e);return false;}
}

async function compressImageForSync(dataUrl,maxPx=800,quality=0.7){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      let w=img.width,h=img.height;
      if(Math.max(w,h)>maxPx){if(w>h){h=Math.round(h*maxPx/w);w=maxPx;}else{w=Math.round(w*maxPx/h);h=maxPx;}}
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      resolve(canvas.toDataURL('image/jpeg',quality));
    };
    img.onerror=()=>resolve(dataUrl);
    img.src=dataUrl;
  });
}

async function fetchProyectosFromSupabase(){
  if(!supabaseAvailable)return;
  try{
    const r=await sbCall('/rest/v1/proyectos?select=*,proyecto_fotos(*)&order=id.desc');
    if(!r.ok)return;
    const remoteProy=await r.json();
    for(const sp of remoteProy){
      const all=await getAllProyectos();
      const existing=all.find(p=>p.supabaseId===sp.id);
      const fotos=(sp.proyecto_fotos||[]).map(f=>({
        dataUrl:f.data_url,nota:f.nota||'',hora:f.hora||'',fecha:f.fecha||'',
        subidoPor:f.subido_por||'',supabaseFotoId:f.id,id:f.id
      }));
      const localP={
        ...(existing||{}),
        supabaseId:sp.id,
        nombre:sp.nombre,fechaInicio:sp.fecha_inicio||null,fechaFin:sp.fecha_fin||null,
        estado:sp.estado||'activo',notas:sp.notas||'',empleados:sp.empleados||[],
        horasCache:(sp.horas_cache||0).toFixed(2),fechaCreacion:sp.created_at,fotos
      };
      if(existing){localP.id=existing.id;await updateProyecto(localP);}
      else{const newId=await saveProyecto(localP);localP.id=newId;}
    }
    console.log('✓ Proyectos sincronizados desde Supabase:',remoteProy.length);
  }catch(e){console.warn('fetchProyectosFromSupabase:',e);}
}

// ============================================================
// KILL-SWITCH — Verificar si el sistema está cerrado por admin
// ============================================================
let _ksCache={active:false,ts:0,note:''};
const KS_CACHE_MS=60000; // refrescar cada 60 segundos

async function checkKillSwitch(){
  // ✅ ADMIN EXENTO — nunca bloqueado por kill-switch
  if(isAdmin||currentUser===ADMIN_USER) return false;
  // Sin conexión → permitir (no bloquear offline)
  if(!supabaseAvailable||!SUPABASE_URL) return false;

  const now=Date.now();
  // Usar caché si es reciente
  if(now-_ksCache.ts < KS_CACHE_MS){
    if(_ksCache.active){ _showKillSwitchBlocked(_ksCache.note); return true; }
    return false;
  }

  try{
    const res=await fetch(SUPABASE_URL+'/rest/v1/rpc/get_kill_switch',{
      method:'POST',
      headers:{
        'apikey':SUPABASE_ANON_KEY,
        'Authorization':'Bearer '+SUPABASE_ANON_KEY,
        'Content-Type':'application/json'
      },
      body:'{}'
    });
    if(!res.ok) return false; // si falla el RPC, no bloquear
    const data=await res.json();
    const active=data?.active===true||data?.active==='true';
    const note  =data?.note||'';
    _ksCache={active,ts:Date.now(),note};
    if(active){ _showKillSwitchBlocked(note); return true; }
    return false;
  }catch(e){
    console.warn('checkKillSwitch error:',e);
    return false; // en caso de error de red, no bloquear
  }
}

function _showKillSwitchBlocked(note){
  const msg=note
    ?`⛔ Sistema cerrado\n\n"${note}"\n\nContacta al administrador para continuar.`
    :'⛔ Sistema cerrado por administración.\n\nNo se pueden iniciar nuevas jornadas en este momento.';
  // Intentar mostrar en el modal de error si existe, si no usar toast
  const errEl=document.getElementById('modal-range-sub');
  if(errEl){
    errEl.textContent='Sistema cerrado por administración.'+( note?' "'+note+'"':'' );
    openModal('modal-range');
  } else {
    showToast('⛔ Sistema cerrado — '+( note||'contacta al admin' ));
  }
}

// Invalidar caché del kill-switch (llamar después de acción admin)
function ksInvalidateCache(){ _ksCache.ts=0; }

async function checkSupabaseConnection(){
  if(!SUPABASE_URL||!SUPABASE_ANON_KEY){supabaseAvailable=false;return false;}
  try{
    const res=await fetch(SUPABASE_URL+'/rest/v1/records?limit=1',{
      headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY}
    });
    // 200/206 = OK, 406 = tabla existe pero sin datos (PostgREST), ambos confirman conexión
    supabaseAvailable=res.ok||res.status===406||res.status===200;
    return supabaseAvailable;
  }catch(e){supabaseAvailable=false;return false;}
}

// Verifica si el usuario anon tiene permisos de escritura en la tabla records
async function checkInsertPermission(){
  if(!SUPABASE_URL||!SUPABASE_ANON_KEY||!supabaseAvailable)return false;
  try{
    // Hacemos un HEAD o GET para verificar que la tabla acepta escrituras desde anon
    // Usamos un OPTIONS para ver los métodos permitidos
    const res=await fetch(SUPABASE_URL+'/rest/v1/records',{
      method:'HEAD',
      headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY}
    });
    // Si devuelve 200 o 204 (HEAD), la tabla es accesible; si 401/403 hay problema de permisos
    if(res.status===401||res.status===403){
      console.warn('[Permisos] Supabase bloqueó acceso a tabla records. Verifica políticas RLS.');
      return false;
    }
    return true;
  }catch(e){return true;} // asumir OK si hay error de red
}

async function syncRecordToSupabase(record){
  if(!SUPABASE_URL||!SUPABASE_ANON_KEY||!supabaseAvailable)return false;
  // Payload V1 — columnas originales (SIEMPRE presentes en cualquier versión del schema)
  const payloadV1={
    usuario:record.usuario,
    tipo:record.tipo,
    fecha:record.fecha,
    hora:record.hora,
    timestamp:record.timestamp||new Date().toISOString(),
    coords:record.coords||'sin_gps',
    device_id:record.device||deviceId,
    firma:record.firma||null
  };
  // Payload V2 — añade columnas opcionales de supabase_setup_v2.sql
  const payloadV2={
    ...payloadV1,
    device_model:currentDeviceModel||'Desconocido',
    area_trabajo:record.area_trabajo||null,
    horas_bruto:record.horas_bruto||null,
    horas_neto:record.horas_neto||null,
    lunch_descontado:record.lunch_descontado||null,
    proyecto:record.proyecto||null,
    osha_ok:record.osha_ok||false
  };
  const hdrs={
    'apikey':SUPABASE_ANON_KEY,
    'Authorization':'Bearer '+SUPABASE_ANON_KEY,
    'Content-Type':'application/json',
    'Prefer':'resolution=ignore-duplicates,return=minimal'
  };
  try{
    // Intento 1: payload completo V2
    let res=await fetch(SUPABASE_URL+'/rest/v1/records',{method:'POST',headers:hdrs,body:JSON.stringify(payloadV2)});
    if(res.ok||res.status===201||res.status===200||res.status===204)return true;
    const err1=await res.text().catch(()=>'');
    console.warn('[Sync] Intento V2 falló ('+res.status+'):', err1,'— reintentando con payload V1...');
    // Intento 2: payload mínimo V1 (por si el schema no tiene columnas de V2)
    res=await fetch(SUPABASE_URL+'/rest/v1/records',{method:'POST',headers:hdrs,body:JSON.stringify(payloadV1)});
    if(res.ok||res.status===201||res.status===200||res.status===204)return true;
    const err2=await res.text().catch(()=>'');
    console.error('[Sync] ❌ Ambos intentos fallaron ('+res.status+'):', err2);
    if(res.status===401||res.status===403||(err2&&(err2.includes('policy')||err2.includes('permission')))){
      console.error('[Sync] 🔒 RLS bloqueando INSERT en records. Ejecuta en Supabase SQL Editor:\n'+
        "CREATE POLICY \"allow_insert_anon_records\" ON records FOR INSERT TO anon WITH CHECK (true);");
      _syncRlsError=true;
    } else if(err2&&err2.includes('foreign key')){
      console.error('[Sync] 🔗 Foreign key violation — el usuario no existe en tabla employees en Supabase. Ejecuta:\nALTER TABLE records DROP CONSTRAINT IF EXISTS records_usuario_fkey;');
    } else if(err2&&err2.includes('null value')){
      console.error('[Sync] ⚠️ Columna NOT NULL rechazando el INSERT. Revisa el schema de la tabla records.');
    } else {
      console.error('[Sync] Respuesta completa de Supabase:', err2);
    }
    return false;
  }catch(e){
    console.error('[Sync] Error de red:', e);
    return false;
  }
}
let _syncRlsError=false; // bandera interna: detectó error de permisos RLS

async function syncEmployeeToSupabase(emp){
  if(!SUPABASE_URL||!SUPABASE_ANON_KEY)return false;
  try{
    // Incluir contraseña hasheada para que otros dispositivos puedan autenticar
    const passHash=emp.pass_hash||(emp.pass?await hashPass(emp.pass):'');
    const payload={
      usuario:emp.usuario,
      nombre:emp.nombre||emp.usuario,
      face_registered:emp.faceRegistered||false,
      first_login:emp.firstLogin!==false,
      device_id:emp.deviceId||null,
      pass_hash:passHash,
      created_at:emp.createdAt||new Date().toISOString(),
      device_model:emp.deviceModel||currentDeviceModel||'Desconocido',
      last_seen:new Date().toISOString(),
      // Rol asistente — necesario para que otros dispositivos reconozcan el rol
      is_asistente:emp.isAsistente===true||emp.isAsistente==='TRUE'||false
    };
    const res=await fetch(SUPABASE_URL+'/rest/v1/employees',{
      method:'POST',
      headers:{
        'apikey':SUPABASE_ANON_KEY,
        'Authorization':'Bearer '+SUPABASE_ANON_KEY,
        'Content-Type':'application/json',
        'Prefer':'resolution=merge-duplicates,return=minimal'
      },
      body:JSON.stringify(payload)
    });
    return res.ok||res.status===201||res.status===200;
  }catch(e){return false;}
}

async function uploadBackupToSupabase(backup){
  if(!SUPABASE_URL||!SUPABASE_ANON_KEY)return false;
  try{
    const res=await fetch(SUPABASE_URL+'/rest/v1/backups',{
      method:'POST',
      headers:{
        'apikey':SUPABASE_ANON_KEY,
        'Authorization':'Bearer '+SUPABASE_ANON_KEY,
        'Content-Type':'application/json',
        'Prefer':'return=minimal'
      },
      body:JSON.stringify({
        device_id:backup.deviceId,
        timestamp:backup.timestamp,
        firma:backup.firma,
        total_records:backup.totalRecords
        // NO subimos el data completo por privacidad y tamaño
      })
    });
    return res.ok;
  }catch(e){return false;}
}

// Cola offline: sincroniza registros pendientes cuando hay internet
async function processSyncQueue(){
  // Si no hay conexión, intentar reconectar primero antes de rendirse
  if(!supabaseAvailable){
    await checkSupabaseConnection();
    if(!supabaseAvailable)return;
  }
  try{
    const allRecs=await getAllRecords();
    const pending=allRecs.filter(r=>!r.synced_cloud);
    if(!pending.length)return;
    _syncRlsError=false; // resetear bandera antes de intentar
    let synced=0,failed=0;
    for(const r of pending){
      const ok=await syncRecordToSupabase(r);
      if(ok){
        await dbPut('records',{...r,synced_cloud:true});
        synced++;
      }else{
        failed++;
        // Si falla uno, re-check connection y abortar el resto
        await checkSupabaseConnection();
        if(!supabaseAvailable)break;
      }
    }
    if(synced>0){
      console.log('✓ Sincronizados',synced,'registros a Supabase');
      allRecords=await getAllRecords();
      updateSyncStatus();
      if(isAdmin){renderDashboard();renderAdminRecords();renderAdminMap();}
    }
    if(failed>0&&supabaseAvailable){
      // Hay internet pero la escritura falla — posible problema de permisos
      if(_syncRlsError){
        showToast('⚠️ Supabase bloquea escritura — revisa permisos RLS');
      } else {
        showToast('⚠️ Error al subir '+failed+' registro(s) — ver consola');
      }
      updateSyncStatus();
    }
  }catch(e){console.warn('Error procesando cola de sync:',e);}
}

// Descarga registros de Supabase al dispositivo del admin (o cualquier teléfono)
async function fetchRecordsFromSupabase(){
  if(!SUPABASE_URL||!SUPABASE_ANON_KEY||!supabaseAvailable)return false;
  try{
    const res=await fetch(SUPABASE_URL+'/rest/v1/records?select=*&order=timestamp.desc&limit=5000',{
      headers:{
        'apikey':SUPABASE_ANON_KEY,
        'Authorization':'Bearer '+SUPABASE_ANON_KEY
      }
    });
    if(!res.ok)return false;
    const remoteRecs=await res.json();
    const localRecs=await getAllRecords();
    const localFirmas=new Set(localRecs.filter(r=>r.firma).map(r=>r.firma));
    const localTimestamps=new Set(localRecs.filter(r=>r.timestamp).map(r=>r.timestamp));
    // Normalizar hora para comparar (elimina diferencias de espaciado "p. m." vs "p.m.")
    const normalHora=h=>(h||'').replace(/\s+/g,' ').replace(/\. /g,'.').trim();
    const localKeys=new Set(localRecs.map(r=>r.usuario+'|'+r.tipo+'|'+r.fecha+'|'+normalHora(r.hora)));
    let added=0;
    for(const r of remoteRecs){
      // Dedup: firma (más confiable) > timestamp ISO (exacto) > clave compuesta normalizada
      if(r.firma&&localFirmas.has(r.firma))continue;
      if(r.timestamp&&localTimestamps.has(r.timestamp))continue;
      const key=r.usuario+'|'+r.tipo+'|'+r.fecha+'|'+normalHora(r.hora);
      if(localKeys.has(key))continue;
      await dbAdd('records',{
        usuario:r.usuario,
        tipo:r.tipo,
        fecha:r.fecha,
        hora:r.hora,
        timestamp:r.timestamp||new Date().toISOString(),
        coords:r.coords||'sin_gps',
        device:r.device_id||'remoto',
        firma:r.firma||null,
        area_trabajo:r.area_trabajo||null,
        horas_bruto:r.horas_bruto||null,
        horas_neto:r.horas_neto||null,
        lunch_descontado:r.lunch_descontado||null,
        synced_cloud:true
      });
      added++;
    }
    if(added>0){
      allRecords=await getAllRecords();
      console.log('✓ Descargados',added,'registros nuevos de Supabase');
    }
    return true;
  }catch(e){console.warn('Error descargando registros de Supabase:',e);return false;}
}

function updateSyncStatus(){
  const pending=allRecords.filter(r=>!r.synced_cloud).length;
  const el=document.getElementById('dr-pend');
  if(el)el.textContent=pending;
  // Actualizar indicador en panel admin si está visible
  const syncEl=document.getElementById('sync-status-dot');
  if(syncEl){
    syncEl.style.background=supabaseAvailable?'var(--green)':'var(--orange)';
    syncEl.title=supabaseAvailable?'Sincronizado':'Sin conexión — datos guardados localmente';
  }
  // Actualizar chip de sync en pantalla de empleado
  const chipDot=document.getElementById('sync-chip-dot');
  const chipTxt=document.getElementById('sync-chip-txt');
  if(chipDot&&chipTxt){
    if(!supabaseAvailable){
      chipDot.className='sync-chip-dot warn';chipTxt.textContent='Sin red';
    } else if(_syncRlsError){
      chipDot.className='sync-chip-dot err';chipTxt.textContent='Error';
    } else if(pending>0){
      chipDot.className='sync-chip-dot warn';chipTxt.textContent=pending+' pend';
    } else {
      chipDot.className='sync-chip-dot ok';chipTxt.textContent='Sync ✓';
    }
  }
}

// Forzar sincronización manual al tocar el chip de sync
async function forceSyncNow(){
  const chipTxt=document.getElementById('sync-chip-txt');
  if(chipTxt)chipTxt.textContent='...';
  await checkSupabaseConnection();
  if(supabaseAvailable){
    _syncRlsError=false;
    await processSyncQueue();
    showToast(allRecords.filter(r=>!r.synced_cloud).length===0?'✓ Todo sincronizado':'⚠️ Algunos registros no pudieron sincronizarse');
  }else{
    showToast('Sin conexión a internet');
  }
  updateSyncStatus();
}

function startSyncSchedule(){
  clearInterval(syncInt);
  // Intentar sync inmediato al iniciar
  checkSupabaseConnection().then(async ok=>{
    if(ok){
      await processSyncQueue();
      if(isAdmin){
        await fetchRecordsFromSupabase();
        renderDashboard();renderAdminRecords();renderAdminMap();
      }
    }
    updateSyncStatus();
  });
  // Sync cada 30 segundos para actualizaciones en tiempo real
  syncInt=setInterval(async()=>{
    await checkSupabaseConnection();
    if(supabaseAvailable){
      await processSyncQueue();
      if(isAdmin){
        await fetchRecordsFromSupabase();
        await fetchEmployees(); // Sincronizar empleados: refleja altas y bajas desde la web
        renderDashboard();renderAdminRecords();renderAdminMap();
        // Si la pestaña empleados está visible, actualizarla también
        if(document.getElementById('tab-empleados')?.classList.contains('active')) renderEmpList();
      }
    }
    updateSyncStatus();
  },30*1000);
}

// ============================================================
// HELPERS
// ============================================================
async function getDeviceId(){
  // Prioridad 1: ANDROID_ID via Capacitor — persiste aunque el app se desinstale
  try{
    if(window.Capacitor?.Plugins?.Device){
      const info=await window.Capacitor.Plugins.Device.getId();
      if(info&&info.identifier){
        localStorage.setItem('sc_device_id',info.identifier);
        return info.identifier;
      }
    }
  }catch(e){console.warn('[Device] No se pudo obtener hardware ID:',e);}
  // Fallback: ID aleatorio guardado en localStorage (navegador web / emulador)
  let id=localStorage.getItem('sc_device_id');
  if(!id){id='dev_'+Date.now()+'_'+Math.random().toString(36).substring(2,9);localStorage.setItem('sc_device_id',id);}
  return id;
}

// Detecta el modelo del teléfono usando Capacitor Device API
// Si no está disponible (navegador web), parsea el userAgent como fallback
async function detectDeviceModel(){
  try{
    // Capacitor Device plugin (requiere @capacitor/device instalado)
    if(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Device){
      const info=await window.Capacitor.Plugins.Device.getInfo();
      const mfr=(info.manufacturer||'').trim();
      const mdl=(info.model||'').trim();
      // Evita duplicar si el fabricante ya está en el modelo (ej: "Apple iPhone 15")
      const model=mdl.toLowerCase().includes(mfr.toLowerCase())||!mfr?mdl:mfr+' '+mdl;
      if(model&&model.length>2){
        currentDeviceModel=model;
        localStorage.setItem('sc_device_model',model);
        return model;
      }
    }
  }catch(e){console.warn('[Device] Capacitor Device no disponible:',e);}
  // Fallback: parsear userAgent para detectar iPhone/Samsung/etc.
  try{
    const ua=navigator.userAgent||'';
    let model='Desconocido';
    if(/iPhone/.test(ua)){
      const m=ua.match(/iPhone\s*OS\s*([\d_]+)/);
      model='iPhone (iOS '+(m?m[1].replace(/_/g,'.'):'')+')';
    } else if(/iPad/.test(ua)){
      model='iPad';
    } else if(/Android/.test(ua)){
      const m=ua.match(/;\s*([^;)]+)\s*Build\//);
      model=m?m[1].trim():'Android Device';
    }
    currentDeviceModel=model;
    localStorage.setItem('sc_device_model',model);
    return model;
  }catch(e){}
  return 'Desconocido';
}

function getTodayKey(){return new Date().toLocaleDateString('es-US');}

// Normaliza "12:03:42 a. m." / "p.m." / "p. m." → parseable por Date
function parseHora(h){
  if(!h||typeof h!=='string')return null;
  const norm=h.trim()
    .replace(/a\.\s*m\./gi,'AM')
    .replace(/p\.\s*m\./gi,'PM');
  const d=new Date('2000/01/01 '+norm);
  return isNaN(d.getTime())?null:d;
}

// Calcula minutos entre hora de entrada y salida (usando parseHora)
function calcMinsBetween(horaIni,horaFin){
  const ini=parseHora(horaIni);const fin=parseHora(horaFin);
  if(!ini||!fin)return 0;
  let mins=(fin-ini)/60000;
  // Si da negativo, posiblemente cruce de medianoche — añadir 24h
  if(mins<0)mins+=24*60;
  return Math.max(0,mins);
}

// Diferencia en días entre dos claves de fecha "M/D/YYYY"
function dateDiffDays(dateKeyOld, dateKeyNew){
  try{
    const a=new Date(dateKeyOld), b=new Date(dateKeyNew);
    return Math.round((b-a)/86400000);
  }catch(e){ return 99; }
}

// Cierre automático de jornada huérfana (sin Salida).
// Guarda un registro de Salida con horas = 0 y nota de auto-cierre.
async function _autoCloseOrphanJornada(user, orphanDate){
  try{
    const record={
      usuario:user, tipo:'Salida', fecha:orphanDate,
      hora:'00:00 AM', timestamp: new Date(orphanDate).toISOString(),
      coords:'sin_gps', device:deviceId||'unknown',
      synced_cloud:false,
      horas_bruto:'0h 0m', horas_neto:'0h 0m',
      lunch_descontado:'0m',
      area_trabajo:'AUTO-CERRADO', proyecto:null,
      nota:'Jornada cerrada automáticamente por falta de registro de Salida'
    };
    record.firma = await signRecord(record);
    await saveRecord(record);
    if(supabaseAvailable) await syncRecordToSupabase(record);
    console.info('[SecureCheck] Jornada huérfana de',orphanDate,'cerrada automáticamente');
  }catch(e){ console.warn('[SecureCheck] Error al auto-cerrar jornada huérfana:', e); }
}

async function getCycleState(user){
  try{const s=await dbGet('cycleState',user);if(s)return s;}catch(e){}
  return{usuario:user,date:'',step:0,blocked:false};
}
async function saveCycleState(user,state){
  await dbPut('cycleState',{...state,usuario:user});
}
async function getOrResetCycle(user){
  let c=await getCycleState(user);
  const today=getTodayKey();
  if(c.date!==today){
    if(c.step>0&&!c.blocked){
      // Jornada abierta de un día anterior sin Salida.
      // NO auto-cerramos a 0h porque destruye las horas reales del usuario.
      // En su lugar, mantenemos la jornada abierta con la fecha original guardada
      // en `originalDate` para que finalizarMarcacion pueda recuperar la Entrada original.
      // El usuario verá un aviso al volver a la app y podrá presionar Salida normalmente
      // — el cálculo final usará el timestamp ISO original y se recortará a un máximo razonable.
      console.warn('[SecureCheck] Jornada de',c.date,'sigue abierta hasta hoy',today,'— manteniendo estado, fecha actualizada');
      c={...c, originalDate: c.originalDate||c.date, date:today};
    }else{
      c={usuario:user,date:today,step:0,blocked:false};
    }
    await saveCycleState(user,c);
  }
  return c;
}
function getFaceAttempts(user){try{return parseInt(localStorage.getItem('sc_face_attempts_'+user)||'0');}catch(e){return 0;}}
function setFaceAttempts(user,n){try{localStorage.setItem('sc_face_attempts_'+user,String(n));}catch(e){}}
function getLunchOvertime(user,date){try{return JSON.parse(localStorage.getItem('sc_lunch_ot')||'{}')[user+'_'+date]||0;}catch(e){return 0;}}
function setLunchOvertime(user,date,mins){try{const d=JSON.parse(localStorage.getItem('sc_lunch_ot')||'{}');d[user+'_'+date]=mins;localStorage.setItem('sc_lunch_ot',JSON.stringify(d));}catch(e){}}

// ============================================================
// BIOMETRÍA NATIVA — Usa el sensor del dispositivo (huella/cara)
// Igual que el desbloqueo del Samsung S24, iPhone, etc.
// Prioridad: 1) Capacitor BiometricAuth (plugin nativo Android/iOS)
//            2) WebAuthn platform authenticator (fallback web)
// ============================================================

// Verifica si el dispositivo tiene biometría disponible
async function nativeBiometricAvailable(){
  // 1) capacitor-native-biometric — funciona en TODOS los Android (huella + cara)
  const NBio=window.Capacitor?.Plugins?.NativeBiometric;
  if(NBio){
    try{
      const r=await NBio.isAvailable();
      return r.isAvailable===true;
    }catch(e){}
  }
  // 2) @aparajita BiometricAuth (si está instalado como alternativa)
  const plugin=window.Capacitor?.Plugins?.BiometricAuth;
  if(plugin){
    try{
      const r=await plugin.checkBiometry();
      return r.isAvailable===true;
    }catch(e){}
  }
  // 3) WebAuthn platform (solo para desktop/browser, NO funciona en Android WebView)
  if(window.PublicKeyCredential&&!window.Capacitor){
    try{
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }catch(e){}
  }
  return false;
}

// Activa la biometría para el usuario — no hay registro real,
// el dispositivo ya tiene la cara/huella del usuario configurada.
// Solo verificamos que funcione y marcamos como activo.
async function setupNativeBiometric(){
  const statusEl=document.getElementById('bio-setup-status');
  const btnEl=document.getElementById('bio-setup-btn');
  if(statusEl)statusEl.textContent='Verificando disponibilidad...';
  if(btnEl)btnEl.disabled=true;

  const available=await nativeBiometricAvailable();
  if(!available){
    if(statusEl)statusEl.textContent='⚠ Este dispositivo no tiene biometría configurada. Ve a Ajustes del teléfono y activa huella o reconocimiento facial, luego vuelve aquí.';
    if(btnEl){btnEl.disabled=false;btnEl.textContent='Reintentar';}
    return;
  }
  // Hacer una verificación de prueba para confirmar que responde
  if(statusEl)statusEl.textContent='Confirma tu identidad en el teléfono...';
  const ok=await doNativeBiometricVerify('Activar SecureCheck Pro en este dispositivo');
  if(ok){
    await updateEmployee(currentUser,{faceRegistered:true,biometricMethod:'native'});
    biometricReady=true;
    closeModal('modal-bio-setup');
    showToast('✓ Biometría activada — '+getBiometricLabel());
    // Si hay una marcación pendiente, continuar
    if(pendingTipo)await finalizarMarcacion();
  }else{
    if(statusEl)statusEl.textContent='No se pudo verificar. Asegúrate de tener huella/cara configurada en los ajustes del teléfono.';
    if(btnEl){btnEl.disabled=false;btnEl.textContent='Intentar de nuevo';}
  }
}

// Devuelve un nombre descriptivo según lo que tiene el dispositivo
function getBiometricLabel(){
  const plugin=window.Capacitor?.Plugins?.BiometricAuth;
  // En Android los tipos comunes son: fingerprint, face, iris
  // En iOS: faceID, touchID
  // Damos un label genérico si no podemos detectar
  return 'Huella / Reconocimiento facial del dispositivo';
}

// Ejecuta la verificación biométrica nativa — igual que Samsung Pay / apps bancarias
// Funciona con huella dactilar Y reconocimiento facial en TODOS los Android
async function doNativeBiometricVerify(reason){
  // 1) capacitor-native-biometric — usa el BiometricPrompt nativo de Android
  //    Soporta: huella (todos), cara (Honor, Xiaomi, Samsung), iris (Samsung)
  //    Es EXACTAMENTE el mismo sistema que usa Samsung Pay, BBVA, etc.
  const NBio=window.Capacitor?.Plugins?.NativeBiometric;
  if(NBio){
    try{
      await NBio.verifyIdentity({
        reason:reason||'Verifica tu identidad para continuar',
        title:'SecureCheck Pro',
        subtitle:reason||'Verificación de identidad',
        description:'Usa tu huella dactilar o reconocimiento facial',
        negativeButtonText:'Cancelar',
        useFallback:false,
        maxAttempts:3
      });
      return true;
    }catch(e){
      console.warn('NativeBiometric verifyIdentity failed:',e?.message||e);
      // e.message puede ser: 'Cancel', 'Authentication failed', etc.
      return false;
    }
  }
  // 2) @aparajita BiometricAuth (si está instalado)
  const plugin=window.Capacitor?.Plugins?.BiometricAuth;
  if(plugin){
    try{
      await plugin.authenticate({
        reason:reason||'Verifica tu identidad para continuar',
        title:'SecureCheck Pro',
        subtitle:'Usa tu huella o reconocimiento facial',
        description:'El mismo sistema que desbloquea tu teléfono',
        cancelTitle:'Cancelar',
        allowDeviceCredential:false,
        androidTitle:'SecureCheck Pro',
        androidSubtitle:reason||'Verificación de identidad',
        androidConfirmationRequired:false
      });
      return true;
    }catch(e){console.warn('BiometricAuth failed:',e);return false;}
  }
  // 3) WebAuthn — solo funciona en desktop/browser (NO en Android WebView)
  if(window.PublicKeyCredential&&!window.Capacitor){
    try{
      const challenge=new Uint8Array(32);crypto.getRandomValues(challenge);
      const emp=employees[currentUser];
      if(emp?.biometricId){
        const rawId=Uint8Array.from(atob(emp.biometricId),c=>c.charCodeAt(0));
        const assertion=await navigator.credentials.get({
          publicKey:{challenge,rpId:window.location.hostname||'localhost',
            allowCredentials:[{id:rawId,type:'public-key',transports:['internal']}],
            userVerification:'required',timeout:30000}
        });
        return !!assertion;
      }
      const credential=await navigator.credentials.create({
        publicKey:{challenge,
          rp:{name:'SecureCheck Pro',id:window.location.hostname||'localhost'},
          user:{id:new TextEncoder().encode(currentUser),name:currentUser,displayName:currentUser},
          pubKeyCredParams:[{alg:-7,type:'public-key'},{alg:-257,type:'public-key'}],
          authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required'},
          timeout:30000,attestation:'none'}
      });
      if(credential){
        const credId=btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        await updateEmployee(currentUser,{biometricId:credId});
        return true;
      }
      return false;
    }catch(e){console.warn('WebAuthn fallback failed:',e);return false;}
  }
  // Sin plugin y sin WebAuthn: no hay biometría disponible
  return false;
}

function skipBioSetup(){
  closeModal('modal-bio-setup');
  pendingTipo=null;
  showToast('Activa la biometría desde el menú más tarde');
}

async function retryBiometric(){
  closeModal('modal-bio-fallback');
  showLoader('Verificando identidad...');
  const ok=await doNativeBiometricVerify('Verifica tu identidad para marcar '+pendingTipo);
  hideLoader();
  if(ok){await finalizarMarcacion();}
  else{openModal('modal-bio-fallback');}
}

function switchToEmergencyFromBio(){
  closeModal('modal-bio-fallback');
  document.getElementById('emergency-code-inp').value='';
  openModal('modal-emergency-code');
}

// ============================================================
// EMPLOYEES
// ============================================================

// ============================================================
// SEGURIDAD — Hash de contraseñas para Supabase
// ============================================================
async function hashPass(pass){
  // Hash SHA-256 de la contraseña antes de guardarla en Supabase
  return await sha256(pass + '|SC_PASS_SALT_2026_' + ADMIN_USER);
}
async function fetchEmployees(){
  // Primero cargar desde IndexedDB local (rápido, funciona offline)
  try{
    const all=await dbGetAll('employees');
    employees={};
    all.forEach(e=>{employees[e.usuario]=e;});
  }catch(e){}

  // Luego sincronizar con Supabase — Supabase es la fuente de verdad
  if(SUPABASE_URL&&SUPABASE_ANON_KEY){
    try{
      const res=await fetch(SUPABASE_URL+'/rest/v1/employees?select=*',{
        headers:{
          'apikey':SUPABASE_ANON_KEY,
          'Authorization':'Bearer '+SUPABASE_ANON_KEY
        }
      });
      if(res.ok){
        const remoteEmps=await res.json();
        const remoteUsers=new Set(remoteEmps.map(e=>e.usuario));

        // ── BORRAR localmente empleados que ya no existen en Supabase ──
        for(const localUser of Object.keys(employees)){
          if(!remoteUsers.has(localUser) && localUser!==ADMIN_USER){
            try{ await dbDelete('employees',localUser); }catch(e){}
            try{ await dbDelete('faceData',localUser); }catch(e){}
            try{ await dbDelete('cycleState',localUser); }catch(e){}
            delete employees[localUser];
          }
        }

        // ── ACTUALIZAR / CREAR empleados que vienen de Supabase ──
        for(const emp of remoteEmps){
          const local=employees[emp.usuario]||{};
          const merged={
            ...local,
            usuario:emp.usuario,
            nombre:emp.nombre||emp.usuario,
            faceRegistered:emp.face_registered||local.faceRegistered||false,
            firstLogin:local.firstLogin!==undefined?local.firstLogin:(emp.first_login!==false),
            pass:local.pass||emp.pass_hash||'',
            pass_hash:emp.pass_hash||local.pass_hash||'',
            deviceId:local.deviceId||emp.device_id||null,
            createdAt:emp.created_at||local.createdAt,
            isAsistente: emp.is_asistente===true||emp.is_asistente==='true'||local.isAsistente||false,
            avatarData: local.avatarData||null,
            hourlyRate: emp.hourly_rate>0?parseFloat(emp.hourly_rate):(local.hourlyRate||parseFloat(localStorage.getItem('sc_rate_'+emp.usuario)||'0')||0)
          };
          await dbPut('employees',merged);
          employees[emp.usuario]=merged;
        }
        return true;
      }
    }catch(e){console.warn('Supabase fetch empleados:',e);}
  }
  return Object.keys(employees).length>0;
}
async function updateEmployee(usuario,fields){
  try{
    const existing=await dbGet('employees',usuario)||{usuario};
    const updated={...existing,...fields};
    await dbPut('employees',updated);
    employees[usuario]=updated;
    if(supabaseAvailable)syncEmployeeToSupabase(updated);
  }catch(e){}
}
async function createEmployee(usuario,pass){
  const passHash=await hashPass(pass);
  const obj={usuario,pass,pass_hash:passHash,firstLogin:true,faceRegistered:false,biometricId:null,deviceId:null,createdAt:new Date().toISOString(),nombre:usuario};
  await dbPut('employees',obj);
  employees[usuario]=obj;
  // Subir a Supabase inmediatamente (incluso si supabaseAvailable es false, intentar de todos modos)
  if(SUPABASE_URL&&SUPABASE_ANON_KEY){
    await checkSupabaseConnection();
    const ok=await syncEmployeeToSupabase(obj);
    if(!ok)showToast('⚠ Sin conexión — empleado guardado solo local');
  }
}
async function deleteEmployee(usuario){
  // Intentar eliminar en Supabase via RPC (SECURITY DEFINER — borra empleado + registros + pagos)
  if(supabaseAvailable&&SUPABASE_URL&&SUPABASE_ANON_KEY){
    try{
      const res=await fetch(SUPABASE_URL+'/rest/v1/rpc/admin_delete_employee_complete',{
        method:'POST',
        headers:{
          'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({p_usuario:usuario,p_reason:'Admin deleted from app'})
      });
      if(!res.ok){
        const err=await res.text();
        console.warn('admin_delete_employee_complete error:',err);
      }
    }catch(e){
      console.warn('deleteEmployee RPC error:',e);
    }
  }
  // Limpiar localmente (IndexedDB + cache)
  await dbDelete('employees',usuario);
  await dbDelete('faceData',usuario);
  await dbDelete('cycleState',usuario);
  // Eliminar también todos los registros locales de este empleado
  try{
    const allRecs=await dbGetAll('records');
    const userRecs=allRecs.filter(r=>r.usuario===usuario);
    for(const r of userRecs) await dbDelete('records',r.id);
  }catch(e){}
  delete employees[usuario];
}

// ============================================================
// RECORDS
// ============================================================
async function saveRecord(record){
  const r={...record};delete r.id;
  const id=await dbAdd('records',r);
  return id;
}
async function getAllRecords(){return await dbGetAll('records');}
async function getRecordsByUser(usuario){return await dbGetByIndex('records','usuario',usuario);}
async function getTodayRecordsByUser(usuario){
  const all=await getRecordsByUser(usuario);
  const today=getTodayKey();
  // Si hay jornada activa cruzando medianoche/varios días, incluir también
  // los registros desde la fecha original de inicio (`originalDate`) para que
  // se pueda recuperar la Entrada original aun después de varios días.
  const cycle=await getCycleState(usuario);
  if(cycle&&cycle.step>0&&!cycle.blocked){
    const fechasValidas=new Set([today]);
    const ayer=new Date();ayer.setDate(ayer.getDate()-1);
    fechasValidas.add(ayer.toLocaleDateString('es-US'));
    if(cycle.originalDate) fechasValidas.add(cycle.originalDate);
    if(cycle.date) fechasValidas.add(cycle.date);
    return all.filter(r=>fechasValidas.has(r.fecha));
  }
  return all.filter(r=>r.fecha===today);
}

// ============================================================
// LOGIN
// ============================================================
// ---- RPC helper: valida credenciales contra Supabase (verify_login) ----
// Devuelve {ok:bool, usuario, nombre, rol, mensaje} o null si no hubo red.
async function verifyLoginRemote(u, p){
  if(!SUPABASE_URL||!SUPABASE_ANON_KEY) return null;
  try{
    const h=await hashPass(p);  // mismo salt que ya usa la app
    const res=await fetch(SUPABASE_URL+'/rest/v1/rpc/verify_login',{
      method:'POST',
      headers:{
        'apikey':SUPABASE_ANON_KEY,
        'Authorization':'Bearer '+SUPABASE_ANON_KEY,
        'Content-Type':'application/json',
        'Accept':'application/json'
      },
      body: JSON.stringify({p_usuario:u, p_hash:h})
    });
    if(!res.ok) return null;
    const data=await res.json();
    return Array.isArray(data)?data[0]:data;
  }catch(e){ return null; }
}

async function doLogin(){
  const u=document.getElementById('inp-u').value.trim().toLowerCase();
  const p=document.getElementById('inp-p').value;
  document.getElementById('login-err').textContent='';
  if(!u||!p){document.getElementById('login-err').textContent='Completa usuario y contraseña.';return;}
  // Validación de entrada (anti-inyección y DoS)
  if(u.length>64 || p.length>128 || !/^[a-z0-9._@-]+$/i.test(u)){
    document.getElementById('login-err').textContent='Usuario inválido.';return;
  }

  showLoader('Verificando credenciales...');

  // Intento ONLINE primero → la DB valida, rate-limita y audita
  const remote=await verifyLoginRemote(u,p);

  if(remote && remote.ok===true){
    // Login online correcto → guardamos el hash en caché para offline
    try{
      const cacheHash=await hashPass(p);
      const existing=await dbGet('employees',u)||{usuario:u};
      await dbPut('employees',{...existing,
        usuario:u,
        nombre:remote.nombre||existing.nombre||u,
        pass_hash:cacheHash,
        isAsistente: remote.rol==='Asistente'
      });
    }catch(e){}
    // Refresco de datos
    if(u===ADMIN_USER){
      currentUser=u;isAdmin=true;
      await fetchEmployees();
      allRecords=await getAllRecords();
      await checkSupabaseConnection();
      if(supabaseAvailable) await fetchRecordsFromSupabase();
      allRecords=await getAllRecords();
      hideLoader();
      showScreen('admin-screen');
      renderDashboard();renderAdminRecords();renderEmpList();startAdminCode();renderAdminSettings();renderAdminMap(); logAudit('ADMIN_LOGIN',null,{dispositivo:navigator.userAgent.slice(0,60)});
      setTimeout(()=>setRptQuick('semana'),100);
      document.getElementById('dr-av').textContent='AD';
      document.getElementById('dr-name').textContent='Administrador';
      document.getElementById('dr-role').textContent='Admin Sistema';
      updateAvatarUI(ADMIN_USER);
      const dItemProy=document.getElementById('d-item-proyectos');
      if(dItemProy)dItemProy.style.display='flex';
      document.querySelectorAll('.emp-only-item').forEach(el=>el.style.display='none');
      document.getElementById('d-item-personal')?.setAttribute('style','display:none');
      document.getElementById('d-item-fotos')?.setAttribute('style','display:none');
      startSyncSchedule();
      return;
    }
    // Empleado / asistente autenticado online
    await fetchEmployees();
    hideLoader();
    // continúa al flujo empleado (passOk=true)
    // eslint-disable-next-line no-var
    var passOk=true;
    var emp=employees[u]||{usuario:u,nombre:remote.nombre||u,isAsistente:remote.rol==='Asistente'};
  } else {
    // OFFLINE o credenciales incorrectas online → fallback cache local
    if(remote && remote.ok===false){
      hideLoader();
      document.getElementById('login-err').textContent = remote.mensaje || 'Contraseña incorrecta.';
      return;
    }
    // Sin red: validar con hash cacheado en IndexedDB
    await fetchEmployees();
    hideLoader();
    if(!employees[u]){document.getElementById('login-err').textContent='Usuario no encontrado (sin conexión).';return;}
    const emp2=employees[u];
    let ok=false;
    if(emp2.pass_hash){
      const hashed=await hashPass(p);
      ok=(hashed===emp2.pass_hash);
    }
    if(!ok){document.getElementById('login-err').textContent='Contraseña incorrecta.';return;}
    // admin offline
    if(u===ADMIN_USER){
      currentUser=u;isAdmin=true;
      allRecords=await getAllRecords();
      showScreen('admin-screen');
      renderDashboard();renderAdminRecords();renderEmpList();startAdminCode();renderAdminSettings();renderAdminMap();
      setTimeout(()=>setRptQuick('semana'),100);
      document.getElementById('dr-av').textContent='AD';
      document.getElementById('dr-name').textContent='Administrador';
      document.getElementById('dr-role').textContent='Admin Sistema';
      updateAvatarUI(ADMIN_USER);
      const dItemProy=document.getElementById('d-item-proyectos');
      if(dItemProy)dItemProy.style.display='flex';
      document.querySelectorAll('.emp-only-item').forEach(el=>el.style.display='none');
      document.getElementById('d-item-personal')?.setAttribute('style','display:none');
      document.getElementById('d-item-fotos')?.setAttribute('style','display:none');
      startSyncSchedule();
      return;
    }
    var passOk=true;
    var emp=emp2;
  }
  if(!passOk){document.getElementById('login-err').textContent='Contraseña incorrecta.';return;}
  // ── DEVICE BINDING ──────────────────────────────────────────────────────
  // Si el empleado ya tiene un dispositivo registrado, bloquear si no coincide
  const registeredDevId = emp.deviceId;
  if(registeredDevId && registeredDevId !== deviceId){
    const modelHint = emp.deviceModel ? ` (${emp.deviceModel})` : '';
    document.getElementById('login-err').textContent =
      `⛔ Dispositivo no autorizado. Tu cuenta está vinculada a otro teléfono${modelHint}. Contacta al administrador.`;
    return;
  }
  // ────────────────────────────────────────────────────────────────────────
  currentUser=u;isAdmin=false;
  // Detectar modelo del dispositivo y actualizar empleado + Supabase
  detectDeviceModel().then(model=>{
    currentDeviceModel=model;
    updateEmployee(u,{deviceId:deviceId,lastLogin:new Date().toISOString(),deviceModel:model});
    if(supabaseAvailable)syncEmployeeToSupabase({...(employees[u]||{}),usuario:u});
  });
  if(employees[u].firstLogin===true||employees[u].firstLogin==='TRUE'){showScreen('change-pass-screen');return;}
  setupEmployeeUI(u);
  showScreen('main-screen');startClock();initGPS();
  const cycle=await getOrResetCycle(u);
  await updateButtonStates(cycle);
  await loadTodayHistory();
  // Restaurar timer de lunch si estaba activo antes del cierre/minimización
  await restoreLunchTimerIfNeeded();
  nativeBiometricAvailable().then(ok=>{biometricReady=ok;});
  startSyncSchedule();
  startBackupSchedule();
  if(!employees[u].faceRegistered)setTimeout(async()=>{
    const statusEl=document.getElementById('bio-setup-status');
    const btnEl=document.getElementById('bio-setup-btn');
    if(statusEl)statusEl.textContent='';
    if(btnEl){btnEl.disabled=false;btnEl.textContent='Activar biometría del dispositivo';}
    openModal('modal-bio-setup');
  },800);
}

document.getElementById('inp-p').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
document.getElementById('inp-u').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});

async function changePassword(){
  const np=document.getElementById('new-pass-inp').value;
  const cp=document.getElementById('confirm-pass-inp').value;
  if(!np||np.length<4){showToast(t('passMin'));return;}
  if(np!==cp){showToast(t('passNoMatch'));return;}
  showLoader(t('loading'));
  // Calcular nuevo hash ANTES de llamar updateEmployee para que Supabase reciba el hash actualizado
  const newHash=await hashPass(np);
  await updateEmployee(currentUser,{pass:np,pass_hash:newHash,firstLogin:false});
  hideLoader();
  setupEmployeeUI(currentUser);
  showScreen('main-screen');startClock();initGPS();
  const cycle=await getOrResetCycle(currentUser);
  await updateButtonStates(cycle);
  await loadTodayHistory();
  await restoreLunchTimerIfNeeded();
  startSyncSchedule();startBackupSchedule();
  // Verificar disponibilidad de biometría en el dispositivo
  nativeBiometricAvailable().then(ok=>{biometricReady=ok;});
  // Primer acceso: pedir activar biometría (huella/cara)
  setTimeout(async()=>{
    const statusEl=document.getElementById('bio-setup-status');
    const btnEl=document.getElementById('bio-setup-btn');
    if(statusEl)statusEl.textContent='';
    if(btnEl){btnEl.disabled=false;btnEl.textContent='Activar biometría del dispositivo';}
    openModal('modal-bio-setup');
  },800);
}

function setupEmployeeUI(u){
  const ini=u.substring(0,2).toUpperCase();
  document.getElementById('top-av').textContent=ini;
  document.getElementById('dr-av').textContent=ini;
  document.getElementById('dr-name').textContent=u.charAt(0).toUpperCase()+u.slice(1);
  // Cargar avatar guardado (foto o preset)
  updateAvatarUI(u);
  const isAsi=employees[u]&&(employees[u].isAsistente===true||employees[u].isAsistente==='TRUE');
  document.getElementById('dr-role').textContent=isAsi?'Asistente':'Empleado';
  // Registro Personal — visible para todos los empleados
  const dItemP=document.getElementById('d-item-personal');
  if(dItemP)dItemP.style.display='flex';
  // Fotos del Proyecto — solo para asistentes
  const dItemF=document.getElementById('d-item-fotos');
  if(dItemF)dItemF.style.display=isAsi?'flex':'none';
  // Historial semanal — solo empleados (no admin)
  document.querySelectorAll('.emp-only-item').forEach(el=>el.style.display='');
  // Proyectos — solo admin (ocultar en perfil de empleado)
  const dItemProy=document.getElementById('d-item-proyectos');
  if(dItemProy)dItemProy.style.display='none';
  // Si es asistente, precargar fecha de hoy en el modal de fotos
  if(isAsi){
    const fecInp=document.getElementById('asi-fecha-foto');
    if(fecInp&&!fecInp.value){
      _mcSetValue('asi-fecha-foto','lbl-asi-fecha-foto',new Date());
    }
    const roleEl=document.getElementById('asi-modal-role');
    if(roleEl)roleEl.textContent=u.charAt(0).toUpperCase()+u.slice(1)+' · Asistente';
  }
}

function doLogout(){
  currentUser=null;isAdmin=false;userCoords=null;gpsOk=false;
  clearInterval(clockInt);clearInterval(codeInt);clearInterval(lunchInt);
  clearInterval(backupInt);clearInterval(syncInt);
  if(gpsWatchId!=null){navigator.geolocation.clearWatch(gpsWatchId);gpsWatchId=null;}
  if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}
  closeDrawer();showScreen('login-screen');
  document.getElementById('inp-u').value='';document.getElementById('inp-p').value='';
  document.getElementById('hist-list').innerHTML='';document.getElementById('login-err').textContent='';
  clearSearch();
}

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function tryBiometric(){
  // Alias para compatibilidad — redirige a la nueva verificación nativa
  closeModal('modal-bio-fallback');
  showLoader('Verificando identidad biométrica...');
  const ok=await doNativeBiometricVerify('Verifica tu identidad para continuar');
  hideLoader();
  if(ok){await finalizarMarcacion();showToast('✓ Identidad verificada');}
  else{openModal('modal-bio-fallback');}
}

function switchToEmergencyCode(){
  closeModal('modal-bio-fallback');
  closeModal('modal-bio-fallback');
  document.getElementById('emergency-code-inp').value='';
  openModal('modal-emergency-code');
}

async function submitEmergencyCode(){
  const val=document.getElementById('emergency-code-inp').value.trim();
  if(val===getDynamicCode()){setFaceAttempts(currentUser,0);closeModal('modal-emergency-code');document.getElementById('emergency-code-inp').value='';showToast('✓ Código verificado');await finalizarMarcacion();}
  else showToast('❌ Código incorrecto o expirado');
}

// ============================================================
// GPS & CLOCK
// ============================================================
function startClock(){
  function tick(){
    const n=new Date();
    document.getElementById('time-big').textContent=n.toLocaleTimeString('es-US');
    const days=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const months=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    document.getElementById('date-lbl').textContent=days[n.getDay()]+', '+n.getDate()+' de '+months[n.getMonth()]+' '+n.getFullYear();
  }
  tick();clockInt=setInterval(tick,1000);
}
function initGPS(){
  if(!navigator.geolocation){document.getElementById('gps-txt').textContent='GPS no disponible';return;}
  // Limpiar watcher anterior si existe (evitar acumulación en login/logout múltiples)
  if(gpsWatchId!=null){navigator.geolocation.clearWatch(gpsWatchId);gpsWatchId=null;}
  gpsWatchId=navigator.geolocation.watchPosition(async pos=>{
    if(!currentUser)return; // ya se cerró sesión, ignorar callback
    userCoords={lat:pos.coords.latitude,lng:pos.coords.longitude};gpsOk=true;
    document.getElementById('gps-dot').classList.add('ok');
    const d=calcDist(userCoords.lat,userCoords.lng,TALLER.lat,TALLER.lng);
    const c=await getCycleState(currentUser);
    if(!c.blocked){
      if(d<=RADIO){document.getElementById('gps-txt').textContent='GPS OK — En rango';document.getElementById('dist-txt').textContent=Math.round(d*1000)+'m';}
      else{document.getElementById('gps-txt').textContent='Fuera de rango';document.getElementById('dist-txt').textContent=d.toFixed(2)+'km';}
    }
  },err=>{document.getElementById('gps-txt').textContent='Error GPS';gpsOk=false;},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
}
function calcDist(a,b,c,d){const R=6371,dL=(c-a)*Math.PI/180,dN=(d-b)*Math.PI/180;const x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dN/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

// ============================================================
// CONFIRMACIÓN ANTI-ACCIDENTE
// ============================================================
function marcar(tipo){
  // Paso 1: Mostrar confirmación visual antes de cualquier acción
  const icons={Entrada:'→]','Salida':'[→','Inicio Lunch':'☕','Fin Lunch':'↩'};
  const colors={Entrada:'#10b981','Salida':'#ef4444','Inicio Lunch':'#f97316','Fin Lunch':'#3b82f6'};
  const descs={Entrada:'Iniciar jornada laboral','Salida':'Terminar jornada laboral','Inicio Lunch':'Tomar descanso de lunch','Fin Lunch':'Regresar al trabajo'};
  const color=colors[tipo]||'#10b981';
  const el=document.getElementById('confirm-tipo');
  const el2=document.getElementById('confirm-desc');
  const el3=document.getElementById('confirm-dot');
  const btn=document.getElementById('confirm-btn');
  if(el)el.textContent=tipo;
  if(el2)el2.textContent=descs[tipo]||tipo;
  if(el3)el3.style.background=color;
  if(btn){btn.style.background=color;btn.style.boxShadow='0 4px 20px '+color+'40';}
  pendingTipo=tipo;
  openModal('modal-confirm-mark');
}

async function confirmarMarcacion(){
  closeModal('modal-confirm-mark');
  const tipo=pendingTipo;
  await _doMarcar(tipo);
}

async function _doMarcar(tipo){
  if(!gpsOk||!userCoords){showToast('Esperando señal GPS...');return;}
  // ── Kill-Switch: bloquear Entrada si el sistema está cerrado ──
  if(tipo==='Entrada'){
    const ksBlocked=await checkKillSwitch();
    if(ksBlocked) return; // mensaje ya mostrado dentro de checkKillSwitch
  }
  const c=await getOrResetCycle(currentUser);
  if(c.blocked){showToast('Jornada completada. Necesitas código del admin.');return;}
  const dist=calcDist(userCoords.lat,userCoords.lng,TALLER.lat,TALLER.lng);
  // Salida no requiere estar en rango — el empleado puede salir desde cualquier lugar
  if(dist>RADIO&&tipo!=='Salida'){
    pendingTipo=tipo;
    document.getElementById('modal-range-sub').textContent='Estás a '+dist.toFixed(2)+'km del área de trabajo.';
    openModal('modal-range');return;
  }
  if(tipo==='Salida'){
    clearInterval(lunchInt);
    const w=document.getElementById('lunch-timer-wrap');if(w)w.style.display='none';
    pendingTipo=tipo;
    await abrirModalSalida(c);
    return;
  }
  pendingTipo=tipo;
  if(tipo==='Entrada'){
    // OSHA Safety Checklist — obligatorio antes de cada entrada
    document.getElementById('osha-cb1').checked=false;
    document.getElementById('osha-cb2').checked=false;
    document.getElementById('osha-cb3').checked=false;
    updateOshaBtn();
    openModal('modal-osha');
    return;
  }
  if(tipo==='_entrada_post_osha'){
    pendingTipo='Entrada';
    if(!employees[currentUser]?.faceRegistered){
      const statusEl=document.getElementById('bio-setup-status');
      const btnEl=document.getElementById('bio-setup-btn');
      if(statusEl)statusEl.textContent='';
      if(btnEl){btnEl.disabled=false;btnEl.textContent='Activar biometría del dispositivo';}
      openModal('modal-bio-setup');return;
    }
    showLoader('Verificando identidad...');
    const ok=await doNativeBiometricVerify('Verifica tu identidad — '+tipo);
    hideLoader();
    if(ok){await finalizarMarcacion();}
    else{openModal('modal-bio-fallback');}
  }else{await finalizarMarcacion();}
}

async function submitRangeAuth(){
  const val=document.getElementById('sup-code-inp').value.trim();
  if(val===getDynamicCode()){
    closeModal('modal-range');document.getElementById('sup-code-inp').value='';
    if(pendingTipo==='Entrada'){
      showLoader('Esperando verificación...');
      const ok=await doNativeBiometricVerify('Verifica tu identidad para marcar Entrada');
      hideLoader();
      if(ok){await finalizarMarcacion();}
      else{openModal('modal-bio-fallback');}
    }else{await finalizarMarcacion();}
  }else{showToast('Código incorrecto o expirado');document.getElementById('sup-code-inp').value='';}
}

async function submitUnlockCode(){
  const val=document.getElementById('unlock-code-inp').value.trim();
  if(val===getDynamicCode()){
    const c=await getOrResetCycle(currentUser);c.blocked=false;c.step=0;c.date=getTodayKey();
    await saveCycleState(currentUser,c);setFaceAttempts(currentUser,0);
    closeModal('modal-unlock');document.getElementById('unlock-code-inp').value='';
    await updateButtonStates(c);await loadTodayHistory();showToast('✓ Jornada desbloqueada');
  }else showToast('Código incorrecto o expirado');
}

function getDynamicCode(){const seed=Math.floor(new Date().getTime()/60000);let h=seed^0x45d9f3b;h=((h>>>16)^h)*0x119de1f3;h=((h>>>16)^h)*0x45d9f3b;h=(h>>>16)^h;return String(Math.abs(h)%900000+100000);}
function startAdminCode(){
  function update(){const code=getDynamicCode();const secs=60-new Date().getSeconds();document.getElementById('admin-code').textContent=code;document.getElementById('code-timer').textContent='Caduca en '+secs+'s';const prog=document.getElementById('code-progress');if(prog)prog.style.width=(secs/60*100)+'%';}
  update();codeInt=setInterval(update,1000);
}

// ============================================================
// OSHA SAFETY CHECKLIST
// ============================================================
let _oshaVerified=false;

function updateOshaBtn(){
  const all=[1,2,3].every(i=>document.getElementById('osha-cb'+i)?.checked);
  const btn=document.getElementById('osha-proceed-btn');
  if(btn){btn.disabled=!all;btn.style.opacity=all?'1':'0.4';}
  [1,2,3].forEach(i=>{
    const lbl=document.getElementById('osha-q'+i);
    const cb=document.getElementById('osha-cb'+i);
    if(lbl)lbl.classList.toggle('osha-checked',cb?.checked);
  });
}

async function proceedAfterOsha(){
  _oshaVerified=true;
  closeModal('modal-osha');
  await _doMarcar('_entrada_post_osha');
}

// ============================================================
// FINALIZAR MARCACION — con firma SHA-256
// ============================================================
let _marcandoEnProceso=false; // guard anti-doble tap / doble ejecución

async function finalizarMarcacion(){
  if(_marcandoEnProceso)return; // bloquear doble ejecución
  _marcandoEnProceso=true;
  showLoader('Registrando '+pendingTipo+'...');
  const now=new Date();const today=getTodayKey();
  const record={
    usuario:currentUser,tipo:pendingTipo,fecha:today,
    hora:now.toLocaleTimeString('es-US'),
    timestamp:now.toISOString(),
    coords:userCoords?userCoords.lat.toFixed(6)+','+userCoords.lng.toFixed(6):'sin_gps',
    device:deviceId,synced_cloud:false,
    osha_ok:pendingTipo==='Entrada'?(_oshaVerified||false):undefined
  };
  if(pendingTipo==='Entrada')_oshaVerified=false; // reset flag
  // Firmar el registro
  record.firma=await signRecord(record);
  // Guardar y capturar el id asignado por IndexedDB (auto-increment)
  // Esto es CRÍTICO: sin el id, dbPut crearía un duplicado en lugar de actualizar
  const savedId=await saveRecord(record);
  record.id=savedId;
  allRecords.push({...record});
  const c=await getOrResetCycle(currentUser);
  if(pendingTipo==='Entrada')c.step=1;
  else if(pendingTipo==='Inicio Lunch'){c.step=2;startLunchTimer(0);}
  else if(pendingTipo==='Fin Lunch'){c.step=3;clearInterval(lunchInt);localStorage.removeItem('sc_lunch_ts');localStorage.removeItem('sc_lunch_ext');localStorage.removeItem('sc_lunch_user');const w=document.getElementById('lunch-timer-wrap');if(w)w.style.display='none';}
  else if(pendingTipo==='Salida'){c.step=4;c.blocked=true;}
  await saveCycleState(currentUser,c);
  // Intentar sync inmediato — usar record con id para que dbPut actualice el existente
  if(supabaseAvailable){
    const synced=await syncRecordToSupabase(record);
    if(synced){
      const syncedRecord={...record,synced_cloud:true};
      await dbPut('records',syncedRecord);
      // Actualizar allRecords para que el contador PEND sea inmediatamente correcto
      const idx=allRecords.findIndex(r=>r.id===record.id);
      if(idx>=0) allRecords[idx]=syncedRecord;
    }
  }
  hideLoader();
  _marcandoEnProceso=false; // liberar guard
  updateDrawerStats();
  await updateButtonStates(c);
  await loadTodayHistory();
  const syncIcon=supabaseAvailable?'☁️':'📱';
  showToast('✓ '+record.tipo.toUpperCase()+' registrado '+syncIcon);
  pendingTipo=null;
}

// ============================================================
// BUTTON STATES
// ============================================================
async function updateButtonStates(cycle){
  if(!cycle)cycle=await getOrResetCycle(currentUser);
  const step=cycle.step,blocked=cycle.blocked;
  // Actualizar paso activo global para protección de sesión
  activeCycleStep=blocked?4:step;
  const btns={e:document.querySelector('.act-btn.e'),s:document.querySelector('.act-btn.s'),l:document.querySelector('.act-btn.l'),v:document.querySelector('.act-btn.v')};
  const ub=document.getElementById('unlock-bar');
  if(blocked){Object.values(btns).forEach(b=>{if(b){b.style.opacity='0.3';b.style.pointerEvents='none';}});if(ub)ub.style.display='flex';document.getElementById('gps-txt').textContent='JORNADA COMPLETADA';return;}
  if(ub)ub.style.display='none';
  // Salida solo habilitada cuando está trabajando (step 1) o regresó de lunch (step 3)
  // Durante el lunch (step 2) la Salida se bloquea — debe regresar primero
  const states={e:step===0,s:step===1||step===3,l:step===1,v:step===2};
  Object.keys(btns).forEach(k=>{if(btns[k]){btns[k].style.opacity=states[k]?'1':'0.3';btns[k].style.pointerEvents=states[k]?'auto':'none';}});
}

// ============================================================
// HISTORY
// ============================================================
async function loadTodayHistory(){
  const recs=await getTodayRecordsByUser(currentUser);
  const list=document.getElementById('hist-list');
  if(!recs.length){list.innerHTML=`<div style="color:var(--text4);font-size:12px;padding:8px 0">${t('noRecords')}</div>`;return;}
  updateHorasTrabajadas(recs);
  // Vista compacta agrupada por día con flecha desplegable
  const sorted=[...recs].sort((a,b)=>(a.id||0)-(b.id||0));
  const lastRec=sorted[sorted.length-1];
  const colors={Entrada:'#10b981',Salida:'#ef4444','Inicio Lunch':'#f97316','Fin Lunch':'#3b82f6'};
  const expanded=list.dataset.expanded==='true';
  const detailHtml=sorted.slice().reverse().map(r=>`
    <div class="hist-item">
      <div class="h-dot" style="background:${colors[r.tipo]||'#475569'}"></div>
      <span class="h-type">${r.tipo}</span>
      <span class="h-time">${r.hora}</span>
      <span class="h-badge ${r.synced_cloud?'ok':'pend'}">${r.synced_cloud?'OK':'PEND'}</span>
    </div>`).join('');
  list.innerHTML=`
    <div class="hist-summary" onclick="toggleTodayHistory()" style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07)">
      <div class="h-dot" style="background:${colors[lastRec.tipo]||'#475569'};flex-shrink:0"></div>
      <span style="flex:1;color:#fff;font-size:12px;font-weight:500">${lastRec.tipo}</span>
      <span style="color:var(--text3);font-size:11px;font-family:var(--mono)">${lastRec.hora}</span>
      <span style="color:var(--text4);font-size:11px;margin-left:4px">${recs.length} reg</span>
      <svg id="hist-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px;flex-shrink:0;transition:transform .2s;transform:rotate(${expanded?'180':'0'}deg)"><path d="M6 9l6 6 6-6"/></svg>
    </div>
    <div id="hist-detail" style="display:${expanded?'block':'none'}">${detailHtml}</div>`;
}

function toggleTodayHistory(){
  const list=document.getElementById('hist-list');
  const detail=document.getElementById('hist-detail');
  const chev=document.getElementById('hist-chev');
  if(!detail||!chev)return;
  const open=detail.style.display==='none';
  detail.style.display=open?'block':'none';
  chev.style.transform=open?'rotate(180deg)':'rotate(0deg)';
  list.dataset.expanded=open?'true':'false';
}

function calcActualLunchMins(recs){
  // Calcula los minutos reales de lunch usando Inicio Lunch → Fin Lunch del mismo día
  const sorted=[...recs].sort((a,b)=>(a.id||0)-(b.id||0));
  let totalLunch=0;
  let lastInicioLunch=null;
  for(const r of sorted){
    if(r.tipo==='Inicio Lunch'){lastInicioLunch=r.hora;}
    else if(r.tipo==='Fin Lunch'&&lastInicioLunch){
      const mins=calcMinsBetween(lastInicioLunch,r.hora);
      if(mins>0&&mins<240)totalLunch+=mins;
      lastInicioLunch=null;
    }
  }
  return totalLunch;
}

function updateHorasTrabajadas(recs){
  const el=document.getElementById('horas-trabajadas');if(!el)return;
  // Ordenar por id para garantizar orden cronológico
  const sorted=[...recs].sort((a,b)=>(a.id||0)-(b.id||0));
  // Buscar el ÚLTIMO par Entrada→Salida completo
  const lastSalida=sorted.slice().reverse().find(r=>r.tipo==='Salida');
  if(lastSalida){
    const idxS=sorted.indexOf(lastSalida);
    const entradaAntes=sorted.slice(0,idxS).reverse().find(r=>r.tipo==='Entrada');
    if(entradaAntes){
      const totalMins=calcMinsBetween(entradaAntes.hora,lastSalida.hora);
      const actualLunchMins=calcActualLunchMins(recs);
      const pagadoMins=Math.max(0,totalMins-actualLunchMins);
      const h=Math.floor(pagadoMins/60),m=Math.round(pagadoMins%60);
      const lunchStr=actualLunchMins>0?` · Lunch: ${Math.round(actualLunchMins)}m`:'';
      el.textContent=entradaAntes.hora+' → '+lastSalida.hora+' · Pagado: '+h+'h '+m+'m'+lunchStr;
      return;
    }
  }
  const lastEntrada=sorted.slice().reverse().find(r=>r.tipo==='Entrada');
  if(lastEntrada)el.textContent='Entrada: '+lastEntrada.hora+' — Trabajando';
  else el.textContent=t('noEntryToday');
}

function addHistItem(tipo,hora,synced){
  const colors={Entrada:'#10b981',Salida:'#ef4444','Inicio Lunch':'#f97316','Fin Lunch':'#3b82f6'};
  const el=document.createElement('div');el.className='hist-item';
  el.innerHTML='<div class="h-dot" style="background:'+(colors[tipo]||'#475569')+'"></div><span class="h-type">'+tipo+'</span><span class="h-time">'+hora+'</span><span class="h-badge '+(synced?'ok':'pend')+'">'+(synced?'OK':'PEND')+'</span>';
  const list=document.getElementById('hist-list');list.insertBefore(el,list.firstChild);
}

function updateDrawerStats(){
  const today=getTodayKey();
  const todayCount=allRecords.filter(r=>r.usuario===currentUser&&r.fecha===today).length;
  const pend=allRecords.filter(r=>!r.synced_cloud).length;
  document.getElementById('dr-today').textContent=todayCount+' registros hoy';
  document.getElementById('dr-pend').textContent=pend;
}

// ============================================================
// DRAWER — Historial semanal FUNCIONAL
// ============================================================
async function renderWeekHistory(){
  const el=document.getElementById('week-history');if(!el)return;
  // Admin ve resumen de todos los empleados hoy
  if(isAdmin){
    const today=getTodayKey();
    const todayRecs=allRecords.filter(r=>r.fecha===today);
    const empKeys=Object.keys(employees);
    if(!empKeys.length){el.innerHTML='<div style="color:var(--text4);font-size:12px;padding:8px">Sin empleados registrados</div>';return;}
    el.innerHTML=empKeys.map(u=>{
      const recs=todayRecs.filter(r=>r.usuario===u);
      const entrada=recs.find(r=>r.tipo==='Entrada');
      const salida=recs.find(r=>r.tipo==='Salida');
      let horasStr='Sin actividad hoy';
      if(entrada&&salida){
        const lunchM=calcActualLunchMins(recs);
        const mins=Math.max(0,calcMinsBetween(entrada.hora,salida.hora)-lunchM);
        horasStr=(mins/60).toFixed(1)+'h trabajadas';
      }else if(entrada){
        horasStr='Entrada: '+entrada.hora+' — Activo';
      }
      return `<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:8px">
        <div style="width:26px;height:26px;border-radius:50%;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);display:flex;align-items:center;justify-content:center;color:var(--green);font-size:9px;font-weight:700;font-family:var(--mono);flex-shrink:0">${u.substring(0,2).toUpperCase()}</div>
        <div style="flex:1">
          <div style="color:#fff;font-size:12px;font-weight:500">${u}</div>
          <div style="color:var(--text3);font-size:10px;font-family:var(--mono)">${horasStr}</div>
        </div>
      </div>`;
    }).join('');
    return;
  }
  // Empleado ve su propio historial semanal
  const userRecs=allRecords.filter(r=>r.usuario===currentUser);
  if(!userRecs.length){
    // Intentar cargar desde IndexedDB directamente
    try{
      const fresh=await getRecordsByUser(currentUser);
      if(!fresh.length){el.innerHTML='<div style="color:var(--text4);font-size:12px;padding:8px">Sin historial aún</div>';return;}
      fresh.forEach(r=>{if(!allRecords.find(x=>x.id===r.id))allRecords.push(r);});
    }catch(e){}
  }
  const records=allRecords.filter(r=>r.usuario===currentUser);
  const byDate={};
  records.forEach(r=>{if(!byDate[r.fecha])byDate[r.fecha]=[];byDate[r.fecha].push(r);});
  const dates=Object.keys(byDate).sort((a,b)=>new Date(b)-new Date(a)).slice(0,7);
  if(!dates.length){el.innerHTML='<div style="color:var(--text4);font-size:12px;padding:8px">Sin historial aún</div>';return;}
  el.innerHTML=dates.map(date=>{
    const recs=byDate[date];
    const entrada=recs.find(r=>r.tipo==='Entrada');
    const salida=recs.find(r=>r.tipo==='Salida');
    let pagado='';
    if(entrada&&salida){
      const lunchM=calcActualLunchMins(recs);
      const pagadoMins=Math.max(0,calcMinsBetween(entrada.hora,salida.hora)-lunchM);
      pagado=(pagadoMins/60).toFixed(1)+'h pagado';
    }
    const isToday=date===getTodayKey();
    return `<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
      <div style="color:${isToday?'var(--green)':'#fff'};font-size:12px;font-weight:600">${isToday?'HOY — ':''} ${date}</div>
      <div style="color:var(--text3);font-size:11px;margin-top:3px;font-family:var(--mono)">
        ${entrada?'▶ '+entrada.hora:'Sin entrada'}${salida?' → '+salida.hora:entrada?' — Trabajando':''}
      </div>
      ${pagado?`<div style="color:var(--green);font-size:11px;margin-top:2px;font-family:var(--mono)">${pagado}</div>`:''}
    </div>`;
  }).join('');
}

// ============================================================
// LUNCH TIMER
// ============================================================
function startLunchTimer(extendedMins){
  clearInterval(lunchInt);lunchStartTime=new Date();lunchExtended=extendedMins||0;
  // Persistir en localStorage para sobrevivir cierre/minimización de la app
  localStorage.setItem('sc_lunch_ts',lunchStartTime.getTime().toString());
  localStorage.setItem('sc_lunch_ext',(lunchExtended||0).toString());
  localStorage.setItem('sc_lunch_user',currentUser||'');
  const totalSecs=(LUNCH_MINUTES+lunchExtended)*60;
  let alarmPlayed=false,extensionShown=false;
  const wrap=document.getElementById('lunch-timer-wrap');const timerEl=document.getElementById('lunch-timer');const timerBar=document.getElementById('lunch-timer-bar');
  if(wrap)wrap.style.display='block';
  lunchInt=setInterval(()=>{
    const remaining=totalSecs-Math.floor((new Date()-lunchStartTime)/1000);
    if(remaining>0){
      const m=Math.floor(remaining/60),s=remaining%60;
      if(timerEl){timerEl.textContent='LUNCH: '+m+':'+(s<10?'0':'')+s;timerEl.style.color=remaining<=120?'var(--red)':'var(--orange)';}
      if(timerBar)timerBar.style.width=Math.max(0,(remaining/totalSecs)*100)+'%';
      if(remaining<=120&&!extensionShown){extensionShown=true;openModal('modal-extend-lunch');}
    }else{
      if(timerEl){timerEl.textContent='⏰ TIEMPO TERMINADO';timerEl.style.color='var(--red)';}
      if(timerBar)timerBar.style.width='0%';
      if(!alarmPlayed){alarmPlayed=true;playAlarm();}
    }
  },1000);
}
function extendLunch(mins){closeModal('modal-extend-lunch');lunchExtended+=mins;setLunchOvertime(currentUser,getTodayKey(),lunchExtended);startLunchTimer(lunchExtended);showToast('Lunch extendido '+mins+' minutos');}
function playAlarm(){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();[0,0.4,0.8].forEach(t=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(0.4,ctx.currentTime+t);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+t+0.35);o.start(ctx.currentTime+t);o.stop(ctx.currentTime+t+0.35);});}catch(e){}}

// ============================================================
// RESTAURAR TIMER DE LUNCH — sobrevive cierre/minimización
// ============================================================
async function restoreLunchTimerIfNeeded(){
  try{
    const savedTs=localStorage.getItem('sc_lunch_ts');
    const savedUser=localStorage.getItem('sc_lunch_user');
    if(!savedTs||!savedUser)return;
    // Solo restaurar si es el mismo usuario activo
    if(savedUser!==currentUser)return;
    // Verificar que Fin Lunch no haya sido registrado ya
    const today=getTodayKey();
    const recs=await getTodayRecordsByUser(currentUser);
    const finLunch=recs.find(r=>r.tipo==='Fin Lunch');
    if(finLunch){
      // Ya terminó el lunch — limpiar localStorage
      localStorage.removeItem('sc_lunch_ts');localStorage.removeItem('sc_lunch_ext');localStorage.removeItem('sc_lunch_user');
      return;
    }
    const inicioLunch=recs.find(r=>r.tipo==='Inicio Lunch');
    if(!inicioLunch)return;
    // Restaurar timer desde el timestamp guardado
    const savedExt=parseInt(localStorage.getItem('sc_lunch_ext')||'0',10);
    lunchExtended=savedExt;
    lunchStartTime=new Date(parseInt(savedTs,10));
    const wrap=document.getElementById('lunch-timer-wrap');
    const timerEl=document.getElementById('lunch-timer');
    const timerBar=document.getElementById('lunch-timer-bar');
    if(wrap)wrap.style.display='block';
    clearInterval(lunchInt);
    const totalSecs=(LUNCH_MINUTES+lunchExtended)*60;
    let alarmPlayed=false,extensionShown=false;
    lunchInt=setInterval(()=>{
      const remaining=totalSecs-Math.floor((new Date()-lunchStartTime)/1000);
      if(remaining>0){
        const m=Math.floor(remaining/60),s=remaining%60;
        if(timerEl){timerEl.textContent='LUNCH: '+m+':'+(s<10?'0':'')+s;timerEl.style.color=remaining<=120?'var(--red)':'var(--orange)';}
        if(timerBar)timerBar.style.width=Math.max(0,(remaining/totalSecs)*100)+'%';
        if(remaining<=120&&!extensionShown){extensionShown=true;openModal('modal-extend-lunch');}
      }else{
        if(timerEl){timerEl.textContent='⏰ TIEMPO TERMINADO';timerEl.style.color='var(--red)';}
        if(timerBar)timerBar.style.width='0%';
        if(!alarmPlayed){alarmPlayed=true;playAlarm();}
      }
    },1000);
    showToast('⏱ Timer de lunch restaurado');
    console.log('Lunch timer restaurado desde localStorage');
  }catch(e){console.warn('restoreLunchTimerIfNeeded error:',e);}
}

// ============================================================
// REANUDAR APP — cuando vuelve al primer plano
// ============================================================
async function handleAppResume(){
  try{
    console.log('App reanudada — verificando estado de sesión');
    // Reconectar Supabase si estaba caído
    if(!supabaseAvailable){
      await checkSupabaseConnection();
      if(supabaseAvailable)processSyncQueue();
    }
    // Restaurar timer de lunch si aplica
    if(currentUser&&!isAdmin){
      await restoreLunchTimerIfNeeded();
      // Refrescar estado de botones
      const cycle=await getOrResetCycle(currentUser);
      await updateButtonStates(cycle);
      await loadTodayHistory();
    }
    // Si es admin, refrescar panel
    if(isAdmin){
      await fetchAllRecords();
      renderAdminMap();
    }
  }catch(e){console.warn('handleAppResume error:',e);}
}

// ============================================================
// ADMIN — SEARCH
// ============================================================
async function adminSearch(query){
  const q=query.trim().toLowerCase();
  const clearBtn=document.getElementById('search-clear');
  const panel=document.getElementById('search-result-panel');
  const mainContent=document.getElementById('admin-main-content');
  if(clearBtn)clearBtn.style.display=q?'block':'none';
  if(!q){panel.style.display='none';mainContent.style.display='block';return;}
  panel.style.display='block';mainContent.style.display='none';
  const matches=Object.keys(employees).filter(u=>u.toLowerCase().includes(q));
  const inner=document.getElementById('search-result-inner');
  if(!matches.length){inner.innerHTML='<div class="no-results">No se encontró ningún trabajador para "'+query+'"</div>';return;}
  inner.innerHTML='';
  for(const u of matches)inner.insertAdjacentHTML('beforeend',await buildWorkerCard(u));
}
function clearSearch(){
  const inp=document.getElementById('admin-search');if(inp)inp.value='';
  document.getElementById('search-result-panel').style.display='none';
  document.getElementById('admin-main-content').style.display='block';
  const clearBtn=document.getElementById('search-clear');if(clearBtn)clearBtn.style.display='none';
}

async function buildWorkerCard(username){
  const emp=employees[username]||{};const today=getTodayKey();
  const allUserRecs=allRecords.filter(r=>r.usuario===username);
  const todayRecs=allUserRecs.filter(r=>r.fecha===today);
  const cycle=await getCycleState(username);const isToday=cycle.date===today;
  let statusLabel='Sin actividad',statusClass='ws-idle';
  if(isToday){if(cycle.blocked){statusLabel='Jornada completa';statusClass='ws-out';}else if(cycle.step===2){statusLabel='En LUNCH';statusClass='ws-lunch';}else if(cycle.step>=1){statusLabel='Trabajando';statusClass='ws-active';}}
  const entrada=todayRecs.find(r=>r.tipo==='Entrada');const salida=todayRecs.find(r=>r.tipo==='Salida');
  let horasHoy='—';
  if(entrada&&salida){const lunchM=calcActualLunchMins(todayRecs);const mins=Math.max(0,calcMinsBetween(entrada.hora,salida.hora)-lunchM);horasHoy=(mins/60).toFixed(1)+'h';}
  else if(entrada){const ini=parseHora(entrada.hora);const mins=ini?Math.max(0,(new Date()-ini)/60000):0;horasHoy=(mins/60).toFixed(1)+'h+';}
  const diasSet=new Set(allUserRecs.filter(r=>r.tipo==='Entrada').map(r=>r.fecha));
  const lastRec=todayRecs[todayRecs.length-1];
  const typeColors={Entrada:'#10b981',Salida:'#ef4444','Inicio Lunch':'#f97316','Fin Lunch':'#3b82f6'};
  const recRows=allUserRecs.slice(-5).reverse().map(r=>`
    <div class="worker-record-row">
      <div class="wr-dot" style="background:${typeColors[r.tipo]||'#475569'}"></div>
      <span class="wr-tipo">${r.tipo}</span><span class="wr-fecha">${r.fecha}</span><span class="wr-hora">${r.hora}</span>
    </div>`).join('');
  // Área de trabajo del día
  const salidaRec = todayRecs.find(r=>r.tipo==='Salida');
  const areaHoy = salidaRec?.area_trabajo || null;
  const horasNetas = salidaRec?.horas_neto || null;
  const horasBruto = salidaRec?.horas_bruto || null;

  return `<div class="worker-card">
    <div class="worker-card-header">
      <div class="worker-av-lg">${username.substring(0,2).toUpperCase()}</div>
      <div><div class="worker-name-lg">${username.charAt(0).toUpperCase()+username.slice(1)}</div>
      <div class="worker-id">ID: ${username} · ${emp.deviceId?`📱 Dispositivo vinculado${emp.deviceModel?' ('+emp.deviceModel+')':''}`:'Sin dispositivo'}</div></div>
      <span class="worker-status-badge ${statusClass}">${statusLabel}</span>
    </div>
    <div class="worker-stats-grid">
      <div class="wstat"><div class="wstat-val">${horasHoy}</div><div class="wstat-lbl">Horas hoy</div></div>
      <div class="wstat"><div class="wstat-val">${diasSet.size}</div><div class="wstat-lbl">Días trabajados</div></div>
      <div class="wstat"><div class="wstat-val">${allUserRecs.length}</div><div class="wstat-lbl">Registros total</div></div>
    </div>
    ${areaHoy ? `
    <div style="background:rgba(59,130,246,0.07);border:1px solid rgba(59,130,246,0.2);border-radius:10px;padding:10px 12px;margin-bottom:8px">
      <div style="color:var(--text4);font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Área de trabajo hoy</div>
      <div style="color:var(--blue);font-size:14px;font-weight:600">${areaHoy}</div>
      ${horasNetas?`<div style="display:flex;gap:16px;margin-top:6px">
        <div><div style="color:var(--text4);font-size:10px">Horas brutas</div><div style="color:var(--text2);font-size:13px;font-family:var(--mono)">${horasBruto||'—'}</div></div>
        <div><div style="color:var(--text4);font-size:10px">Horas pagables</div><div style="color:var(--green);font-size:13px;font-weight:700;font-family:var(--mono)">${horasNetas}</div></div>
      </div>`:''}
    </div>` : '<div style="color:var(--text4);font-size:11px;padding:6px 0 8px">Sin registro de salida hoy — área pendiente</div>'}
    <div class="worker-records-title">Registros recientes</div>
    ${recRows||'<div style="color:var(--text4);font-size:12px;padding:6px 0">Sin registros</div>'}
    <div class="worker-location">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <span>${lastRec?lastRec.coords:'Sin datos GPS'}</span>
    </div>
  </div>`;
}

// ============================================================
// ADMIN — DASHBOARD
// ============================================================
function renderDashboard(){
  const today=getTodayKey();const todayRecs=allRecords.filter(r=>r.fecha===today);
  const presentesSet=new Set(todayRecs.filter(r=>r.tipo==='Entrada').map(r=>r.usuario));
  const salidasSet=new Set(todayRecs.filter(r=>r.tipo==='Salida').map(r=>r.usuario));
  const lunchTodaySet=new Set(todayRecs.filter(r=>r.tipo==='Inicio Lunch').map(r=>r.usuario));
  const finLunchSet=new Set(todayRecs.filter(r=>r.tipo==='Fin Lunch').map(r=>r.usuario));
  const enLunchAhoraSet=new Set([...lunchTodaySet].filter(u=>!finLunchSet.has(u)));
  const kpis=document.getElementById('dash-kpis');
  if(kpis)kpis.innerHTML=`
    <div class="kpi-card green"><div class="kpi-lbl">Presentes hoy</div><div class="kpi-val">${presentesSet.size}</div><div class="kpi-sub">marcaron entrada</div></div>
    <div class="kpi-card orange"><div class="kpi-lbl">${enLunchAhoraSet.size>0?'En lunch ahora':'Lunch hoy'}</div><div class="kpi-val">${enLunchAhoraSet.size>0?enLunchAhoraSet.size:lunchTodaySet.size}</div><div class="kpi-sub">${enLunchAhoraSet.size>0?'en descanso ahora':lunchTodaySet.size>0?'tomaron lunch hoy':'nadie tomó lunch'}</div></div>
    <div class="kpi-card blue"><div class="kpi-lbl">Salidas hoy</div><div class="kpi-val">${salidasSet.size}</div><div class="kpi-sub">terminaron jornada</div></div>
    <div class="kpi-card red"><div class="kpi-lbl">Sin sincronizar</div><div class="kpi-val">${allRecords.filter(r=>!r.synced_cloud).length}</div><div class="kpi-sub">${supabaseAvailable?'Subiendo...':'Sin internet'}</div></div>`;
  const timeline=document.getElementById('dash-timeline');
  if(timeline){
    const typeColors={Entrada:'rgba(16,185,129,0.12)',Salida:'rgba(239,68,68,0.12)','Inicio Lunch':'rgba(249,115,22,0.12)','Fin Lunch':'rgba(59,130,246,0.12)'};
    const typeIcons={Entrada:'<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>',Salida:'<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>','Inicio Lunch':'<svg viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round"><path d="M3 11V3M7 11V3M5 11h16v2a8 8 0 01-16 0v-2z"/></svg>','Fin Lunch':'<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>'};
    if(!todayRecs.length){timeline.innerHTML='<div style="color:var(--text4);font-size:13px;padding:8px 0">Sin actividad hoy</div>';return;}
    const sorted=[...todayRecs].sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
    timeline.innerHTML=sorted.slice(0,20).map(r=>`<div class="timeline-item"><div class="tl-dot" style="background:${typeColors[r.tipo]||'rgba(255,255,255,0.05)'}">${typeIcons[r.tipo]||''}</div><div style="flex:1"><div class="tl-name">${r.usuario.charAt(0).toUpperCase()+r.usuario.slice(1)}</div><div class="tl-detail">${r.tipo}${r.coords&&r.coords!=='sin_gps'?' · '+r.coords:''}</div></div><div class="tl-time">${r.hora}</div></div>`).join('');
  }
}

// ============================================================
// ADMIN — RECORDS (compact grouped cards)
// ============================================================
const _rgOpenMaps={}; // rastrea qué mapas Leaflet ya se inicializaron

function renderAdminRecords(){
  const tipoFilter=document.getElementById('filter-tipo')?.value||'';
  const fechaFilter=document.getElementById('filter-fecha')?.value||'';
  // Actualizar selector de fechas (hidden select + custom btn label)
  const fechaSelect=document.getElementById('filter-fecha');
  if(fechaSelect){
    const dates=[...new Set(allRecords.map(r=>r.fecha))].sort((a,b)=>b.localeCompare(a));
    const current=fechaSelect.value;
    fechaSelect.innerHTML='<option value="">Todas las fechas</option>'+dates.map(d=>`<option value="${d}"${d===current?' selected':''}>${d}</option>`).join('');
  }
  // Filtrar registros
  let recs=[...allRecords];
  if(tipoFilter)recs=recs.filter(r=>r.tipo===tipoFilter);
  if(fechaFilter)recs=recs.filter(r=>r.fecha===fechaFilter);
  recs.sort((a,b)=>(b.timestamp||'').localeCompare(a.timestamp||''));
  const container=document.getElementById('records-list');if(!container)return;
  if(!recs.length){
    container.innerHTML=`<div class="live-empty" style="padding:40px 0">${t('noRecords')}</div>`;return;
  }
  // Agrupar por usuario+fecha
  const groups={};
  for(const r of recs){
    const key=r.usuario+'||'+r.fecha;
    if(!groups[key]){groups[key]={usuario:r.usuario,fecha:r.fecha,recs:[]};}
    groups[key].recs.push(r);
  }
  // Ordenar grupos por el último timestamp
  const sorted=Object.values(groups).sort((a,b)=>{
    const ta=a.recs[0]?.timestamp||''; const tb=b.recs[0]?.timestamp||'';
    return tb.localeCompare(ta);
  });
  const cmap={Entrada:'badge-e',Salida:'badge-s','Inicio Lunch':'badge-l','Fin Lunch':'badge-v'};
  const dotColors={Entrada:'#10b981',Salida:'#ef4444','Inicio Lunch':'#f97316','Fin Lunch':'#3b82f6'};
  container.innerHTML=sorted.map(g=>{
    const lastRec=g.recs[0]; // ya están ordenados desc
    const nombre=g.usuario.charAt(0).toUpperCase()+g.usuario.slice(1);
    const dotColor=dotColors[lastRec.tipo]||'#64748b';
    const gid='rg-'+g.usuario.replace(/[^a-z0-9]/gi,'_')+'-'+g.fecha.replace(/\//g,'');
    // Encontrar Salida para mostrar horas si está disponible
    const salidaRec=g.recs.find(r=>r.tipo==='Salida');
    // Construir filas internas de cada registro del grupo
    const recRows=g.recs.map((r,i)=>{
      const rid=gid+'r'+i;
      let coordsParts=null;
      if(r.coords&&r.coords!=='sin_gps'){
        const parts=r.coords.split(',');
        if(parts.length===2&&!isNaN(parts[0])&&!isNaN(parts[1])){
          coordsParts={lat:parseFloat(parts[0]).toFixed(6),lng:parseFloat(parts[1]).toFixed(6)};
        }
      }
      const recDev=r.device||r.device_id||'';
      const recDevShort=recDev&&recDev!=='remoto'?(recDev.substring(0,10)+'…'):(recDev||'—');
      const recEmp=employees[r.usuario]||{};
      const bioStatus=recEmp.biometricId?'Verificada (Nativa)':recEmp.faceRegistered?'Face ID':'Sin biometría';
      const bioColor=recEmp.biometricId?'#10b981':recEmp.faceRegistered?'#3b82f6':'#64748b';
      const devModel=recEmp.deviceModel||'';
      return`<div class="rg-rec">
  <span class="badge ${cmap[r.tipo]||'badge-e'} rg-badge">${r.tipo}</span>
  <span class="rg-hora">${r.hora}</span>
  ${r.area_trabajo?`<span class="rg-area">${r.area_trabajo}</span>`:''}
  ${r.horas_neto?`<span class="rg-hrs">${r.horas_neto}</span>`:''}
  <span title="${recDev||'Desconocido'}${devModel?' · '+devModel:''}" style="font-size:9px;color:#64748b;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:1px 5px;font-family:monospace;cursor:default">
    📱 ${recDevShort}${devModel?' ('+devModel+')':''}
  </span>
  <span style="font-size:9px;color:${bioColor};border:1px solid ${bioColor}30;border-radius:4px;padding:1px 5px;background:${bioColor}10">
    ${bioStatus}
  </span>
  <span class="rg-sync ${r.synced_cloud?'ok':'pend'}" title="${r.synced_cloud?'Sincronizado con Supabase':'Pendiente de subir'}">${r.synced_cloud?'☁':'○'}</span>
  ${coordsParts?`<button class="rg-gps-btn" onclick="event.stopPropagation();toggleRgMap('${rid}',${coordsParts.lat},${coordsParts.lng})">📍</button>`:''}
  <button class="rg-gps-btn" style="color:#3b82f6;margin-left:2px" onclick="event.stopPropagation();openEditRecord(${r.id})" title="Editar registro">✏️</button>
</div>
${coordsParts?`<div class="rg-map-wrap" id="rg-map-${rid}">
  <div class="rg-map-header">
    <span class="rg-map-coords">📍 ${coordsParts.lat}, ${coordsParts.lng}</span>
    <a href="https://www.google.com/maps?q=${coordsParts.lat},${coordsParts.lng}" target="_blank" class="rg-maps-link">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      Google Maps
    </a>
  </div>
  <div id="rg-mapbox-${rid}" class="rg-mapbox"></div>
</div>`:''}`;
    }).join('');
    return`<div class="rg-card" id="${gid}">
  <div class="rg-row" onclick="toggleRgCard('${gid}')">
    <span class="ev-dot" style="background:${dotColor};box-shadow:0 0 0 3px ${dotColor}30"></span>
    <span class="ev-name">${nombre}</span>
    <span class="ev-last">${lastRec.tipo} · ${lastRec.hora.replace(/ (a|p)\.?\s?m\.?/i,s=>s.trim().toLowerCase())}</span>
    <span class="rg-fecha">${g.fecha}</span>
    ${salidaRec?.horas_neto?`<span class="ev-hrs">${salidaRec.horas_neto}</span>`:`<span class="rg-count">${g.recs.length} reg</span>`}
    <svg class="live-chevron" id="${gid}-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
  </div>
  <div class="rg-detail" id="${gid}-detail">${recRows}</div>
</div>`;
  }).join('');
}

function toggleRgCard(id){
  const detail=document.getElementById(id+'-detail');
  if(!detail)return;
  const open=detail.classList.contains('open');
  detail.classList.toggle('open',!open);
  const chev=document.getElementById(id+'-chev');
  if(chev)chev.style.transform=open?'':'rotate(180deg)';
}

// ── Admin: editar registro ───────────────────────────────────
let _editingRecord=null;
function _horaTo24(horaStr){
  // Convierte "10:25:40 a.m." → "10:25"
  if(!horaStr)return'';
  const m=horaStr.match(/(\d+):(\d+)(?::(\d+))?\s*(a\.?\s*m\.?|p\.?\s*m\.?)/i);
  if(!m)return horaStr.substring(0,5);
  let h=parseInt(m[1]);const mn=m[2];const pm=/p/i.test(m[4]);
  if(pm&&h<12)h+=12;if(!pm&&h===12)h=0;
  return String(h).padStart(2,'0')+':'+mn;
}
function _hora24ToAmPm(t24){
  // Convierte "10:25" → "10:25:00 a.m."
  const [hh,mm]=t24.split(':');
  let h=parseInt(hh);const ampm=h<12?'a.m.':'p.m.';
  if(h===0)h=12;else if(h>12)h-=12;
  return h+':'+mm+':00 '+ampm;
}
async function openEditRecord(localId){
  const rec=allRecords.find(r=>r.id===localId);
  if(!rec){showToast('Registro no encontrado');return;}
  _editingRecord=rec;
  const titulo=document.getElementById('modal-edit-rec-title');
  if(titulo)titulo.textContent=rec.usuario+' · '+rec.tipo+' · '+rec.fecha;
  const tipoSel=document.getElementById('edit-rec-tipo');
  const horaInp=document.getElementById('edit-rec-hora');
  const fechaInp=document.getElementById('edit-rec-fecha');
  const brutoInp=document.getElementById('edit-rec-bruto');
  const netoInp=document.getElementById('edit-rec-neto');
  // Populate hidden inputs
  if(tipoSel)tipoSel.value=rec.tipo||'Entrada';
  const hora24=_horaTo24(rec.hora);
  if(horaInp)horaInp.value=hora24;
  if(fechaInp)fechaInp.value=rec.fecha||'';
  if(brutoInp)brutoInp.value=rec.horas_bruto||'';
  if(netoInp)netoInp.value=rec.horas_neto||'';
  // Update custom UI labels
  const lblTipo=document.getElementById('lbl-edit-rec-tipo');
  if(lblTipo)lblTipo.textContent=rec.tipo||'Entrada';
  _tpSetValue('edit-rec-hora','lbl-edit-rec-hora-disp',hora24);
  openModal('modal-edit-record');
}
async function saveEditRecord(){
  if(!_editingRecord){closeModal('modal-edit-record');return;}
  const tipo=document.getElementById('edit-rec-tipo')?.value||_editingRecord.tipo;
  const hora24=document.getElementById('edit-rec-hora')?.value;
  const hora=hora24?_hora24ToAmPm(hora24):_editingRecord.hora;
  const fecha=document.getElementById('edit-rec-fecha')?.value||_editingRecord.fecha;
  const horas_bruto=document.getElementById('edit-rec-bruto')?.value||null;
  const horas_neto=document.getElementById('edit-rec-neto')?.value||null;
  // Actualizar en memoria y en IndexedDB
  const updated={..._editingRecord,tipo,hora,fecha,
    horas_bruto:horas_bruto||_editingRecord.horas_bruto,
    horas_neto:horas_neto||_editingRecord.horas_neto};
  await dbPut('records',updated);
  const idx=allRecords.findIndex(r=>r.id===_editingRecord.id);
  if(idx>=0)allRecords[idx]=updated;
  // Actualizar en Supabase si tiene firma
  if(supabaseAvailable&&_editingRecord.firma){
    try{
      await fetch(SUPABASE_URL+'/rest/v1/rpc/admin_edit_record_by_firma',{
        method:'POST',
        headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({
          p_firma:_editingRecord.firma,
          p_nuevo_tipo:tipo,
          p_nueva_hora:hora,
          p_nueva_fecha:fecha,
          p_nuevas_horas_bruto:horas_bruto||null,
          p_nuevas_horas_neto:horas_neto||null,
          p_reason:'Admin manual edit'
        })
      });
    }catch(e){console.warn('admin_edit_record_by_firma error:',e);}
  }
  _editingRecord=null;
  closeModal('modal-edit-record');
  renderAdminRecords();
  renderDashboard();
  showToast('✓ Registro actualizado');
}

function toggleRgMap(rid,lat,lng){
  const wrap=document.getElementById('rg-map-'+rid);
  if(!wrap)return;
  const isOpen=wrap.classList.contains('open');
  wrap.classList.toggle('open',!isOpen);
  if(!isOpen&&!_rgOpenMaps[rid]){
    _rgOpenMaps[rid]=true;
    // Inicializar mapa Leaflet la primera vez que se abre
    const mapDiv=document.getElementById('rg-mapbox-'+rid);
    if(mapDiv&&typeof L!=='undefined'){
      setTimeout(()=>{
        try{
          const map=L.map(mapDiv,{zoomControl:true,attributionControl:false}).setView([lat,lng],17);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
          // Marcador personalizado con círculo pulsante
          const icon=L.divIcon({
            className:'',
            html:`<div style="width:16px;height:16px;background:#10b981;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(16,185,129,0.3)"></div>`,
            iconSize:[16,16],iconAnchor:[8,8]
          });
          L.marker([lat,lng],{icon}).addTo(map);
          // Llamar invalidateSize varias veces para cubrir la animación de apertura
          [100,250,450,700].forEach(ms=>setTimeout(()=>{
            map.invalidateSize();
            map.setView([lat,lng],17);
          },ms));
          // ResizeObserver: re-centra el mapa cuando el contenedor termina de expandirse
          if(window.ResizeObserver){
            const ro=new ResizeObserver(()=>{map.invalidateSize();map.setView([lat,lng],17);});
            ro.observe(mapDiv);
            setTimeout(()=>ro.disconnect(),2000); // dejar de observar tras 2s
          }
        }catch(e){console.warn('Leaflet init error:',e);}
      },50);
    }
  }
}

// ============================================================
// ADMIN — EN VIVO (FIXED: usa allRecords de Supabase, no IndexedDB local)
// ============================================================
function getEmpLiveStatus(usuario){
  // Deriva el estado del empleado directamente de allRecords (que viene de Supabase)
  // NO usa getCycleState() porque el admin no tiene los estados locales de otros dispositivos
  const today=getTodayKey();
  const recs=allRecords.filter(r=>r.usuario===usuario&&r.fecha===today);
  const entrada=recs.find(r=>r.tipo==='Entrada');
  const salida=recs.find(r=>r.tipo==='Salida');
  const inicioLunch=recs.find(r=>r.tipo==='Inicio Lunch');
  const finLunch=recs.find(r=>r.tipo==='Fin Lunch');
  if(!entrada)return{step:0,active:false,entrada,salida,inicioLunch,finLunch,recs};
  if(salida)return{step:4,active:false,entrada,salida,inicioLunch,finLunch,recs};
  if(inicioLunch&&!finLunch)return{step:2,active:true,entrada,salida,inicioLunch,finLunch,recs};
  if(inicioLunch&&finLunch)return{step:3,active:true,entrada,salida,inicioLunch,finLunch,recs};
  return{step:1,active:true,entrada,salida,inicioLunch,finLunch,recs};
}

function renderLiveCard(u,status,lastActivityTs){
  const{step,active,entrada,salida,inicioLunch,finLunch,recs}=status;
  const nombre=u.charAt(0).toUpperCase()+u.slice(1);
  const id='lc-'+u.replace(/[^a-z0-9]/gi,'_');
  // Determinar si inactivo >18h
  const hoursAgo=lastActivityTs?(Date.now()-new Date(lastActivityTs).getTime())/3600000:999;
  const isInactive=hoursAgo>18;
  // Color del círculo de estado
  // step1=trabajando(verde), step2=lunch(naranja), step3=regresó(verde), step4=terminó(rojo), inactivo=gris
  const dotColors={1:'#10b981',2:'#f97316',3:'#10b981',4:'#ef4444'};
  const dotColor=isInactive?'#475569':(dotColors[step]||'#475569');
  // Última acción del empleado
  const lastRec=recs.length?[...recs].sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp))[0]:null;
  const lastLabel=lastRec?lastRec.tipo:'Sin actividad';
  const lastTime=lastRec?lastRec.hora.replace(/ (a|p)\.?\s?m\.?/i,s=>s.replace(/\s/,'').toLowerCase()):'';
  // Horas trabajadas en vivo
  let horasStr='';
  if(entrada&&!salida){
    const iniD=parseHora(entrada.hora);
    const mins=iniD?Math.max(0,(new Date()-iniD)/60000):0;
    if(mins>0&&mins<1440)horasStr=Math.floor(mins/60)+'h '+Math.round(mins%60)+'m';
  }else if(salida?.horas_neto){horasStr=salida.horas_neto;}
  return`<div class="ev-card" id="${id}">
  <div class="ev-row" onclick="toggleLiveCard('${id}')">
    <span class="ev-dot" style="background:${dotColor};box-shadow:0 0 0 3px ${dotColor}30"></span>
    <span class="ev-name">${nombre}</span>
    <span class="ev-last">${lastLabel}${lastTime?' · '+lastTime:''}</span>
    ${horasStr?`<span class="ev-hrs">${horasStr}</span>`:''}
    <svg class="live-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" id="${id}-chev"><path d="M6 9l6 6 6-6"/></svg>
  </div>
  <div class="live-card-detail" id="${id}-detail">
    ${entrada?`<div class="ldd-row"><span>Entrada</span><span class="ldd-val green">${entrada.hora}</span></div>`:''}
    ${inicioLunch?`<div class="ldd-row"><span>Inicio lunch</span><span class="ldd-val orange">${inicioLunch.hora}</span></div>`:''}
    ${finLunch?`<div class="ldd-row"><span>Regresó de lunch</span><span class="ldd-val blue">${finLunch.hora}</span></div>`:''}
    ${salida?`<div class="ldd-row"><span>Salida</span><span class="ldd-val red">${salida.hora}</span></div>`:''}
    ${salida?.horas_neto?`<div class="ldd-row"><span>Horas pagables</span><span class="ldd-val green" style="font-weight:700">${salida.horas_neto}</span></div>`:''}
    ${salida?.horas_bruto?`<div class="ldd-row"><span>Horas brutas</span><span class="ldd-val">${salida.horas_bruto}</span></div>`:''}
    ${salida?.area_trabajo?`<div class="ldd-row"><span>Área de trabajo</span><span class="ldd-val blue">${salida.area_trabajo}</span></div>`:''}
    ${lastRec?.coords&&lastRec.coords!=='sin_gps'?`<div class="ldd-row"><span>GPS</span><span class="ldd-val" style="font-size:10px;opacity:.7">${lastRec.coords}</span></div>`:''}
  </div>
</div>`;
}

function toggleLiveCard(id){
  const detail=document.getElementById(id+'-detail');
  if(!detail)return;
  const open=detail.classList.contains('open');
  detail.classList.toggle('open',!open);
  const chevron=document.getElementById(id+'-chev');
  if(chevron)chevron.style.transform=open?'':'rotate(180deg)';
}

// Obtiene el timestamp de la última actividad de un empleado (todos los registros)
function getLastActivityTs(usuario){
  const recs=allRecords.filter(r=>r.usuario===usuario);
  if(!recs.length)return null;
  return recs.reduce((latest,r)=>{
    const t=r.timestamp||'';
    return t>latest?t:latest;
  },'');
}

async function renderAdminMap(){
  const el=document.getElementById('admin-map-list');if(!el)return;
  // Recargar SIEMPRE desde IndexedDB para tener el estado más actualizado
  allRecords=await getAllRecords();
  const empKeys=Object.keys(employees).filter(u=>u!==ADMIN_USER);
  if(!empKeys.length){el.innerHTML='<div class="live-empty">Sin empleados registrados</div>';return;}
  const active=[];// Solo trabajadores ACTIVOS ahora mismo (sin Salida)
  for(const u of empKeys){
    const s=getEmpLiveStatus(u);
    const lastTs=getLastActivityTs(u);
    // Solo mostrar empleados que tienen Entrada HOY y NO han marcado Salida
    if(s.step===0||s.step===4)continue;// Sin actividad hoy o ya terminaron → NO mostrar
    active.push({u,s,lastTs});
  }
  let html='';
  if(active.length){
    html+=`<div class="live-section-hdr"><div class="live-pulse"></div>En vivo ahora — ${active.length}</div>`;
    html+=active.map(({u,s,lastTs})=>renderLiveCard(u,s,lastTs)).join('');
  }
  if(!html)html=`<div class="live-empty"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg><span>${t('liveEmpty')}</span></div>`;
  el.innerHTML=html;
}

// ============================================================
// ADMIN — EMPLOYEES
// ============================================================
async function renderEmpList(){
  const el=document.getElementById('emp-list');if(!el)return;
  const keys=Object.keys(employees).filter(u=>u!==ADMIN_USER);
  if(!keys.length){el.innerHTML='<div style="color:var(--text4);font-size:13px;padding:8px 0">Sin empleados. Crea el primero arriba.</div>';return;}
  const recCounts={};
  const allRecs=await getAllRecords();
  allRecs.forEach(r=>{recCounts[r.usuario]=(recCounts[r.usuario]||0)+1;});
  el.innerHTML=keys.map(u=>{
    const e=employees[u];const hasFace=e.faceRegistered===true||e.faceRegistered==='TRUE';const hasBio=!!e.biometricId;
    const count=recCounts[u]||0;
    const isAsi=e.isAsistente===true||e.isAsistente==='TRUE';
    const hasDev=!!e.deviceId;
    const devShort=hasDev?(e.deviceId.substring(0,12)+'…'):'Sin vincular';
    const devModel=e.deviceModel||'';
    return `<div class="emp-row" style="flex-wrap:wrap;gap:4px">
      <div class="emp-av" style="${isAsi?'background:rgba(59,130,246,0.3)':''}">${isAsi?'📸':u.substring(0,2).toUpperCase()}</div>
      <div style="flex:1;min-width:120px">
        <div class="emp-name">${u}${isAsi?' <span style="font-size:10px;color:#60a5fa;font-weight:600">[Asistente]</span>':''}</div>
        <div class="emp-role">
          ${isAsi?'<span style="font-size:10px;color:#60a5fa">Solo fotos de proyecto</span>':`<span class="face-badge ${hasFace?'face-ok':'face-no'}">${hasFace?'✓ Bio':'Sin Bio'}</span>`}
          <span style="margin-left:6px;font-size:10px;color:var(--text4)">${count} reg</span>
        </div>
        <div style="font-size:9px;color:${hasDev?'#10b981':'var(--text4)'};margin-top:2px;display:flex;align-items:center;gap:4px">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>
          ${hasDev?`<span title="${e.deviceId}">${devShort}${devModel?' · '+devModel:''}</span>`:'Sin dispositivo vinculado'}
        </div>
      </div>
      <button class="reset-pass-btn" onclick="resetEmpPassword('${u}')" title="${t('resetPassTitle')}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
      </button>
      <button class="reset-pass-btn" onclick="unlinkDevice('${u}')" title="${hasDev?'Desvincular dispositivo':'Sin dispositivo vinculado'}" style="color:${hasDev?'#f59e0b':'var(--text4)'};opacity:${hasDev?1:0.35};cursor:${hasDev?'pointer':'default'}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
      </button>
      <button class="clear-rec-btn" onclick="toggleAsistenteRole('${u}')" title="${isAsi?'Quitar rol asistente':'Hacer asistente'}" style="color:${isAsi?'#60a5fa':'var(--text4)'}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
      </button>
      <button class="clear-rec-btn" onclick="confirmClearLocalRecords('${u}')" title="Limpiar registros locales">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
      <button class="del-btn" onclick="delEmp('${u}')">${t('delete')}</button>
    </div>`;
  }).join('');
}

// Desvincular dispositivo de un empleado (permite que inicie sesión desde otro celular)
async function unlinkDevice(u){
  if(!employees[u]?.deviceId){showToast('Este empleado no tiene dispositivo vinculado');return;}
  const model=employees[u].deviceModel?` (${employees[u].deviceModel})`:'';
  if(!confirm(`¿Desvincular dispositivo de "${u}"${model}?\n\nEl empleado podrá iniciar sesión desde cualquier teléfono. El nuevo dispositivo quedará registrado automáticamente en su próximo login.`))return;
  showLoader('Desvinculando...');
  try{
    await updateEmployee(u,{deviceId:null,deviceModel:null});
    if(supabaseAvailable){
      await sbCall(`/rest/v1/employees?usuario=eq.${encodeURIComponent(u)}`,{
        method:'PATCH',prefer:'return=minimal',
        body:JSON.stringify({device_id:null})
      });
    }
    hideLoader();
    await renderEmpList();
    logAudit('DEVICE_UNLINK',u,{modelo:employees[u]?.deviceModel||'desconocido'});
    showToast('✓ Dispositivo desvinculado. El empleado puede registrarse desde su nuevo teléfono.');
  }catch(e){hideLoader();showToast('Error al desvincular: '+e.message);}
}

// Limpiar registros locales de un empleado (NO afecta Supabase ni backups)
async function confirmClearLocalRecords(u){
  const allRecs=await getAllRecords();
  const count=allRecs.filter(r=>r.usuario===u).length;
  if(!count){showToast('No hay registros locales para '+u);return;}
  if(!confirm(`¿Limpiar ${count} registros locales de "${u}"?\n\nIMPORTANTE: Esto solo borra de ESTE dispositivo.\nSupabase y los backups quedan intactos.`))return;
  await clearLocalRecordsForUser(u);
}

async function clearLocalRecordsForUser(u){
  showLoader('Limpiando registros locales...');
  try{
    const allRecs=await getAllRecords();
    const toDelete=allRecs.filter(r=>r.usuario===u);
    for(const r of toDelete){if(r.id)await dbDelete('records',r.id);}
    // Limpiar también el estado de ciclo local
    await dbDelete('cycleState',u);
    // Refrescar allRecords en memoria
    allRecords=await getAllRecords();
    hideLoader();
    await renderEmpList();
    updateDrawerStats();
    if(isAdmin){renderDashboard();renderAdminRecords();renderAdminMap();}
    showToast('✓ Registros locales de "'+u+'" eliminados (Supabase y backup intactos)');
  }catch(e){hideLoader();console.error('clearLocalRecordsForUser error:',e);showToast('Error al limpiar registros');}
}
async function addEmp(){
  const u=document.getElementById('new-user').value.trim().toLowerCase();const p=document.getElementById('new-pass').value;
  if(!u||!p){showToast('Completa usuario y contraseña');return;}
  if(u===ADMIN_USER){showToast('Nombre reservado');return;}
  if(employees[u]){showToast('Usuario ya existe');return;}
  showLoader(t('loading'));await createEmployee(u,p);hideLoader();
  document.getElementById('new-user').value='';document.getElementById('new-pass').value='';
  logAudit('EMPLOYEE_CREATED',u);
  await renderEmpList();showToast(t('empCreated')+' '+u);
}
let _pendingDelEmpUser=null;
async function delEmp(u){
  _pendingDelEmpUser=u;
  const nm=document.getElementById('modal-del-emp-name');if(nm)nm.textContent=u;
  openModal('modal-del-emp');
}
async function confirmDelEmp(){
  const u=_pendingDelEmpUser;if(!u)return;
  _pendingDelEmpUser=null;
  closeModal('modal-del-emp');
  showLoader(t('loading'));await deleteEmployee(u);hideLoader();
  logAudit('EMPLOYEE_DELETED',u);
  await renderEmpList();showToast(t('empDeleted'));
}

// ============================================================
// ADMIN — REPORT
// ============================================================
// ── Tarifa por hora — persiste en localStorage por empleado ──
// ── MULTI-SELECT PDF ────────────────────────────────────────────────────────
let selectedPayUsers=new Set();

function togglePayCard(u){
  if(selectedPayUsers.has(u)) selectedPayUsers.delete(u);
  else selectedPayUsers.add(u);
  updateRptPdfBtn();
  updatePayGrandTotal(); // ← recalcular total al cambiar selección
}
function selectAllPayCards(all){
  document.querySelectorAll('#rpt-pay-list .pay-card').forEach(card=>{
    const u=card.dataset.paycard;if(!u)return;
    const chk=card.querySelector('.pay-sel-chk');
    if(all){selectedPayUsers.add(u);if(chk)chk.checked=true;}
    else{selectedPayUsers.delete(u);if(chk)chk.checked=false;}
  });
  updateRptPdfBtn();
  updatePayGrandTotal(); // ← recalcular total al cambiar selección masiva
}
function filterPayCards(){
  const q=(document.getElementById('rpt-search')?.value||'').toLowerCase().trim();
  const fromVal=document.getElementById('rpt-from')?.value;
  const toVal=document.getElementById('rpt-to')?.value;
  document.querySelectorAll('#rpt-pay-list .pay-card').forEach(card=>{
    const u=(card.dataset.paycard||'').toLowerCase();
    const matchQ=!q||u.includes(q);
    const matchPending=!showOnlyPending||(fromVal&&toVal&&!isRangePaid(u,fromVal,toVal));
    card.style.display=(matchQ&&matchPending)?'':'none';
  });
}
function updateRptPdfBtn(){
  const n=selectedPayUsers.size;
  const btn=document.getElementById('rpt-pdf-btn');
  const lbl=document.getElementById('rpt-pdf-lbl');
  const cnt=document.getElementById('rpt-sel-count');
  if(lbl)lbl.textContent=`PDF (${n})`;
  if(cnt)cnt.textContent=`${n} seleccionado${n!==1?'s':''}`;
  if(btn){
    btn.disabled=n===0;
    if(n>0){btn.style.cssText='background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.25);color:#ef4444;cursor:pointer';}
    else{btn.style.cssText='background:rgba(239,68,68,0.05);border-color:rgba(239,68,68,0.15);color:rgba(239,68,68,0.4);cursor:not-allowed';}
  }
}
// ────────────────────────────────────────────────────────────────────────────

function getEmpRate(u){
  // Priority: employee record (synced from Supabase) → localStorage fallback
  const fromEmp=parseFloat(employees[u]?.hourlyRate||0);
  if(fromEmp>0) return fromEmp;
  return parseFloat(localStorage.getItem('sc_rate_'+u)||'0');
}
function setEmpRate(u,rate){
  const r=parseFloat(rate)||0;
  localStorage.setItem('sc_rate_'+u,r);
  // Persist in IndexedDB employee record so it survives across sessions
  if(employees[u]){
    updateEmployee(u,{hourlyRate:r});
    // Sync to Supabase (best-effort, ignore if column not yet added)
    if(supabaseAvailable&&r>0){
      sbCall(`/rest/v1/employees?usuario=eq.${encodeURIComponent(u)}`,{
        method:'PATCH',prefer:'return=minimal',
        body:JSON.stringify({hourly_rate:r})
      }).catch(()=>{});
    }
  }
}

// Recalcula el total de un empleado y actualiza el DOM + totalizador
function recalcPayCard(u){
  const rate=getEmpRate(u);
  const hrsEl=document.getElementById('pay-hrs-'+u);
  const totalEl=document.getElementById('pay-total-'+u);
  if(!hrsEl||!totalEl)return;
  const reg=parseFloat(hrsEl.dataset.reg||'0');
  const ot=parseFloat(hrsEl.dataset.ot||'0');
  const dt=parseFloat(hrsEl.dataset.dt||'0');
  const total=rate>0?(reg*rate)+(ot*rate*1.5)+(dt*rate*2):0;
  totalEl.textContent=rate>0?'$'+total.toFixed(2):'—';
  totalEl.style.color=rate>0?'var(--green)':'var(--text4)';
  // Actualizar desglose OT si existe
  const card=totalEl.closest('.pay-card');
  if(card){
    let breakdown=card.querySelector('.ot-breakdown');
    if((ot>0.01||dt>0.01)&&rate>0){
      const bd=`<span>Regular: $${(reg*rate).toFixed(2)}</span>${ot>0.01?`<span>OT: $${(ot*rate*1.5).toFixed(2)}</span>`:''}${dt>0.01?`<span>DT: $${(dt*rate*2).toFixed(2)}</span>`:''}`;
      if(breakdown){breakdown.innerHTML=bd;}
      else{breakdown=document.createElement('div');breakdown.className='ot-breakdown';breakdown.innerHTML=bd;card.appendChild(breakdown);}
    }else if(breakdown){breakdown.remove();}
  }
  updatePayGrandTotal();
}

function updatePayGrandTotal(){
  const list=document.getElementById('rpt-pay-list');if(!list)return;
  const gtEl=document.getElementById('pgt-val');const gtWrap=document.getElementById('pay-grand-total');
  let grand=0,hasAny=false;
  list.querySelectorAll('[data-paycard]').forEach(card=>{
    const u=card.dataset.paycard;
    // Solo sumar empleados actualmente seleccionados (checkbox marcado)
    if(selectedPayUsers.size>0&&!selectedPayUsers.has(u))return;
    const rate=getEmpRate(u);
    const hrsEl=card.querySelector('[data-reg]');
    if(rate>0&&hrsEl){
      const reg=parseFloat(hrsEl.dataset.reg||'0');
      const ot=parseFloat(hrsEl.dataset.ot||'0');
      const dt=parseFloat(hrsEl.dataset.dt||'0');
      grand+=(reg*rate)+(ot*rate*1.5)+(dt*rate*2);
      hasAny=true;
    }
  });
  if(gtEl)gtEl.textContent='$'+grand.toFixed(2);
  if(gtWrap)gtWrap.style.display=hasAny?'flex':'none';
}

// Guarda/carga el rango de fechas activo del reporte
let _rptFrom=null,_rptTo=null;

// ============================================================
// CUSTOM DATE RANGE CALENDAR
// ============================================================
const MESES_ES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
let _calYear=new Date().getFullYear(),_calMonth=new Date().getMonth();
let _calFrom=null,_calTo=null; // Date objects
let _calStep=0; // 0=esperando desde, 1=esperando hasta

function openRptCalendar(){
  const popup=document.getElementById('rpt-calendar-popup');
  if(!popup)return;
  const isOpen=popup.style.display!=='none';
  if(isOpen){popup.style.display='none';return;}
  // Leer valores actuales
  const fi=document.getElementById('rpt-from'),ti=document.getElementById('rpt-to');
  if(fi?.value){_calFrom=new Date(fi.value+'T12:00:00');}
  if(ti?.value){_calTo=new Date(ti.value+'T12:00:00');}
  if(_calFrom){_calYear=_calFrom.getFullYear();_calMonth=_calFrom.getMonth();}
  _calStep=_calFrom&&_calTo?0:(_calFrom?1:0);
  popup.style.display='block';
  renderCalGrid();
  // Cerrar al click fuera
  setTimeout(()=>{
    document.addEventListener('click',_calOutsideClick,{once:false,capture:true});
  },100);
}

function _calOutsideClick(e){
  const popup=document.getElementById('rpt-calendar-popup');
  const btn=document.getElementById('rpt-datepicker-btn');
  if(popup&&!popup.contains(e.target)&&btn&&!btn.contains(e.target)){
    popup.style.display='none';
    document.removeEventListener('click',_calOutsideClick,true);
  }
}

function rptCalNav(dir){
  _calMonth+=dir;
  if(_calMonth<0){_calMonth=11;_calYear--;}
  if(_calMonth>11){_calMonth=0;_calYear++;}
  renderCalGrid();
}

function rptCalClear(){
  _calFrom=null;_calTo=null;_calStep=0;
  const fi=document.getElementById('rpt-from'),ti=document.getElementById('rpt-to');
  if(fi)fi.value='';if(ti)ti.value='';
  const disp=document.getElementById('rpt-range-display');
  if(disp)disp.textContent='Seleccionar período';
  renderCalGrid();renderReport();
}

function _calFmt(d){// → YYYY-MM-DD
  if(!d)return'';
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function _calShortFmt(d){// → "15 abr"
  if(!d)return'';
  return d.getDate()+' '+MESES_ES[d.getMonth()].slice(0,3).toLowerCase();
}

function renderCalGrid(){
  const lbl=document.getElementById('rpt-cal-month-lbl');
  if(lbl)lbl.textContent=MESES_ES[_calMonth]+' '+_calYear;
  const hint=document.getElementById('rpt-cal-hint');
  if(hint)hint.textContent=_calStep===1?'Ahora selecciona la fecha final':'Selecciona fecha de inicio';
  const grid=document.getElementById('rpt-cal-days');
  if(!grid)return;
  const today=new Date();today.setHours(0,0,0,0);
  const firstDay=new Date(_calYear,_calMonth,1).getDay(); // 0=Dom
  const daysInMonth=new Date(_calYear,_calMonth+1,0).getDate();
  let html='';
  // Espacios vacíos antes del primer día
  for(let i=0;i<firstDay;i++)html+='<div class="rpt-cal-day empty"></div>';
  for(let d=1;d<=daysInMonth;d++){
    const date=new Date(_calYear,_calMonth,d);date.setHours(0,0,0,0);
    const isToday=date.getTime()===today.getTime();
    const fromMs=_calFrom?new Date(_calFrom).setHours(0,0,0,0):null;
    const toMs=_calTo?new Date(_calTo).setHours(0,0,0,0):null;
    const dateMs=date.getTime();
    let cls='rpt-cal-day';
    if(isToday)cls+=' today';
    if(fromMs!==null&&dateMs===fromMs)cls+=' selected-from';
    else if(toMs!==null&&dateMs===toMs)cls+=' selected-to';
    else if(fromMs!==null&&toMs!==null&&dateMs>fromMs&&dateMs<toMs)cls+=' in-range';
    const iso=_calYear+'-'+String(_calMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    html+=`<div class="${cls}" onclick="rptCalSelectDay('${iso}')">${d}</div>`;
  }
  grid.innerHTML=html;
}

function rptCalSelectDay(iso){
  const d=new Date(iso+'T12:00:00');
  if(_calStep===0||(!_calFrom&&!_calTo)){
    // primer click = desde
    _calFrom=d;_calTo=null;_calStep=1;
  } else if(_calStep===1){
    // segundo click = hasta
    if(d<_calFrom){_calTo=_calFrom;_calFrom=d;}
    else{_calTo=d;}
    _calStep=0;
    // Aplicar al reporte
    const fi=document.getElementById('rpt-from'),ti=document.getElementById('rpt-to');
    if(fi){fi.value=_calFmt(_calFrom);}
    if(ti){ti.value=_calFmt(_calTo);}
    // Actualizar display
    const disp=document.getElementById('rpt-range-display');
    if(disp)disp.textContent=_calShortFmt(_calFrom)+' → '+_calShortFmt(_calTo);
    // Desactivar quick btns
    document.querySelectorAll('.rpt-qbtn').forEach(b=>b.classList.remove('active'));
    // Cerrar popup + actualizar reporte
    const popup=document.getElementById('rpt-calendar-popup');
    if(popup)popup.style.display='none';
    document.removeEventListener('click',_calOutsideClick,true);
    renderReport();
    return;
  }
  renderCalGrid();
}

function setRptQuick(q){
  const today=new Date();
  let from,to;
  if(q==='hoy'){from=to=today;}
  else if(q==='semana'){from=new Date(today);from.setDate(today.getDate()-6);to=today;}
  else if(q==='mes'){from=new Date(today);from.setDate(today.getDate()-29);to=today;}
  const fmt=d=>d.toISOString().slice(0,10);
  const fi=document.getElementById('rpt-from');const ti=document.getElementById('rpt-to');
  if(fi)fi.value=fmt(from);if(ti)ti.value=fmt(to);
  // Actualizar el display del botón calendario
  _calFrom=from;_calTo=to;_calStep=0;
  const disp=document.getElementById('rpt-range-display');
  if(disp)disp.textContent=_calShortFmt(from)+' → '+_calShortFmt(to);
  document.querySelectorAll('.rpt-qbtn').forEach(b=>b.classList.remove('active'));
  const btn=document.getElementById('rqb-'+q);if(btn)btn.classList.add('active');
  renderReport();
}

function onRptRangeChange(){
  document.querySelectorAll('.rpt-qbtn').forEach(b=>b.classList.remove('active'));
  renderReport();
}

// ── RANGO PERSONALIZADO ──────────────────────────────────────
let _rcStep=1; // 1=selecting from, 2=selecting to
let _rcFrom='', _rcTo='';
let _rcYear=new Date().getFullYear(), _rcMonth=new Date().getMonth();

function openRangoPersonalizado(){
  _rcStep=1; _rcFrom=''; _rcTo='';
  _rcYear=new Date().getFullYear(); _rcMonth=new Date().getMonth();
  _rcUpdatePills();
  _rcRenderGrid();
  openModal('modal-rango-custom');
}

function rcCalNav(dir){
  _rcMonth+=dir;
  if(_rcMonth<0){_rcMonth=11;_rcYear--;}
  if(_rcMonth>11){_rcMonth=0;_rcYear++;}
  _rcRenderGrid();
}

function _rcRenderGrid(){
  const MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  document.getElementById('rc-month-lbl').textContent=MONTHS[_rcMonth]+' '+_rcYear;
  const firstDay=new Date(_rcYear,_rcMonth,1).getDay();
  const daysInMonth=new Date(_rcYear,_rcMonth+1,0).getDate();
  const todayStr=new Date().toISOString().slice(0,10);
  let html='';
  for(let i=0;i<firstDay;i++) html+=`<div class="mc-day empty"></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const iso=_rcYear+'-'+String(_rcMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    let cls='mc-day';
    if(iso===todayStr) cls+=' today';
    if(_rcFrom&&_rcTo){
      if(iso===_rcFrom&&iso===_rcTo) cls+=' range-single';
      else if(iso===_rcFrom) cls+=' range-from';
      else if(iso===_rcTo) cls+=' range-to';
      else if(iso>_rcFrom&&iso<_rcTo) cls+=' in-range';
    } else if(_rcFrom&&iso===_rcFrom){
      cls+=' range-single';
    }
    html+=`<div class="${cls}" onclick="_rcPickDay('${iso}')">${d}</div>`;
  }
  document.getElementById('rc-grid').innerHTML=html;
}

function _rcPickDay(iso){
  if(_rcStep===1){
    _rcFrom=iso; _rcTo=''; _rcStep=2;
    _rcUpdatePills();
    _rcRenderGrid();
  } else {
    if(iso<_rcFrom){
      // Swapped — the selected "to" is before "from": make it the new from
      _rcTo=_rcFrom; _rcFrom=iso;
    } else {
      _rcTo=iso;
    }
    _rcStep=1; // allow re-picking from
    _rcUpdatePills();
    _rcRenderGrid();
  }
}

function _rcUpdatePills(){
  const fmt=iso=>{
    if(!iso) return '—';
    const d=new Date(iso+'T12:00:00');
    const M=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return d.getDate()+' '+M[d.getMonth()]+' '+d.getFullYear();
  };
  const step1=document.getElementById('rc-step1-pill');
  const step2=document.getElementById('rc-step2-pill');
  const applyBtn=document.getElementById('rc-apply-btn');
  const title=document.getElementById('rc-modal-title');

  document.getElementById('rc-from-lbl').textContent=fmt(_rcFrom);
  document.getElementById('rc-to-lbl').textContent=fmt(_rcTo);

  if(_rcStep===2){
    title.textContent='Selecciona fecha final';
    step1?.classList.remove('rc-step-active');
    step2?.classList.add('rc-step-active');
    document.getElementById('rc-to-lbl').style.color='var(--text4)';
  } else {
    title.textContent=_rcFrom?'Rango personalizado':'Selecciona fecha inicial';
    step2?.classList.remove('rc-step-active');
    step1?.classList.add('rc-step-active');
  }

  if(applyBtn) applyBtn.style.display=(_rcFrom&&_rcTo)?'flex':'none';
}

function applyRangoCustom(){
  if(!_rcFrom||!_rcTo) return;
  const fi=document.getElementById('rpt-from');
  const ti=document.getElementById('rpt-to');
  if(fi) fi.value=_rcFrom;
  if(ti) ti.value=_rcTo;
  // Actualizar display del botón rango
  _calFrom=new Date(_rcFrom+'T12:00:00');
  _calTo=new Date(_rcTo+'T12:00:00');
  _calStep=0;
  const disp=document.getElementById('rpt-range-display');
  if(disp) disp.textContent=_calShortFmt(_calFrom)+' → '+_calShortFmt(_calTo);
  // Marcar botón Custom como activo
  document.querySelectorAll('.rpt-qbtn').forEach(b=>b.classList.remove('active'));
  const btn=document.getElementById('rqb-custom');
  if(btn) btn.classList.add('active');
  closeModal('modal-rango-custom');
  renderReport();
}

// Funciones para períodos pagados
function getPaidHistory(){try{return JSON.parse(localStorage.getItem('sc_paid_history')||'[]');}catch(e){return[];}}
function savePaidHistory(arr){localStorage.setItem('sc_paid_history',JSON.stringify(arr));}

function markPeriodAsPaid(){
  const fromVal=document.getElementById('rpt-from')?.value;
  const toVal=document.getElementById('rpt-to')?.value;
  if(!fromVal||!toVal){showToast('Selecciona un rango de fechas primero');return;}
  const container=document.getElementById('rpt-pay-list');
  const cards=container?container.querySelectorAll('.pay-card'):[];
  const history=getPaidHistory();
  let count=0;
  cards.forEach(card=>{
    const u=card.dataset.paycard;if(!u)return;
    const hrsEl=document.getElementById('pay-hrs-'+u);
    const totalEl=document.getElementById('pay-total-'+u);
    const hrs=parseFloat(hrsEl?.dataset?.hrs||0);
    const total=totalEl?.textContent||'—';
    history.unshift({usuario:u,from:fromVal,to:toVal,hrs:hrs.toFixed(2),total,paidAt:new Date().toISOString()});
    count++;
  });
  savePaidHistory(history);
  showToast('✓ Período marcado como PAGADO para '+count+' empleado(s)');
  renderReport();renderPaidHistory();
}

function renderPaidHistory(){
  const el=document.getElementById('rpt-paid-history');if(!el)return;
  const history=getPaidHistory();
  if(!history.length){el.innerHTML='';return;}
  // Agrupar por rango
  const byRange={};
  history.forEach(h=>{
    const key=h.from+'→'+h.to;
    if(!byRange[key])byRange[key]={from:h.from,to:h.to,paidAt:h.paidAt,items:[]};
    byRange[key].items.push(h);
  });
  el.innerHTML='<div class="pr-section-lbl" style="margin-top:12px">Períodos pagados</div>'+
    Object.values(byRange).slice(0,5).map(g=>{
      const d=new Date(g.paidAt);
      const dateStr=d.toLocaleDateString('es-US',{month:'short',day:'numeric',year:'numeric'});
      const fEsc=g.from.replace(/'/g,"\\'");
      const tEsc=g.to.replace(/'/g,"\\'");
      return`<div class="paid-period-row">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div style="flex:1;min-width:0">
            <div class="paid-period-dates">${g.from} → ${g.to}</div>
            <div class="paid-period-emp">${g.items.map(i=>`<span>${i.usuario.charAt(0).toUpperCase()+i.usuario.slice(1)}: ${i.total}</span>`).join('')}</div>
            <div class="paid-period-when">Pagado el ${dateStr}</div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;align-items:center;padding-top:2px">
            <button onclick="exportPaidPeriodPDF('${fEsc}','${tEsc}')" style="
              background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);
              border-radius:8px;padding:6px 10px;color:#ef4444;
              font-size:11px;font-weight:700;cursor:pointer;
              display:flex;align-items:center;gap:4px;white-space:nowrap;font-family:var(--font)
            ">📄 PDF</button>
            <button onclick="exportPaidPeriodCSV('${fEsc}','${tEsc}')" style="
              background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);
              border-radius:8px;padding:6px 10px;color:var(--green);
              font-size:11px;font-weight:700;cursor:pointer;
              display:flex;align-items:center;gap:4px;white-space:nowrap;font-family:var(--font)
            ">📊 CSV</button>
          </div>
        </div>
      </div>`;
    }).join('');
}

// Exporta PDF de un período pagado específico sin alterar los filtros actuales
async function exportPaidPeriodPDF(from,to){
  // Guardar filtros actuales
  const prevFrom=document.getElementById('rpt-from')?.value;
  const prevTo=document.getElementById('rpt-to')?.value;
  // Aplicar filtros del período seleccionado
  const fromEl=document.getElementById('rpt-from');
  const toEl=document.getElementById('rpt-to');
  if(fromEl)fromEl.value=from;
  if(toEl)toEl.value=to;
  // Generar PDF
  await exportReportPDF();
  // Restaurar filtros anteriores
  if(fromEl)fromEl.value=prevFrom||'';
  if(toEl)toEl.value=prevTo||'';
}

// Exporta CSV de un período pagado específico
function exportPaidPeriodCSV(from,to){
  const prevFrom=document.getElementById('rpt-from')?.value;
  const prevTo=document.getElementById('rpt-to')?.value;
  const fromEl=document.getElementById('rpt-from');
  const toEl=document.getElementById('rpt-to');
  if(fromEl)fromEl.value=from;
  if(toEl)toEl.value=to;
  exportReportCSV();
  if(fromEl)fromEl.value=prevFrom||'';
  if(toEl)toEl.value=prevTo||'';
}

// Verifica si un rango ya fue pagado para un usuario
function isRangePaid(usuario,fromVal,toVal){
  return getPaidHistory().some(h=>h.usuario===usuario&&h.from===fromVal&&h.to===toVal&&h.type!=='unmark');
}

// Toggle pagado/pendiente por empleado individual
function toggleEmpPaid(u,fromVal,toVal){
  const alreadyPaid=isRangePaid(u,fromVal,toVal);
  const nombre=u.charAt(0).toUpperCase()+u.slice(1);
  const history=getPaidHistory();
  if(alreadyPaid){
    if(!confirm(`¿Desmarcar a ${nombre} como pagado en este período?\n\nEsto quedará anotado en el historial de cambios.`))return;
    // Remover entradas de paid y agregar log de unmark
    const newHist=history.filter(h=>!(h.usuario===u&&h.from===fromVal&&h.to===toVal&&h.type!=='unmark'));
    const now=new Date().toISOString();
    newHist.unshift({usuario:u,from:fromVal,to:toVal,hrs:'—',total:'—',paidAt:now,type:'unmark',changedBy:currentUser||'admin'});
    savePaidHistory(newHist); logAudit('PAYMENT_UNMARKED',u,{periodo:fromVal+'→'+toVal});
    showToast(`↩ ${nombre} — regresado a Pendiente`);
  }else{
    const hrsEl=document.getElementById('pay-hrs-'+u);
    const totalEl=document.getElementById('pay-total-'+u);
    const hrs=parseFloat(hrsEl?.dataset?.hrs||0);
    const total=totalEl?.textContent||'—';
    const now=new Date().toISOString();
    history.unshift({usuario:u,from:fromVal,to:toVal,hrs:hrs.toFixed(2),total,paidAt:now,type:'paid',changedBy:currentUser||'admin'});
    savePaidHistory(history);
    logAudit('PAYMENT_MARKED',u,{periodo:fromVal+'→'+toVal,total});
    showToast(`✓ ${nombre} marcado como PAGADO`);
  }
  renderReport();
  renderPaidHistory();
}

// Filtro "Solo Pendientes" en reporte
let showOnlyPending=false;
function toggleOnlyPending(){
  showOnlyPending=!showOnlyPending;
  const btn=document.getElementById('btn-only-pending');
  if(btn)btn.classList.toggle('active',showOnlyPending);
  filterPayCards();
}

function renderReport(){
  const fromVal=document.getElementById('rpt-from')?.value;
  const toVal=document.getElementById('rpt-to')?.value;
  // Filtrar registros por rango de fechas seleccionado
  let recs=allRecords;
  if(fromVal&&toVal){
    const from=new Date(fromVal+'T00:00:00');
    const to=new Date(toVal+'T23:59:59');
    recs=allRecords.filter(r=>{
      if(r.timestamp){const t=new Date(r.timestamp);return t>=from&&t<=to;}
      // fallback: comparar por fecha texto M/D/YYYY
      if(r.fecha){
        const rf=new Date(r.fecha);
        return !isNaN(rf.getTime())&&rf>=from&&rf<=to;
      }
      return false;
    });
  } else if(fromVal){
    const from=new Date(fromVal+'T00:00:00');
    recs=allRecords.filter(r=>{
      if(r.timestamp)return new Date(r.timestamp)>=from;
      if(r.fecha){const rf=new Date(r.fecha);return !isNaN(rf.getTime())&&rf>=from;}
      return false;
    });
  }
  // Ordenar cronológicamente para garantizar Entrada antes de Salida
  recs=recs.slice().sort((a,b)=>{
    const ta=a.timestamp?new Date(a.timestamp).getTime():0;
    const tb=b.timestamp?new Date(b.timestamp).getTime():0;
    return ta-tb;
  });
  // Helper: parsea "8h 30m" → minutos
  function _parseHorasTxt(t){
    if(!t||typeof t!=='string')return 0;
    const m=t.match(/(\d+)h\s*(\d+)m?/);
    return m?(parseInt(m[1])*60+parseInt(m[2])):0;
  }
  // Calcular horas por empleado con OT California (>8h/día = 1.5x, >12h/día = 2x)
  const users={};
  recs.forEach(r=>{
    const u=r.usuario;
    if(!users[u])users[u]={horasBruto:0,regularHrs:0,otHrs:0,dtHrs:0,diasSet:new Set(),lastEntrada:{},lunchOT:0,dayRecs:{},oshaOk:0,oshaTotal:0};
    const uu=users[u];
    if(r.tipo==='Entrada'){
      uu.lastEntrada[r.fecha]=r.hora;
      uu.oshaTotal++;
      if(r.osha_ok)uu.oshaOk++;
    }
    if(!uu.dayRecs[r.fecha])uu.dayRecs[r.fecha]=[];
    uu.dayRecs[r.fecha].push(r);
    if(r.tipo==='Salida'){
      let totalMins=0,pagoMins=0;
      // PRIORIDAD 1: usar horas_neto almacenada (calculada en el momento del registro)
      if(r.horas_neto&&_parseHorasTxt(r.horas_neto)>0){
        const netoM=_parseHorasTxt(r.horas_neto);
        const brutoM=r.horas_bruto?_parseHorasTxt(r.horas_bruto):netoM;
        totalMins=brutoM;pagoMins=netoM;
      }
      // PRIORIDAD 2: horas_bruto almacenada + descontar lunch real
      else if(r.horas_bruto&&_parseHorasTxt(r.horas_bruto)>0){
        totalMins=_parseHorasTxt(r.horas_bruto);
        const lm=calcActualLunchMins(uu.dayRecs[r.fecha]||[]);
        pagoMins=Math.max(0,totalMins-lm);
      }
      // PRIORIDAD 3: calcular desde hora de entrada (flujo normal en tiempo real)
      else if(uu.lastEntrada[r.fecha]){
        totalMins=calcMinsBetween(uu.lastEntrada[r.fecha],r.hora);
        if(totalMins>0&&totalMins<24*60){
          const lm=calcActualLunchMins(uu.dayRecs[r.fecha]||[]);
          pagoMins=Math.max(0,totalMins-lm);
        }
      }
      if(pagoMins>0&&totalMins<24*60){
        const pagoHrs=pagoMins/60;
        uu.horasBruto+=totalMins/60;
        uu.diasSet.add(r.fecha);
        delete uu.lastEntrada[r.fecha];
        // California OT: >8h/día = 1.5x  |  >12h/día = 2x
        if(pagoHrs<=8){uu.regularHrs+=pagoHrs;}
        else if(pagoHrs<=12){uu.regularHrs+=8;uu.otHrs+=(pagoHrs-8);}
        else{uu.regularHrs+=8;uu.otHrs+=4;uu.dtHrs+=(pagoHrs-12);}
      }
    }
  });
  const container=document.getElementById('rpt-pay-list');if(!container)return;
  const keys=Object.keys(users).filter(u=>u!==ADMIN_USER).sort((a,b)=>(users[b].regularHrs+users[b].otHrs+users[b].dtHrs)-(users[a].regularHrs+users[a].otHrs+users[a].dtHrs));
  if(!keys.length){
    container.innerHTML='<div class="live-empty" style="padding:40px 0">Sin datos para el período seleccionado</div>';
    const pg=document.getElementById('pay-grand-total');if(pg)pg.style.display='none';
    const pb=document.getElementById('rpt-paid-bar');if(pb)pb.style.display='none';
    renderPaidHistory();return;
  }
  container.innerHTML=keys.map(u=>{
    const d=users[u];
    const diasCount=d.diasSet.size;
    const nombre=u.charAt(0).toUpperCase()+u.slice(1);
    const ini=u.substring(0,2).toUpperCase();
    const rate=getEmpRate(u);
    const totalPagado=d.regularHrs+d.otHrs+d.dtHrs;
    const totalPay=rate>0?(d.regularHrs*rate)+(d.otHrs*rate*1.5)+(d.dtHrs*rate*2):0;
    const totalStr=rate>0?'$'+totalPay.toFixed(2):'—';
    const totalColor=rate>0?'var(--green)':'var(--text4)';
    const alreadyPaid=fromVal&&toVal&&isRangePaid(u,fromVal,toVal);
    const hasOT=d.otHrs>0.01||d.dtHrs>0.01;
    const oshaAll=d.oshaTotal>0&&d.oshaOk===d.oshaTotal;
    const oshaPartial=d.oshaTotal>0&&d.oshaOk>0&&d.oshaOk<d.oshaTotal;
    const oshaStr=d.oshaTotal>0?`${d.oshaOk}/${d.oshaTotal}`:'—';
    const oshaColor=oshaAll?'var(--green)':oshaPartial?'#f97316':'#ef4444';
    const isSelPdf=selectedPayUsers.has(u);
    return`<div class="pay-card" data-paycard="${u}" data-reg="${d.regularHrs.toFixed(4)}" data-ot="${d.otHrs.toFixed(4)}" data-dt="${d.dtHrs.toFixed(4)}" data-osha-ok="${d.oshaOk}" data-osha-total="${d.oshaTotal}">
  <div class="pay-top">
    <label onclick="event.stopPropagation()" style="display:flex;align-items:center;flex-shrink:0;cursor:pointer;margin-right:4px" title="Incluir en PDF">
      <input type="checkbox" class="pay-sel-chk" ${isSelPdf?'checked':''} onchange="togglePayCard('${u}')" style="width:15px;height:15px;accent-color:var(--green);cursor:pointer">
    </label>
    <div class="td-av" style="flex-shrink:0">${ini}</div>
    <div class="pay-name">${nombre}</div>
    <div class="pay-days" style="flex-shrink:0">${diasCount} día${diasCount!==1?'s':''}</div>
  </div>
  <div class="pay-badges-row">
    ${fromVal&&toVal?`<button class="pay-paid-btn ${alreadyPaid?'paid':'pending'}" onclick="event.stopPropagation();toggleEmpPaid('${u}','${fromVal}','${toVal}')" title="${alreadyPaid?'Toca para desmarcar':'Toca para marcar como pagado'}">${alreadyPaid?'✓ Pagado':'⏳ Pendiente'}</button>`:''}
    ${hasOT?'<span class="ot-badge">OT</span>':''}
    ${d.oshaTotal>0?`<span style="background:rgba(0,0,0,0.3);border:1px solid ${oshaColor}44;border-radius:20px;padding:2px 7px;font-size:10px;font-weight:700;color:${oshaColor}" title="OSHA checklist confirmado">🛡️ ${oshaStr}</span>`:''}
  </div>
  <div class="pay-hrs-row">
    <div class="pay-hrs-item"><span class="pay-hrs-lbl">Hrs brutas</span><span class="pay-hrs-val">${d.horasBruto.toFixed(1)}h</span></div>
    <div class="pay-hrs-item accent"><span class="pay-hrs-lbl">Regular (1x)</span><span class="pay-hrs-val green" id="pay-hrs-${u}" data-hrs="${totalPagado.toFixed(4)}" data-reg="${d.regularHrs.toFixed(4)}" data-ot="${d.otHrs.toFixed(4)}" data-dt="${d.dtHrs.toFixed(4)}">${d.regularHrs.toFixed(1)}h</span></div>
    ${d.otHrs>0.01?`<div class="pay-hrs-item"><span class="pay-hrs-lbl">OT 1.5x</span><span class="pay-hrs-val orange">${d.otHrs.toFixed(1)}h</span></div>`:''}
    ${d.dtHrs>0.01?`<div class="pay-hrs-item"><span class="pay-hrs-lbl">Doble 2x</span><span class="pay-hrs-val" style="color:#ef4444">${d.dtHrs.toFixed(1)}h</span></div>`:''}
  </div>
  <div class="pay-calc-row">
    <div class="pay-rate-wrap">
      <span class="pay-rate-lbl">$ / hora</span>
      <div class="pay-rate-input-wrap">
        <span class="pay-dollar">$</span>
        <input class="pay-rate-inp" type="number" min="0" step="0.01" placeholder="0.00"
          value="${rate>0?rate:''}"
          oninput="setEmpRate('${u}',this.value);recalcPayCard('${u}')"
          onfocus="this.select()">
      </div>
    </div>
    <div class="pay-result">
      <span class="pay-result-lbl">Total a pagar</span>
      <span class="pay-total-val" id="pay-total-${u}" style="color:${totalColor}">${totalStr}</span>
    </div>
  </div>
  ${hasOT&&rate>0?`<div class="ot-breakdown">
    <span>Regular: $${(d.regularHrs*rate).toFixed(2)}</span>
    ${d.otHrs>0.01?`<span>OT: $${(d.otHrs*rate*1.5).toFixed(2)}</span>`:''}
    ${d.dtHrs>0.01?`<span>DT: $${(d.dtHrs*rate*2).toFixed(2)}</span>`:''}
  </div>`:''}
</div>`;
  }).join('');
  // Auto-select all employees for PDF and show multi-select bar
  selectedPayUsers=new Set(keys);
  const selBar=document.getElementById('rpt-select-bar');
  if(selBar)selBar.style.display=keys.length?'block':'none';
  updateRptPdfBtn();
  updatePayGrandTotal();
  const pb=document.getElementById('rpt-paid-bar');
  if(pb)pb.style.display=fromVal&&toVal?'block':'none';
  renderPaidHistory();
}

// ============================================================
// ADMIN — SETTINGS (con info de backups y sync)
// ============================================================
async function renderAdminSettings(){
  const el=document.getElementById('admin-settings-panel');if(!el)return;
  const backupInfo=await verifyLastBackup();
  const lastBackups=await getLastBackups(3);
  const pendingSync=allRecords.filter(r=>!r.synced_cloud).length;
  el.innerHTML=`
    <div class="sec-title" style="margin-bottom:12px">Configuración del sistema</div>
    <div class="config-card"><div class="config-lbl">Tiempo de lunch base</div><div class="config-val">${LUNCH_MINUTES} min</div><div class="config-sub">Tolerancia silenciosa: ${LUNCH_TOLERANCE_MINUTES} min</div></div>
    <div class="config-card"><div class="config-lbl">Intentos de verificación facial</div><div class="config-val">${MAX_FACE_ATTEMPTS}</div><div class="config-sub">Luego requiere código de emergencia</div></div>
    <div class="config-card" style="border-color:${supabaseAvailable?'rgba(16,185,129,0.2)':'rgba(249,115,22,0.2)'}">
      <div class="config-lbl">Sincronización en la nube</div>
      <div class="config-val" style="font-size:14px;color:${supabaseAvailable?'var(--green)':'var(--orange)'}">${supabaseAvailable?'✓ Conectado a Supabase':'⚠ Sin conexión'}</div>
      <div class="config-sub">${pendingSync} registros pendientes de subir</div>
      ${!SUPABASE_URL?'<div style="margin-top:6px;color:var(--orange);font-size:11px">⚠ Supabase no configurado — ver instrucciones abajo</div>':''}
    </div>
    <div class="config-card" style="border-color:${backupInfo.ok?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'}">
      <div class="config-lbl">Último backup local (cada 15 min)</div>
      <div class="config-val" style="font-size:13px;color:${backupInfo.ok?'var(--green)':'var(--red)'}">${backupInfo.ok?'✓ Integridad verificada':'⚠ '+backupInfo.msg}</div>
      <div class="config-sub">${backupInfo.timestamp?new Date(backupInfo.timestamp).toLocaleString('es-US'):'—'} · ${backupInfo.totalRecords||0} registros</div>
      ${lastBackups.length>1?'<div style="margin-top:8px;color:var(--text4);font-size:10px;text-transform:uppercase;letter-spacing:1px">Backups recientes</div>'+lastBackups.slice(1).map(b=>`<div style="color:var(--text3);font-size:11px;font-family:var(--mono);padding:2px 0">${new Date(b.timestamp).toLocaleString('es-US')} · ${b.totalRecords} reg</div>`).join(''):''}
    </div>
    <div class="config-card">
      <div class="config-lbl">Acciones de respaldo</div>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <button onclick="exportFullBackup()" style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:8px;padding:8px 12px;color:var(--blue);font-size:12px;cursor:pointer;font-family:var(--font);font-weight:600">📦 Exportar JSON</button>
        <button onclick="exportCSV()" style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:8px;padding:8px 12px;color:var(--green);font-size:12px;cursor:pointer;font-family:var(--font);font-weight:600">📊 Exportar CSV</button>
        <button onclick="createSignedBackup().then(()=>showToast('✓ Backup creado'))" style="background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.2);border-radius:8px;padding:8px 12px;color:var(--orange);font-size:12px;cursor:pointer;font-family:var(--font);font-weight:600">🔒 Backup ahora</button>
        <button onclick="exportLatestBackup()" style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.25);border-radius:8px;padding:8px 12px;color:#c084fc;font-size:12px;cursor:pointer;font-family:var(--font);font-weight:600">📤 Exportar backup interno</button>
      </div>
    </div>
    ${!SUPABASE_URL?`
    <div class="config-card" style="border-color:rgba(249,115,22,0.2)">
      <div class="config-lbl" style="color:var(--orange)">⚡ Configurar Supabase (gratis)</div>
      <div style="color:var(--text3);font-size:12px;line-height:1.8;margin-top:6px">
        1. Ve a <span style="color:var(--blue)">supabase.com</span> → Create project<br>
        2. Settings → API → copia "Project URL" y "anon public key"<br>
        3. En el SQL Editor pega el SQL del archivo <span style="color:var(--green)">supabase_setup.sql</span><br>
        4. En script.js reemplaza SUPABASE_URL y SUPABASE_ANON_KEY
      </div>
    </div>`:''}
  `;
}

// ============================================================
// EXPORT
// ============================================================
async function exportFullBackup(){
  const recs=await getAllRecords();const emps=await dbGetAll('employees');
  const backup={exportedAt:new Date().toISOString(),version:'3.0',device:deviceId,records:recs,employees:emps.map(e=>({...e,pass:'[PROTECTED]',biometricId:'[PROTECTED]'}))};
  const str=JSON.stringify(backup,null,2);
  const firma=await sha256(str+'|EXPORT_KEY');
  backup.firma_exportacion=firma;
  const backupStr=JSON.stringify(backup,null,2);
  downloadFileNative('BACKUP_SecureCheck_'+new Date().toISOString().slice(0,10)+'.json','application/json',backupStr);
}
async function exportLatestBackup(){
  // Obtener todos los backups internos guardados (sin tocar el guardado)
  const all=await dbGetAll('backups');
  if(!all||!all.length){showToast('⚠️ No hay backups internos todavía — usa "Backup ahora" primero');return;}
  // Ordenar y tomar el más reciente
  const latest=all.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp))[0];
  // Parsear el snapshot interno
  let exportObj;
  try{
    const snapshot=JSON.parse(latest.data||'{}');
    exportObj={
      export_type:'backup_interno',
      exported_at:new Date().toISOString(),
      backup_timestamp:latest.timestamp,
      firma_integridad:latest.firma,
      device_id:latest.deviceId||deviceId,
      total_records:latest.totalRecords,
      nota:'Cada exportación es una foto del estado actual. No se fusiona con archivos anteriores.',
      ...snapshot
    };
  }catch(e){
    showToast('❌ Error al leer el backup interno');return;
  }
  const fecha=new Date(latest.timestamp).toISOString().slice(0,10);
  const hora=new Date(latest.timestamp).toTimeString().slice(0,5).replace(':','-');
  const filename=`BACKUP_INTERNO_LNI_${fecha}_${hora}.json`;
  await downloadFileNative(filename,'application/json',JSON.stringify(exportObj,null,2));
}

function exportCSV(){
  const tipoFilter=document.getElementById('filter-tipo')?.value||'';const fechaFilter=document.getElementById('filter-fecha')?.value||'';
  let recs=[...allRecords];
  if(tipoFilter)recs=recs.filter(r=>r.tipo===tipoFilter);if(fechaFilter)recs=recs.filter(r=>r.fecha===fechaFilter);
  recs.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
  const header='Empleado,Tipo,Fecha,Hora,Coordenadas,OSHA_OK,Firma,Timestamp\n';
  const rows=recs.map(r=>`"${r.usuario}","${r.tipo}","${r.fecha}","${r.hora}","${r.coords||''}","${r.osha_ok?'SI':''}","${r.firma?r.firma.substring(0,8)+'...':'sin_firma'}","${r.timestamp||''}"`).join('\n');
  downloadFileNative('REGISTROS_LNI_'+new Date().toISOString().slice(0,10)+'.csv','text/csv',header+rows);
}
async function exportReportPDF(){
  if(typeof window.jspdf==='undefined'&&typeof jsPDF==='undefined'){
    showToast('⚠ jsPDF no cargado — verifica conexión a internet');return;
  }
  const {jsPDF}=window.jspdf||{jsPDF:window.jsPDF};
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'letter'});
  const fromVal=document.getElementById('rpt-from')?.value||'';
  const toVal=document.getElementById('rpt-to')?.value||'';
  const now=new Date();
  const genDate=now.toLocaleDateString('es-US',{year:'numeric',month:'long',day:'numeric'});
  const genTime=now.toLocaleTimeString('es-US',{hour:'2-digit',minute:'2-digit',hour12:true});
  // Formato legible para el rango
  function _fmtReadable(iso){
    if(!iso)return'—';
    const d=new Date(iso+'T12:00:00');
    return d.toLocaleDateString('es-US',{day:'2-digit',month:'2-digit',year:'numeric'});
  }
  const fromDisplay=_fmtReadable(fromVal);
  const toDisplay=_fmtReadable(toVal);

  // ── HEADER LNI (mejorado) ────────────────────────────────────
  doc.setFillColor(26,58,126);
  doc.rect(0,0,216,32,'F');
  // Logo cuadrado LNI
  doc.setFillColor(255,255,255);
  doc.roundedRect(8,6,20,20,2,2,'F');
  doc.setTextColor(26,58,126);
  doc.setFont('helvetica','bold');
  doc.setFontSize(11);
  doc.text('LNI',18,19,{align:'center'});
  // Nombre empresa y datos
  doc.setTextColor(255,255,255);
  doc.setFontSize(14);
  doc.setFont('helvetica','bold');
  doc.text('LNI Custom Manufacturing Inc.',34,13);
  doc.setFontSize(9);
  doc.setFont('helvetica','normal');
  doc.text('Gardena, CA  —  Reporte de Asistencia y Nómina',34,20);
  // Período prominente
  doc.setFontSize(8.5);
  doc.setFont('helvetica','bold');
  const periodoStr = fromVal&&toVal
    ? 'Período: '+fromDisplay+' al '+toDisplay
    : 'Período: Todos los registros';
  doc.text(periodoStr, 34, 27);
  // Fecha y hora de generación (derecha)
  doc.setFont('helvetica','normal');
  doc.setFontSize(7);
  doc.text('Generado: '+genDate+' a las '+genTime, 202, 27, {align:'right'});

  // ── TÍTULO DEL REPORTE ───────────────────────────────────────
  doc.setTextColor(26,58,126);
  doc.setFontSize(13);
  doc.setFont('helvetica','bold');
  doc.text('RESUMEN DE HORAS Y NÓMINA',108,42,{align:'center'});
  doc.setDrawColor(26,58,126);
  doc.setLineWidth(0.5);
  doc.line(14,45,202,45);

  // ── TABLA PRINCIPAL ──────────────────────────────────────────
  const tableRows=[];
  let grandTotal=0, totalReg=0, totalOT=0, totalDT=0;
  document.querySelectorAll('#rpt-pay-list .pay-card').forEach(card=>{
    const u=card.dataset.paycard;if(!u)return;
    // Only include employees selected in the multi-select
    if(selectedPayUsers.size>0&&!selectedPayUsers.has(u))return;
    const nombre=u.charAt(0).toUpperCase()+u.slice(1);
    const hrsEl=card.querySelector('[data-reg]');
    const reg=parseFloat(hrsEl?.dataset.reg||'0');
    const ot=parseFloat(hrsEl?.dataset.ot||'0');
    const dt=parseFloat(hrsEl?.dataset.dt||'0');
    const rate=getEmpRate(u);
    const total=rate>0?(reg*rate)+(ot*rate*1.5)+(dt*rate*2):0;
    const dias=card.querySelector('.pay-days')?.textContent||'';
    const oshaOk=parseInt(card.dataset.oshaOk||'0');
    const oshaTotal=parseInt(card.dataset.oshaTotal||'0');
    const oshaStr=oshaTotal>0?oshaOk+'/'+oshaTotal:'N/A';
    grandTotal+=total;
    totalReg+=reg; totalOT+=ot; totalDT+=dt;
    tableRows.push([
      nombre,
      dias,
      reg.toFixed(1)+'h',
      ot>0.01?ot.toFixed(1)+'h':'—',
      dt>0.01?dt.toFixed(1)+'h':'—',
      rate>0?'$'+rate.toFixed(2)+'/hr':'—',
      rate>0?'$'+total.toFixed(2):'—',
      oshaStr
    ]);
  });
  const empCount=tableRows.length;

  doc.autoTable({
    startY:45,
    head:[['Empleado','Días','Regular','OT 1.5x','DT 2x','Tarifa','Total','OSHA ✓']],
    body:tableRows,
    foot:[['','','','','','TOTAL NÓMINA','$'+grandTotal.toFixed(2),'']],
    headStyles:{fillColor:[26,58,126],textColor:255,fontStyle:'bold',fontSize:8},
    footStyles:{fillColor:[240,240,240],textColor:[26,58,126],fontStyle:'bold',fontSize:9},
    bodyStyles:{fontSize:8,textColor:50},
    alternateRowStyles:{fillColor:[248,250,255]},
    columnStyles:{
      0:{fontStyle:'bold',cellWidth:32},
      6:{textColor:[16,120,70],fontStyle:'bold'},
      7:{halign:'center',fontStyle:'bold'}
    },
    didDrawCell:(data)=>{
      // Colorear celda OSHA
      if(data.column.index===7&&data.section==='body'){
        const txt=data.cell.text[0]||'';
        if(txt!=='N/A'&&txt.includes('/')){
          const[ok,tot]=txt.split('/').map(Number);
          if(tot>0){
            const color=ok===tot?[16,185,129]:ok>0?[249,115,22]:[239,68,68];
            doc.setTextColor(...color);
            doc.setFont('helvetica','bold');
            doc.text(txt,data.cell.x+data.cell.width/2,data.cell.y+data.cell.height/2+1,{align:'center'});
          }
        }
        doc.setTextColor(50,50,50);doc.setFont('helvetica','normal');
      }
    },
    margin:{left:14,right:14},
    styles:{cellPadding:2.5}
  });

  // ── SECCIÓN OSHA (detalle legal) ──────────────────────────────
  const finalY0=doc.lastAutoTable.finalY+6;
  doc.setFillColor(255,247,237);
  doc.roundedRect(14,finalY0,188,10,2,2,'F');
  doc.setDrawColor(249,115,22);doc.setLineWidth(0.3);
  doc.roundedRect(14,finalY0,188,10,2,2,'S');
  doc.setFontSize(7.5);doc.setFont('helvetica','bold');doc.setTextColor(180,70,0);
  doc.text('🛡️  OSHA Safety Checklist — Declaración de seguridad firmada electrónicamente antes de cada jornada',17,finalY0+6.5);

  // ── SECCIÓN NOTAS LEGALES ─────────────────────────────────────
  const finalY=finalY0+15;
  doc.setDrawColor(200,200,200);doc.setLineWidth(0.3);
  doc.line(14,finalY,202,finalY);
  doc.setFontSize(7);doc.setTextColor(120,120,120);doc.setFont('helvetica','normal');
  const notes=[
    '• Cálculo de overtime según California Labor Code: >8h/día = 1.5x  |  >12h/día = 2x (tiempo doble).',
    '• El tiempo de lunch descontado es el REAL registrado (Inicio Lunch → Fin Lunch) por cada empleado.',
    '• OSHA columna: confirmaciones de seguridad (casco, área libre, condición física) por día / días trabajados.',
    '• Registros con firma digital SHA-256 y coordenadas GPS — SecureCheck Pro v3.0 — Confidencial.'
  ];
  notes.forEach((n,i)=>doc.text(n,14,finalY+5+(i*4)));

  // ── RESUMEN GRAN TOTAL ────────────────────────────────────────
  const pgH=doc.internal.pageSize.height;
  const afterNotesY=finalY+5+(notes.length*4)+12;
  // Espacio necesario: encabezado 8mm + datos 20mm + firmas 35mm + footer 12mm = ~75mm
  let gtY=afterNotesY;
  if(gtY+75>pgH){ doc.addPage(); gtY=20; }
  // Barra de título
  doc.setFillColor(26,58,126);
  doc.roundedRect(14,gtY,188,8,2,2,'F');
  doc.setTextColor(255,255,255);
  doc.setFont('helvetica','bold');
  doc.setFontSize(9);
  doc.text('RESUMEN TOTAL DEL PERÍODO',108,gtY+5.5,{align:'center'});
  // Caja de datos
  const gtDataY=gtY+11;
  doc.setFillColor(248,250,255);
  doc.roundedRect(14,gtDataY,188,20,2,2,'F');
  doc.setDrawColor(26,58,126); doc.setLineWidth(0.4);
  doc.roundedRect(14,gtDataY,188,20,2,2,'S');
  // Divisores verticales entre columnas
  [51.6,89.2,126.8,164.4].forEach(xDiv=>{
    doc.setDrawColor(200,210,235); doc.setLineWidth(0.2);
    doc.line(xDiv,gtDataY+3,xDiv,gtDataY+17);
  });
  // 5 columnas de totales
  const gtCols=[
    {label:'Total Empleados', value:String(empCount),                              x:32.8},
    {label:'Hrs Regulares',   value:totalReg.toFixed(1)+'h',                       x:70.4},
    {label:'OT (1.5x)',       value:totalOT>0.01?totalOT.toFixed(1)+'h':'—',      x:108},
    {label:'DT (2x)',         value:totalDT>0.01?totalDT.toFixed(1)+'h':'—',      x:145.6},
    {label:'TOTAL A PAGAR',   value:'$'+grandTotal.toFixed(2),                     x:183.2},
  ];
  gtCols.forEach(col=>{
    const isLast=col.label==='TOTAL A PAGAR';
    doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(100,100,120);
    doc.text(col.label,col.x,gtDataY+8,{align:'center'});
    doc.setFont('helvetica','bold');
    doc.setFontSize(isLast?10.5:10);
    if(isLast) doc.setTextColor(16,120,70); else doc.setTextColor(26,58,126);
    doc.text(col.value,col.x,gtDataY+17,{align:'center'});
  });

  // ── LÍNEAS DE FIRMA ───────────────────────────────────────────
  const sigY=gtDataY+30;
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(60,60,60);
  doc.text('FIRMAS DE APROBACIÓN',108,sigY,{align:'center'});
  // Línea firma izquierda — Empleado
  doc.setDrawColor(80,80,80); doc.setLineWidth(0.5);
  doc.line(18,sigY+14,96,sigY+14);
  doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(60,60,60);
  doc.text('Firma del Empleado',57,sigY+19,{align:'center'});
  doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(140,140,140);
  doc.text('Nombre: _______________________',18,sigY+25);
  doc.text('Fecha:   _______________________',18,sigY+30);
  // Línea firma derecha — Supervisor
  doc.setDrawColor(80,80,80); doc.setLineWidth(0.5);
  doc.line(118,sigY+14,198,sigY+14);
  doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(60,60,60);
  doc.text('Firma del Supervisor',158,sigY+19,{align:'center'});
  doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(140,140,140);
  doc.text('Nombre: _______________________',118,sigY+25);
  doc.text('Fecha:   _______________________',118,sigY+30);

  // ── PIE DE PÁGINA ─────────────────────────────────────────────
  const pageH=doc.internal.pageSize.height;
  doc.setFillColor(26,58,126);
  doc.rect(0,pageH-10,216,10,'F');
  doc.setTextColor(255,255,255);doc.setFontSize(7);
  doc.text('LNI Custom Manufacturing Inc.  |  Generado por SecureCheck Pro v3.0  |  '+genDate,108,pageH-4,{align:'center'});

  // ── NOMBRE INTELIGENTE DEL ARCHIVO ────────────────────────────
  const MESES_SHORT=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  function _fmtDateLabel(iso){
    if(!iso)return'';
    const d=new Date(iso+'T12:00:00');
    return d.getDate()+''+MESES_SHORT[d.getMonth()]+d.getFullYear();
  }
  const desde=_fmtDateLabel(fromVal);
  const hasta=_fmtDateLabel(toVal);
  const rangoStr=desde&&hasta?`_${desde}-${hasta}`:(desde?`_${desde}`:'');
  const filename=`NOMINA_LNI${rangoStr}_${empCount}empleados.pdf`;

  // ── DESCARGA CON CAPACITOR O FALLBACK ─────────────────────────
  const pdfArrayBuffer=doc.output('arraybuffer');
  await downloadFileNative(filename,'application/pdf',pdfArrayBuffer);
}

function exportReportCSV(){
  const fromVal=document.getElementById('rpt-from')?.value||'';
  const toVal=document.getElementById('rpt-to')?.value||'';
  const rows=[`Empleado,Días Trabajados,Hrs Brutas,Hrs Regular(1x),OT(1.5x),DT(2x),Tarifa/hr,Total a Pagar,OSHA Cumplido,Período Desde,Período Hasta`];
  document.querySelectorAll('#rpt-pay-list .pay-card').forEach(card=>{
    const u=card.dataset.paycard;if(!u)return;
    if(selectedPayUsers.size>0&&!selectedPayUsers.has(u))return;
    const nombre=u.charAt(0).toUpperCase()+u.slice(1);
    const dias=card.querySelector('.pay-days')?.textContent||'';
    const hrsEl=card.querySelector('[data-reg]');
    const hrsBruto=card.querySelector('.pay-hrs-val')?.textContent||'';
    const reg=parseFloat(hrsEl?.dataset.reg||'0').toFixed(1)+'h';
    const ot=parseFloat(hrsEl?.dataset.ot||'0').toFixed(1)+'h';
    const dt=parseFloat(hrsEl?.dataset.dt||'0').toFixed(1)+'h';
    const rate=getEmpRate(u)||0;
    const total=document.getElementById('pay-total-'+u)?.textContent||'';
    const oshaOk=parseInt(card.dataset.oshaOk||'0');
    const oshaTotal=parseInt(card.dataset.oshaTotal||'0');
    const oshaStr=oshaTotal>0?`${oshaOk}/${oshaTotal} días`:'N/A';
    rows.push(`"${nombre}","${dias}","${hrsBruto}","${reg}","${ot}","${dt}","$${rate}","${total}","${oshaStr}","${fromVal}","${toVal}"`);
  });
  const MESES_SHORT=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  function _fl(iso){if(!iso)return'';const d=new Date(iso+'T12:00:00');return d.getDate()+MESES_SHORT[d.getMonth()]+d.getFullYear();}
  const filename=`NOMINA_LNI_${_fl(fromVal)||'inicio'}-${_fl(toVal)||'hoy'}.csv`;
  downloadFileNative(filename,'text/csv',rows.join('\n'));
}

// ── Construir Blob desde contenido (string o ArrayBuffer) ──────
function _makeBlob(content,type){
  return new Blob([content],{type});
}

// ============================================================
// SISTEMA DE DESCARGA — sin @capacitor/share
// Flujo APK: genera archivo → muestra panel "Listo" con botón
// El botón llama navigator.share() con gesto fresco del usuario
// → Android muestra panel nativo → usuario elige Descargas
// ============================================================

// Almacena el blob listo mientras el usuario no ha tocado "Guardar"
let _pendingBlob=null;
let _pendingFilename='';

// Llamado desde el botón "Guardar / Compartir" del panel
async function _triggerPendingShare(){
  if(!_pendingBlob||!_pendingFilename) return;
  const blob=_pendingBlob;
  const filename=_pendingFilename;
  _pendingBlob=null;
  _pendingFilename='';
  _closeSharePanel();

  const isNative=window.Capacitor?.isNativePlatform?.()??false;

  // ── Convertir blob a data URI base64 ─────────────────────────
  async function _blobToDataUri(b){
    return new Promise((res,rej)=>{
      const r=new FileReader();
      r.onload=()=>res(r.result);
      r.onerror=rej;
      r.readAsDataURL(b);
    });
  }

  // ── 1: APK — <a download> con data URI → DownloadListener en MainActivity ──
  // MainActivity.java intercepta esto y guarda directo en /Descargas (MediaStore)
  if(isNative){
    try{
      const dataUri=await _blobToDataUri(blob);
      const a=document.createElement('a');
      a.href=dataUri;
      a.download=filename;
      a.setAttribute('type',blob.type);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      _showDownloadToast(filename,'downloads');
      return;
    }catch(e){ console.warn('[DL1] data URI click:',e); }
  }

  // ── 2: Web Share API (gesto directo del usuario) ─────────────
  if(typeof navigator.share==='function'){
    try{
      const file=new File([blob],filename,{type:blob.type,lastModified:Date.now()});
      await navigator.share({files:[file],title:filename,text:filename});
      _showDownloadToast(filename,'share');
      return;
    }catch(e){
      if(e?.name==='AbortError'||/cancel/i.test(e?.message||'')){
        _showDownloadToast(filename,'cancelled'); return;
      }
      console.warn('[DL2] Web Share:',e);
    }
  }

  // ── 3: Blob URL (navegador web / fallback final) ──────────────
  const url=URL.createObjectURL(blob);
  const a2=document.createElement('a');
  a2.href=url; a2.download=filename;
  document.body.appendChild(a2); a2.click();
  setTimeout(()=>{document.body.removeChild(a2);URL.revokeObjectURL(url);},800);
  _showDownloadToast(filename,'blob');
}

function _closeSharePanel(){
  const p=document.getElementById('sc-share-panel');
  if(p) p.remove();
}

// Muestra el panel "Archivo listo" con botón Guardar
function _showSharePanel(filename,blob){
  _pendingBlob=blob;
  _pendingFilename=filename;
  _closeSharePanel(); // eliminar panel anterior si existía

  const ext=filename.split('.').pop().toUpperCase();
  const icon=ext==='PDF'?'📄':ext==='CSV'?'📊':'📁';
  const isNative=window.Capacitor?.isNativePlatform?.()??false;
  const shareAvail=typeof navigator.share==='function';
  const btnLabel=isNative?'📥 Guardar en Descargas':'⬇️ Descargar';

  const panel=document.createElement('div');
  panel.id='sc-share-panel';
  panel.style.cssText=`
    position:fixed;bottom:0;left:0;right:0;z-index:99999;
    background:linear-gradient(135deg,#0d1f2d,#0a1628);
    border-top:2px solid #10b981;
    border-radius:20px 20px 0 0;
    padding:24px 20px 36px;
    box-shadow:0 -8px 40px rgba(0,0,0,0.6);
    animation:slideUp .25s ease;
  `;
  panel.innerHTML=`
    <style>@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}</style>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      <span style="font-size:36px">${icon}</span>
      <div style="flex:1;min-width:0">
        <div style="color:#10b981;font-weight:700;font-size:14px;margin-bottom:2px">✅ Archivo listo</div>
        <div style="color:#e2e8f0;font-size:12px;word-break:break-all;opacity:.85">${filename}</div>
      </div>
    </div>
    <button onclick="_triggerPendingShare()" style="
      width:100%;padding:16px;border:none;border-radius:14px;
      background:linear-gradient(135deg,#10b981,#059669);
      color:#fff;font-size:16px;font-weight:700;cursor:pointer;
      display:flex;align-items:center;justify-content:center;gap:10px;
      margin-bottom:12px;letter-spacing:.3px;
    ">${btnLabel}</button>
    <button onclick="_closeSharePanel()" style="
      width:100%;padding:12px;border:1px solid #374151;border-radius:14px;
      background:transparent;color:#94a3b8;font-size:14px;cursor:pointer;
    ">Cancelar</button>
  `;
  document.body.appendChild(panel);
}

async function downloadFileNative(filename,type,content){
  const blob=_makeBlob(content,type);
  const isNative=window.Capacitor?.isNativePlatform?.()??false;

  if(isNative){
    // En APK: mostrar panel con botón — el usuario toca y se abre el share sheet de Android
    _showSharePanel(filename,blob);
    return;
  }

  // ══ NAVEGADOR WEB ═════════════════════════════════════════════
  if(typeof navigator.share==='function'){
    try{
      const file=new File([blob],filename,{type,lastModified:Date.now()});
      await navigator.share({files:[file],title:filename});
      _showDownloadToast(filename,'share');
      return;
    }catch(e){ if(e?.name==='AbortError'||/cancel/i.test(e?.message||'')){_showDownloadToast(filename,'cancelled');return;} }
  }
  // Blob URL (Chrome/Firefox desktop)
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();
  setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},800);
  _showDownloadToast(filename,'blob');
}

// Alias por compatibilidad con llamadas antiguas
function downloadFile(filename,type,content){downloadFileNative(filename,type,content);}

function _showDownloadToast(filename,via){
  const toastEl=document.getElementById('toast');
  if(!toastEl)return;
  const cfg={
    cancelled: {icon:'❌',title:'Cancelado',                sub:'No se guardó el archivo',                                                          dur:3000},
    downloads: {icon:'✅',title:'¡Guardado en Descargas!', sub:'Abre <b>Mis Archivos → Descargas</b> para verlo',                                      dur:7000},
    share:     {icon:'📤',title:'Selecciona dónde guardar',sub:'Toca <b>Mis Archivos</b> → luego elige <b>Descargas</b>',                              dur:10000},
    intent:    {icon:'📂',title:'Archivo abierto en visor', sub:'Dentro del visor toca los <b>3 puntos ⋮ → Compartir → Mis Archivos → Descargas</b>', dur:12000},
    blob:      {icon:'📥',title:'Archivo generado',         sub:'Revisa la carpeta Descargas del teléfono',                                             dur:7000},
  }[via]||{icon:'📥',title:'Listo',sub:'',dur:4000};
  toastEl.innerHTML=`
    <div style="display:flex;align-items:flex-start;gap:10px">
      <span style="font-size:22px;line-height:1.2">${cfg.icon}</span>
      <div>
        <div style="font-weight:700;font-size:13px;margin-bottom:2px">${cfg.title}</div>
        <div style="font-size:11px;opacity:0.85;word-break:break-all;margin-bottom:2px">${filename}</div>
        <div style="font-size:11px;color:#10b981">${cfg.sub}</div>
      </div>
    </div>`;
  toastEl.classList.add('show');
  clearTimeout(toastEl._timer);
  toastEl._timer=setTimeout(()=>{toastEl.classList.remove('show');toastEl.innerHTML='';},cfg.dur);
}

async function _tryBrowserNotification(filename){
  try{
    if(!('Notification' in window))return;
    if(Notification.permission==='default'){
      await Notification.requestPermission();
    }
    if(Notification.permission==='granted'){
      new Notification('SecureCheck Pro — Archivo guardado',{
        body:'📥 '+filename+'\nGuardado en Descargas',
        icon:'https://cdn-icons-png.flaticon.com/512/2092/2092204.png',
        tag:'sc-download'
      });
    }
  }catch(e){}
}

// ============================================================
// TAB SWITCHING
// ============================================================
function switchTab(tab){
  const tabs=['dashboard','registros','mapa','empleados','reporte','codigo','config','bitacora'];
  document.querySelectorAll('.a-tab').forEach((t,i)=>{t.classList.toggle('active',tabs[i]===tab);});
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  const pane=document.getElementById('tab-'+tab);if(pane)pane.classList.add('active');
  if(tab==='dashboard')renderDashboard();
  if(tab==='bitacora')renderBitacora();
  if(tab==='registros')renderAdminRecords();
  if(tab==='mapa'){
    renderAdminMap(); // render inmediato con datos locales
    // Luego refrescar desde Supabase y re-render si hay conexión
    if(supabaseAvailable) fetchRecordsFromSupabase().then(()=>renderAdminMap());
  }
  if(tab==='reporte'){
    setRptQuick('semana');renderPaidHistory();
    if(supabaseAvailable){
      fetchRecordsFromSupabase().then(added=>{if(added)renderReport();});
    }
  }
  if(tab==='empleados'){ fetchEmployees().then(()=>renderEmpList()); }
  if(tab==='config')renderAdminSettings();
}

// ============================================================
// UI HELPERS
// ============================================================
function toggleDrawer(){document.getElementById('drawer').classList.toggle('open');document.getElementById('drawer-ov').classList.toggle('open');}
function closeDrawer(){document.getElementById('drawer').classList.remove('open');document.getElementById('drawer-ov').classList.remove('open');}

function drawerGoToRegistros(){
  closeDrawer();
  // Si es empleado, lo lleva a la pantalla principal con sus registros de hoy
  // Si es admin, lo lleva al tab de registros
  if(isAdmin){
    showScreen('admin-screen');
    switchTab('registros');
  } else {
    showScreen('main-screen');
    loadTodayHistory();
  }
}

// ============================================================
// REGISTRO PERSONAL — Calendario + Semanas circulares
// ============================================================
let _prYear=new Date().getFullYear();
let _prMonth=new Date().getMonth();

async function openPersonalRecord(){
  closeDrawer();
  const nameEl=document.getElementById('pr-emp-name');
  if(nameEl)nameEl.textContent=currentUser?currentUser.charAt(0).toUpperCase()+currentUser.slice(1):'';
  openModal('modal-personal-record');
  _prYear=new Date().getFullYear();
  _prMonth=new Date().getMonth();
  // Mostrar cargando mientras bajamos datos
  const grid=document.getElementById('pr-cal-grid');
  if(grid)grid.innerHTML='<div style="grid-column:1/-1;text-align:center;color:var(--text4);font-size:12px;padding:24px 0;letter-spacing:.3px">⏳ Cargando registros...</div>';
  // Descargar registros desde Supabase si hay conexión
  if(supabaseAvailable){
    await fetchRecordsFromSupabase();
  }
  // SIEMPRE recargar allRecords desde IndexedDB (con o sin Supabase)
  // para que el calendario muestre registros locales aunque el sync falle
  allRecords=await getAllRecords();
  renderPrCalendar();
  renderPrWeeks();
}

function prChangeMonth(delta){
  _prMonth+=delta;
  if(_prMonth>11){_prMonth=0;_prYear++;}
  if(_prMonth<0){_prMonth=11;_prYear--;}
  renderPrCalendar();
}

function renderPrCalendar(){
  const lbl=document.getElementById('pr-month-lbl');
  const grid=document.getElementById('pr-cal-grid');
  const statsEl=document.getElementById('pr-month-stats');
  if(!lbl||!grid)return;
  const monthNames=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  lbl.textContent=monthNames[_prMonth]+' '+_prYear;
  // Construir mapa de días con horas trabajadas
  const userRecs=allRecords.filter(r=>r.usuario===currentUser);
  const recsByDate={};
  userRecs.forEach(r=>{if(!recsByDate[r.fecha])recsByDate[r.fecha]=[];recsByDate[r.fecha].push(r);});
  const dayMap={};// fecha → {totalMins, lastTipo, paid}
  userRecs.forEach(r=>{
    if(!dayMap[r.fecha])dayMap[r.fecha]={lastEntrada:null,totalMins:0,lastTipo:r.tipo,paid:false};
    const d=dayMap[r.fecha];
    d.lastTipo=r.tipo;
    if(r.tipo==='Entrada')d.lastEntrada=r.hora;
    if(r.tipo==='Salida'&&d.lastEntrada){
      const mins=calcMinsBetween(d.lastEntrada,r.hora);
      if(mins>0&&mins<24*60){
        const lunchM=calcActualLunchMins(recsByDate[r.fecha]||[]);
        d.totalMins+=Math.max(0,mins-lunchM);
        d.lastEntrada=null;
      }
    }
  });
  // Marcar días pagados
  const paidHistory=getPaidHistory();
  paidHistory.filter(h=>h.usuario===currentUser).forEach(h=>{
    const from=new Date(h.from+'T00:00:00');
    const to=new Date(h.to+'T23:59:59');
    Object.keys(dayMap).forEach(fecha=>{
      try{
        const parts=fecha.split('/');
        if(parts.length===3){
          const fd=new Date(parts[2]+'-'+parts[0].padStart(2,'0')+'-'+parts[1].padStart(2,'0')+'T12:00:00');
          if(fd>=from&&fd<=to)dayMap[fecha].paid=true;
        }
      }catch(e){}
    });
  });
  // ── Calcular estadísticas del mes y semana actual ─────────
  const today=new Date();
  const getWeekStart=d=>{const dt=new Date(d);dt.setDate(dt.getDate()-((dt.getDay()+6)%7));dt.setHours(0,0,0,0);return dt;};
  const weekStart=getWeekStart(today);
  const weekEnd=new Date(weekStart);weekEnd.setDate(weekStart.getDate()+6);weekEnd.setHours(23,59,59,999);
  let monthMins=0,monthDays=0,weekMins=0;
  Object.entries(dayMap).forEach(([fecha,info])=>{
    if(!info.totalMins)return;
    try{
      const parts=fecha.split('/');
      if(parts.length!==3)return;
      const fd=new Date(parts[2]+'-'+parts[0].padStart(2,'0')+'-'+parts[1].padStart(2,'0')+'T12:00:00');
      if(fd.getFullYear()===_prYear&&fd.getMonth()===_prMonth){monthMins+=info.totalMins;monthDays++;}
      if(fd>=weekStart&&fd<=weekEnd)weekMins+=info.totalMins;
    }catch(e){}
  });
  // ── Stats bar ─────────────────────────────────────────────
  if(statsEl){
    const mh=(monthMins/60).toFixed(1);
    const wh=(weekMins/60).toFixed(1);
    const otDays=Object.entries(dayMap).filter(([f,i])=>{
      if(!i.totalMins)return false;
      try{const p=f.split('/');const fd=new Date(p[2]+'-'+p[0].padStart(2,'0')+'-'+p[1].padStart(2,'0')+'T12:00:00');return fd.getFullYear()===_prYear&&fd.getMonth()===_prMonth&&i.totalMins>480;}catch(e){return false;}
    }).length;
    statsEl.innerHTML=`
      <div class="pr-stat-card">
        <div class="pr-stat-val">${mh}h</div>
        <div class="pr-stat-lbl">Este mes</div>
      </div>
      <div class="pr-stat-card">
        <div class="pr-stat-val">${monthDays}</div>
        <div class="pr-stat-lbl">Días trab.</div>
      </div>
      <div class="pr-stat-card">
        <div class="pr-stat-val" style="color:#60a5fa">${wh}h</div>
        <div class="pr-stat-lbl">Esta semana</div>
      </div>
      <div class="pr-stat-card">
        <div class="pr-stat-val" style="color:${otDays?'#f97316':'var(--text2)'}">${otDays}</div>
        <div class="pr-stat-lbl">Días OT</div>
      </div>`;
  }
  // ── Generar grid del mes ─────────────────────────────────
  const firstDay=new Date(_prYear,_prMonth,1).getDay();
  const daysInMonth=new Date(_prYear,_prMonth+1,0).getDate();
  let html='';
  for(let i=0;i<firstDay;i++)html+=`<div class="pr-day-cell pr-day-empty"></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const fechaKey=`${_prMonth+1}/${d}/${_prYear}`;
    const info=dayMap[fechaKey];
    const isToday=_prYear===today.getFullYear()&&_prMonth===today.getMonth()&&d===today.getDate();
    const hasWork=info&&info.totalMins>0;
    const isPaid=info?.paid;
    const hrsStr=hasWork?((info.totalMins/60).toFixed(1)+'h'):'';
    const isOT=info&&info.totalMins>480;
    html+=`<div class="pr-day-cell${hasWork?' has-work':''}${isOT&&!isPaid?' has-ot':''}${isPaid?' paid':''}${isToday?' today':''}"${hasWork?` onclick="prOpenDayPopup('${fechaKey}')"`:''}><span class="pr-day-num">${d}</span>${hrsStr?`<span class="pr-day-hrs">${hrsStr}</span>`:''}<div class="pr-day-bar"></div></div>`;
  }
  grid.innerHTML=html;
}

function prOpenDayPopup(fechaKey){
  const userRecs=allRecords.filter(r=>r.usuario===currentUser&&r.fecha===fechaKey);
  if(!userRecs.length)return;
  // Ordenar cronológicamente
  const sorted=[...userRecs].sort((a,b)=>{
    const ta=a.timestamp?new Date(a.timestamp).getTime():0;
    const tb=b.timestamp?new Date(b.timestamp).getTime():0;
    return ta-tb;
  });
  // Fecha legible
  const parts=fechaKey.split('/');
  let dateLabel=fechaKey;
  if(parts.length===3){
    try{
      const d=new Date(parts[2]+'-'+parts[0].padStart(2,'0')+'-'+parts[1].padStart(2,'0')+'T12:00:00');
      dateLabel=d.toLocaleDateString('es-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
      dateLabel=dateLabel.charAt(0).toUpperCase()+dateLabel.slice(1);
    }catch(e){}
  }
  // Calcular total horas con lunch real
  const recsByDate={};
  userRecs.forEach(r=>{if(!recsByDate[r.fecha])recsByDate[r.fecha]=[];recsByDate[r.fecha].push(r);});
  let totalMins=0,lastEntrada=null;
  sorted.forEach(r=>{
    if(r.tipo==='Entrada')lastEntrada=r.hora;
    if(r.tipo==='Salida'&&lastEntrada){
      const mins=calcMinsBetween(lastEntrada,r.hora);
      if(mins>0&&mins<1440){
        const lunchM=calcActualLunchMins(recsByDate[r.fecha]||[]);
        totalMins+=Math.max(0,mins-lunchM);
        lastEntrada=null;
      }
    }
  });
  const totalHrs=(totalMins/60).toFixed(1);
  const isOT=totalMins>480;
  const typeColors={'Entrada':'#10b981','Salida':'#ef4444','Inicio Lunch':'#f97316','Fin Lunch':'#3b82f6'};
  const rows=sorted.map(r=>`
    <div class="pr-day-popup-row">
      <div class="pr-day-popup-dot" style="background:${typeColors[r.tipo]||'#94a3b8'}"></div>
      <span class="pr-day-popup-tipo">${r.tipo}</span>
      <span class="pr-day-popup-hora">${r.hora}</span>
    </div>`).join('');
  let popup=document.getElementById('pr-day-popup');
  if(!popup){popup=document.createElement('div');popup.id='pr-day-popup';document.body.appendChild(popup);}
  popup.innerHTML=`<div class="pr-day-popup-box">
    <div class="pr-day-popup-date">📅 ${dateLabel}</div>
    ${rows}
    <div class="pr-day-popup-total">
      <span style="font-size:11px;color:var(--text4)">Total neto trabajado</span>
      <span class="pr-day-popup-hrs${isOT?' ot':''}">${totalHrs}h ${isOT?'<span style="font-size:10px;background:rgba(249,115,22,0.2);border-radius:5px;padding:1px 6px">OT</span>':''}</span>
    </div>
    <button class="pr-day-popup-close" onclick="document.getElementById('pr-day-popup').style.display='none'">Cerrar</button>
  </div>`;
  popup.style.display='flex';
  popup.onclick=e=>{if(e.target===popup)popup.style.display='none';};
}

function renderPrWeeks(){
  const el=document.getElementById('pr-weeks-list');if(!el)return;
  const userRecs=allRecords.filter(r=>r.usuario===currentUser);
  if(!userRecs.length){el.innerHTML='<div style="color:var(--text4);font-size:12px;padding:8px">Sin registros aún</div>';return;}
  // Calcular horas por fecha usando lunch REAL
  const dayMins={};
  const sorted=[...userRecs].sort((a,b)=>new Date(a.timestamp||0)-new Date(b.timestamp||0));
  // Agrupar por fecha para calcActualLunchMins
  const recsByDateW={};
  sorted.forEach(r=>{if(!recsByDateW[r.fecha])recsByDateW[r.fecha]=[];recsByDateW[r.fecha].push(r);});
  const lastEntrada={};
  sorted.forEach(r=>{
    if(r.tipo==='Entrada')lastEntrada[r.fecha]=r.hora;
    if(r.tipo==='Salida'&&lastEntrada[r.fecha]){
      const mins=calcMinsBetween(lastEntrada[r.fecha],r.hora);
      if(mins>0&&mins<24*60){
        const lunchM=calcActualLunchMins(recsByDateW[r.fecha]||[]);
        dayMins[r.fecha]=(dayMins[r.fecha]||0)+Math.max(0,mins-lunchM);
        delete lastEntrada[r.fecha];
      }
    }
  });
  // Agrupar por semana ISO (lunes a domingo)
  const weekMap={};
  const parseKey=fecha=>{
    try{const p=fecha.split('/');return new Date(p[2]+'-'+p[0].padStart(2,'0')+'-'+p[1].padStart(2,'0')+'T12:00:00');}catch(e){return null;}
  };
  const getWeekStart=d=>{const dt=new Date(d);dt.setDate(dt.getDate()-((dt.getDay()+6)%7));dt.setHours(0,0,0,0);return dt.toISOString().slice(0,10);};
  Object.entries(dayMins).forEach(([fecha,mins])=>{
    const dt=parseKey(fecha);if(!dt)return;
    const ws=getWeekStart(dt);
    if(!weekMap[ws])weekMap[ws]={mins:0,dates:[]};
    weekMap[ws].mins+=mins;
    weekMap[ws].dates.push(fecha);
  });
  const weeks=Object.entries(weekMap).sort((a,b)=>b[0].localeCompare(a[0]));
  const R=22,C=2*Math.PI*R;
  el.innerHTML=weeks.map(([ws,data],idx)=>{
    const hrs=data.mins/60;const hrsStr=hrs.toFixed(1);
    const progress=Math.min(1,hrs/40);// 40h = semana completa
    const dash=C*progress;const gap=C-dash;
    const wNum=weeks.length-idx;// semana 1 = la más antigua
    const startDate=new Date(ws+'T12:00:00');
    const endDate=new Date(ws+'T12:00:00');endDate.setDate(startDate.getDate()+6);
    const fmt=d=>d.toLocaleDateString('es-US',{month:'short',day:'numeric'});
    return`<div class="pr-week-row">
      <svg class="pr-week-ring" viewBox="0 0 50 50" width="50" height="50">
        <circle cx="25" cy="25" r="${R}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="4"/>
        <circle cx="25" cy="25" r="${R}" fill="none" stroke="${hrs>=40?'#10b981':'#3b82f6'}" stroke-width="4"
          stroke-dasharray="${dash.toFixed(1)} ${gap.toFixed(1)}"
          stroke-linecap="round" transform="rotate(-90 25 25)"/>
        <text x="25" y="28" text-anchor="middle" font-size="9" font-family="monospace" fill="#fff" font-weight="700">${hrsStr}h</text>
      </svg>
      <div class="pr-week-info">
        <div class="pr-week-num">Semana ${wNum}</div>
        <div class="pr-week-dates">${fmt(startDate)} — ${fmt(endDate)}</div>
        <div class="pr-week-days">${data.dates.length} día${data.dates.length!==1?'s':''} trabajados</div>
      </div>
    </div>`;
  }).join('');
}

function openDrawerTab(tab){
  // NO cerrar el drawer — expandir dentro del mismo
  if(tab==='historial'){
    const el=document.getElementById('drawer-history');
    const arrow=document.getElementById('historial-arrow');
    if(el){
      const open=el.style.display==='block';
      el.style.display=open?'none':'block';
      if(arrow)arrow.style.transform=open?'rotate(0deg)':'rotate(180deg)';
      if(!open)renderWeekHistory();
    }
  }
}
function openModal(id){
  const el=document.getElementById(id);
  if(!el)return;
  el.classList.add('open');
  // Asegura que el modal sea visible inmediatamente — scroll al tope del overlay
  el.scrollTop=0;
}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function showLoader(t){document.getElementById('load-txt').textContent=t||'Cargando...';document.getElementById('loader').classList.add('show');}
function hideLoader(){document.getElementById('loader').classList.remove('show');}
let toastT;
function showToast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),3200);}


// ============================================================
// MODAL SALIDA — Calculadora + Área de trabajo
// ============================================================
let selectedArea = '';

// Carga proyectos activos en el selector del modal de salida
async function populateProyectoSelect(){
  const sel=document.getElementById('proyecto-input');
  if(!sel||sel.tagName!=='SELECT')return;
  // Sincronizar desde Supabase antes de poblar
  if(supabaseAvailable) await fetchProyectosFromSupabase();
  const lista=await getAllProyectos();
  const activos=lista.filter(p=>!p.estado||p.estado==='activo'||p.estado==='en curso');
  sel.innerHTML='<option value="">Sin proyecto específico</option>';
  if(activos.length){
    activos.sort((a,b)=>(a.nombre||'').localeCompare(b.nombre||''));
    activos.forEach(p=>{
      const opt=document.createElement('option');
      opt.value=p.nombre||'';
      opt.textContent=p.nombre||'Sin nombre';
      sel.appendChild(opt);
    });
  } else {
    const opt=document.createElement('option');opt.disabled=true;
    opt.textContent='— Sin proyectos activos —';
    sel.appendChild(opt);
  }
}

async function abrirModalSalida(cycle){
  // Calcular horas desde los registros de hoy
  const today = getTodayKey();
  const todayRecs = await getTodayRecordsByUser(currentUser);
  const entrada = todayRecs.find(r => r.tipo === 'Entrada');
  const horaSalida = new Date().toLocaleTimeString('es-US', {hour:'2-digit', minute:'2-digit', hour12:true});
  const sinLunch = cycle && cycle.step === 1;

  // Mostrar horas en la calculadora
  document.getElementById('sc-entrada').textContent = entrada ? entrada.hora : '--:--';
  document.getElementById('sc-salida').textContent = horaSalida;

  if(entrada){
    const fin = new Date();
    let iniMs = null;
    if(entrada.timestamp){ const d=new Date(entrada.timestamp); if(!isNaN(d.getTime())) iniMs=d.getTime(); }
    if(iniMs===null){ const d=parseHora(entrada.hora); if(d){const b=new Date(fin);b.setHours(d.getHours(),d.getMinutes(),0,0);iniMs=b.getTime();} }
    const rawBruto = iniMs!==null ? Math.max(0,(fin.getTime()-iniMs)/60000) : 0;
    const brutoMins = Math.min(rawBruto, 24*60); // cap 24h
    const actualLunchMins = calcActualLunchMins(todayRecs);
    const netoMins = Math.max(0, brutoMins - actualLunchMins);

    const brutoH = Math.floor(brutoMins/60), brutoM = Math.round(brutoMins%60);
    const netoH = Math.floor(netoMins/60), netoM = Math.round(netoMins%60);

    document.getElementById('sc-bruto').textContent = brutoH+'h '+brutoM+'m';
    document.getElementById('sc-lunch').textContent = actualLunchMins>0 ? Math.round(actualLunchMins)+'m' : 'Sin lunch registrado';
    document.getElementById('sc-neto').textContent = netoH+'h '+netoM+'m';
  } else {
    document.getElementById('sc-bruto').textContent = '—';
    document.getElementById('sc-lunch').textContent = '—';
    document.getElementById('sc-neto').textContent = '—';
  }

  // Reset selector de área
  selectedArea = '';
  document.querySelectorAll('.area-btn').forEach(b => b.classList.remove('selected'));
  const customInp = document.getElementById('area-custom-input');
  if(customInp){customInp.style.display='none'; customInp.value='';}
  document.getElementById('area-error').textContent = '';

  // Advertencia sin lunch
  if(sinLunch){
    document.getElementById('area-error').textContent = '⚠ No registraste LUNCH hoy — no se descontará';
    document.getElementById('area-error').style.color = 'var(--orange)';
  }

  // Poblar selector de proyectos (fire-and-forget — se carga mientras el usuario elige área)
  populateProyectoSelect();

  openModal('modal-salida-resumen');
}

function selectArea(el, value){
  // Deseleccionar todos
  document.querySelectorAll('.area-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  const customInp = document.getElementById('area-custom-input');
  if(value === '__custom__'){
    selectedArea = '';
    if(customInp){customInp.style.display='block'; customInp.focus(); customInp.value='';}
  } else {
    selectedArea = value;
    if(customInp){customInp.style.display='none'; customInp.value='';}
  }
  document.getElementById('area-error').textContent = '';
}

function updateCustomArea(value){
  selectedArea = value.trim();
}

async function confirmarSalida(){
  if(!selectedArea){
    document.getElementById('area-error').textContent = '⚠ Selecciona el área donde trabajaste hoy';
    document.getElementById('area-error').style.color = 'var(--red)';
    return;
  }
  closeModal('modal-salida-resumen');
  // Guardar área en el registro
  await finalizarMarcacionConArea(selectedArea);
}

function cancelarSalida(){
  closeModal('modal-salida-resumen');
  pendingTipo = null;
  selectedArea = '';
  const pi=document.getElementById('proyecto-input');if(pi)pi.value='';
}

async function finalizarMarcacionConArea(area){
  if(_marcandoEnProceso)return; // bloquear doble tap
  _marcandoEnProceso=true;
  showLoader('Registrando Salida...');
  const now = new Date();
  const today = getTodayKey();

  // Calcular horas para incluirlas en el registro
  const todayRecs = await getTodayRecordsByUser(currentUser);

  // Usar SIEMPRE el timestamp ISO completo de la Entrada, NO solo el campo hora.
  // El campo hora es solo "HH:MM AM/PM" anclado a año 2000 — causa horas gigantes.
  let entradaRec = todayRecs.find(r => r.tipo === 'Entrada');
  // FALLBACK: si la sesión llevaba muchos días abierta y la Entrada ya no aparece
  // en `todayRecs`, buscamos la última Entrada SIN Salida posterior en TODOS los registros del usuario.
  if(!entradaRec){
    try{
      const allUserRecs = await getRecordsByUser(currentUser);
      const sortedEntradas = allUserRecs
        .filter(r=>r.tipo==='Entrada' && r.timestamp)
        .sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
      for(const cand of sortedEntradas){
        const tsCand = new Date(cand.timestamp).getTime();
        const tieneSalidaPosterior = allUserRecs.some(r=>
          r.tipo==='Salida' && r.timestamp && new Date(r.timestamp).getTime()>tsCand
        );
        if(!tieneSalidaPosterior){ entradaRec = cand; break; }
      }
      if(entradaRec) console.warn('[SecureCheck] Entrada huérfana recuperada desde',entradaRec.fecha);
    }catch(e){ console.warn('Fallback de búsqueda de Entrada falló:',e); }
  }
  const actualLunchMins = calcActualLunchMins(todayRecs);
  let brutoMins = 0, netoMins = 0;

  if(entradaRec){
    // Prioridad: timestamp ISO (más preciso) → fallback a parseHora mismo día
    let iniMs = null;
    if(entradaRec.timestamp){
      const tsDate = new Date(entradaRec.timestamp);
      if(!isNaN(tsDate.getTime())) iniMs = tsDate.getTime();
    }
    if(iniMs === null){
      const iniD = parseHora(entradaRec.hora);
      if(iniD){
        // Anclar al mismo día de HOY para evitar desbordamiento entre días
        const todayBase = new Date(now);
        todayBase.setHours(iniD.getHours(), iniD.getMinutes(), 0, 0);
        iniMs = todayBase.getTime();
      }
    }
    if(iniMs !== null){
      brutoMins = Math.max(0, (now.getTime() - iniMs) / 60000);
      // Validación de sanidad: una jornada no puede superar 16 horas (turno máximo razonable).
      // Si la sesión llevaba días abierta, esto evita pagar miles de horas falsas.
      const MAX_TURNO_MIN = 16 * 60;
      if(brutoMins > MAX_TURNO_MIN){
        console.warn('[SecureCheck] brutoMins fuera de rango:', brutoMins, '— recortado a 16h (turno máximo). Admin deberá revisar manualmente.');
        brutoMins = MAX_TURNO_MIN;
      }
    }
    netoMins = Math.max(0, brutoMins - actualLunchMins);
  }
  const brutoH = Math.floor(brutoMins/60), brutoM = Math.round(brutoMins%60);
  const netoH = Math.floor(netoMins/60), netoM = Math.round(netoMins%60);

  const proyectoVal=(document.getElementById('proyecto-input')?.value||'').trim();
  const record = {
    usuario: currentUser,
    tipo: 'Salida',
    fecha: today,
    hora: now.toLocaleTimeString('es-US'),
    timestamp: now.toISOString(),
    coords: userCoords ? userCoords.lat.toFixed(6)+','+userCoords.lng.toFixed(6) : 'sin_gps',
    device: deviceId,
    synced_cloud: false,
    area_trabajo: area,
    proyecto: proyectoVal||null,
    horas_bruto: brutoH+'h '+brutoM+'m',
    horas_neto: netoH+'h '+netoM+'m',
    lunch_descontado: actualLunchMins>0 ? Math.round(actualLunchMins)+'m' : '0m'
  };

  record.firma = await signRecord(record);
  await saveRecord(record);
  allRecords.push(record);

  // Actualizar ciclo
  const c = await getOrResetCycle(currentUser);
  c.step = 4; c.blocked = true;
  await saveCycleState(currentUser, c);

  // Sync a Supabase
  if(supabaseAvailable){
    const synced = await syncRecordToSupabase(record);
    if(synced) await dbPut('records', {...record, synced_cloud:true});
  }

  hideLoader();
  _marcandoEnProceso=false; // liberar guard
  updateDrawerStats();
  await updateButtonStates(c);
  await loadTodayHistory();
  const todayRecsUpdated = await getTodayRecordsByUser(currentUser);
  updateHorasTrabajadas(todayRecsUpdated);
  showToast('✓ SALIDA registrada · '+netoH+'h '+netoM+'m pagables · '+area);
  pendingTipo = null;
}

// ============================================================
// CUSTOM PICKERS — select, time, date
// ============================================================

// ── Generic custom-select bottom sheet ──────────────────────
let _custSelCb=null;
let _custSelCurrent='';

function openCustomSelect(title,options,current,cb){
  _custSelCb=cb;
  _custSelCurrent=current;
  document.getElementById('cust-sel-title-txt').textContent=title;
  const container=document.getElementById('cust-sel-opts');
  container.innerHTML=options.map(o=>{
    const val=typeof o==='object'?o.value:o;
    const lbl=typeof o==='object'?o.label:o;
    const sel=val===current;
    return `<div class="cust-opt-row${sel?' selected':''}" onclick="_custSelPick('${val.replace(/'/g,"\\'")}','${lbl.replace(/'/g,"\\'")}')">
      <span>${lbl}</span>
      <div class="cust-opt-radio"><div class="cust-opt-radio-dot"></div></div>
    </div>`;
  }).join('');
  openModal('modal-cust-sel');
}
function _custSelPick(val,lbl){
  if(_custSelCb)_custSelCb(val,lbl);
  closeModal('modal-cust-sel');
}

// ── Filter tipo & fecha triggers ────────────────────────────
const _TIPOS_FILTER=[
  {value:'',label:'Todos los tipos'},
  {value:'Entrada',label:'Entrada'},
  {value:'Salida',label:'Salida'},
  {value:'Inicio Lunch',label:'Inicio Lunch'},
  {value:'Fin Lunch',label:'Fin Lunch'},
  {value:'Inicio Almuerzo',label:'Inicio Almuerzo'},
  {value:'Fin Almuerzo',label:'Fin Almuerzo'},
  {value:'Pausa',label:'Pausa'},
  {value:'Reanudar',label:'Reanudar'}
];
function openFiltroTipo(){
  const cur=document.getElementById('filter-tipo')?.value||'';
  openCustomSelect('Tipo de registro',_TIPOS_FILTER,cur,(val,lbl)=>{
    const sel=document.getElementById('filter-tipo');
    if(sel)sel.value=val;
    const btn=document.getElementById('lbl-filter-tipo');
    if(btn)btn.textContent=lbl||'Todos los tipos';
    renderAdminRecords();
  });
}
function openFiltroFecha(){
  const sel=document.getElementById('filter-fecha');
  const dates=[...sel.options].map(o=>({value:o.value,label:o.textContent}));
  const cur=sel?.value||'';
  openCustomSelect('Filtrar por fecha',dates,cur,(val,lbl)=>{
    if(sel)sel.value=val;
    const btn=document.getElementById('lbl-filter-fecha');
    if(btn)btn.textContent=lbl||'Todas las fechas';
    renderAdminRecords();
  });
}

// ── Edit-record tipo picker ──────────────────────────────────
const _TIPOS_RECORD=[
  'Entrada','Salida','Inicio Lunch','Fin Lunch',
  'Inicio Almuerzo','Fin Almuerzo','Pausa','Reanudar'
];
function openEditTipoPicker(){
  const cur=document.getElementById('edit-rec-tipo')?.value||'Entrada';
  openCustomSelect('Tipo de registro',_TIPOS_RECORD,cur,(val)=>{
    const sel=document.getElementById('edit-rec-tipo');
    if(sel)sel.value=val;
    const lbl=document.getElementById('lbl-edit-rec-tipo');
    if(lbl)lbl.textContent=val;
  });
}

// ── Custom Time Picker ───────────────────────────────────────
let _tpInputId=null;
let _tpLblId=null;
let _tpH=12,_tpM=0,_tpAP='AM';

function openTimePicker(inputId,lblId){
  _tpInputId=inputId; _tpLblId=lblId;
  // Parse current value (24h format: "HH:MM")
  const cur=document.getElementById(inputId)?.value||'';
  if(cur){
    const [hh,mm]=(cur.split(':')).map(Number);
    _tpAP=hh>=12?'PM':'AM';
    _tpH=hh%12||12;
    _tpM=mm||0;
  } else {
    const now=new Date();
    _tpH=now.getHours()%12||12;
    _tpM=now.getMinutes();
    _tpAP=now.getHours()>=12?'PM':'AM';
  }
  _tpBuildCols();
  _tpUpdateDisplay();
  openModal('modal-time-pick');
  // Scroll to selected items after render
  setTimeout(_tpScrollToSel,80);
}

function _tpBuildCols(){
  // Hours 1–12
  const hCol=document.getElementById('tp-col-h');
  hCol.innerHTML=['','',''].concat([...Array(12)].map((_,i)=>i+1)).concat(['','']).map((v,i)=>{
    if(v==='')return `<div class="tp-item" style="visibility:hidden">12</div>`;
    return `<div class="tp-item${v===_tpH?' sel':''}" onclick="_tpPickH(${v})">${v}</div>`;
  }).join('');
  // Minutes 0,5,10...55
  const mins=[0,5,10,15,20,25,30,35,40,45,50,55];
  const snapM=Math.round(_tpM/5)*5%60; // snap to nearest 5
  _tpM=snapM;
  const mCol=document.getElementById('tp-col-m');
  mCol.innerHTML=['',''].concat(mins).concat(['','']).map(v=>{
    if(v==='')return `<div class="tp-item" style="visibility:hidden">00</div>`;
    return `<div class="tp-item${v===snapM?' sel':''}" onclick="_tpPickM(${v})">${String(v).padStart(2,'0')}</div>`;
  }).join('');
  // AM/PM
  const apCol=document.getElementById('tp-col-ap');
  apCol.innerHTML=[''].concat(['AM','PM']).concat(['']).map(v=>{
    if(v==='')return `<div class="tp-item" style="visibility:hidden">AM</div>`;
    return `<div class="tp-item${v===_tpAP?' sel':''}" onclick="_tpPickAP('${v}')">${v}</div>`;
  }).join('');
}
function _tpScrollToSel(){
  ['tp-col-h','tp-col-m','tp-col-ap'].forEach(id=>{
    const col=document.getElementById(id);
    if(!col)return;
    const sel=col.querySelector('.sel');
    if(sel){
      const itemH=sel.offsetHeight||52;
      col.scrollTop=sel.offsetTop-col.offsetHeight/2+itemH/2;
    }
  });
}
function _tpPickH(v){_tpH=v;_tpUpdateDisplay();_tpHighlight('tp-col-h',v);}
function _tpPickM(v){_tpM=v;_tpUpdateDisplay();_tpHighlight('tp-col-m',v);}
function _tpPickAP(v){_tpAP=v;_tpUpdateDisplay();_tpHighlight('tp-col-ap',v);}
function _tpHighlight(colId,val){
  const col=document.getElementById(colId);
  if(!col)return;
  col.querySelectorAll('.tp-item').forEach(el=>{
    const t=el.textContent.trim();
    const matches=(colId==='tp-col-m')?parseInt(t)===val:(colId==='tp-col-h')?parseInt(t)===val:t===val;
    el.classList.toggle('sel',matches);
  });
}
function _tpUpdateDisplay(){
  document.getElementById('tp-disp-h').textContent=_tpH;
  document.getElementById('tp-disp-m').textContent=String(_tpM).padStart(2,'0');
  document.getElementById('tp-disp-ap').textContent=_tpAP;
}
function confirmTimePick(){
  // Convert to 24h for the hidden input
  let h24=_tpH%12;
  if(_tpAP==='PM')h24+=12;
  const val24=String(h24).padStart(2,'0')+':'+String(_tpM).padStart(2,'0');
  const dispTxt=_tpH+':'+String(_tpM).padStart(2,'0')+' '+_tpAP;
  const inp=document.getElementById(_tpInputId);
  if(inp)inp.value=val24;
  const lbl=document.getElementById(_tpLblId);
  if(lbl)lbl.textContent=dispTxt;
  closeModal('modal-time-pick');
}

// ── Mini Calendar Picker ─────────────────────────────────────
let _mcInputId=null,_mcLblId=null;
let _mcYear=2026,_mcMonth=3; // 0-indexed month
let _mcSelected=''; // ISO yyyy-mm-dd

function openMiniCal(inputId,lblId){
  _mcInputId=inputId; _mcLblId=lblId;
  const cur=document.getElementById(inputId)?.value||'';
  const now=new Date();
  if(cur){
    const d=new Date(cur+'T12:00:00');
    _mcYear=d.getFullYear();_mcMonth=d.getMonth();_mcSelected=cur;
  } else {
    _mcYear=now.getFullYear();_mcMonth=now.getMonth();_mcSelected='';
  }
  _mcRender();
  openModal('modal-mini-cal');
}
function mcNav(dir){
  _mcMonth+=dir;
  if(_mcMonth<0){_mcMonth=11;_mcYear--;}
  if(_mcMonth>11){_mcMonth=0;_mcYear++;}
  _mcRender();
}
function _mcRender(){
  const MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  document.getElementById('mc-month-lbl').textContent=MONTHS[_mcMonth]+' '+_mcYear;
  const firstDay=new Date(_mcYear,_mcMonth,1).getDay();
  const daysInMonth=new Date(_mcYear,_mcMonth+1,0).getDate();
  const todayStr=new Date().toISOString().slice(0,10);
  let html='';
  for(let i=0;i<firstDay;i++) html+=`<div class="mc-day empty"></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const iso=_mcYear+'-'+String(_mcMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const isSel=iso===_mcSelected;
    const isToday=iso===todayStr;
    html+=`<div class="mc-day${isSel?' selected':isToday?' today':''}" onclick="_mcPick('${iso}')">${d}</div>`;
  }
  document.getElementById('mc-grid').innerHTML=html;
}
function _mcPick(iso){
  _mcSelected=iso;
  const inp=document.getElementById(_mcInputId);
  if(inp)inp.value=iso;
  // Format for display: M/D/YYYY
  const d=new Date(iso+'T12:00:00');
  const display=(d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear();
  const lbl=document.getElementById(_mcLblId);
  if(lbl)lbl.textContent=display;
  _mcRender(); // refresh to show selection
  setTimeout(()=>closeModal('modal-mini-cal'),120);
}

// ── Helper: set mini-cal input value programmatically ────────
function _mcSetValue(inputId,lblId,isoOrDate){
  let iso=isoOrDate;
  if(isoOrDate instanceof Date){
    iso=isoOrDate.getFullYear()+'-'+String(isoOrDate.getMonth()+1).padStart(2,'0')+'-'+String(isoOrDate.getDate()).padStart(2,'0');
  }
  const inp=document.getElementById(inputId);
  if(inp)inp.value=iso;
  if(lblId){
    const d=new Date(iso+'T12:00:00');
    const display=(d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear();
    const lbl=document.getElementById(lblId);
    if(lbl)lbl.textContent=display;
  }
}

// ── Helper: set time-picker display input programmatically ───
function _tpSetValue(inputId,lblId,val24){
  // val24: "HH:MM"
  const inp=document.getElementById(inputId);
  if(inp)inp.value=val24;
  if(lblId&&val24){
    const [hh,mm]=val24.split(':').map(Number);
    const ap=hh>=12?'PM':'AM';
    const h=hh%12||12;
    const lbl=document.getElementById(lblId);
    if(lbl)lbl.textContent=h+':'+String(mm).padStart(2,'0')+' '+ap;
  }
}

// ============================================================
// INIT
// ============================================================
// ============================================================
// BOTÓN REGRESAR DE ANDROID — evita salir de la app
// ============================================================
// ── Doble-toque para salir ───────────────────────────────────
let _backPressedOnce=false;
let _backPressTimer=null;
// ── Anti-doble-disparo: document.backbutton + CapApp.backButton se disparan los dos por la misma pulsación ──
let _lastBackHandled=0;

function _exitOrMinimize(){
  const CapApp=window.Capacitor?.Plugins?.App;
  if(CapApp){
    // exitApp cierra el proceso; si no existe usa minimizeApp
    if(typeof CapApp.exitApp==='function'){ CapApp.exitApp(); return; }
    if(typeof CapApp.minimizeApp==='function'){ CapApp.minimizeApp(); return; }
  }
  // Fallback si App plugin no está instalado
  try{ window.close(); }catch(e){}
  try{ navigator.app&&navigator.app.exitApp&&navigator.app.exitApp(); }catch(e){}
}

function _minimizeToBackground(){
  const CapApp=window.Capacitor?.Plugins?.App;
  if(CapApp&&typeof CapApp.minimizeApp==='function'){
    CapApp.minimizeApp();
  }
}

function handleBackButton(){
  // ── Debounce: evita doble-disparo cuando document.backbutton Y CapApp.backButton se activan juntos ──
  const _now=Date.now();
  if(_now-_lastBackHandled<400)return;
  _lastBackHandled=_now;

  // ── 1. Cerrar modal abierto ──────────────────────────────────
  const openModalEl=document.querySelector('.modal-wrap.open');
  if(openModalEl&&openModalEl.id!=='loader'){
    closeModal(openModalEl.id);
    return;
  }
  // ── 2. Cerrar drawer ────────────────────────────────────────
  const drawer=document.getElementById('drawer');
  if(drawer&&drawer.classList.contains('open')){
    closeDrawer();
    return;
  }
  // ── 3. Navegación interna de pantallas ──────────────────────
  const activeScreen=document.querySelector('.screen.active');
  if(activeScreen&&activeScreen.id==='pago-screen'){
    closePagoScreen();
    return;
  }
  if(activeScreen&&activeScreen.id==='proyectos-screen'){
    showScreen(isAdmin?'admin-screen':'main-screen');
    return;
  }
  // ── 4. Jornada activa → minimizar al fondo, NO salir ────────
  if(activeCycleStep>=1&&activeCycleStep<4){
    _minimizeToBackground();
    showToast('⏱ Jornada en curso — app corriendo en segundo plano');
    return;
  }
  // ── 5. Sin jornada activa → doble-toque para salir ──────────
  if(_backPressedOnce){
    clearTimeout(_backPressTimer);
    _backPressedOnce=false;
    _exitOrMinimize();
    return;
  }
  _backPressedOnce=true;
  showToast('⬅️ Presiona de nuevo para salir de la app');
  _backPressTimer=setTimeout(()=>{_backPressedOnce=false;},2500);
}

function initBackButtonHandler(){
  // ── MÉTODO PRINCIPAL: evento 'backbutton' en document ────────
  // Capacitor y Cordova disparan este evento DOM nativo en Android
  // SIEMPRE funciona sin importar si @capacitor/app está instalado
  document.addEventListener('backbutton', function(e){
    e.preventDefault();
    e.stopPropagation();
    handleBackButton();
    return false;
  }, false);
  console.log('[SecureCheck] Back button: document.backbutton registrado');

  // ── MÉTODO 2: Capacitor App plugin (refuerzo adicional) ──────
  try{
    const CapApp=window.Capacitor?.Plugins?.App;
    if(CapApp){
      CapApp.addListener('backButton',()=>{ handleBackButton(); });
      CapApp.addListener('appStateChange',({isActive})=>{ if(isActive) handleAppResume(); });
      console.log('[SecureCheck] Capacitor App plugin también activo');
    }
  }catch(e){}

  // ── MÉTODO 3: history.pushState como red de seguridad extra ──
  // Solo para dispositivos sin gesture nav o sin Capacitor
  try{
    for(let _i=0;_i<15;_i++) window.history.pushState({sc:'app',i:_i},'',window.location.href);
    window.addEventListener('popstate',function(e){
      window.history.pushState({sc:'app',t:Date.now()},'',window.location.href);
      handleBackButton();
    });
  }catch(e){}

  // ── Reanudar app cuando vuelve al frente ─────────────────────
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible') handleAppResume();
  });
  document.addEventListener('resume',function(){ handleAppResume(); },false);
}

// ============================================================
// PROTECCIÓN BEFOREUNLOAD — advertencia si se intenta cerrar
// ============================================================
function initBeforeUnloadProtection(){
  window.addEventListener('beforeunload',function(e){
    if(activeCycleStep>=1&&activeCycleStep<4&&currentUser&&!isAdmin){
      const msg='Tienes una jornada activa. Si cierras la app podrías perder el progreso del día.';
      e.preventDefault();
      e.returnValue=msg;
      return msg;
    }
  });
  console.log('beforeunload protection activo');
}

async function init(){
  try{
    applyLang(); // apply saved language preference immediately
    // Obtener ID de hardware estable (persiste tras reinstalar el app)
    deviceId=await getDeviceId();
    await initDB();
    await migrateLegacyData();
    await deduplicateLocalRecords(); // eliminar duplicados al inicio
    await fetchEmployees();
    // Detectar modelo del teléfono (guardado para sincronizar con Supabase)
    currentDeviceModel=localStorage.getItem('sc_device_model')||'Desconocido';
    detectDeviceModel(); // actualiza en background, no bloquea el arranque
    nativeBiometricAvailable().then(ok=>{biometricReady=ok;});
    // Inicializar manejo del botón de regresar ANTES de todo
    initBackButtonHandler();
    // Protección beforeunload (navegador/WebView)
    initBeforeUnloadProtection();
    // Escuchar cambios de conectividad
    window.addEventListener('online',async()=>{
      await checkSupabaseConnection();
      if(supabaseAvailable){processSyncQueue();fetchProyectosFromSupabase();}
      showToast('☁️ Conexión restaurada — sincronizando...');
    });
    window.addEventListener('offline',()=>{
      supabaseAvailable=false;showToast('📱 Sin internet — guardando localmente');
    });
    // Keep-alive: evita que Supabase pause el proyecto por inactividad (plan free)
    // Se ejecuta silenciosamente en background, máximo una vez cada 5 días
    _supabaseKeepAlive();
  }catch(e){console.error('Error init:',e);}
}

// ============================================================
// SUPABASE KEEP-ALIVE
// Hace un ping ligero a Supabase cada 5 días para evitar que
// el proyecto free se pause por inactividad (límite: 7 días)
// ============================================================
async function _supabaseKeepAlive(){
  try{
    const KEY='sc_keepalive_last';
    const last=parseInt(localStorage.getItem(KEY)||'0');
    const now=Date.now();
    const FIVE_DAYS=5*24*60*60*1000;
    if(now-last < FIVE_DAYS) return; // ya se hizo hace menos de 5 días
    // Ping mínimo: consulta de 1 fila (no escribe nada, no cuesta nada)
    const res=await fetch(
      `${SUPABASE_URL}/rest/v1/employees?select=usuario&limit=1`,
      {headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY}}
    );
    if(res.ok){
      localStorage.setItem(KEY, String(now));
      console.log('[KeepAlive] Supabase ping OK —',new Date().toLocaleDateString());
    }
  }catch(e){ /* silencioso, no afecta el arranque */ }
}

// Limpia registros duplicados del IndexedDB (una sola vez al inicio)
async function deduplicateLocalRecords(){
  try{
    const allRecs=await getAllRecords();
    const seen=new Set();const toDelete=[];
    const norm=h=>(h||'').replace(/\s+/g,' ').replace(/\. /g,'.').trim();
    // Ordenar por id para mantener el primer registro (el original)
    allRecs.sort((a,b)=>(a.id||0)-(b.id||0));
    for(const r of allRecs){
      // Clave de dedup: firma > timestamp > compuesta
      const key=r.firma||(r.timestamp&&'ts:'+r.timestamp)||(r.usuario+'|'+r.tipo+'|'+r.fecha+'|'+norm(r.hora));
      if(seen.has(key)){toDelete.push(r.id);}else{seen.add(key);}
    }
    if(toDelete.length){
      for(const id of toDelete)await dbDelete('records',id);
      console.log('🧹 Eliminados',toDelete.length,'registros duplicados del IndexedDB');
    }
  }catch(e){console.warn('deduplicateLocalRecords error:',e);}
}

async function migrateLegacyData(){
  try{
    const cached=localStorage.getItem('sc_emp_cache');
    if(cached){
      const emps=JSON.parse(cached);const existing=await dbGetAll('employees');
      if(!existing.length&&Object.keys(emps).length){for(const[u,data] of Object.entries(emps))await dbPut('employees',{usuario:u,...data});console.log('Empleados migrados');}
    }
  }catch(e){}
  try{
    const existingRecs=await getAllRecords();
    if(!existingRecs.length){
      const empCache=JSON.parse(localStorage.getItem('sc_emp_cache')||'{}');let migrated=0;
      for(const u of Object.keys(empCache)){const arr=JSON.parse(localStorage.getItem('sc_backup_'+u)||'[]');for(const r of arr){await saveRecord({...r,usuario:u});migrated++;}}
      if(migrated)console.log('Migrados',migrated,'registros');
    }
  }catch(e){}
}

function getCycleSyncFromStorage(u){try{return JSON.parse(localStorage.getItem('sc_cycle_'+u)||'{}');}catch(e){return null;}}

// ============================================================
// ROL ASISTENTE — Marca asistencia igual que empleado +
//                 puede subir fotos del proyecto desde el drawer
// ============================================================
let _asiFotos=[];// fotos pendientes [{dataUrl, nombre, size}]

async function toggleAsistenteRole(u){
  const emp=employees[u];
  const isAsi=emp.isAsistente===true||emp.isAsistente==='TRUE';
  const nuevoEstado=!isAsi;
  const msg=nuevoEstado
    ? `¿Asignar rol de Asistente a "${u}"?\n\n• Marcará asistencia igual que los demás empleados\n• Tendrá acceso extra para subir fotos del proyecto\n• Los cambios aplican en su próximo inicio de sesión`
    : `¿Quitar el rol de Asistente a "${u}"?\n\nVolverá a ser empleado regular.\nAplica en su próximo inicio de sesión.`;
  if(!confirm(msg))return;
  await updateEmployee(u,{isAsistente:nuevoEstado});
  showToast(nuevoEstado?'📸 '+u+' asignado como Asistente — aplica al próximo login':'✓ Rol de asistente removido de '+u);
  renderEmpList();
}

// Carga proyectos del admin en el select del modal Fotos
async function loadProyectosEnSelect(){
  // Intentar actualizar desde Supabase primero
  if(supabaseAvailable) await fetchProyectosFromSupabase();
  const sel=document.getElementById('asi-proyecto');
  const hint=document.getElementById('asi-proy-hint');
  if(!sel)return;
  const lista=await getAllProyectos();
  const activos=lista.filter(p=>!p.estado||p.estado==='activo'||p.estado==='en curso');
  sel.innerHTML='';
  if(!activos.length){
    sel.innerHTML='<option value="" disabled selected style="background:#1a2332">Sin proyectos activos</option>';
    sel.disabled=true;
    if(hint)hint.style.display='block';
    return;
  }
  if(hint)hint.style.display='none';
  sel.disabled=false;
  sel.innerHTML='<option value="" disabled selected style="background:#1a2332;color:var(--text4)">— Selecciona un proyecto —</option>';
  activos.forEach(p=>{
    const opt=document.createElement('option');
    opt.value=p.nombre;
    opt.dataset.id=p.id||'';
    opt.dataset.supabaseId=p.supabaseId||'';
    opt.textContent=p.nombre+(p.estado&&p.estado!=='activo'?' ('+p.estado+')':'');
    opt.style.background='#1a2332';
    sel.appendChild(opt);
  });
  // Si solo hay uno, seleccionarlo automáticamente
  if(activos.length===1) sel.selectedIndex=1;
}

function abrirCamaraAsistente(){
  const inp=document.getElementById('asi-file-input');
  if(!inp)return;
  inp.setAttribute('capture','environment');
  inp.removeAttribute('multiple');
  inp.click();
}

function abrirArchivoAsistente(){
  const inp=document.getElementById('asi-file-input');
  if(!inp)return;
  inp.removeAttribute('capture');
  inp.setAttribute('multiple','');
  inp.click();
}

function procesarFotoAsistente(input){
  const files=input.files;if(!files||!files.length)return;
  Array.from(files).forEach(file=>{
    const reader=new FileReader();
    reader.onload=e=>{
      _asiFotos.push({dataUrl:e.target.result,nombre:file.name,size:file.size});
      actualizarPreviewFotos();
    };
    reader.readAsDataURL(file);
  });
  input.value='';
}

function actualizarPreviewFotos(){
  const preview=document.getElementById('asi-photos-preview');
  const thumbs=document.getElementById('asi-thumbs');
  const count=document.getElementById('asi-photo-count');
  const uploadBtn=document.getElementById('asi-upload-btn');
  if(!preview||!thumbs)return;
  if(!_asiFotos.length){preview.style.display='none';if(uploadBtn)uploadBtn.disabled=true;return;}
  preview.style.display='block';
  if(count)count.textContent=_asiFotos.length;
  if(uploadBtn)uploadBtn.disabled=false;
  thumbs.innerHTML=_asiFotos.map((f,i)=>`
    <div class="asi-thumb-item">
      <img src="${f.dataUrl}" class="asi-thumb-img" onclick="verFotoGrande('${f.dataUrl}')"/>
      <button class="asi-thumb-del" onclick="quitarFotoAsistente(${i})">✕</button>
    </div>`).join('');
}

function quitarFotoAsistente(idx){
  _asiFotos.splice(idx,1);
  actualizarPreviewFotos();
}

function verFotoGrande(src){
  // Abre la foto a pantalla completa en un overlay temporal
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out';
  const img=document.createElement('img');
  img.src=src;img.style.cssText='max-width:96vw;max-height:92vh;border-radius:10px;object-fit:contain';
  ov.appendChild(img);
  ov.onclick=()=>document.body.removeChild(ov);
  document.body.appendChild(ov);
}

async function subirFotosAsistente(){
  if(!_asiFotos.length){showToast('Selecciona al menos una foto');return;}
  const sel=document.getElementById('asi-proyecto');
  const proyecto=(sel?.value||'').trim();
  const notas=(document.getElementById('asi-notas')?.value||'').trim();
  const fechaInp=document.getElementById('asi-fecha-foto')?.value;
  if(!proyecto){showToast('⚠️ Selecciona un proyecto');if(sel)sel.focus();return;}
  showLoader('Guardando fotos...');
  // Calcular fecha key desde el input de fecha
  let fechaKey=getTodayKey();
  if(fechaInp){
    const [y,m,d]=fechaInp.split('-');
    fechaKey=`${parseInt(m)}/${parseInt(d)}/${y}`;
  }
  const now=new Date();
  try{
    // Obtener supabaseId desde el option seleccionado o buscar en IndexedDB
    const selOpt=sel?.options[sel.selectedIndex];
    let proySupabaseId=selOpt?.dataset?.supabaseId||null;
    if(!proySupabaseId){
      const proyectosList=await getAllProyectos();
      const proyObj=proyectosList.find(p=>p.nombre.toLowerCase()===proyecto.toLowerCase());
      proySupabaseId=proyObj?.supabaseId||null;
    }

    for(const foto of _asiFotos){
      const photoRec={
        usuario:currentUser,
        tipo:'Foto',
        fecha:fechaKey,
        hora:now.toLocaleTimeString('es-US'),
        timestamp:now.toISOString(),
        proyecto:proyecto,
        area_trabajo:notas||null,
        foto_data:foto.dataUrl,// base64 guardado localmente
        coords:'sin_gps',
        device:deviceId,
        device_model:currentDeviceModel||'Desconocido',
        synced_cloud:false
      };
      photoRec.firma=await signRecord({...photoRec,foto_data:undefined});
      await saveRecord(photoRec);
      // Sync a Supabase: metadata del registro + foto al proyecto
      if(supabaseAvailable){
        await syncRecordToSupabase({...photoRec,foto_data:'[imagen local]'});
        // Sync foto a proyecto_fotos si tenemos el ID del proyecto
        if(proySupabaseId){
          await syncFotoToSupabase(proySupabaseId,foto.dataUrl,notas||'',currentUser,photoRec.hora,fechaKey);
        }
      }
    }
    hideLoader();
    const cnt=_asiFotos.length;
    _asiFotos=[];
    actualizarPreviewFotos();
    const notasEl=document.getElementById('asi-notas');if(notasEl)notasEl.value='';
    showToast('✅ '+cnt+' foto'+(cnt!==1?'s':'')+' guardadas · '+proyecto);
    loadFotosHoyAsistente();
    // Las fotos de asistentes ahora se gestionan desde la pantalla de Proyectos
  }catch(e){hideLoader();console.error('subirFotosAsistente:',e);showToast('❌ Error al guardar fotos');}
}

async function loadFotosHoyAsistente(){
  const el=document.getElementById('asi-uploaded-list');if(!el)return;
  // Usar la fecha seleccionada en el input, o hoy si no hay
  const fechaInp=document.getElementById('asi-fecha-foto')?.value;
  let fechaKey=getTodayKey();
  if(fechaInp){const [y,m,d]=fechaInp.split('-');fechaKey=`${parseInt(m)}/${parseInt(d)}/${y}`;}
  const recs=await getAllRecords();
  const fotos=recs.filter(r=>r.usuario===currentUser&&r.tipo==='Foto'&&r.fecha===fechaKey);
  if(!fotos.length){el.innerHTML='<div style="color:var(--text4);font-size:12px">Sin fotos para esta fecha</div>';return;}
  const byProy={};
  fotos.forEach(f=>{const p=f.proyecto||'Sin proyecto';if(!byProy[p])byProy[p]=[];byProy[p].push(f);});
  el.innerHTML=Object.entries(byProy).map(([proy,fts])=>`
    <div class="aud-group">
      <div class="aud-group-hdr">📁 ${proy} <span class="aud-cnt">${fts.length} foto${fts.length!==1?'s':''}</span></div>
      <div class="aud-thumb-row">
        ${fts.map(f=>f.foto_data
          ?`<img src="${f.foto_data}" class="aud-thumb" onclick="verFotoGrande('${f.foto_data}')" title="${f.hora||''}"/>`
          :`<div class="aud-thumb-ph">📷</div>`).join('')}
      </div>
      ${fts[0]?.area_trabajo?`<div class="aud-nota">${fts[0].area_trabajo}</div>`:''}
    </div>`).join('');
}

// ============================================================
// ADMIN — AUDITORÍA (galería de fotos de asistentes)
// ============================================================
async function renderAuditoria(){
  const listEl=document.getElementById('auditoria-list');
  const countEl=document.getElementById('aud-count-bar');
  if(!listEl)return;
  // Actualizar select de asistentes
  const selEmp=document.getElementById('aud-filter-emp');
  if(selEmp){
    const asiKeys=Object.keys(employees).filter(u=>u!==ADMIN_USER&&(employees[u].isAsistente===true||employees[u].isAsistente==='TRUE'));
    const currentVal=selEmp.value;
    selEmp.innerHTML='<option value="">Todos los asistentes</option>'+asiKeys.map(u=>`<option value="${u}">${u.charAt(0).toUpperCase()+u.slice(1)}</option>`).join('');
    if(currentVal)selEmp.value=currentVal;
  }
  // Filtros
  const empFilter=selEmp?.value||'';
  const fechaFilter=document.getElementById('aud-filter-fecha')?.value||'';
  // Traer todos los registros de tipo Foto
  const allRecs=await getAllRecords();
  let fotos=allRecs.filter(r=>r.tipo==='Foto');
  // Filtrar solo registros de asistentes
  const asiSet=new Set(Object.keys(employees).filter(u=>employees[u].isAsistente===true||employees[u].isAsistente==='TRUE'));
  fotos=fotos.filter(r=>asiSet.has(r.usuario));
  if(empFilter)fotos=fotos.filter(r=>r.usuario===empFilter);
  if(fechaFilter){
    const [y,m,d]=fechaFilter.split('-');
    const fk=`${parseInt(m)}/${parseInt(d)}/${y}`;
    fotos=fotos.filter(r=>r.fecha===fk);
  }
  if(countEl)countEl.textContent=fotos.length+' foto'+(fotos.length!==1?'s':'')+' encontradas';
  if(!fotos.length){
    listEl.innerHTML='<div class="live-empty" style="padding:40px 0"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg><span>Sin fotos en el período seleccionado</span></div>';
    return;
  }
  // Ordenar por timestamp descendente
  fotos.sort((a,b)=>new Date(b.timestamp||0)-new Date(a.timestamp||0));
  // Agrupar por fecha → por asistente → por proyecto
  const byFecha={};
  fotos.forEach(f=>{
    const fecha=f.fecha||'?';
    if(!byFecha[fecha])byFecha[fecha]={};
    const byEmp=byFecha[fecha];
    const emp=f.usuario||'?';
    if(!byEmp[emp])byEmp[emp]={};
    const proy=f.proyecto||'Sin proyecto';
    if(!byEmp[emp][proy])byEmp[emp][proy]=[];
    byEmp[emp][proy].push(f);
  });
  let html='';
  for(const fecha of Object.keys(byFecha).sort((a,b)=>new Date(b.split('/')[2]+'-'+String(b.split('/')[0]).padStart(2,'0')+'-'+String(b.split('/')[1]).padStart(2,'0'))-new Date(a.split('/')[2]+'-'+String(a.split('/')[0]).padStart(2,'0')+'-'+String(a.split('/')[1]).padStart(2,'0')))){
    html+=`<div class="aud-date-hdr">${fecha}</div>`;
    const byEmp=byFecha[fecha];
    for(const emp of Object.keys(byEmp)){
      const nombre=emp.charAt(0).toUpperCase()+emp.slice(1);
      html+=`<div class="aud-emp-strip"><span class="aud-emp-av">${emp.substring(0,2).toUpperCase()}</span><span class="aud-emp-name">${nombre}</span><span class="asi-badge" style="margin-left:6px">ASISTENTE</span></div>`;
      for(const proy of Object.keys(byEmp[emp])){
        const fts=byEmp[emp][proy];
        const nota=fts.find(f=>f.area_trabajo)?.area_trabajo||'';
        html+=`<div class="aud-group">
          <div class="aud-group-hdr">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:.6"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
            ${proy} <span class="aud-cnt">${fts.length} foto${fts.length!==1?'s':''}</span>
            <span style="margin-left:auto;font-size:10px;color:var(--text4)">${fts[0]?.hora||''}</span>
          </div>
          <div class="aud-thumb-row">
            ${fts.map(f=>f.foto_data
              ?`<img src="${f.foto_data}" class="aud-thumb" onclick="verFotoGrande('${f.foto_data}')" title="${f.hora||''}"/>`
              :`<div class="aud-thumb-ph" title="Foto sincronizada desde otro dispositivo">📷<span style="font-size:8px;display:block;color:var(--text4)">otro disp.</span></div>`).join('')}
          </div>
          ${nota?`<div class="aud-nota">💬 ${nota}</div>`:''}
        </div>`;
      }
    }
  }
  listEl.innerHTML=html;
}

// ============================================================
// AVATAR / FOTO DE PERFIL
// ============================================================
const AVATAR_PRESETS=[
  {id:'green',  bg:'rgba(16,185,129,0.18)',border:'rgba(16,185,129,0.5)', color:'#10b981'},
  {id:'blue',   bg:'rgba(59,130,246,0.18)', border:'rgba(59,130,246,0.5)',  color:'#3b82f6'},
  {id:'purple', bg:'rgba(168,85,247,0.18)', border:'rgba(168,85,247,0.5)', color:'#a855f7'},
  {id:'orange', bg:'rgba(249,115,22,0.18)', border:'rgba(249,115,22,0.5)', color:'#f97316'},
  {id:'red',    bg:'rgba(239,68,68,0.18)',  border:'rgba(239,68,68,0.5)',  color:'#ef4444'},
  {id:'teal',   bg:'rgba(20,184,166,0.18)', border:'rgba(20,184,166,0.5)', color:'#14b8a6'},
  {id:'indigo', bg:'rgba(99,102,241,0.18)', border:'rgba(99,102,241,0.5)', color:'#6366f1'},
  {id:'pink',   bg:'rgba(236,72,153,0.18)', border:'rgba(236,72,153,0.5)', color:'#ec4899'},
  {id:'amber',  bg:'rgba(245,158,11,0.18)', border:'rgba(245,158,11,0.5)', color:'#f59e0b'},
  {id:'cyan',   bg:'rgba(6,182,212,0.18)',  border:'rgba(6,182,212,0.5)',  color:'#06b6d4'},
];

// Leer/escribir avatar desde IndexedDB (campo en employees) o localStorage para admin
async function getAvatarData(usuario){
  if(usuario===ADMIN_USER){
    try{return JSON.parse(localStorage.getItem('sc_avatar_admin')||'null');}catch(e){return null;}
  }
  try{
    const emp=await dbGet('employees',usuario)||employees[usuario]||{};
    return emp.avatarData||null;
  }catch(e){return null;}
}

async function setAvatarData(usuario,data){
  if(usuario===ADMIN_USER){
    try{localStorage.setItem('sc_avatar_admin',JSON.stringify(data));}catch(e){}
    return;
  }
  try{
    const emp=await dbGet('employees',usuario)||{usuario};
    const updated={...emp,avatarData:data};
    await dbPut('employees',updated);
    if(employees[usuario])employees[usuario]={...employees[usuario],avatarData:data};
    // Subir a Supabase también para que persista en otros dispositivos
    if(supabaseAvailable&&data){
      // Solo guardamos el preset/color, NO la foto en base64 en Supabase (demasiado pesada)
      if(data.type==='preset'){
        await updateEmployee(usuario,{avatarData:data});
      }
    }
  }catch(e){}
}

// Actualiza TODOS los elementos de avatar en pantalla para un usuario
async function updateAvatarUI(usuario){
  const data=await getAvatarData(usuario);
  const ini=usuario===ADMIN_USER?'AD':usuario.substring(0,2).toUpperCase();
  // Elementos a actualizar
  const targets=[];
  if(usuario===ADMIN_USER){
    const el=document.getElementById('top-av-admin');if(el)targets.push({el,size:32});
    const drEl=document.getElementById('dr-av');if(drEl)targets.push({el:drEl,size:44});
  } else {
    const el=document.getElementById('top-av');if(el)targets.push({el,size:32});
    const drEl=document.getElementById('dr-av');if(drEl)targets.push({el:drEl,size:44});
  }
  targets.forEach(({el,size})=>{
    el.innerHTML='';
    el.style.background='';el.style.borderColor='';el.style.color='';
    el.style.overflow='hidden';el.style.cursor='pointer';
    if(data&&data.type==='photo'&&data.dataUrl){
      el.style.background='transparent';
      el.style.border='2px solid rgba(255,255,255,0.2)';
      const img=document.createElement('img');
      img.src=data.dataUrl;
      img.style.cssText='width:100%;height:100%;object-fit:cover;display:block;border-radius:50%';
      el.appendChild(img);
    } else if(data&&data.type==='preset'){
      const preset=AVATAR_PRESETS.find(p=>p.id===data.presetId)||AVATAR_PRESETS[0];
      el.style.background=preset.bg;
      el.style.borderColor=preset.border;
      el.style.color=preset.color;
      el.textContent=ini;
    } else {
      // Default: iniciales con color según rol
      if(usuario===ADMIN_USER){
        el.style.background='rgba(59,130,246,0.15)';
        el.style.borderColor='rgba(59,130,246,0.3)';
        el.style.color='#3b82f6';
      } else {
        el.style.background='rgba(16,185,129,0.15)';
        el.style.borderColor='rgba(16,185,129,0.3)';
        el.style.color='#10b981';
      }
      el.textContent=ini;
    }
  });
}

// ── Abrir modal de avatar ─────────────────────────────────────
async function abrirModalAvatar(){
  if(!currentUser)return;
  const ini=currentUser===ADMIN_USER?'AD':currentUser.substring(0,2).toUpperCase();
  const nombre=currentUser===ADMIN_USER?'Administrador':(currentUser.charAt(0).toUpperCase()+currentUser.slice(1));
  // Sincronizar preview con avatar actual
  const data=await getAvatarData(currentUser);
  const previewEl=document.getElementById('av-preview-circle');
  if(previewEl){
    previewEl.innerHTML='';
    previewEl.style.overflow='hidden';
    if(data&&data.type==='photo'&&data.dataUrl){
      const img=document.createElement('img');
      img.src=data.dataUrl;img.style.cssText='width:100%;height:100%;object-fit:cover;display:block;border-radius:50%';
      previewEl.appendChild(img);previewEl.style.background='transparent';previewEl.style.borderColor='rgba(255,255,255,0.2)';
    } else if(data&&data.type==='preset'){
      const preset=AVATAR_PRESETS.find(p=>p.id===data.presetId)||AVATAR_PRESETS[0];
      previewEl.textContent=ini;
      previewEl.style.background=preset.bg;previewEl.style.borderColor=preset.border;previewEl.style.color=preset.color;
    } else {
      previewEl.textContent=ini;
      previewEl.style.background='rgba(16,185,129,0.15)';previewEl.style.borderColor='rgba(16,185,129,0.3)';previewEl.style.color='#10b981';
    }
  }
  const nameEl=document.getElementById('av-preview-name');
  if(nameEl)nameEl.textContent=nombre;
  // Render presets
  const grid=document.getElementById('av-preset-grid');
  if(grid){
    const currentPreset=data&&data.type==='preset'?data.presetId:null;
    grid.innerHTML=AVATAR_PRESETS.map(p=>`
      <button class="av-preset-btn ${p.id===currentPreset?'selected':''}"
              style="background:${p.bg};border-color:${p.border};color:${p.color}"
              onclick="elegirPresetAvatar('${p.id}')">
        <span style="font-size:14px;font-weight:700;font-family:var(--mono)">${ini}</span>
      </button>`).join('');
  }
  openModal('modal-avatar');
}

function tomarFotoAvatar(){
  const inp=document.getElementById('av-file-input');
  if(inp){inp.setAttribute('capture','user');inp.click();}
}
function elegirFotoAvatar(){
  const inp=document.getElementById('av-file-input');
  if(inp){inp.removeAttribute('capture');inp.click();}
}

function procesarFotoAvatar(inputEl){
  const file=inputEl.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=async e=>{
    // Comprimir la imagen a max 200x200 para no sobrecargar el storage
    const img=new Image();
    img.onload=async()=>{
      const canvas=document.createElement('canvas');
      const MAX=200;
      let w=img.width,h=img.height;
      if(w>h){if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}}else{if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}}
      canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d');
      // Recortar en círculo
      ctx.beginPath();ctx.arc(w/2,h/2,Math.min(w,h)/2,0,Math.PI*2);ctx.clip();
      ctx.drawImage(img,0,0,w,h);
      const dataUrl=canvas.toDataURL('image/jpeg',0.85);
      await guardarYAplicarAvatar({type:'photo',dataUrl});
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
  inputEl.value='';
}

async function elegirPresetAvatar(presetId){
  await guardarYAplicarAvatar({type:'preset',presetId});
}

async function quitarFotoAvatar(){
  await guardarYAplicarAvatar(null);
  showToast('Foto de perfil eliminada');
}

async function guardarYAplicarAvatar(data){
  await setAvatarData(currentUser,data);
  await updateAvatarUI(currentUser);
  // Actualizar preview en modal
  const ini=currentUser===ADMIN_USER?'AD':currentUser.substring(0,2).toUpperCase();
  const previewEl=document.getElementById('av-preview-circle');
  if(previewEl){
    previewEl.innerHTML='';previewEl.style.overflow='hidden';
    if(data&&data.type==='photo'&&data.dataUrl){
      const img=document.createElement('img');img.src=data.dataUrl;
      img.style.cssText='width:100%;height:100%;object-fit:cover;display:block;border-radius:50%';
      previewEl.appendChild(img);previewEl.style.background='transparent';previewEl.style.borderColor='rgba(255,255,255,0.25)';
    } else if(data&&data.type==='preset'){
      const preset=AVATAR_PRESETS.find(p=>p.id===data.presetId)||AVATAR_PRESETS[0];
      previewEl.textContent=ini;previewEl.style.background=preset.bg;previewEl.style.borderColor=preset.border;previewEl.style.color=preset.color;
    } else {
      previewEl.textContent=ini;previewEl.style.background='rgba(16,185,129,0.15)';previewEl.style.borderColor='rgba(16,185,129,0.3)';previewEl.style.color='#10b981';
    }
  }
  // Resaltar preset seleccionado
  if(data&&data.type==='preset'){
    document.querySelectorAll('.av-preset-btn').forEach(b=>b.classList.remove('selected'));
    const btn=document.querySelector(`.av-preset-btn[onclick="elegirPresetAvatar('${data.presetId}')"]`);
    if(btn)btn.classList.add('selected');
  } else {
    document.querySelectorAll('.av-preset-btn').forEach(b=>b.classList.remove('selected'));
  }
  if(data&&data.type!==null)showToast('✓ Avatar actualizado');
  // Cerrar modal después de pequeño delay para ver el cambio
  setTimeout(()=>closeModal('modal-avatar'),400);
}

// ============================================================
// PROYECTOS & AUDITORÍA
// ============================================================
let currentProyecto=null;       // proyecto abierto en detalle
let proyectoFotosPending=[];    // fotos pendientes en modal
let filtroProyectos='todos';

// ── CRUD IndexedDB ──────────────────────────────────────────
async function getAllProyectos(){return await dbGetAll('proyectos');}
async function saveProyecto(p){const id=await dbAdd('proyectos',p);return id;}
async function updateProyecto(p){await dbPut('proyectos',p);}
async function getProyecto(id){return await dbGet('proyectos',id);}

// ── Abrir / cerrar pantalla ──────────────────────────────────
function openProyectosScreen(){
  showScreen('proyectos-screen');
  const inp=document.getElementById('np-fecha-inicio');
  if(inp&&!inp.value) _mcSetValue('np-fecha-inicio','lbl-np-fecha-inicio',new Date());
  // Cargar desde Supabase primero (sync), luego render
  fetchProyectosFromSupabase().then(()=>renderProyectos()).catch(()=>renderProyectos());
}
function closeProyectosScreen(){
  const lv=document.getElementById('proy-list-view');
  const dv=document.getElementById('proy-detail-view');
  if(lv)lv.style.display='block';
  if(dv)dv.style.display='none';
  currentProyecto=null;
  showScreen('admin-screen');
}

// ── Cálculo de horas del proyecto ───────────────────────────
// Regla: horas = el empleado que más trabajó en ese rango de fechas
async function calcHorasProyecto(empleados,fechaInicio,fechaFin){
  const allRecs=await getAllRecords();
  // Convertir fechas al formato "M/D/YYYY" que usa la app
  function toFechaKey(dateStr){
    if(!dateStr)return null;
    const d=new Date(dateStr+'T12:00:00');
    return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear();
  }
  const fIni=toFechaKey(fechaInicio);
  const fFin=fechaFin?toFechaKey(fechaFin):null;
  let maxHoras=0;
  let maxEmp=null;
  for(const u of empleados){
    let recs=allRecs.filter(r=>r.usuario===u);
    // Filtrar por rango de fechas
    if(fIni||fFin){
      recs=recs.filter(r=>{
        if(!r.fecha)return false;
        const parts=r.fecha.split('/');
        if(parts.length!==3)return false;
        const d=new Date(parseInt(parts[2]),parseInt(parts[0])-1,parseInt(parts[1]));
        const iniD=fIni?new Date(fechaInicio+'T00:00:00'):null;
        const finD=fFin?new Date(fechaFin+'T23:59:59'):null;
        if(iniD&&d<iniD)return false;
        if(finD&&d>finD)return false;
        return true;
      });
    }
    // Calcular horas por días en ese rango
    const byDate={};
    recs.forEach(r=>{if(!byDate[r.fecha])byDate[r.fecha]=[];byDate[r.fecha].push(r);});
    let totalHrs=0;
    for(const fecha of Object.keys(byDate)){
      const dr=byDate[fecha].sort((a,b)=>(a.id||0)-(b.id||0));
      const ent=dr.find(r=>r.tipo==='Entrada');
      const sal=dr.find(r=>r.tipo==='Salida');
      if(ent&&sal){
        const lunchMins=calcActualLunchMins(dr);
        const mins=Math.max(0,calcMinsBetween(ent.hora,sal.hora)-lunchMins);
        totalHrs+=mins/60;
      } else if(ent){
        const ini=parseHora(ent.hora);
        const mins=ini?Math.max(0,(new Date()-ini)/60000):0;
        totalHrs+=Math.min(mins/60,24); // cap a 24h si no hay salida
      }
    }
    if(totalHrs>maxHoras){maxHoras=totalHrs;maxEmp=u;}
  }
  return {horas:maxHoras,empleado:maxEmp};
}

// ── Render lista de proyectos ────────────────────────────────
const PROY_COLORS=['#10b981','#3b82f6','#f97316','#a855f7','#ef4444','#14b8a6','#f59e0b','#6366f1'];
async function renderProyectos(){
  const grid=document.getElementById('proy-grid');
  if(!grid)return;
  let proyectos=await getAllProyectos();
  // Ordenar por fecha creación desc
  proyectos.sort((a,b)=>new Date(b.fechaCreacion||0)-new Date(a.fechaCreacion||0));
  // Filtro activo
  if(filtroProyectos!=='todos')proyectos=proyectos.filter(p=>p.estado===filtroProyectos);
  if(!proyectos.length){
    grid.innerHTML=`<div class="proy-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".3"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
      <div>Sin proyectos ${filtroProyectos==='todos'?'aún':'en este filtro'}</div>
      <div style="font-size:11px;color:var(--text4);margin-top:4px">${filtroProyectos==='todos'?'Toca + Nuevo para crear el primero':''}</div>
    </div>`;
    return;
  }
  grid.innerHTML=proyectos.map((p,i)=>{
    const color=PROY_COLORS[i%PROY_COLORS.length];
    const fotoCount=(p.fotos||[]).length;
    const empCount=(p.empleados||[]).length;
    const h=p.horasCache?parseFloat(p.horasCache).toFixed(1):'—';
    const estadoBadge=p.estado==='completado'
      ?`<span class="proy-badge done">Completado</span>`
      :`<span class="proy-badge active">Activo</span>`;
    const fechaStr=p.fechaInicio?formatFechaDisplay(p.fechaInicio):'—';
    return `<div class="proy-card" onclick="abrirDetalleProyecto(${p.id})">
      <div class="proy-card-color" style="background:${color}">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
      </div>
      <div class="proy-card-body">
        <div class="proy-card-name">${p.nombre}</div>
        <div class="proy-card-meta">${fechaStr} · ${empCount} emp.</div>
        <div class="proy-card-footer">
          ${estadoBadge}
          <span class="proy-card-hrs">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            ${h}h
          </span>
          <span class="proy-card-fotos">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            ${fotoCount}
          </span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function formatFechaDisplay(dateStr){
  if(!dateStr)return '—';
  try{
    const d=new Date(dateStr+'T12:00:00');
    return d.toLocaleDateString('es-US',{month:'short',day:'numeric',year:'numeric'});
  }catch(e){return dateStr;}
}

function filtrarProyectos(f){
  filtroProyectos=f;
  document.querySelectorAll('.proy-filter-btn').forEach(b=>b.classList.remove('active'));
  const btn=document.getElementById('pfbtn-'+f);
  if(btn)btn.classList.add('active');
  renderProyectos();
}

// ── Crear nuevo proyecto ─────────────────────────────────────
function prepNuevoProyectoModal(){
  const empList=document.getElementById('np-emp-list');
  if(!empList)return;
  const empKeys=Object.keys(employees).filter(u=>u!==ADMIN_USER);
  empList.innerHTML=empKeys.length?empKeys.map(u=>`
    <label class="proy-emp-check">
      <input type="checkbox" value="${u}" checked/>
      <span class="proy-emp-av">${u.substring(0,2).toUpperCase()}</span>
      <span>${u.charAt(0).toUpperCase()+u.slice(1)}</span>
      ${employees[u]?.isAsistente?'<span class="asi-badge" style="font-size:9px">ASI</span>':''}
    </label>`).join('')
    :'<div style="color:var(--text4);font-size:12px">No hay empleados registrados</div>';
}

async function crearNuevoProyecto(){
  const nombre=(document.getElementById('np-nombre')?.value||'').trim();
  if(!nombre){showToast('⚠ Escribe el nombre del proyecto');document.getElementById('np-nombre')?.focus();return;}
  const fechaInicio=document.getElementById('np-fecha-inicio')?.value||new Date().toISOString().slice(0,10);
  const notas=(document.getElementById('np-notas')?.value||'').trim();
  const empChecks=document.querySelectorAll('#np-emp-list input[type=checkbox]:checked');
  const empleados=[...empChecks].map(cb=>cb.value);
  showLoader('Creando proyecto...');
  const p={
    nombre,empleados,fechaInicio,fechaFin:null,
    estado:'activo',notas,fotos:[],
    fechaCreacion:new Date().toISOString(),
    horasCache:'0'
  };
  const id=await saveProyecto(p);
  p.id=id;
  const {horas}=await calcHorasProyecto(empleados,fechaInicio,null);
  p.horasCache=horas.toFixed(2);
  // Sync a Supabase
  if(supabaseAvailable){
    const sbId=await syncProyectoToSupabase(p);
    if(sbId)p.supabaseId=sbId;
  }
  await updateProyecto(p);
  hideLoader();
  closeModal('modal-nuevo-proyecto');
  document.getElementById('np-nombre').value='';
  document.getElementById('np-notas').value='';
  showToast('✓ Proyecto "'+nombre+'" creado');
  renderProyectos();
}

// ── Abrir detalle de proyecto ────────────────────────────────
async function abrirDetalleProyecto(id){
  const p=await getProyecto(id);
  if(!p)return;
  currentProyecto=p;
  // Actualizar horas en tiempo real
  const {horas,empleado}=await calcHorasProyecto(p.empleados||[],p.fechaInicio,p.fechaFin);
  if(Math.abs(horas-(parseFloat(p.horasCache)||0))>0.05){
    await updateProyecto({...p,horasCache:horas.toFixed(2)});
    currentProyecto={...p,horasCache:horas.toFixed(2)};
  }
  // Ocultar lista, mostrar detalle
  document.getElementById('proy-list-view').style.display='none';
  const dv=document.getElementById('proy-detail-view');
  dv.style.display='block';
  renderProyectoDetalle(currentProyecto,horas,empleado);
}

function renderProyectoDetalle(p,horas,maxEmp){
  const color=PROY_COLORS[Math.abs(p.nombre.charCodeAt(0))%PROY_COLORS.length];
  const estadoBadge=p.estado==='completado'
    ?`<span class="proy-badge done">Completado</span>`
    :`<span class="proy-badge active">Activo</span>`;
  const empCount=(p.empleados||[]).length;
  const fotoCount=(p.fotos||[]).length;
  const hStr=horas.toFixed(1);
  const fecIni=formatFechaDisplay(p.fechaInicio);
  const fecFin=p.fechaFin?formatFechaDisplay(p.fechaFin):'En curso';
  // Header del detalle
  document.getElementById('proy-detail-header').innerHTML=`
    <div class="pd-topbar">
      <button class="proy-back-btn" onclick="volverListaProyectos()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <div class="pd-title">${p.nombre}</div>
      <button class="proy-new-btn" onclick="exportarProyectoPDF(${p.id})" style="background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.3);color:#ef4444">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        PDF
      </button>
    </div>
    <div class="pd-info-bar">
      <div class="pd-info-chip">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        ${fecIni} → ${fecFin}
      </div>
      <div class="pd-info-chip">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        ${empCount} emp.
      </div>
      <div class="pd-info-chip" style="color:#10b981;border-color:rgba(16,185,129,.3)">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        ${hStr}h totales
      </div>
      ${estadoBadge}
    </div>`;
  // Body del detalle
  const empRows=(p.empleados||[]).map(u=>{
    const nombre=u.charAt(0).toUpperCase()+u.slice(1);
    return `<div class="pd-emp-row">
      <span class="proy-emp-av" style="width:28px;height:28px;font-size:10px">${u.substring(0,2).toUpperCase()}</span>
      <span style="flex:1;font-size:13px">${nombre}</span>
      ${u===maxEmp?'<span class="proy-badge done" style="font-size:9px">Max horas</span>':''}
    </div>`;
  }).join('');
  const thumbsHtml=(p.fotos||[]).length
    ?[...p.fotos].reverse().map((f,i)=>`
      <div class="pd-foto-item">
        <img src="${f.dataUrl}" class="pd-foto-thumb" onclick="verFotoGrande('${f.dataUrl}')"/>
        <div class="pd-foto-meta">${f.hora||''} · ${f.nota||''}</div>
      </div>`).join('')
    :`<div class="proy-empty" style="padding:20px 0"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".3"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg><div style="color:var(--text4);font-size:12px">Sin fotos aún</div></div>`;
  document.getElementById('proy-detail-body').innerHTML=`
    ${p.notas?`<div class="pd-notas">💬 ${p.notas}</div>`:''}
    <div class="pd-section-title" style="display:flex;align-items:center;justify-content:space-between">
      Empleados asignados
      <button class="proy-new-btn" style="padding:4px 10px;font-size:11px" onclick="abrirModalAgregarEmpProyecto()">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar
      </button>
    </div>
    <div class="pd-emp-list">${empRows}</div>
    <div class="pd-section-title" style="margin-top:14px">
      Fotos del proyecto
      <button class="proy-new-btn" style="margin-left:auto" onclick="abrirModalFotoProyecto()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar
      </button>
    </div>
    <div class="pd-fotos-grid">${thumbsHtml}</div>
    <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
      ${p.estado==='activo'
        ?`<button class="modal-btn-gray" style="flex:1;min-width:120px" onclick="cerrarProyecto(${p.id})">✓ Marcar completado</button>`
        :`<button class="modal-btn-gray" style="flex:1;min-width:120px" onclick="reabrirProyecto(${p.id})">↩ Reabrir proyecto</button>`}
      <button class="modal-btn-gray" style="flex:1;min-width:120px;color:#ef4444;border-color:rgba(239,68,68,.3)" onclick="confirmarEliminarProyecto(${p.id})">Eliminar</button>
    </div>`;
}

function volverListaProyectos(){
  document.getElementById('proy-list-view').style.display='block';
  document.getElementById('proy-detail-view').style.display='none';
  currentProyecto=null;
  renderProyectos();
}

async function cerrarProyecto(id){
  const p=await getProyecto(id);if(!p)return;
  const hoy=new Date().toISOString().slice(0,10);
  const updated={...p,estado:'completado',fechaFin:hoy};
  await updateProyecto(updated);
  if(supabaseAvailable&&p.supabaseId)await syncProyectoToSupabase(updated);
  currentProyecto=updated;
  const {horas,empleado}=await calcHorasProyecto(p.empleados||[],p.fechaInicio,hoy);
  const withHoras={...updated,horasCache:horas.toFixed(2)};
  await updateProyecto(withHoras);
  if(supabaseAvailable&&p.supabaseId)await syncProyectoToSupabase(withHoras);
  currentProyecto=withHoras;
  renderProyectoDetalle(currentProyecto,horas,empleado);
  showToast('✓ Proyecto marcado como completado');
}

async function reabrirProyecto(id){
  const p=await getProyecto(id);if(!p)return;
  const updated={...p,estado:'activo',fechaFin:null};
  await updateProyecto(updated);
  if(supabaseAvailable&&p.supabaseId)await syncProyectoToSupabase(updated);
  currentProyecto=updated;
  const {horas,empleado}=await calcHorasProyecto(p.empleados||[],p.fechaInicio,null);
  renderProyectoDetalle(currentProyecto,horas,empleado);
  showToast('✓ Proyecto reactivado');
}

// ── Agregar empleados a proyecto existente ──────────────────
function abrirModalAgregarEmpProyecto(){
  if(!currentProyecto)return;
  const ya=new Set(currentProyecto.empleados||[]);
  const empKeys=Object.keys(employees).filter(u=>u!==ADMIN_USER);
  const list=document.getElementById('add-emp-proy-list');
  if(!list)return;
  if(!empKeys.length){list.innerHTML='<div style="color:var(--text4);font-size:12px">No hay empleados registrados</div>';openModal('modal-add-emp-proyecto');return;}
  list.innerHTML=empKeys.map(u=>{
    const checked=ya.has(u)?'checked':'';
    return`<label class="proy-emp-check">
      <input type="checkbox" value="${u}" ${checked}/>
      <span class="proy-emp-av">${u.substring(0,2).toUpperCase()}</span>
      <span>${u.charAt(0).toUpperCase()+u.slice(1)}</span>
      ${employees[u]?.isAsistente?'<span class="asi-badge" style="font-size:9px">ASI</span>':''}
    </label>`;
  }).join('');
  openModal('modal-add-emp-proyecto');
}
async function guardarEmpProyecto(){
  if(!currentProyecto)return;
  const checks=document.querySelectorAll('#add-emp-proy-list input[type=checkbox]:checked');
  const nuevosEmps=[...checks].map(cb=>cb.value);
  const updated={...currentProyecto,empleados:nuevosEmps};
  await updateProyecto(updated);
  if(supabaseAvailable&&currentProyecto.supabaseId)await syncProyectoToSupabase(updated);
  currentProyecto=updated;
  closeModal('modal-add-emp-proyecto');
  const {horas,empleado}=await calcHorasProyecto(nuevosEmps,updated.fechaInicio,updated.fechaFin);
  renderProyectoDetalle({...updated,horasCache:horas.toFixed(2)},horas,empleado);
  showToast('✓ Empleados del proyecto actualizados');
}

async function confirmarEliminarProyecto(id){
  if(!confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.'))return;
  const p=await getProyecto(id);
  if(p?.supabaseId&&supabaseAvailable){
    await sbCall('/rest/v1/proyectos?id=eq.'+p.supabaseId,{method:'DELETE'});
  }
  await dbDelete('proyectos',id);
  showToast('Proyecto eliminado');
  volverListaProyectos();
}

// ── Fotos del proyecto ──────────────────────────────────────
function abrirModalFotoProyecto(){
  proyectoFotosPending=[];
  resetFotoProyectoModal();
  openModal('modal-foto-proyecto');
}

function resetFotoProyectoModal(){
  proyectoFotosPending=[];
  const prev=document.getElementById('fp-preview');
  if(prev)prev.style.display='none';
  const thumbs=document.getElementById('fp-thumbs');
  if(thumbs)thumbs.innerHTML='';
  const inp=document.getElementById('fp-nota');
  if(inp)inp.value='';
  const cnt=document.getElementById('fp-count');
  if(cnt)cnt.textContent='0';
  const btn=document.getElementById('fp-upload-btn');
  if(btn)btn.disabled=true;
}

function abrirCamaraFotoProyecto(){
  const inp=document.getElementById('fp-file-input');
  if(inp){inp.removeAttribute('multiple');inp.setAttribute('capture','environment');inp.click();}
}
function abrirArchivoFotoProyecto(){
  const inp=document.getElementById('fp-file-input');
  if(inp){inp.setAttribute('multiple','');inp.removeAttribute('capture');inp.click();}
}

function procesarFotoProyectoInput(inputEl){
  const files=inputEl.files;if(!files||!files.length)return;
  const thumbs=document.getElementById('fp-thumbs');
  const prev=document.getElementById('fp-preview');
  const cnt=document.getElementById('fp-count');
  const btn=document.getElementById('fp-upload-btn');
  Array.from(files).forEach(file=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const dataUrl=e.target.result;
      proyectoFotosPending.push({dataUrl,hora:new Date().toLocaleTimeString('es-US'),fecha:getTodayKey()});
      if(thumbs){
        const div=document.createElement('div');div.className='asi-thumb-item';
        div.innerHTML=`<img src="${dataUrl}" class="asi-thumb-img" onclick="verFotoGrande('${dataUrl}')"/>`;
        thumbs.appendChild(div);
      }
      if(cnt)cnt.textContent=proyectoFotosPending.length;
      if(prev)prev.style.display='block';
      if(btn)btn.disabled=false;
    };
    reader.readAsDataURL(file);
  });
  inputEl.value='';
}

async function confirmarFotosProyecto(){
  if(!currentProyecto||!proyectoFotosPending.length)return;
  const nota=(document.getElementById('fp-nota')?.value||'').trim();
  const p=await getProyecto(currentProyecto.id);
  if(!p)return;
  const hora=new Date().toLocaleTimeString('es-US');
  const fecha=getTodayKey();
  const nuevasFotos=proyectoFotosPending.map(f=>({...f,nota,usuario:currentUser}));
  const updated={...p,fotos:[...(p.fotos||[]),...nuevasFotos]};
  await updateProyecto(updated);
  currentProyecto=updated;
  // Sync fotos a Supabase
  if(supabaseAvailable&&p.supabaseId){
    for(const f of nuevasFotos){
      await syncFotoToSupabase(p.supabaseId,f.dataUrl,nota,currentUser,hora,fecha);
    }
  }
  closeModal('modal-foto-proyecto');
  resetFotoProyectoModal();
  const {horas,empleado}=await calcHorasProyecto(p.empleados||[],p.fechaInicio,p.fechaFin);
  renderProyectoDetalle(currentProyecto,horas,empleado);
  showToast('✓ '+nuevasFotos.length+' foto'+(nuevasFotos.length!==1?'s':'')+' agregada'+(nuevasFotos.length!==1?'s':'')+' al proyecto');
}

// ── Exportar PDF del proyecto ────────────────────────────────
async function exportarProyectoPDF(id){
  if(typeof window.jspdf==='undefined'&&typeof jsPDF==='undefined'){
    showToast('⚠ jsPDF no cargado — verifica conexión');return;
  }
  const p=await getProyecto(id);if(!p)return;
  showLoader('Generando PDF...');
  const {jsPDF}=window.jspdf||{jsPDF:window.jsPDF};
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'letter'});
  const genDate=new Date().toLocaleDateString('es-US',{year:'numeric',month:'long',day:'numeric'});
  const {horas,empleado}=await calcHorasProyecto(p.empleados||[],p.fechaInicio,p.fechaFin);

  // ── HEADER ────────────────────────────────────────────────
  doc.setFillColor(8,13,26);
  doc.rect(0,0,216,30,'F');
  doc.setFillColor(16,185,129);
  doc.roundedRect(8,6,18,18,2,2,'F');
  doc.setTextColor(8,13,26);
  doc.setFont('helvetica','bold');
  doc.setFontSize(8);
  doc.text('PR',17,18,{align:'center'});
  doc.setTextColor(255,255,255);
  doc.setFontSize(15);
  doc.setFont('helvetica','bold');
  doc.text('LNI Custom Manufacturing Inc.',32,13);
  doc.setFontSize(8);
  doc.setFont('helvetica','normal');
  doc.text('Reporte de Proyecto  |  SecureCheck Pro v3.0  |  Generado: '+genDate,32,19);
  doc.setFontSize(7);
  doc.setTextColor(16,185,129);
  doc.text('AUDITORÍA DE PROYECTO',32,25);

  // ── NOMBRE PROYECTO ───────────────────────────────────────
  doc.setTextColor(30,30,30);
  doc.setFontSize(16);
  doc.setFont('helvetica','bold');
  doc.text(p.nombre.toUpperCase(),108,42,{align:'center'});
  doc.setDrawColor(16,185,129);
  doc.setLineWidth(0.8);
  doc.line(14,45,202,45);

  // ── INFO CHIPS ────────────────────────────────────────────
  let y=52;
  const fecIni=formatFechaDisplay(p.fechaInicio);
  const fecFin=p.fechaFin?formatFechaDisplay(p.fechaFin):'En curso';
  const estadoStr=p.estado==='completado'?'COMPLETADO':'ACTIVO';
  doc.setFontSize(9);
  doc.setFont('helvetica','normal');
  doc.setTextColor(80,80,80);
  doc.text('Estado: '+estadoStr+'    |    Período: '+fecIni+' → '+fecFin+'    |    Horas totales: '+horas.toFixed(1)+'h',108,y,{align:'center'});
  if(p.notas){y+=6;doc.setTextColor(100,100,100);doc.text('Notas: '+p.notas,14,y);}

  // ── TABLA DE EMPLEADOS ────────────────────────────────────
  y+=10;
  doc.setFontSize(10);
  doc.setFont('helvetica','bold');
  doc.setTextColor(16,185,129);
  doc.text('EMPLEADOS DEL PROYECTO',14,y);
  y+=2;
  const empRows=await Promise.all((p.empleados||[]).map(async u=>{
    const allRecs=await getAllRecords();
    const recs=allRecs.filter(r=>r.usuario===u);
    let hrs=0;
    const byDate={};
    recs.forEach(r=>{if(!byDate[r.fecha])byDate[r.fecha]=[];byDate[r.fecha].push(r);});
    for(const fecha of Object.keys(byDate)){
      const dr=byDate[fecha].sort((a,b)=>(a.id||0)-(b.id||0));
      const ent=dr.find(r=>r.tipo==='Entrada');const sal=dr.find(r=>r.tipo==='Salida');
      if(ent&&sal){const lm=calcActualLunchMins(dr);hrs+=Math.max(0,calcMinsBetween(ent.hora,sal.hora)-lm)/60;}
    }
    return [u.charAt(0).toUpperCase()+u.slice(1),hrs.toFixed(1)+'h',u===empleado?'★ Max horas':''];
  }));
  doc.autoTable({
    startY:y+2,
    head:[['Empleado','Horas trabajadas','']],
    body:empRows,
    headStyles:{fillColor:[16,185,129],textColor:255,fontStyle:'bold',fontSize:9},
    bodyStyles:{fontSize:9,textColor:50},
    alternateRowStyles:{fillColor:[245,255,250]},
    columnStyles:{0:{fontStyle:'bold'},2:{textColor:[16,185,129]}},
    margin:{left:14,right:14},styles:{cellPadding:3}
  });
  y=doc.lastAutoTable.finalY+10;

  // ── FOTOS ──────────────────────────────────────────────────
  const fotos=p.fotos||[];
  if(fotos.length){
    doc.setFontSize(10);doc.setFont('helvetica','bold');doc.setTextColor(16,185,129);
    doc.text('FOTOS DEL PROYECTO ('+fotos.length+')',14,y);
    y+=4;
    const W=55,H=42,GAP=4,PERROW=3;
    let col=0;
    for(const f of fotos){
      if(y+H>270){doc.addPage();y=14;}
      const x=14+col*(W+GAP);
      try{
        doc.addImage(f.dataUrl,'JPEG',x,y,W,H);
        doc.setDrawColor(200,200,200);doc.setLineWidth(0.2);
        doc.roundedRect(x,y,W,H,1,1,'S');
        if(f.nota||f.hora){
          doc.setFontSize(6);doc.setFont('helvetica','normal');doc.setTextColor(120,120,120);
          doc.text((f.hora||'')+(f.nota?' · '+f.nota:''),x+1,y+H+3);
        }
      }catch(e){}
      col++;
      if(col>=PERROW){col=0;y+=H+8;}
    }
    if(col>0)y+=H+8;
  }

  // ── FOOTER ─────────────────────────────────────────────────
  if(y>255)doc.addPage();
  doc.setDrawColor(200,200,200);doc.setLineWidth(0.2);doc.line(14,270,202,270);
  doc.setFontSize(7);doc.setFont('helvetica','normal');doc.setTextColor(150,150,150);
  doc.text('SecureCheck Pro v3.0  |  LNI Custom Manufacturing  |  Registros con firma digital SHA-256',108,275,{align:'center'});

  hideLoader();
  const filename='Proyecto_'+p.nombre.replace(/[^a-z0-9]/gi,'_')+'_'+new Date().toISOString().slice(0,10)+'.pdf';
  doc.save(filename);
  showToast('✓ PDF exportado');
}

// ── Preparar modal nuevo proyecto al abrirlo ─────────────────
document.addEventListener('DOMContentLoaded',()=>{
  const modal=document.getElementById('modal-nuevo-proyecto');
  if(modal){
    const observer=new MutationObserver(()=>{
      if(modal.classList.contains('open'))prepNuevoProyectoModal();
    });
    observer.observe(modal,{attributes:true,attributeFilter:['class']});
  }
  // Inyectar pantalla Mi Pago al cargar el DOM
  injectPagoScreen();
});

init();

// ============================================================
// MI PAGO — Portal de pago estilo ADP para empleados
// ============================================================

// ── Inyectar pantalla en el DOM ──────────────────────────────
function injectPagoScreen(){
  if(document.getElementById('pago-screen')) return;
  const el=document.createElement('div');
  el.id='pago-screen';
  el.className='screen';
  // NOTA: NO se establece `display:none` aquí porque el inline tendría mayor especificidad
  // que `.screen.active{display:flex}` en CSS y la pantalla nunca se mostraría (bug pantalla negra).
  // Ancho/posición fija porque `body{display:flex}` puede achicar la pantalla a medio viewport.
  el.style.cssText='background:#0f172a;position:fixed;inset:0;width:100vw;height:100vh;min-height:100vh;flex-direction:column;z-index:50;';
  el.innerHTML=`
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:16px 16px 12px;border-bottom:1px solid rgba(16,185,129,0.15);display:flex;align-items:center;gap:12px;flex-shrink:0">
    <button onclick="closePagoScreen()" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    </button>
    <div style="flex:1">
      <div style="color:#fff;font-size:16px;font-weight:700;letter-spacing:-0.3px">Mi Pago</div>
      <div style="color:var(--text4);font-size:11px;font-family:var(--mono)" id="pago-sub-lbl">Cargando...</div>
    </div>
    <div id="pago-rate-badge" style="display:none;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:4px 10px;text-align:right">
      <div style="color:var(--text4);font-size:9px;text-transform:uppercase;letter-spacing:0.8px">Tarifa/hr</div>
      <div style="color:var(--green);font-size:13px;font-weight:700;font-family:var(--mono)" id="pago-rate-val">—</div>
    </div>
  </div>

  <!-- Content -->
  <div style="flex:1;overflow-y:auto;padding:16px 16px 32px">
    <!-- Skeleton / loader -->
    <div id="pago-loader" style="text-align:center;padding:60px 0;color:var(--text4);font-size:13px">
      <svg style="display:block;margin:0 auto 12px;animation:spin 1s linear infinite" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
      Cargando comprobantes...
    </div>
    <!-- Empty state -->
    <div id="pago-empty" style="display:none;text-align:center;padding:60px 16px;color:var(--text4)">
      <svg style="display:block;margin:0 auto 14px;opacity:.4" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      <div style="font-size:14px;font-weight:600;color:var(--text3);margin-bottom:6px">Sin comprobantes aún</div>
      <div style="font-size:12px;line-height:1.6">Cuando el administrador emita tu pago aparecerá aquí con el desglose completo.</div>
    </div>
    <!-- Error state -->
    <div id="pago-error" style="display:none;text-align:center;padding:40px 16px;color:var(--orange)">
      <svg style="display:block;margin:0 auto 12px;opacity:.6" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <div id="pago-error-msg" style="font-size:13px;font-weight:600">Sin conexión — inténtalo de nuevo</div>
      <button onclick="renderMisPagos()" style="margin-top:14px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.3);border-radius:10px;color:var(--orange);font-size:13px;font-weight:600;padding:10px 20px;cursor:pointer">Reintentar</button>
    </div>
    <!-- List container -->
    <div id="pago-list"></div>
  </div>`;
  document.body.appendChild(el);

  // Añadir @keyframes spin si no existe
  if(!document.getElementById('pago-spin-style')){
    const st=document.createElement('style');
    st.id='pago-spin-style';
    st.textContent=`
    @keyframes spin{to{transform:rotate(360deg)}}
    .pago-card{background:rgba(30,41,59,0.7);border:1px solid rgba(255,255,255,0.08);border-radius:16px;margin-bottom:16px;overflow:hidden;transition:box-shadow .2s}
    .pago-card.pending-confirm{border-color:rgba(249,115,22,0.35);box-shadow:0 0 0 1px rgba(249,115,22,0.15)}
    .pago-card-header{padding:14px 16px 10px;display:flex;align-items:flex-start;gap:12px}
    .pago-period{flex:1}
    .pago-period-lbl{color:var(--text4);font-size:10px;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px}
    .pago-period-val{color:#fff;font-size:14px;font-weight:700}
    .pago-badge{border-radius:8px;padding:4px 10px;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;flex-shrink:0}
    .pago-badge.paid{background:rgba(249,115,22,0.12);color:var(--orange);border:1px solid rgba(249,115,22,0.25)}
    .pago-badge.confirmed{background:rgba(16,185,129,0.1);color:var(--green);border:1px solid rgba(16,185,129,0.2)}
    .pago-divider{height:1px;background:rgba(255,255,255,0.06);margin:0 16px}
    .pago-breakdown{padding:14px 16px}
    .pago-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)}
    .pago-row:last-child{border-bottom:none}
    .pago-row-lbl{color:var(--text3);font-size:12px}
    .pago-row-val{color:var(--text2);font-size:12px;font-family:var(--mono);font-weight:500}
    .pago-total-row{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(16,185,129,0.05);border-top:1px solid rgba(16,185,129,0.15)}
    .pago-total-lbl{color:var(--text2);font-size:13px;font-weight:600}
    .pago-total-amt{color:var(--green);font-size:20px;font-weight:800;font-family:var(--mono)}
    .pago-confirm-btn{width:calc(100% - 32px);margin:12px 16px 16px;padding:14px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:12px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:0.3px;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s}
    .pago-confirm-btn:active{opacity:.8}
    .pago-confirmed-info{padding:10px 16px 14px;text-align:center;color:var(--text4);font-size:11px;display:flex;align-items:center;justify-content:center;gap:6px}
    .pago-nota{margin:0 16px 12px;padding:10px 12px;background:rgba(59,130,246,0.07);border:1px solid rgba(59,130,246,0.15);border-radius:10px;color:var(--text3);font-size:12px;line-height:1.5}
    `;
    document.head.appendChild(st);
  }
}

// ── Navegación ───────────────────────────────────────────────
function openPagoScreen(){
  closeDrawer();
  showScreen('pago-screen');
  renderMisPagos();
}
function closePagoScreen(){
  showScreen('main-screen');
}

// ── Cargar y renderizar comprobantes ─────────────────────────
async function renderMisPagos(){
  if(!currentUser||isAdmin) return;

  // Mostrar loader
  const loaderEl=document.getElementById('pago-loader');
  const listEl=document.getElementById('pago-list');
  const emptyEl=document.getElementById('pago-empty');
  const errEl=document.getElementById('pago-error');
  const subLbl=document.getElementById('pago-sub-lbl');
  const rateBadge=document.getElementById('pago-rate-badge');
  const rateVal=document.getElementById('pago-rate-val');

  if(loaderEl)loaderEl.style.display='block';
  if(listEl)listEl.innerHTML='';
  if(emptyEl)emptyEl.style.display='none';
  if(errEl)errEl.style.display='none';

  try{
    // Obtener tarifa del empleado desde employees_bi
    let hourlyRate=0;
    try{
      const empRes=await fetch(`${SUPABASE_URL}/rest/v1/employees_bi?usuario=eq.${encodeURIComponent(currentUser)}&select=hourly_rate`,{
        headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY}
      });
      if(empRes.ok){
        const empData=await empRes.json();
        if(empData&&empData[0]&&empData[0].hourly_rate!=null){
          hourlyRate=parseFloat(empData[0].hourly_rate)||0;
        }
      }
    }catch(e){}

    if(rateBadge&&rateVal){
      if(hourlyRate>0){
        rateVal.textContent='$'+hourlyRate.toFixed(2);
        rateBadge.style.display='block';
      } else {
        rateBadge.style.display='none';
      }
    }

    // Obtener pagos del empleado
    const res=await fetch(`${SUPABASE_URL}/rest/v1/payments?usuario=eq.${encodeURIComponent(currentUser)}&order=period_start.desc&limit=20`,{
      headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY}
    });

    if(!res.ok) throw new Error('HTTP '+res.status);
    const pagos=await res.json();

    if(loaderEl)loaderEl.style.display='none';

    if(!Array.isArray(pagos)||!pagos.length){
      if(emptyEl)emptyEl.style.display='block';
      if(subLbl)subLbl.textContent='Sin comprobantes';
      return;
    }

    // Estadísticas rápidas
    const totalPagado=pagos.filter(p=>p.status==='confirmed').reduce((s,p)=>s+parseFloat(p.total_amount||0),0);
    const pendientes=pagos.filter(p=>p.status==='paid').length;
    if(subLbl){
      const parts=[];
      if(pendientes>0)parts.push(pendientes+' por confirmar');
      if(totalPagado>0)parts.push('$'+totalPagado.toFixed(2)+' cobrado total');
      subLbl.textContent=parts.join(' · ')||pagos.length+' comprobante(s)';
    }

    // Renderizar tarjetas
    listEl.innerHTML=pagos.map(p=>buildPagoCard(p,hourlyRate)).join('');

  }catch(e){
    if(loaderEl)loaderEl.style.display='none';
    if(errEl){
      document.getElementById('pago-error-msg').textContent='Error: '+(e.message||'Sin conexión');
      errEl.style.display='block';
    }
    console.warn('renderMisPagos error:',e);
  }
}

// ── Construir tarjeta de comprobante ─────────────────────────
function buildPagoCard(p, empRate){
  const isPending=p.status==='paid';
  const isConfirmed=p.status==='confirmed';
  const hourlyRate=parseFloat(p.hourly_rate)||empRate||0;
  const hBruto=parseFloat(p.hours_bruto)||0;
  const hLunch=parseFloat(p.hours_lunch)||0;
  const hNeto=parseFloat(p.hours_neto)||0;
  const total=parseFloat(p.total_amount)||0;

  // Formatear período
  const fmtDate=iso=>{
    if(!iso)return '—';
    const d=new Date(iso+'T12:00:00');
    const m=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return m[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();
  };
  const periodStr=fmtDate(p.period_start)+' – '+fmtDate(p.period_end);

  // Formato horas
  const fmtH=h=>{const hh=Math.floor(h),mm=Math.round((h-hh)*60);return hh+'h'+(mm>0?' '+mm+'m':'');};

  // Badge
  const badgeHtml=isPending
    ?`<span class="pago-badge paid">⏳ Por confirmar</span>`
    :`<span class="pago-badge confirmed">✓ Confirmado</span>`;

  // Nota del admin
  const notaHtml=p.nota_admin
    ?`<div class="pago-nota">📝 ${escHtml(p.nota_admin)}</div>`:'';

  // Botón / info de confirmación
  const actionHtml=isPending
    ?`<button class="pago-confirm-btn" onclick="confirmarPagoEmployee(${p.id})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
        Confirmar recibo de pago
      </button>`
    :`<div class="pago-confirmed-info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
        Confirmado ${p.confirmado_at?'el '+fmtDate(p.confirmado_at.slice(0,10)):''}${p.confirm_device?' · '+escHtml(p.confirm_device):''}
      </div>`;

  return`<div class="pago-card${isPending?' pending-confirm':''}">
    <div class="pago-card-header">
      <div class="pago-period">
        <div class="pago-period-lbl">Período de pago</div>
        <div class="pago-period-val">${periodStr}</div>
        ${p.emitido_por?`<div style="color:var(--text4);font-size:10px;margin-top:3px">Emitido por: ${escHtml(p.emitido_por)}${p.emitido_at?' · '+fmtDate(p.emitido_at.slice(0,10)):''}</div>`:''}
      </div>
      ${badgeHtml}
    </div>
    <div class="pago-divider"></div>
    <div class="pago-breakdown">
      <div class="pago-row"><span class="pago-row-lbl">Horas brutas</span><span class="pago-row-val">${fmtH(hBruto)}</span></div>
      <div class="pago-row"><span class="pago-row-lbl">— Lunch (descontado)</span><span class="pago-row-val">${fmtH(hLunch)}</span></div>
      <div class="pago-row"><span class="pago-row-lbl">Horas pagables</span><span class="pago-row-val" style="color:#fff;font-weight:700">${fmtH(hNeto)}</span></div>
      ${hourlyRate>0?`<div class="pago-row"><span class="pago-row-lbl">Tarifa por hora</span><span class="pago-row-val">$${hourlyRate.toFixed(2)}/hr</span></div>`:''}
    </div>
    <div class="pago-total-row">
      <span class="pago-total-lbl">Total a cobrar</span>
      <span class="pago-total-amt">$${total.toFixed(2)}</span>
    </div>
    ${notaHtml}
    ${actionHtml}
  </div>`;
}

// ── Confirmar recibo de pago ─────────────────────────────────
async function confirmarPagoEmployee(paymentId){
  if(!currentUser||isAdmin) return;
  if(!confirm('¿Confirmas que recibiste este pago? Esta acción no se puede deshacer.')) return;

  showLoader('Confirmando pago...');
  try{
    // Obtener dispositivo y coords
    const device=currentDeviceModel||'Desconocido';
    let coords='sin_gps';
    if(userCoords&&userCoords.lat)coords=userCoords.lat.toFixed(6)+','+userCoords.lng.toFixed(6);

    const res=await fetch(`${SUPABASE_URL}/rest/v1/rpc/confirmar_pago`,{
      method:'POST',
      headers:{
        'apikey':SUPABASE_ANON_KEY,
        'Authorization':'Bearer '+SUPABASE_ANON_KEY,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({p_payment_id:paymentId,p_usuario:currentUser,p_device:device,p_coords:coords})
    });

    hideLoader();
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data=await res.json();

    if(data===true||data===1){
      showToast('✓ Pago confirmado — gracias');
      await renderMisPagos(); // refrescar lista
    } else {
      showToast('⚠ No se pudo confirmar — intenta de nuevo');
    }
  }catch(e){
    hideLoader();
    showToast('❌ Error al confirmar: '+(e.message||'Sin conexión'));
    console.error('confirmarPagoEmployee error:',e);
  }
}

// ── Helper: escapar HTML ─────────────────────────────────────
function escHtml(str){
  if(!str)return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Añadir botón "Mi Pago" al drawer cuando es empleado ──────
function injectPagoDrawerButton(){
  // Solo para empleados regulares (no admin)
  if(isAdmin) return;
  if(document.getElementById('drawer-pago-btn')) return; // ya inyectado

  // Buscar el botón de historial en el drawer para insertar después
  const histBtn=document.querySelector('#drawer [onclick*="historial"], #drawer [onclick*="openDrawerTab"]');
  const drawerEl=document.getElementById('drawer');
  if(!drawerEl) return;

  // Buscar un buen lugar de inserción — después del botón de "Mi Registro"
  const allBtns=drawerEl.querySelectorAll('button, [role="button"], .drawer-item, a');
  let insertAfter=null;
  allBtns.forEach(btn=>{
    const txt=(btn.textContent||'').toLowerCase();
    if(txt.includes('registro')||txt.includes('historial')||txt.includes('semana'))insertAfter=btn;
  });

  const pagoBtn=document.createElement('button');
  pagoBtn.id='drawer-pago-btn';
  pagoBtn.setAttribute('onclick','openPagoScreen()');
  pagoBtn.style.cssText='width:100%;background:none;border:none;padding:12px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-top:1px solid rgba(255,255,255,0.05)';
  pagoBtn.innerHTML=`
    <div style="width:36px;height:36px;border-radius:10px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    </div>
    <div style="text-align:left">
      <div style="color:#fff;font-size:13px;font-weight:600">Mi Pago</div>
      <div style="color:var(--text4);font-size:11px">Ver comprobantes y confirmar</div>
    </div>
    <div id="pago-badge-count" style="display:none;background:var(--orange);color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-left:auto"></div>`;

  if(insertAfter&&insertAfter.parentNode){
    insertAfter.parentNode.insertBefore(pagoBtn,insertAfter.nextSibling);
  } else if(drawerEl){
    // Fallback: insertar al final del drawer
    drawerEl.appendChild(pagoBtn);
  }
}

// ── Llamar injectPagoDrawerButton cuando el usuario inicia sesión ──
// Hook into the existing post-login flow via a MutationObserver on the drawer
(function(){
  function tryInject(){
    if(currentUser&&!isAdmin){
      injectPagoDrawerButton();
      checkPagosNotification();
    }
  }
  // Escuchar cambio de pantalla — cuando main-screen se activa, inyectar
  const observer=new MutationObserver(()=>{
    const ms=document.getElementById('main-screen');
    if(ms&&ms.classList.contains('active')&&currentUser&&!isAdmin){
      injectPagoDrawerButton();
      checkPagosNotification();
      observer.disconnect();
    }
  });
  document.addEventListener('DOMContentLoaded',()=>{
    const ms=document.getElementById('main-screen');
    if(ms) observer.observe(ms,{attributes:true,attributeFilter:['class']});
  });
})();

// ── Verificar pagos pendientes y mostrar badge ───────────────
async function checkPagosNotification(){
  if(!currentUser||isAdmin) return;
  try{
    const res=await fetch(`${SUPABASE_URL}/rest/v1/payments?usuario=eq.${encodeURIComponent(currentUser)}&status=eq.paid&select=id`,{
      headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY}
    });
    if(!res.ok)return;
    const data=await res.json();
    const count=Array.isArray(data)?data.length:0;
    const badge=document.getElementById('pago-badge-count');
    if(badge){
      if(count>0){badge.textContent=count;badge.style.display='flex';}
      else{badge.style.display='none';}
    }
  }catch(e){}
}
