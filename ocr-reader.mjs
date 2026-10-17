import {preparePhoto,cropCell,separatorPresent} from './ocr-image.mjs?v=17';
import {parseTimetable,matrixFromWords,describeGrid,parseGrid,extractionScore} from './timetable-parser.mjs?v=17';
const ink=(p,x0,y0,x1,y1)=>{let black=0,total=0;for(let y=Math.ceil(y0+5);y<y1-5;y+=2)for(let x=Math.ceil(x0+5);x<x1-5;x+=2){black+=p.mask[y*p.width+x]||0;total++;}return black/Math.max(1,total);};
export async function readTimetablePhoto({file,rotation,crop,cleanup,layout,createWorker,onProgress,isCancelled,onWorker}){
 const p=await preparePhoto(file,rotation,crop,cleanup);if(isCancelled())return null;let stage='Reading the full timetable';const worker=await createWorker(m=>{if(m.status==='recognizing text'&&!isCancelled())onProgress(`${stage}… ${Math.round(m.progress*100)}%`);});onWorker(worker);
 try{const recognise=async(image,psm,blocks=true)=>{if(isCancelled())throw Error('Reading cancelled.');await worker.setParameters({tessedit_pageseg_mode:String(psm),preserve_interword_spaces:'1',user_defined_dpi:'300'});return (await worker.recognize(image,{}, {text:true,blocks})).data;};
  const first=await recognise(p.clean,11),candidates=[{...parseTimetable(first,{layout,grid:p.grid}),data:first}];stage='Checking a second reading';const second=await recognise(p.original,3);candidates.push({...parseTimetable(second,{layout,grid:p.grid}),data:second});let best=candidates.sort((a,b)=>extractionScore(b)-extractionScore(a))[0],result=best,cellReads=0;
  if(p.grid&&layout!=='list'){
   const matrix=matrixFromWords(best.data,p.grid),H=matrix.length,W=matrix[0].length;
   const readCell=async(r,c,rEnd=r,cEnd=c)=>{const x0=p.grid.x[c],y0=p.grid.y[r],x1=p.grid.x[cEnd+1],y1=p.grid.y[rEnd+1];if(ink(p,x0,y0,x1,y1)<.002)return {text:'',confidence:100};stage=`Reading table cell ${++cellReads}`;onProgress(stage+'…');const data=await recognise(cropCell(p.clean,x0,y0,x1,y1),6,false);return {text:data.text.trim(),confidence:data.confidence||0};};
   let desc=describeGrid(matrix,layout);
   if(!desc){for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(r>2&&c>1)continue;const cell=await readCell(r,c);if(cell.text)matrix[r][c]=cell;}desc=describeGrid(matrix,layout);}
   if(desc){const eligible=[];for(let r=desc.header+1;r<H;r++)for(let c=0;c<W;c++){if(desc.layout==='days across'&&!desc.days.some(d=>d.c===c))continue;if(desc.layout==='times across'&&(c===desc.dayCol||!desc.times.some(t=>t.c===c)))continue;eligible.push([r,c]);}
    const keys=new Set(eligible.map(([r,c])=>r+','+c)),visited=new Set(),spans=[];
    for(const [r,c] of eligible){const key=r+','+c;if(visited.has(key))continue;const group=[],queue=[[r,c]];while(queue.length){const [a,b]=queue.pop(),k=a+','+b;if(visited.has(k)||!keys.has(k))continue;visited.add(k);group.push([a,b]);if(keys.has((a+1)+','+b)&&!separatorPresent(p.mask,p.width,p.grid.x[b],p.grid.y[a+1],p.grid.x[b+1],p.grid.y[a+1]))queue.push([a+1,b]);if(keys.has(a+','+(b+1))&&!separatorPresent(p.mask,p.width,p.grid.x[b+1],p.grid.y[a],p.grid.x[b+1],p.grid.y[a+1]))queue.push([a,b+1]);}
     const minR=Math.min(...group.map(x=>x[0])),maxR=Math.max(...group.map(x=>x[0])),minC=Math.min(...group.map(x=>x[1])),maxC=Math.max(...group.map(x=>x[1]));
     if(group.length!==(maxR-minR+1)*(maxC-minC+1)){for(const [a,b] of group){const cell=await readCell(a,b);if(cell.text||!matrix[a][b].text)matrix[a][b]=cell;}continue;}
     const previous=matrix[minR][minC];let cell=previous;if(group.length>1||!previous.text||previous.confidence<94){const fresh=await readCell(minR,minC,maxR,maxC);if(fresh.text||!previous.text)cell=fresh;}
     for(const [a,b] of group)matrix[a][b]={text:'',confidence:100};
     if(desc.layout==='days across'){for(let b=minC;b<=maxC;b++){matrix[minR][b]=cell;if(maxR>minR)spans.push({r:minR,c:b,rows:maxR-minR+1,cols:1});}}
     else {for(let a=minR;a<=maxR;a++){matrix[a][minC]=cell;if(maxC>minC)spans.push({r:a,c:minC,rows:1,cols:maxC-minC+1});}}
    }
    const parsed=parseGrid(matrix,{layout,spans});if(parsed.rows.length)result={...parsed,text:matrix.map(row=>row.map(c=>c.text.replace(/\n/g,' / ')).join(' | ')).join('\n')};
   }
  }
  return {...result,summary:`${result.rows.length} classes · ${result.layout==='list'?'list layout':result.layout+' layout'} · two OCR passes${cellReads?' + '+cellReads+' cell checks':''}${p.angle?' · straightened '+Math.abs(p.angle)+'°':''}`};
 }finally{await worker.terminate().catch(()=>{});onWorker(null);}
}
