import test from 'node:test';
import assert from 'node:assert/strict';
import {createFriends} from '../friends.mjs';

test('Friends requires sign-in, displays shared counts and discards stale account responses',async()=>{
 const saved=globalThis.document;globalThis.document={addEventListener(){}};
 try{
  let identity=null,resolve, calls=0;
  const friends=createFriends({identity:()=>identity,visible:()=>false,rpc:()=>{calls++;return new Promise(r=>resolve=r);}});
  await friends.load();assert.equal(calls,0);assert.match(friends.page(),/Sign in/);
  identity='a';let request=friends.load();resolve({code:'EXAMPLE',sharing:false,connections:[
   {id:'1',name:'Classmate',status:'friend',progress:[{subject:'Math <A>',done:3,total:5}]},
   {id:'2',name:'Private classmate',status:'friend',progress:null},
   {id:'3',name:'Incoming',status:'incoming',progress:null}
  ]});await request;
  assert.match(friends.page(),/3\/5 chapters/);assert.match(friends.page(),/Math &lt;A&gt;/);
  assert.match(friends.page(),/Study progress is private/);assert.match(friends.page(),/Accept/);
  request=friends.load();friends.reset();identity='b';
  resolve({code:'OLD-CODE',sharing:false,connections:[]});await request;
  assert.doesNotMatch(friends.page(),/OLD-CODE|Classmate/);
 }finally{globalThis.document=saved;}
});
