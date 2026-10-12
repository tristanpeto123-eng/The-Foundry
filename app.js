import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
// The Foundry v4: a single Sony-inspired pallet-transfer line with peripheral engineering offices.
// ALL visual production events are demonstrations; no backend approvals or trading.
const $=s=>document.querySelector(s),canvas=$('#world'),loading=$('#loading');
const mobile=matchMedia('(pointer:coarse)').matches,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const data=[
 ['DC-01','DATA CURATOR','Incoming data / feed conditioning','SCANNING','Synthetic feed intake','Demo input'],
 ['BT-01','BACKTESTER','Automated test equipment','TEST READY','Awaiting test cycle','No verified results'],
 ['VL-01','VALIDATOR','Independent quality inspection','HOLD','Validation service unavailable','No approval'],
 ['SC-01','SCORER','Grading and binning','WAIT','Awaiting validated candidate','No approved ranking'],
 ['RM-01','RISK MANAGER','Safety interlock and risk veto','VETO','Paper dispatch blocked','No risk approval'],
 ['PT-01','PAPER TRADER','Paper-only dispatch cell','STANDBY','No approved paper order','Zero orders'],
 ['RS-01','RESEARCHER','Engineering research centre','RESEARCH','Investigating hypotheses','Illustrative only'],
 ['SD-01','STRATEGY DESIGNER','Engineering design office','DESIGN','Drafting candidate logic','Illustrative only'],
 ['OP-01','OPTIMIZER','Calibration engineering','TUNING','Exploring parameters','Illustrative only'],
 ['BM-01','BOT MANAGER','Production control / Andon','MONITOR','Supervising simulated line','Demo only'],
 ['JR-01','JOURNAL','Traceability office','LOGGING','Recording demo events','No immutable backend log'],
 ['VA-01','VAULT','Evidence archive','STORAGE','Holding demonstration records','No verified evidence']
];
const scene=new THREE.Scene();scene.background=new THREE.Color('#91bdce');scene.fog=new THREE.Fog('#91bdce',100,235);
const camera=new THREE.OrthographicCamera(-55,55,33,-33,.1,500);camera.position.set(68,73,88);
const renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.35:1.8));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.085;controls.enableRotate=false;controls.screenSpacePanning=true;controls.target.set(0,1,0);controls.minZoom=.7;controls.maxZoom=3.5;controls.mouseButtons.LEFT=THREE.MOUSE.PAN;controls.touches.ONE=THREE.TOUCH.PAN;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
const mat=(c,m=.1,r=.75)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});const M={ground:mat('#88a18a'),floor:mat('#b7c3bb'),concrete:mat('#697b80'),road:mat('#43545c'),wall:mat('#d4d9cd'),steel:mat('#586f79',.55),dark:mat('#243942',.5),blue:mat('#4485a5'),orange:mat('#ed9a3d'),yellow:mat('#f4c65c'),red:mat('#e35e52'),green:mat('#5ac49d'),glass:new THREE.MeshStandardMaterial({color:'#92d5dd',transparent:true,opacity:.6,depthWrite:false,roughness:.14}),belt:mat('#202f34'),white:mat('#edf0df'),roof:mat('#558096')};
const clickable=[],animated=[],pallets=[],robots=[];const overlays=[];let selected=-1,playing=false,eventCount=0,lastCycle=0,focusTween=null;const clock=new THREE.Clock();
function box(p,w,h,d,m,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o}
function cyl(p,r,h,m,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),m);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o}
function label(str,w=9,h=.95){const c=document.createElement('canvas');c.width=1024;c.height=130;const q=c.getContext('2d');q.fillStyle='#203e4d';q.fillRect(0,0,1024,130);q.fillStyle='#f4bc60';q.fillRect(0,0,15,130);q.fillStyle='#ffffff';q.font='bold 57px system-ui';q.fillText(str,32,85,970);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}))}
function floorMark(p,text,x,z,w=5){const t=label(text,w,.55);t.rotation.x=-Math.PI/2;t.position.set(x,.11,z);p.add(t)}
function placard(p,title,subtitle,x,y,z,w=9){const g=new THREE.Group();g.position.set(x,y,z);p.add(g);box(g,w,1.7,.18,M.dark,0,0,0);const a=label(title,w-.3,.72);a.position.set(0,.36,.14);g.add(a);const b=label(subtitle,w-.3,.58);b.position.set(0,-.42,.14);g.add(b);return g}
function beacon(p,x,y,z,i){const stem=cyl(p,.15,.65,M.dark,x,y,z);const c=[M.green,M.yellow,M.red][i%3];for(let k=0;k<3;k++)cyl(p,.29,.29,k===i%3?c:M.steel,x,y+.5+k*.34,z)}
function addMachineDetails(g,i){
 // Distinct silhouettes identify machine function without needing to read tiny labels.
 if(i===0){ // feed preparation, optical intake and scanning tunnel
  box(g,4.8,2.8,3.8,M.blue,0,3.1,-2.8);box(g,3.8,1.7,.15,M.glass,0,3.1,-.8);
  for(let j=-1;j<=1;j++){cyl(g,.32,2.6,M.steel,j*1.25,4.1,-2.8);box(g,.65,.32,2,M.orange,j*1.25,5.4,-2.8)}
  placard(g,'01 / INTAKE','FEED + SCAN',0,5.2,-.5,7.6);
 }else if(i===1){ // automated test enclosure and travelling Z-axis head
  for(let q of [-2.6,2.6])box(g,.28,4.8,.28,M.yellow,q,4,-1.7);
  box(g,6,.4,.5,M.yellow,0,6.35,-1.7);
  const head=box(g,2.1,1.35,1.8,M.orange,0,4.6,-1.8);animated.push(t=>{head.position.y=4.6+(playing?.65*Math.sin(t*1.8):0)});
  box(g,4.3,.2,3.1,M.dark,0,2.05,-2);placard(g,'02 / ATE','BACKTEST FIXTURE',0,5.2,-.5,8.2);
 }else if(i===2){ // camera inspection portal
  for(let q of [-2.5,2.5])box(g,.4,4.5,.4,M.blue,q,3.8,.1);
  box(g,5.4,.45,.5,M.blue,0,6,.1);cyl(g,.85,.65,M.dark,0,5.5,.1);
  cyl(g,.38,.7,M.glass,0,4.9,.1);for(let q of [-2,2])box(g,.3,2.4,.3,M.yellow,q,3.4,.1);
  placard(g,'03 / VISION QA','INSPECT + VALIDATE',0,5.2,-.5,8.7);
 }else if(i===3){ // sorting and grading chutes
  for(let q=-1;q<=1;q++){box(g,1.55,2.4,2.2,[M.green,M.yellow,M.red][q+1],q*2,2.6,-2.6);box(g,1.5,.18,3.1,M.steel,q*2,3.8,-1.4)}
  placard(g,'04 / GRADING','SCORE + BIN',0,5.2,-.5,8.2);
 }else if(i===4){ // red safety interlock gate
  for(let q of [-2.6,2.6])box(g,.55,5.2,.55,M.red,q,3.6,.6);
  box(g,6,.7,.7,M.red,0,6.3,.6);box(g,5.5,2.8,.2,M.glass,0,3.5,.6);
  for(let q=-2;q<=2;q++)box(g,.32,.7,.25,M.yellow,q,5.5,.8);
  placard(g,'05 / SAFETY','RISK INTERLOCK',0,5.2,-.5,8.5);
 }else{ // packing / dispatch roller outfeed
  box(g,6,2.5,3,M.blue,0,2.8,-2.8);for(let q=-2;q<=2;q++)cyl(g,.3,.7,M.orange,q*1.1,4.25,-2.4);
  box(g,5.2,.4,2,M.green,0,4.8,-2.6);placard(g,'06 / DISPATCH','PAPER SIMULATION',0,5.2,-.5,8.6);
 }
 // Every cell gets an operator console, physical safety zone and tower light.
 box(g,2.1,.2,1.2,M.yellow,-3.8,.13,3.1);floorMark(g,'OPERATOR',-3.8,4.1,3.8);
 box(g,1.4,1.15,.4,M.dark,-2.15,2.1,3.8);box(g,1.15,.75,.08,M.green,-2.15,2.25,4.06);
 beacon(g,4.4,7.4,4.4,i);
 for(let q of [-1,1]){box(g,.15,.12,7,M.yellow,q*5,.12,0)}
}

// V4: readable industrial assemblies. Each station has identifiable real-world hardware.
const detailMat={rubber:mat('#171e24'),silver:mat('#b4c2c6',.7,.32),copper:mat('#c77c42',.55),safety:mat('#e7b739'),lens:mat('#143b53',.25,.12),screen:mat('#183b40',.15,.25),paper:mat('#f5f1d8'),black:mat('#24292e')};
function beamBetween(p,a,b,r,m){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());p.add(o);return o}
function bolts(p,x,y,z,wx,wz){for(let dx of [-wx/2,wx/2])for(let dz of [-wz/2,wz/2])cyl(p,.095,.08,detailMat.silver,x+dx,y,z+dz)}
function machineDetail(g,i){
 // Safety guarding: legible physical panels with stanchions and hazard markings.
 for(const x of [-4.6,4.6]){box(g,.12,2.9,.12,M.yellow,x,2.65,-4.15);box(g,.12,2.9,.12,M.yellow,x,2.65,1.75)}
 for(const z of [-4.15,1.75]){box(g,9.2,.12,.12,M.yellow,0,4.12,z);box(g,9.2,.12,.12,M.yellow,0,1.2,z)}
 for(let x=-3.6;x<4.1;x+=1.8)box(g,.045,2.2,.045,detailMat.silver,x,2.7,-4.15);
 // A human-readable operating panel: monitor, hard controls, emergency stop.
 const c=new THREE.Group();c.position.set(-3.55,0,3.55);g.add(c);
 box(c,1.65,1.25,.38,detailMat.black,0,2.8,0);box(c,1.34,.88,.07,detailMat.screen,0,2.84,.23);
 for(let k=0;k<4;k++)box(c,.95-k*.12,.07,.08,[M.green,M.blue,M.yellow,M.orange][k],-.12,3.12-k*.19,.28);
 box(c,1.65,.18,.9,detailMat.silver,0,1.95,.35);cyl(c,.22,.16,M.red,.5,2.13,.62);
 for(let k=0;k<3;k++)cyl(c,.085,.09,[M.green,M.yellow,M.blue][k],-.52+k*.28,2.11,.55);
 for(let j=0;j<4;j++)box(g,.11,.08,1.6,detailMat.black,-3.8+j*.35,.2,3.8);
 // Cable trunking, compressed air lines, fasteners, feet and service access.
 box(g,8.5,.26,.42,M.steel,0,.7,-4.55);for(let x=-3.5;x<=3.5;x+=1.75){box(g,.75,.28,.7,detailMat.black,x,.54,-4.1);bolts(g,x,.72,-4.1,.45,.4)}
 beamBetween(g,[-4.2,1,-3.6],[-4.2,4.8,-3.6],.09,detailMat.copper);
 beamBetween(g,[-4.2,4.8,-3.6],[3.9,4.8,-3.6],.09,detailMat.copper);
 // Distinct process tools. Unlike generic boxes these communicate the station's purpose.
 if(i===0){
   // Infeed roller table, sensor portal, camera, feed cassettes.
   for(let x=-2.8;x<=2.8;x+=.7){const r=cyl(g,.19,3.2,detailMat.silver,x,2.35,-1.6);r.rotation.x=Math.PI/2}
   for(let x of [-2.2,2.2]){box(g,.22,3,.25,M.yellow,x,3.25,1.05);box(g,.8,.42,.5,detailMat.black,x,4.65,1.05)}
   box(g,5,.22,.3,M.yellow,0,4.85,1.05);cyl(g,.44,.6,detailMat.lens,0,4.4,1.05);
   for(let x of [-2.5,0,2.5])box(g,.95,1.6,1.4,detailMat.silver,x,3.5,-3.5);
 } else if(i===1){
   // Automated test fixture with twin guides, platen, pogo-pin bed and motor.
   for(let x of [-1.8,1.8]){cyl(g,.14,3.9,detailMat.silver,x,4.05,-2.0);cyl(g,.35,.3,detailMat.black,x,5.95,-2)}
   box(g,4.6,.45,2.8,detailMat.silver,0,2.25,-2);
   for(let x=-1.65;x<=1.7;x+=.55)for(let z=-2.8;z<=-1.1;z+=.55)cyl(g,.055,.25,detailMat.copper,x,2.62,z);
   box(g,1.7,1.2,1.5,M.blue,0,6.1,-2);cyl(g,.4,.6,detailMat.black,0,6.9,-2);
   for(let x of [-2.5,2.5])box(g,.3,2,.35,M.yellow,x,3,-2);
 } else if(i===2){
   // Multi-camera machine-vision inspection, coaxial lights and reject pusher.
   for(let x of [-1.8,0,1.8]){box(g,.7,.65,.7,detailMat.black,x,5.1,-1.5);cyl(g,.29,.65,detailMat.lens,x,4.65,-1.5);cyl(g,.46,.12,M.green,x,4.27,-1.5)}
   box(g,5.2,.18,2.8,detailMat.silver,0,2.4,-2);
   box(g,1.4,.65,1.4,M.orange,3,2.8,-1.8);beamBetween(g,[3,2.8,-1.8],[4.6,2.8,-1.8],.18,detailMat.silver);
 } else if(i===3){
   // Servo sorting gantry and three colour-coded grading chutes.
   box(g,6.5,.5,.65,detailMat.silver,0,5.5,-2.5);
   for(let x of [-2.1,0,2.1]){box(g,1.8,1.1,2.6,[M.green,M.yellow,M.red][Math.round(x/2.1)+1],x,2.5,-3.25);box(g,1.65,.13,2.5,detailMat.black,x,3.15,-3.25);box(g,.2,1.7,.2,detailMat.silver,x,4.3,-2.5)}
   box(g,1.4,.55,.7,M.orange,0,5.15,-2.5);
 } else if(i===4){
   // Safety PLC enclosure, laser interlock gate and two-hand safety controls.
   box(g,2.2,2.9,.8,M.yellow,2.6,3.5,-3.5);box(g,1.6,1.3,.09,detailMat.black,2.6,3.8,-3.04);
   for(let k=0;k<4;k++)box(g,1.25,.13,.1,[M.red,M.green,M.yellow,M.blue][k],2.6,4.22-k*.29,-2.96);
   for(let x of [-2.2,2.2]){box(g,.25,3.2,.28,M.red,x,3.4,1.2);for(let y=2;y<5;y+=.5)box(g,.12,.11,.11,M.yellow,x,y,1.39)}
   box(g,4.6,.16,.4,detailMat.black,0,2.1,1.2);
 } else {
   // Outfeed packaging: roller conveyor, label printer, dispatch crate.
   for(let x=-2.5;x<=2.5;x+=.65){const r=cyl(g,.16,2.8,detailMat.silver,x,2.55,-1.5);r.rotation.x=Math.PI/2}
   box(g,2.1,1.5,1.8,M.orange,0,3.4,-2.6);box(g,1.6,.12,1.4,detailMat.paper,0,4.22,-2.6);
   box(g,1.7,1.3,.9,detailMat.black,2.6,3.5,-2.9);box(g,1.35,.5,.08,M.green,2.6,3.8,-2.42);
 }
 // Readable front-facing station ID at operator height.
 const id=label(data[i][0]+'  /  '+['INFEED','AUTOMATED TEST','VISION QA','GRADING','RISK GATE','DISPATCH'][i],8.4,.74);id.position.set(0,4.5,4.84);g.add(id);
}

function tag(mesh,i){mesh.userData.agent=i;clickable.push(mesh);return mesh}
function robot(p,i,x,z){const g=new THREE.Group();g.position.set(x,0,z);p.add(g);const color=[M.blue,M.orange,M.green,M.yellow,M.red][i%5];cyl(g,.62,.42,M.dark,0,.45,0);box(g,.9,1.2,.75,color,0,1.3,0);box(g,.75,.65,.65,M.white,0,2.23,0);box(g,.58,.18,.09,M.blue,0,2.27,.36);for(const s of [-1,1]){box(g,.2,.9,.24,M.steel,s*.62,1.4,.13);box(g,.27,.4,.3,M.dark,s*.62,.8,.25)}const arm=new THREE.Group();arm.position.set(.58,1.7,0);g.add(arm);box(arm,.24,.95,.24,color,.13,-.43,.15);animated.push(t=>{arm.rotation.x=Math.sin(t*2+i)*.5;g.rotation.y=Math.sin(t*.7+i)*.2});robots.push(g);return g}
function ground(){box(scene,116,2,66,M.ground,0,-1.4,0);box(scene,106,.3,54,M.floor,0,-.18,0);for(const z of [-23,23]){box(scene,104,.06,4,M.road,0,.04,z);for(let x=-48;x<50;x+=6)box(scene,2,.07,.1,M.yellow,x,.1,z)}for(const z of [-13,13])box(scene,102,.05,.15,M.orange,0,.02,z);for(let x=-48;x<49;x+=8)for(let z of [-30,30]){const t=cyl(scene,1.15,2.4,M.steel,x,1,z);cyl(scene,2.2,.55,M.green,x,2.4,z)}}
function office(i,x,z,w=15,d=10){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const h=i===9?11:7.2;tag(box(g,w,.45,d,M.concrete,0,.2,0),i);box(g,w,h,.35,M.wall,0,h/2,-d/2);for(const s of [-1,1])box(g,.35,h,d,M.wall,s*w/2,h/2,0);box(g,w,.4,d*.3,M.roof,0,h+.15,-d*.36);box(g,w,.5,.3,M.blue,0,h-.25,d/2);for(let k=-2;k<=2;k++){box(g,1.6,3.5,.15,M.glass,k*2.55,3.3,-d/2+.23);box(g,1.6,3.2,.15,M.glass,k*2.55,3.3,d/2)}const s=label(data[i][0]+'  '+data[i][1],w-.8);s.position.set(0,h-1.1,d/2+.3);g.add(s);for(let k=-1;k<=1;k++){box(g,2.8,.85,1.6,M.steel,k*3,1,-.5);box(g,1.6,.75,.1,M.blue,k*3,1.8,.3)}robot(g,i,w/2-2.2,2);placard(g,'ENGINEERING',data[i][1],0,h+1.15,d/2+.2,Math.min(w-1,13));return g}
function machine(i,x){const g=new THREE.Group();g.position.set(x,0,0);scene.add(g);tag(box(g,11,.55,13,M.concrete,0,.3,0),i);for(const s of [-1,1]){box(g,.35,7,.35,M.steel,s*5,3.7,-4.7);box(g,.35,7,.35,M.steel,s*5,3.7,4.7)}box(g,10.5,.45,1.2,M.blue,0,7.1,-4.7);box(g,10.5,.4,.4,M.orange,0,6.8,4.7);const sign=label(data[i][0]+'  '+data[i][1],10,.9);sign.position.set(0,5.7,4.95);g.add(sign);
 // Each machine bridges the same continuous conveyor at z=0.
 const main=box(g,7,3.5,3.7,i===4?M.red:M.steel,0,2.3,-2.7);tag(main,i);box(g,5.6,1.1,.2,M.glass,0,3.4,-.72);
 if(i===0){for(const s of [-1,1])box(g,.4,4,.4,M.orange,s*3,3,1.3);box(g,6,.5,.5,M.orange,0,5,1.3)}
 if(i===1){box(g,5,1.2,4,M.dark,0,1.4,-2.5);const press=box(g,3,.7,2,M.orange,0,4.2,-2.5);animated.push(t=>press.position.y=4.2+Math.sin(t*1.8)*.5)}
 if(i===2){box(g,6,3.8,.4,M.glass,0,3,1.1);for(let k=-2;k<=2;k++)box(g,.18,3.5,.2,M.blue,k,3,1.2)}
 if(i===3){for(let k=-2;k<=2;k++)cyl(g,.35,2.1,k%2?M.green:M.yellow,k*1.1,2.1,-2.4)}
 if(i===4){box(g,6,4,.3,M.red,0,3,1.7);box(g,5,.2,.4,M.yellow,0,5.1,1.9)}
 if(i===5){box(g,5,2,3,M.blue,0,2,-2.6);box(g,4.8,.3,2,M.green,0,3.1,-2.6)}
 const screen=box(g,1.4,1.1,.2,M.blue,3.7,2.8,3.2);tag(screen,i);box(g,1.8,1.1,.8,M.dark,3.7,1.8,3.2);robot(g,i,-3.8,3.1);addMachineDetails(g,i);machineDetail(g,i);const light=cyl(g,.28,.35,i===4?M.red:M.green,-4.3,7.55,4.5);animated.push(t=>{light.scale.y=.7+.3*Math.sin(t*3+i)});return g}
function conveyor(){const g=new THREE.Group();scene.add(g);box(g,101,.85,2.9,M.dark,0,.85,0);box(g,101,.12,2.15,M.belt,0,1.36,0);for(const z of [-1.55,1.55])box(g,101,.4,.25,M.orange,0,1.4,z);for(let x=-49;x<50;x+=1.3)box(g,.18,.06,2.05,M.steel,x,1.44,0);for(let x=-48;x<49;x+=5)for(const z of [-1.25,1.25])box(g,.25,1.4,.25,M.steel,x,.25,z);
 for(let i=0;i<7;i++){const p=new THREE.Group();g.add(p);box(p,2,.28,1.7,M.orange,0,1.8,0);box(p,1.35,.7,1.2,M.blue,0,2.32,0);box(p,1.1,.1,1,M.glass,0,2.75,0);pallets.push(p)}
 // One unbroken main conveyor. Rejects move sideways into a buffer, never backwards on the line.
 box(scene,11,.6,3.3,M.dark,2,1.1,6);box(scene,11,.1,2.4,M.red,2,1.5,6);for(let k=0;k<3;k++)box(scene,2,.5,1.5,M.orange,-1+k*3,2,6);const r=label('QA HOLD / REJECT BUFFER',14,.8);r.position.set(2,3.2,9);scene.add(r);
}
function details(){for(let x=-44;x<=44;x+=11){box(scene,.22,6,.22,M.steel,x,3,-11);box(scene,2.4,.3,.7,M.yellow,x,6,-11)}for(const x of [-50,50]){box(scene,.5,13,.5,M.steel,x,6.5,-16);box(scene,.5,13,.5,M.steel,x,6.5,16)}box(scene,101,.65,.8,M.orange,0,13,-16);for(let x=-46;x<47;x+=8)box(scene,.4,.5,1.2,M.yellow,x,13.5,-16);
 const title=label('THE FOUNDRY  /  LINE 01',22,1.7);title.position.set(-30,12,17);scene.add(title);const board=label('GEMBA  ·  AUTOMATED STRATEGY TEST & QUALITY',31,1.2);board.position.set(14,10,-15);scene.add(board)}
function resize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),aspect=w/h;camera.left=-42*aspect;camera.right=42*aspect;camera.top=42;camera.bottom=-42;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
function focus(pos,target,zoom){focusTween={a:camera.position.clone(),b:pos,c:controls.target.clone(),d:target,z0:camera.zoom,z1:zoom,t:0}}
function overview(){selected=-1;$('#inspector').classList.add('hidden');$('#selected-name').textContent='OVERVIEW';focus(new THREE.Vector3(68,73,88),new THREE.Vector3(0,1,0),mobile?1.05:1.45)}
function select(i){selected=i;const a=data[i];$('#inspector').classList.remove('hidden');$('#agent-title').textContent=a[0]+' · '+a[1];$('#agent-role').textContent=a[2];$('#agent-state').textContent=a[3];$('#agent-decision').textContent=a[4];$('#agent-metric').textContent=a[5];$('#selected-name').textContent=a[0];const x=i<6?-40+i*16.1:i===9?33:i===10?-25:i===11?25:-31+(i-6)*22;const z=i<6?0:i===9?-19:i>=10?19:-19;focus(new THREE.Vector3(x+22,28,z+28),new THREE.Vector3(x,2,z),2.25)}
function init(){scene.add(new THREE.HemisphereLight(0xffffff,0x6b7f68,2.3));const sun=new THREE.DirectionalLight(0xfff1cc,2.5);sun.position.set(-40,75,50);sun.castShadow=!mobile;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-90;sun.shadow.camera.right=90;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70;scene.add(sun);ground();for(let i=0;i<6;i++)machine(i,-40+i*16.1);conveyor();office(6,-32,-19,18);office(7,-10,-19,18);office(8,12,-19,18);office(9,35,-19,15);office(10,-25,19,17);office(11,24,19,19);details();resize();addEventListener('resize',resize);overview();controls.update();let down=null;const ray=new THREE.Raycaster(),v=new THREE.Vector2();canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>9)return;const r=canvas.getBoundingClientRect();v.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(v,camera);const hits=ray.intersectObjects(clickable,false);if(hits.length)select(hits[0].object.userData.agent)});canvas.addEventListener('pointercancel',()=>down=null);$('#play').onclick=()=>{playing=true;lastCycle=clock.getElapsedTime();$('#status').textContent='DEMO LINE RUNNING · NO LIVE TRADES'};$('#stop').onclick=()=>{playing=false;$('#status').textContent='LINE STOPPED · DEMO ONLY'};$('#reset').onclick=overview;$('#overview').onclick=overview;$('#close').onclick=()=>$('#inspector').classList.add('hidden');loading.style.display='none';function frame(){requestAnimationFrame(frame);const t=clock.getElapsedTime();if(focusTween){const f=focusTween;f.t=Math.min(1,f.t+.035);const k=1-(1-f.t)**3;camera.position.lerpVectors(f.a,f.b,k);controls.target.lerpVectors(f.c,f.d,k);camera.zoom=f.z0+(f.z1-f.z0)*k;camera.updateProjectionMatrix();if(f.t===1)focusTween=null}if(!reduce){for(const fn of animated)fn(t);pallets.forEach((p,i)=>{p.position.x=-48+((i*14+(playing?t*3.1:0))%96)})}controls.update();controls.target.x=THREE.MathUtils.clamp(controls.target.x,-50,50);controls.target.z=THREE.MathUtils.clamp(controls.target.z,-29,29);if(playing&&t-lastCycle>2.5){lastCycle=t;eventCount++;$('#events').textContent=eventCount;$('#status').textContent='DEMO CYCLE '+eventCount+' · STATION '+data[(eventCount-1)%6][0]+' · NO REAL APPROVALS'}renderer.render(scene,camera)}frame()}
try{init()}catch(e){console.error(e);loading.style.display='grid';loading.style.color='#ff655a';loading.textContent='STARTUP ERROR: '+(e?.message||'WebGL unavailable')}
