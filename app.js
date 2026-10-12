import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// SCALP CITY / THE FOUNDRY — procedural, mobile-aware factory game environment.
// Everything is DEMO: animation never represents actual trade authorization.
const $ = s => document.querySelector(s);
const canvas = $('#world');
const loading = $('#loading');
const isMobile = matchMedia('(pointer:coarse)').matches;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const agents = [
 ['DC-01','DATA CURATOR','Receiving & sorting',-26,-19,0x39d6e9,'SCANNING','Filtering demonstration market feed','Synthetic packets'],
 ['RS-01','RESEARCHER','Discovery laboratory',-13,-19,0x83a9ff,'RESEARCH','Inspecting hypothetical setups','3 demo hypotheses'],
 ['SD-01','STRATEGY DESIGNER','Rule fabrication',0,-19,0xffb253,'ASSEMBLING','Fabricating candidate rules','Illustrative rules'],
 ['OP-01','OPTIMIZER','Parameter mill',13,-19,0xb794ff,'TUNING','Adjusting test parameters','Demo sweep'],
 ['BT-01','BACKTESTER','Simulation turbine',27,-19,0x61edb5,'READY','Waiting for test request','No live strategy result'],
 ['VL-01','VALIDATOR','Quality inspection',-26,1,0xff7d75,'BLOCKED','Independent QA unavailable','No validation approval'],
 ['SC-01','SCORER','Evaluation tower',-13,1,0xffdf75,'WAITING','Waiting for validated candidate','No approved ranking'],
 ['BM-01','BOT MANAGER','Central command',0,1,0x56c9ff,'IDLE','Coordinating demo workflow','12 visual stations'],
 ['RM-01','RISK MANAGER','Safety interlock',14,1,0xff6075,'VETO','Execution disabled','No risk approval'],
 ['PT-01','PAPER TRADER','Dispatch hangar',27,1,0x49e8b4,'STANDBY','No authorized paper order','0 paper orders'],
 ['JR-01','JOURNAL','Event recorder',-13,20,0x99caff,'IDLE','Awaiting trace events','Illustrative activity only'],
 ['VA-01','VAULT','Archive warehouse',13,20,0x6be6e5,'IDLE','Awaiting evidence artifacts','Demo inventory']
];
let renderer,scene,camera,controls,clock;
const clickable=[],stations=[],moving=[],belts=[],particles=[];
let selected=-1,playing=false,eventCount=0,lastEvent=0,focusTween=null;
const mats={};
const material=(hex,metal=.35,rough=.65,emissive=0)=>new THREE.MeshStandardMaterial({color:hex,metalness:metal,roughness:rough,emissive:hex,emissiveIntensity:emissive});
const M={floor:material(0x26333a,.1,.95),base:material(0x101c24,.3,.8),wall:material(0x334653,.3,.68),edge:material(0x5b7180,.7,.38),roof:material(0x253640,.35,.7),steel:material(0x83949a,.7,.34),dark:material(0x15232d,.5,.55),black:material(0x08131a,.3,.5),orange:material(0xe99138,.3,.52),yellow:material(0xffc45b,.1,.55),glass:new THREE.MeshStandardMaterial({color:0x8be8ed,metalness:.25,roughness:.13,transparent:true,opacity:.5,depthWrite:false}),light:new THREE.MeshBasicMaterial({color:0xffd79b}),cyan:new THREE.MeshBasicMaterial({color:0x3ce4ed}),red:new THREE.MeshBasicMaterial({color:0xff5f59}),grass:material(0x52654b,.0,1),rock:material(0x626765,.1,1)};
function box(parent,w,h,d,mat,x=0,y=0,z=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;parent.add(m);return m}
function cylinder(parent,r1,r2,h,mat,x=0,y=0,z=0,n=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,n),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function pipe(parent,a,b,r,mat){const v=new THREE.Vector3(...a),w=new THREE.Vector3(...b),d=w.clone().sub(v);const mesh=cylinder(parent,r,r,d.length(),mat,...v.clone().add(w).multiplyScalar(.5).toArray(),8);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return mesh}
function mark(mesh,i){mesh.userData.station=i;clickable.push(mesh);return mesh}
function textPanel(str,w=6,h=.75,accent='#ffbf69'){const c=document.createElement('canvas');c.width=1024;c.height=144;const q=c.getContext('2d');q.fillStyle='#0b1a22';q.fillRect(0,0,1024,144);q.fillStyle=accent;q.fillRect(0,0,14,144);q.fillStyle='#d6eff1';q.font='bold 58px system-ui';q.fillText(str,35,91,950);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));return m}
function hazard(parent,x,y,z,w,d){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);for(let i=0;i<Math.floor(w/.75);i++){const s=box(g,.4,.025,d,M.yellow,-w/2+i*.75,0,0);s.rotation.y=-.5}return g}
function tower(parent,x,z,h=12){box(parent,2.8,h,2.8,M.wall,x,h/2,z);for(let k=1;k<4;k++)box(parent,3.1,.25,3.1,M.orange,x,h*k/4,z);box(parent,4,.6,4,M.roof,x,h+.1,z);for(let k=0;k<4;k++){const a=k*Math.PI/2;box(parent,.24,2,.6,M.glass,x+1.43*Math.cos(a),h-2,z+1.43*Math.sin(a))}}
function createGround(){box(scene,86,2.5,70,M.base,0,-2.3,0);box(scene,83,.35,67,M.floor,0,-.9,0);for(let x=-40;x<=40;x+=4)box(scene,.035,.012,65,M.edge,x,-.7,0);for(let z=-32;z<=32;z+=4)box(scene,81,.012,.035,M.edge,0,-.7,z);
 // A finite physical world: no ghost/translucent border buildings.
 for(let i=0;i<26;i++){const x=(i*17.7%115)-57,z=(i*29.3%94)-47;if(Math.abs(x)<44&&Math.abs(z)<37)continue;const r=1.2+i%4;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),M.rock);rock.position.set(x,-1.6,z);rock.rotation.set(i*.2,i*.7,0);scene.add(rock)}
 for(let x of [-41,41])for(let z of [-32,32]){box(scene,1.2,3,1.2,M.orange,x,.8,z);box(scene,1.5,.35,1.5,M.yellow,x,2.4,z)}
 for(let z of [-31,31]){box(scene,82,1.3,.5,M.wall,0,-.05,z);for(let x=-39;x<40;x+=5){box(scene,.2,1.3,.2,M.edge,x,.9,z);box(scene,5,.13,.13,M.yellow,x+2.5,1.35,z)}}
 for(let x of [-40,40]){box(scene,.5,1.3,62,M.wall,x,-.05,0);for(let z=-28;z<29;z+=5)box(scene,.14,1.5,.14,M.orange,x,1,z)}
}
function createStructure(){// Factory skeleton, overhead bridges and varied silhouettes
 for(let x of [-35,-18,0,18,35])for(let z of [-27,10,27]){box(scene,.8,17,.8,M.edge,x,7.5,z);box(scene,1.8,.6,1.8,M.orange,x,15.9,z)}
 for(let z of [-27,10,27]){box(scene,72,.75,.8,M.wall,0,16.4,z);box(scene,72,.15,.15,M.orange,0,16.95,z)}
 for(let x of [-35,35]){box(scene,.8,.7,55,M.wall,x,16.4,0)}
 // Raised catwalks with railings, steps, support and open views
 box(scene,75,.45,2.3,M.edge,0,9.2,10);for(let x=-36;x<37;x+=3){box(scene,.14,1.8,.14,M.yellow,x,10.3,8.8);box(scene,.14,1.8,.14,M.yellow,x,10.3,11.2)}for(let z of [8.8,11.2])box(scene,74,.13,.13,M.yellow,0,11.2,z);
 for(let x of [-35,35]){box(scene,2.4,.5,38,M.edge,x,9.2,-9);for(let z=-27;z<10;z+=3){box(scene,.13,1.5,.13,M.yellow,x-1.2,10.1,z);box(scene,.13,1.5,.13,M.yellow,x+1.2,10.1,z)}}
 // Iconic crane bridge and movable trolley
 box(scene,68,1.3,1.6,M.orange,0,19,-7);for(let x=-33;x<34;x+=5)box(scene,.18,.9,1.8,M.yellow,x,19,-7);const trolley=new THREE.Group();scene.add(trolley);box(trolley,3,2.1,3,M.dark,0,18.5,-7);box(trolley,2,.5,2,M.yellow,0,17,-7);pipe(trolley,[0,17,-7],[0,12,-7],.16,M.edge);cylinder(trolley,.85,.85,.4,M.orange,0,11.8,-7);moving.push(t=>{trolley.position.x=Math.sin(t*.17)*22});
 // Large smoke/exhaust stacks
 for(const [x,z,h] of [[-38,-18,21],[38,-21,25],[38,23,18]]){cylinder(scene,1.7,2.1,h,M.wall,x,h/2,z);for(let y=3;y<h;y+=5)cylinder(scene,1.86,1.86,.35,M.orange,x,y,z);cylinder(scene,2.1,2.1,.7,M.dark,x,h,z)}
 // Exterior mechanical vents
 for(let x=-30;x<32;x+=12){box(scene,7,1.6,3,M.roof,x,13,-28);for(let j=-2;j<=2;j++)box(scene,.65,1.8,.15,M.edge,x+j,13,-26.4)}
}
function conveyor(a,b,y=1.15,width=2.3){const v=new THREE.Vector3(a[0],y,a[1]),w=new THREE.Vector3(b[0],y,b[1]);const dir=w.clone().sub(v),len=dir.length(),g=new THREE.Group();g.position.copy(v.clone().add(w).multiplyScalar(.5));g.rotation.y=-Math.atan2(dir.z,dir.x);scene.add(g);box(g,len,.6,width,M.dark,0,0,0);box(g,len,.08,width*.7,M.black,0,.37,0);for(const z of [-width/2,width/2]){box(g,len,.28,.13,M.orange,0,.5,z);for(let x=-len/2;x<len/2;x+=1.2)box(g,.13,.07,.13,M.yellow,x,.64,z)}for(let x=-len/2+1;x<len/2;x+=4){box(g,.25,1.25,.25,M.edge,x,-.95,-width*.35);box(g,.25,1.25,.25,M.edge,x,-.95,width*.35)}const cargo=[];for(let i=0;i<Math.min(5,Math.ceil(len/6));i++){const p=new THREE.Group();g.add(p);box(p,.95,.6,.9,M.orange,0,.83,0);box(p,.7,.12,.7,M.cyan,0,1.2,0);cargo.push(p)}belts.push(t=>cargo.forEach((p,i)=>{p.position.x=-len/2+((t*2.3+i*len/cargo.length)%len)}));return g}
function robot(parent,color,variant){const g=new THREE.Group();parent.add(g);const paint=material(color,.5,.38);cylinder(g,1.05,1.3,.65,M.dark,0,.38,0);box(g,1.7,1.7,1.25,paint,0,1.6,0);box(g,1.2,.95,1.05,M.wall,0,2.95,0);box(g,1,.32,.15,M.cyan,0,3.03,.6);for(const s of [-1,1]){cylinder(g,.38,.38,.42,M.orange,s*1.12,2.15,0);const arm=new THREE.Group();arm.position.set(s*1.17,2.1,0);g.add(arm);box(arm,.43,1.3,.44,M.edge,0,-.7,.15);cylinder(arm,.33,.33,.4,paint,0,-1.42,.2);box(arm,.5,.8,.42,M.dark,0,-1.82,.35);moving.push(t=>arm.rotation.x=Math.sin(t*1.5+variant+s)*.35)}if(variant%3===0){pipe(g,[0,3.5,0],[0,4.9,0],.14,M.edge);cylinder(g,.42,.42,.4,M.cyan,0,5,0)}if(variant%3===1){box(g,1.4,.2,1,M.glass,0,3.65,.7)}if(variant%3===2){cylinder(g,.75,.75,.3,M.orange,0,3.8,0)}moving.push(t=>{g.position.y=.09*Math.sin(t*1.3+variant);g.rotation.y=.13*Math.sin(t*.55+variant)});return g}
function machine(g,i,color){const accent=material(color,.35,.48,.2);const kind=i%6;
 if(kind===0){ // intake sorter with scanning arch
  box(g,6,.8,2.6,M.dark,0,.8,-1);for(let x of [-2.5,2.5])box(g,.5,5,.5,accent,x,3,-1);box(g,5.5,.6,.8,accent,0,5.6,-1);box(g,2.8,2.3,1.1,M.glass,0,3,-1);
 }else if(kind===1){ // optics / laboratory
  cylinder(g,2.3,2.5,1,M.edge,0,1.15,-1);const globe=new THREE.Mesh(new THREE.IcosahedronGeometry(1.35,1),new THREE.MeshStandardMaterial({color,wireframe:true,emissive:color,emissiveIntensity:.4}));globe.position.set(0,3.1,-1);g.add(globe);moving.push(t=>{globe.rotation.y=t*.4;globe.position.y=3.1+Math.sin(t)*.25});
 }else if(kind===2){ // forging press
  box(g,5,1.3,3,M.dark,0,1,-1);for(let x of [-2.1,2.1])box(g,.7,5,.8,M.edge,x,3,-1);box(g,5,.8,3,M.orange,0,5.5,-1);const press=box(g,3,.8,2,accent,0,3.8,-1);moving.push(t=>press.position.y=3.7+Math.abs(Math.sin(t*.9))*.9);
 }else if(kind===3){ // milling turbine
  cylinder(g,2.4,2.4,1.5,M.dark,0,1.3,-1);const wheel=new THREE.Group();wheel.position.set(0,3.4,-1);g.add(wheel);cylinder(wheel,1.5,1.5,.6,accent);for(let j=0;j<8;j++){const a=j*Math.PI/4;box(wheel,.35,1.4,.6,M.edge,Math.cos(a)*1.3,Math.sin(a)*1.3,0)}wheel.rotation.x=Math.PI/2;moving.push(t=>wheel.rotation.z=t*.8);
 }else if(kind===4){ // test chamber
  box(g,5,1.4,4,M.dark,0,1.1,-1);cylinder(g,2,2,3,M.wall,0,3.1,-1);cylinder(g,2.1,2.1,.45,accent,0,4.7,-1);const core=new THREE.Mesh(new THREE.OctahedronGeometry(1.15),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.6,roughness:.2}));core.position.set(0,3.1,-1);g.add(core);moving.push(t=>core.rotation.set(t*.3,t*.65,0));
 }else{ // safety cage / storage
  box(g,5,4.5,3,M.wall,0,2.4,-1);for(let j=-2;j<=2;j++)box(g,.1,3.8,.15,accent,j,2.6,.55);box(g,5,.45,.8,M.orange,0,4.7,.5);for(let j=-1;j<=1;j++)box(g,1.2,.5,1,M.dark,j*1.4,1.6,1);
 }
}
function buildStation(a,i){const [id,name,role,x,z,color]=a;const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const wide=i===7||i===4||i===11?12:11;const depth=i===7||i===11?14:12;const tall=i===7?17:i===11?14:i===4?12:9;
 mark(box(g,wide,.8,depth,M.dark,0,-.15,0),i);hazard(g,0,.32,depth/2-.5,wide-1,.7);
 // Workshop shell: opaque walls, open front and roof silhouettes, no transparent perimeter buildings.
 for(const s of [-1,1]){mark(box(g,.6,tall,.7,M.edge,s*(wide/2-.3),tall/2,depth/2-.35),i);box(g,.5,tall,.5,M.edge,s*(wide/2-.3),tall/2,-depth/2+.35);box(g,.6,.55,depth,M.wall,s*(wide/2-.3),tall-.3,0)}
 box(g,wide,.8,.75,M.orange,0,tall-.3,-depth/2+.3);box(g,wide,.8,.75,M.orange,0,tall-.3,depth/2-.3);
 // Industrial asymmetrical roof and overhang, leaving machinery visible
 box(g,wide+.7,.6,depth*.43,M.roof,0,tall+.3,-depth*.27);for(let j=-2;j<=2;j++)box(g,.15,.16,depth*.43,M.edge,j*2,tall+.7,-depth*.27);
 for(let s of [-1,1]){box(g,.25,tall*.7,.25,M.orange,s*(wide/2-.35),tall*.42,depth/2-.3);box(g,wide/2,.15,.15,M.yellow,s*wide/4,tall-1.2,depth/2+.1)}
 const sign=textPanel(id+'   '+name,wide-1,.9,'#ffbf69');sign.position.set(0,tall-1.35,depth/2+.18);g.add(sign);
 // Platform, industrial details and work robot
 mark(box(g,wide-1,.4,depth-2,M.floor,0,.45,-.5),i);machine(g,i,color);const bot=robot(g,color,i);bot.position.set(wide/2-2.15,.65,depth/2-2.6);
 const console=box(g,1.8,1.4,.8,M.black,-wide/2+1.6,1.55,depth/2-2);mark(console,i);box(g,1.5,.85,.1,M.glass,-wide/2+1.6,2.1,depth/2-1.55);
 // Vary station skylines with tanks, chimneys and roof vents
 if(i%2===0){cylinder(g,1.1,1.1,3.5,M.edge,-wide/2+2,tall+2,-depth/2+1.8);cylinder(g,1.35,1.35,.4,M.orange,-wide/2+2,tall+3.8,-depth/2+1.8)}else{box(g,3,2.1,2.4,M.wall,wide/2-2,tall+1,-depth/2+2);for(let j=-1;j<=1;j++)box(g,.3,1.5,.15,M.edge,wide/2-2+j*.75,tall+1,-depth/2+3.25)}
 const beacon=new THREE.Mesh(new THREE.SphereGeometry(.23,8,6),new THREE.MeshBasicMaterial({color}));beacon.position.set(-wide/2+.8,tall+.1,depth/2-.8);g.add(beacon);moving.push(t=>beacon.scale.setScalar(.85+.2*Math.sin(t*2+i)));
 stations.push({g,a,bot,beacon});
}
function environment(){scene.background=new THREE.Color(0x102332);scene.fog=new THREE.FogExp2(0x102332,.0045);scene.add(new THREE.HemisphereLight(0xc1e8fa,0x32422f,2.4));const sun=new THREE.DirectionalLight(0xffe3b0,3);sun.position.set(-34,60,20);sun.castShadow=!isMobile;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-55;sun.shadow.camera.right=55;sun.shadow.camera.top=50;sun.shadow.camera.bottom=-50;sun.shadow.bias=-.0004;scene.add(sun);const cool=new THREE.PointLight(0x28c8f9,75,80);cool.position.set(0,18,4);scene.add(cool);const amber=new THREE.PointLight(0xff9c47,75,65);amber.position.set(-20,12,-12);scene.add(amber);
 createGround();createStructure();agents.forEach(buildStation);
 // Main U-shaped logistics spine and physical connecting conveyors
 conveyor([-33,-10],[34,-10],1.4,2.6);conveyor([-33,11],[34,11],1.4,2.6);conveyor([-33,-10],[-33,11],1.4,2.6);conveyor([34,-10],[34,11],1.4,2.6);
 // Large central power reactor, silhouetted against walkways
 cylinder(scene,4.3,5.2,2,M.dark,0,1.5,-8);cylinder(scene,2.8,3.3,8,M.wall,0,6,-8);for(let y=3;y<10;y+=2)cylinder(scene,3.15,3.15,.25,M.orange,0,y,-8);const core=cylinder(scene,1.7,1.7,7,M.glass,0,6,-8);moving.push(t=>{core.rotation.y=t*.4});
 // Rotating roof ventilation fans
 for(const [x,z] of [[-24,-27],[21,-27],[-25,27],[24,27]]){const g=new THREE.Group();g.position.set(x,13,z);scene.add(g);cylinder(g,2.5,2.5,.4,M.dark);for(let i=0;i<6;i++){const b=box(g,2,.12,.65,M.edge,1,0,0);b.rotation.y=i*Math.PI/3}moving.push(t=>g.rotation.y=t*.5)}
 // Cable trunks and overhead service lines
 for(const x of [-18,18]){pipe(scene,[x,15,-26],[x,15,26],.19,M.orange);for(let z=-24;z<=24;z+=8)pipe(scene,[x,15,z],[x,13,z],.1,M.edge)}
}
function setInspector(i){selected=i;const a=agents[i];$('#inspector').classList.remove('hidden');$('#agent-title').textContent=a[0]+' · '+a[1];$('#agent-role').textContent=a[2];$('#agent-state').textContent=a[6];$('#agent-decision').textContent=a[7];$('#agent-metric').textContent=a[8];$('#selected-name').textContent=a[0];focus(new THREE.Vector3(a[3]+13,15,a[4]+16),new THREE.Vector3(a[3],3.5,a[4]));}
function focus(pos,target){focusTween={fromPos:camera.position.clone(),toPos:pos,fromTarget:controls.target.clone(),toTarget:target,t:0}}
function overview(){selected=-1;$('#inspector').classList.add('hidden');$('#selected-name').textContent='OVERVIEW';focus(new THREE.Vector3(65,57,69),new THREE.Vector3(0,3,0))}
function init(){scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(47,1,.1,400);camera.position.set(65,57,69);renderer=new THREE.WebGLRenderer({canvas,antialias:!isMobile,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,isMobile?1.25:1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.65;renderer.shadowMap.enabled=!isMobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.07;controls.target.set(0,3,0);controls.minDistance=8;controls.maxDistance=160;controls.maxPolarAngle=Math.PI*.49;controls.enablePan=true;controls.update();environment();clock=new THREE.Clock();const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
 canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>9)return;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(clickable,false);if(hits.length)setInspector(hits[0].object.userData.station)});
 $('#play').onclick=()=>{playing=true;lastEvent=clock.getElapsedTime();$('#status').textContent='RUNNING · DEMO ONLY'};$('#stop').onclick=()=>{playing=false;$('#status').textContent='STOPPED · NO TRADES PLACED'};$('#reset').onclick=overview;$('#overview').onclick=overview;$('#close').onclick=()=>$('#inspector').classList.add('hidden');
 function resize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();loading.style.display='none';
 let frames=0;function frame(){requestAnimationFrame(frame);const t=clock.getElapsedTime();if(focusTween){focusTween.t=Math.min(1,focusTween.t+.032);const v=1-Math.pow(1-focusTween.t,3);camera.position.lerpVectors(focusTween.fromPos,focusTween.toPos,v);controls.target.lerpVectors(focusTween.fromTarget,focusTween.toTarget,v);if(focusTween.t>=1)focusTween=null}if(!reducedMotion){for(const fn of moving)fn(t);for(const fn of belts)fn(t)}controls.update();if(playing&&t-lastEvent>1.55){lastEvent=t;eventCount++;$('#events').textContent=eventCount;const a=agents[(eventCount-1)%agents.length];$('#status').textContent='DEMO EVENT '+eventCount+' · '+a[0]+' · NO LIVE TRADES'}renderer.render(scene,camera)}frame();}
try{init()}catch(error){console.error('Foundry startup failed',error);loading.style.display='grid';loading.style.color='#ff766e';loading.textContent='FOUNDRY ERROR: '+(error?.message||'Unable to start WebGL')}
