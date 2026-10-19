// Bound network waits and preserve cancellation requested by the caller.
export async function fetchWithTimeout(input,options={},timeoutMs=15000){
 const controller=new AbortController();
 const signal=options.signal||(typeof Request!=='undefined'&&input instanceof Request?input.signal:null);
 const cancel=()=>controller.abort(signal.reason);
 if(signal?.aborted)cancel();else signal?.addEventListener('abort',cancel,{once:true});
 const timer=setTimeout(()=>controller.abort(new Error('Connection timed out. Check your connection and load latest records before retrying.')),timeoutMs);
 try{return await fetch(input,{...options,signal:controller.signal});}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
}
