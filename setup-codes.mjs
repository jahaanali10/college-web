import {seedState,validateBackup,mergeState} from './model.mjs?v=23';
import {scheduleForCode,SCHEDULE_CODE} from './exams.mjs?v=23';
import {periodErrors,applyPeriods,weekdays} from './timetable-parser.mjs?v=23';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PREFIX='COLLEGE1-';
export function encodeSetup(state,kind){
 if(!['study','timetable'].includes(kind))throw Error('Choose study or timetable.');
 const data=kind==='study'?state.subjects.map(s=>({id:s.id,name:s.name,chapters:s.chapters.map(c=>({id:c.id,title:c.title,section:c.section??null,isCompleted:false}))})):state.timetable.map(p=>({id:p.id,weekday:p.weekday,title:p.title,start:p.start,end:p.end,room:p.room,kind:p.kind}));
 if(!data.length)throw Error(kind==='study'?'Add subjects and chapters before creating a code.':'Add classes before creating a code.');
 const raw=JSON.stringify({version:1,kind,data}),bytes=new TextEncoder().encode(raw);if(bytes.length>300000)throw Error('This setup is too large for a code. Use a backup instead.');let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
 return PREFIX+btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function decodeSetup(code,kind){
 const input=String(code).replace(/\s/g,'');let payload;
 if(input.toUpperCase()===SCHEDULE_CODE&&kind==='study'){payload={version:1,kind,data:scheduleForCode(input).map(e=>({id:'preset-study-'+e.id,name:e.subject,chapters:e.portion.map(p=>({id:'preset-study-'+p.id,title:p.title,section:e.title,isCompleted:false}))}))};}
 else{if(input.length>420000||!input.startsWith(PREFIX)||!/^[A-Za-z0-9_-]+$/.test(input.slice(PREFIX.length)))throw Error('Code not recognised or too large. Paste a complete College setup code.');try{const binary=atob(input.slice(PREFIX.length).replace(/-/g,'+').replace(/_/g,'/'));payload=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0))));}catch{throw Error('This code is incomplete or damaged. Ask for a new copy.');}}
 if(payload.version!==1||payload.kind!==kind||!Array.isArray(payload.data))throw Error('This is not a '+(kind==='study'?'subjects & chapters':'class timetable')+' code. Use Add code in the matching section.');
 const shell=seedState();shell[kind==='study'?'subjects':'timetable']=payload.data;const clean=validateBackup(shell),data=clean[kind==='study'?'subjects':'timetable'];if(!data.length)throw Error('The code contains an empty setup.');
 if(kind==='study'){const names=new Set();for(const s of data){const name=s.name.trim().toLowerCase();if(!name||names.has(name))throw Error('Subjects must have unique, non-empty names.');names.add(name);s.name=s.name.trim();for(const c of s.chapters){if(!c.title.trim())throw Error('Chapter names cannot be empty.');c.isCompleted=false;}}}
 else{const errors=periodErrors(data,[],'replace');if(errors.length)throw Error(errors.join('\n'));}
 return {kind,data};
}
export function applySetup(state,setup){
 if(setup.kind==='study'){const incoming=seedState();incoming.subjects=setup.data.map(s=>({...s,id:crypto.randomUUID(),chapters:s.chapters.map(c=>({...c,id:crypto.randomUUID()}))}));const merged=mergeState(state,incoming);validateBackup({...state,subjects:merged.subjects});state.subjects=merged.subjects;}
 else if(setup.kind==='timetable'){const rows=setup.data.map(({id,...r})=>r),next=applyPeriods(state.timetable,rows,'add');if(next.length>500)throw Error('Use at most 500 timetable periods.');state.timetable=next;}
 else throw Error('Unknown setup type.');
}
export function createSetupCodes(api){let pending=null,pendingScope=null,exported='';const {getState,change,dialog,closeDialog,toast}=api;
 const title=kind=>kind==='study'?'subjects & chapters':'class timetable';
 function controls(kind){return `<section class="card setup-code-tools"><h2>${kind==='study'?'Study setup codes':'Timetable setup codes'}</h2><p class="small muted">Import a shared setup, or create a code from your own ${title(kind)}. Existing records stay.</p><div class="actions"><button class="button" data-setup-code="add" data-kind="${kind}">Add code</button><button class="text-link" data-setup-code="create" data-kind="${kind}">Create code</button></div></section>`;}
 const reset=()=>{pending=null;pendingScope=null;exported='';};
 document.addEventListener('click',async ev=>{const b=ev.target.closest('[data-setup-code]');if(!b)return;const kind=b.dataset.kind;try{if(b.dataset.setupCode==='add'){reset();dialog(`<h2>Add ${title(kind)} code</h2><form id="setup-code-form" data-kind="${kind}"><label for="setup-code">Setup code</label><textarea id="setup-code" name="code" rows="5" maxlength="420000" spellcheck="false" autocomplete="off" required></textarea><p class="small muted">Paste the complete code. You’ll review its contents before anything is saved.</p><div class="actions"><button type="button" class="button" data-action="close">Cancel</button><button class="button primary">Preview setup</button></div></form>`);}
 else if(b.dataset.setupCode==='create'){reset();exported=encodeSetup(getState(),kind);dialog(`<h2>Your ${title(kind)} code</h2><p class="small muted">Contains only ${kind==='study'?'subject and chapter names; completion marks are excluded':'weekly class names, days, times and rooms; attendance is excluded'}. No finances, account details or chats are included. Anyone you share the code with can read that setup.</p><label for="generated-code">Copy the complete code</label><textarea id="generated-code" rows="5" readonly spellcheck="false">${esc(exported)}</textarea><div class="actions"><button class="button" data-action="close">Close</button><button class="button primary" data-setup-code="copy">Copy code</button></div>`);}
 else if(b.dataset.setupCode==='copy'){try{await navigator.clipboard.writeText(exported);toast('Setup code copied.');}catch{document.querySelector('#generated-code')?.select();toast('Select and copy the code above.');}}
 else if(b.dataset.setupCode==='import'&&pending){if(pendingScope!==api.scope()){reset();throw Error('Your account changed. Preview the code again.');}const copy=structuredClone(pending);if(await change(s=>applySetup(s,copy),'Setup imported; existing records kept')){closeDialog();reset();}}
 }catch(e){toast(e.message);}});
 document.addEventListener('submit',ev=>{const f=ev.target;if(f.id!=='setup-code-form')return;ev.preventDefault();try{pending=decodeSetup(new FormData(f).get('code'),f.dataset.kind);pendingScope=api.scope();const study=pending.kind==='study';dialog(`<h2>Review ${title(pending.kind)}</h2><p>${study?pending.data.length+' subjects · '+pending.data.reduce((n,s)=>n+s.chapters.length,0)+' chapters':pending.data.length+' weekly periods'}</p><div class="notice">${study?'Existing subjects and completed chapters stay. New chapters start incomplete.':'Existing classes stay; exact duplicates are skipped. Overlapping classes must be corrected before importing.'}</div>${study?pending.data.map(s=>`<details><summary>${esc(s.name)} · ${s.chapters.length} chapters</summary><ul>${s.chapters.map(c=>`<li>${esc(c.title)}${c.section?' · '+esc(c.section):''}</li>`).join('')}</ul></details>`).join(''):pending.data.map(p=>`<p><strong>${esc(p.title)}</strong><br>${weekdays[p.weekday]} · ${p.start}–${p.end}${p.room?' · '+esc(p.room):''}</p>`).join('')}<div class="actions"><button class="button" data-action="close">Cancel</button><button class="button primary" data-setup-code="import">Add to my ${study?'studies':'timetable'}</button></div>`);}catch(e){pending=null;toast(e.message);}});
 return {controls,reset};
}
