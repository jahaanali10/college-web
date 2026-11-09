const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createFriends(api){
 let data=null,error='',busy=false,epoch=0;
 const refresh=()=>{if(api.visible())api.render();};
 async function run(action='list',target=''){
  if(busy||!api.identity())return;
  const user=api.identity(),request=++epoch;busy=true;error='';refresh();
  try{const result=await api.rpc(action,target);if(request===epoch&&user===api.identity())data=result;}
  catch(e){if(request===epoch)error=e.message;}
  finally{if(request===epoch){busy=false;refresh();}}
 }
 const button=(action,label,id)=>`<button class="button" data-friend-action="${action}" data-id="${esc(id)}" ${busy?'disabled':''}>${label}</button>`;
 function page(){
  return `<div class="header"><h1>Friends</h1><p>Connect with classmates and follow each other’s study progress.</p></div>`+(!api.identity()?'<section class="card"><p>Sign in to send requests and share progress.</p><button class="button" data-view="backup">Account settings</button></section>':
  `${error?`<p role="alert">${esc(error)}</p>`:''}${!data?`<section class="card">${busy?'Loading friends…':button('list','Try again','')}</section>`:
  `<section class="card"><h2>Your friend code</h2><p><strong>${esc(data.code)}</strong></p>${button('copy','Copy code','')}<form id="friend-request-form"><label for="friend-code">Classmate’s friend code</label><input id="friend-code" name="code" maxlength="16" pattern="[A-Fa-f0-9]{16}" required autocomplete="off"><button class="button primary" ${busy?'disabled':''}>Send request</button></form></section>
  <section class="card"><h2>Study progress sharing</h2><p>${data.sharing?'Your accepted friends can see subject names and chapter completion counts.':'Your study progress is private. Turn on sharing to show subject names and completion counts to accepted friends.'}</p>${button(data.sharing?'share-off':'share-on',data.sharing?'Turn sharing off':'Share with friends','')}</section>
  ${[['incoming','Incoming requests'],['outgoing','Sent requests'],['friend','Your friends']].map(([status,title])=>`<section class="card"><h2>${title}</h2>${data.connections.filter(r=>r.status===status).map(r=>`<div class="insight"><strong>${esc(r.name)}</strong>${status==='friend'?(r.progress===null?'<p class="small muted">Study progress is private.</p>':`<details><summary>Study progress · ${r.progress.reduce((n,s)=>n+s.done,0)}/${r.progress.reduce((n,s)=>n+s.total,0)} chapters</summary>${r.progress.map(s=>`<p>${esc(s.subject)} · ${s.done}/${s.total}</p>`).join('')||'<p>No subjects added yet.</p>'}</details>`):''}<div class="actions">${status==='incoming'?button('accept','Accept',r.id)+button('decline','Decline',r.id):status==='outgoing'?button('cancel','Cancel request',r.id):button('remove','Remove friend',r.id)}</div></div>`).join('')||'<p class="muted">None yet.</p>'}</section>`).join('')}${button('list','Refresh','')}`}`);
 }
 document.addEventListener('submit',e=>{if(e.target.id==='friend-request-form'){e.preventDefault();run('send',String(new FormData(e.target).get('code')).trim());}});
 document.addEventListener('click',async e=>{const b=e.target.closest('[data-friend-action]');if(!b)return;const action=b.dataset.friendAction;if(action==='copy'){try{await navigator.clipboard.writeText(data.code);api.toast('Friend code copied.');}catch{api.toast('Copy the friend code shown above.');}}else run(action,b.dataset.id);});
 return {page,load:()=>run(),reset(){epoch++;data=null;error='';busy=false;}};
}
