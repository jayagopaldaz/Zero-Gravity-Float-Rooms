var ipAndPort='http://192.168.0.11:8081';
var pause=false;
var loaded=0;
var winW,winH;
var renderer;
var foundation;
var bubbleStage, insideStage, inside;

document.onselectstart=function(){ return false; };
window.onfocus=function(){ pause=false; }
window.onblur=function(){ pause=true; }

setInterval(function(){
  req();
  for(t=0; t<dataObj.tank.length; t++){
    temp=dataObj.tank[t].temp;
    m=dataObj.tank[t].min;
    s=dataObj.tank[t].sec;
    if(temp!="null") tempN=parseFloat(temp/10);
    else tempN=0;

    s$=s<10 ? "0"+s : s; 
    if(m+s>0) timeN=m+":"+s$
    else timeN=false;
    tank[t].setData(timeN,tempN.toPrecision(3)+"°F");
  }
  if(insideTank!=-1){
    if(!tank[insideTank].time) tankTimes.setText("NOT IN USE");
    else tankTimes.setText(tank[insideTank].time+" • 12:04 PM");
    tankTemp.setText(tank[insideTank].temp);
  }
}, 500);


window.onload=init;

var tank=[];
var nameList=["SERENITY","HARMONY","TRANQUILITY","AWARENESS"];
var maxTanks=4;
function init(){
  var imageAssets=[
    "bg.jpg",
    "logo.png",
    "gear.png",
    "help.png"
  ];
  
  loader=new PIXI.AssetLoader(imageAssets);
  loader.onAssetLoaded = function(){
    loaded++;
    if(loaded==loader.loadCount){
      initStage();
      for(t=0; t<maxTanks; t++){ tank[t] = new Tank(nameList[t]); }
      main();
    }
  }
  loader.load();
}
  
var theta={};
var baseTime=new Date();
theta.t=theta.tx=theta.ty=0;

function bobble(){
  var curTime=new Date();
  curTime-=baseTime;
  theta.t=.00002*curTime;
  theta.tx=.002*curTime;
  theta.ty=.005*curTime;
  for(t=0; t<maxTanks; t++){
    x=winH*.36*Math.cos(theta.t+Math.PI*2/maxTanks*t)+1*Math.cos(theta.tx+t);
    y=winH*.36*Math.sin(theta.t+Math.PI*2/maxTanks*t)+1*Math.sin(theta.ty+t);
    tank[t].move(x,y);
    try{ tank[t].el.light.alpha=tank[t].el.light.alpha*.95+dataObj.tank[t].light*.05; } catch(e){}
    try{ tank[t].alertStrength=tank[t].alertStrength*.95+dataObj.tank[t].alert*.05; } catch(e){}
    tank[t].el.tint=alertColorCode(tank[t].alertStrength);
    tank[t].el.tankName.style.fill=whitenText(tank[t].alertStrength,"1c677c");
    tank[t].el.useText.style.fill=whitenText(tank[t].alertStrength,"6a7d82");
    tank[t].el.lUse.style.fill=whitenText(tank[t].alertStrength,"6a7d82");
    tank[t].el.rUse.style.fill=whitenText(tank[t].alertStrength,"6a7d82");
    tank[t].el.tankName.setStyle(tank[t].el.tankName.style);
    tank[t].el.useText.setStyle(tank[t].el.useText.style);
    tank[t].el.lUse.setStyle(tank[t].el.lUse.style);
    tank[t].el.rUse.setStyle(tank[t].el.rUse.style);
    tank[t].el.shadow.alpha=1-tank[t].el.light.alpha;
  }
}

function alertColorCode(n){
  n=Math.floor((1-n)*255);
  gb=n.toString(16);
  if(gb.length==1) gb="0"+gb;
  return '0xff'+gb+gb;
}

function whitenText(n,src){
  r=parseInt(src.substr(0,2),16);
  g=parseInt(src.substr(2,2),16);
  b=parseInt(src.substr(4,2),16);
  r=Math.round(r+(255-r)*n);
  g=Math.round(g+(255-g)*n);
  b=Math.round(b+(255-b)*n);
  r=r.toString(16);
  g=g.toString(16);
  b=b.toString(16);
  return "#"+r+g+b;
}

var lastTank=-1;
function entrance(){
  if(insideTank==-1 && lastTank==-1) return;
  var curTime2=new Date();
  curTime2-=clickTime;
  me=tank[insideTank];
  function logistic(x){ return 9/(1+Math.pow(2.718,(80-x)/10)); }
  s=logistic(.2*curTime2);
  
  if(insideTank==-1){ s=9-s; me=tank[lastTank]; }
  
  x=me.x*(1-s/9);
  y=me.y*(1-s/9);
  me.el.tankName.alpha=1-s/3;
  me.el.useText.alpha=1-s/3;
  me.el.lUse.alpha=1-s/3;
  me.el.rUse.alpha=1-s/3;
  me.el.x=x;
  me.el.y=y;
  me.el.scale={x:s+1,y:s+1};
  me.el.alpha=1-s/9;
  inside.x=x;
  inside.y=y;
  inside.scale={x:(s+1)*280/150,y:(s+1)*280/150};
  inside.alpha=s/9;
  if(inside.alpha<.01) inside.visible=false;
  else inside.visible=true;
  for(i=1,j=insideStage.children.length;i<j;i++){
    me=insideStage.children[i];
    me.alpha=s/3;
    if(me.alpha>1) me.alpha=1;
    me.scale={x:s/9,y:s/9};
    me.position={x:x+me.posTarg.x*s/9,y:y+me.posTarg.y*s/9};
  }
}

function main(){
  if(!pause){
    bobble();
    entrance();
    if(foundation) renderer.render(foundation);
  }
  requestAnimFrame(main);
}


function initStage(){
  winW=2048;
  winH=1536;
  renderer = new PIXI.CanvasRenderer(winW, winH);
  renderer.view.style.position = "absolute";
  document.body.appendChild(renderer.view);
  foundation = new PIXI.Stage(0xFFFFFF, true);
  bubbleStage = new PIXI.DisplayObjectContainer();
  insideStage = new PIXI.DisplayObjectContainer();
  bubbleStage.position={x:Math.round(winW/2),y:Math.round(winH/2)};
  insideStage.position=bubbleStage.position;
    
  bg=PIXI.Sprite.fromImage("bg.jpg");
  bg.width=winW;
  bg.scale.y=bg.scale.x;
  bg.alpha=1;
    
  logo=PIXI.Sprite.fromImage("logo.png");
  logo.position={x:winW/2,y:winH/2};
  logo.anchor={x:.5,y:.5};
  logo.interactive=true;
  logo.dblTap=-1;
  logo.click=logo.tap=function(){
    now=new Date();
    if(this.dblTap==-1){ this.dblTap=new Date(); return; }
    else if(now-this.dblTap>200){ this.dblTap=-1; return; }
    ipAndPort=prompt("AJAX Server IP & Port:","192.168.0.11:8081");
  }
  
  inside=PIXI.Sprite.fromImage("white.png");
  inside.alpha=0;
  inside.visible=false;
  inside.anchor={x:.5,y:.5};
  inside.interactive=true;
  inside.click=inside.tap=function(){
    if(inside.alpha<.99) return;
    lastTank=insideTank;
    insideTank=-1;
    clickTime=new Date();
  }

  vOffset=-250;
  tankName=new PIXI.Text("TEMPORARY", {font:'bold 110px TeluguMN', fill:'#1c677c', align:'center'});
  tankName.posTarg={x:0,y:vOffset};
  tankName.anchor={x:.5,y:1};
  tankName.alpha=0;
  
  tankTimes=new PIXI.Text("14:23 • 12:34 PM", {font:'28px Helvetica', fill:'#888888', align:'left'});
  tankTimes.posTarg={x:0,y:vOffset};
  tankTimes.anchor={x:0,y:0};
  tankTimes.alpha=0;

  tankTemp=new PIXI.Text("98°F", {font:'28px Helvetica', fill:'#888888', align:'right'});
  tankTemp.posTarg={x:0,y:vOffset};
  tankTemp.anchor={x:1,y:0};
  tankTemp.alpha=0;

  button=[];
  bText=["60 MINUTE","90 MINUTE","CUSTOM"];
  for(i=0;i<3;i++){
    button[i]=PIXI.Sprite.fromImage("shadow.png");
    button[i].posTarg={x:400*(i-1),y:0};
    button[i].anchor={x:.5,y:.5};
    button[i].alpha=0;
    button[i].text=new PIXI.Text(bText[i]+"\nFLOAT", {font:'bold 30px TeluguMN', fill:'#5395a7', align:'center'});
    button[i].text.anchor={x:.5,y:.5};
    button[i].addChild(button[i].text);
  }
  
  gear=PIXI.Sprite.fromImage("gear.png");
  gear.posTarg={x:-winW/2+150,y:winH/2-150};
  gear.anchor={x:.5,y:.5};
  gear.alpha=0;
  
  help=PIXI.Sprite.fromImage("help.png");
  help.posTarg={x:winW/2-150,y:winH/2-150};
  help.anchor={x:.5,y:.5};
  help.alpha=0;

  foundation.addChild(bg);
  foundation.addChild(logo);
  foundation.addChild(bubbleStage);
  foundation.addChild(insideStage);
  
  insideStage.addChild(inside);
  insideStage.addChild(tankName);
  insideStage.addChild(tankTimes);
  insideStage.addChild(tankTemp);
  for(i=0;i<3;i++){ insideStage.addChild(button[i]); }
  insideStage.addChild(gear);
  insideStage.addChild(help);
   
  bubbleStage.interactive = true;
  insideStage.interactive = true;
}

var inside;
var insideTank=-1;
var zoom=0;
var clickTime;
function Tank(name){
  this.x=0;
  this.y=0;
  this.n=tank.length;
  this.name=name;
  this.temp=0;
  this.time=0;
  this.alertStrength=0;
  
  this.el=PIXI.Sprite.fromImage("bubble.png");
  this.el.anchor={x:.5,y:.5};
  this.el.shadow=new PIXI.Sprite.fromImage("shadow.png");
  this.el.light=new PIXI.Sprite.fromImage("glow.png");
  this.el.tankName=new PIXI.Text(name, {font:'bold 30px TeluguMN', fill:'#1c677c', align:'center'});
  this.el.useText=new PIXI.Text("NOT IN USE", {font:'20px Helvetica', fill:'#6a7d82', align:'center'});
  this.el.lUse=new PIXI.Text("", {font:'20px Helvetica', fill:'#6a7d82', align:'left'});
  this.el.rUse=new PIXI.Text("", {font:'20px Helvetica', fill:'#6a7d82', align:'right'});
  this.el.shadow.anchor={x:.5,y:.5};
  this.el.light.anchor={x:.5,y:.5};
  this.el.tankName.anchor={x:.5,y:1};
  this.el.useText.anchor={x:.5,y:0};
  this.el.lUse.anchor={x:0,y:0}; this.el.lUse.x=-100;
  this.el.rUse.anchor={x:1,y:0}; this.el.rUse.x= 100;
  this.el.addChild(this.el.shadow);
  this.el.addChild(this.el.light);
  this.el.addChild(this.el.tankName);
  this.el.addChild(this.el.useText);
  this.el.addChild(this.el.lUse);
  this.el.addChild(this.el.rUse);
  this.el.interactive=true;
  bubbleStage.addChild(this.el);
  this.el.n=this.n;
  this.el.click=this.el.tap=function(){
    tankName.setText(tank[this.n].name);
    tnw=this.tankName.width/30*110;
    tankTimes.posTarg.x=-tnw/2;
    tankTemp.posTarg.x=tnw/2;
    tankTimes.setText(tank[this.n].time+" • 12:34 PM");
    tankTemp.setText(tank[this.n].temp);
    clickTime=new Date();
    insideTank=this.n;
  }
  
  this.move=function(x,y){
    this.x=this.el.x=x;
    this.y=this.el.y=y;
    if(insideTank==this.n) return;
  }
  
  this.setData=function(time,temp){
    this.time=time;
    this.temp=temp;
    if(time==false){ this.el.useText.setText("NOT IN USE"); this.el.lUse.setText(""); this.el.rUse.setText(""); }
    else{ this.el.useText.setText(""); this.el.lUse.setText(time); this.el.rUse.setText(temp); }
  }
}

var dataObj = {tank:[]};
var debug;
var startDate=new Date();
function req(){
  var xh=new XMLHttpRequest();
  xh.onreadystatechange=function(){
    var t=new Date();
    if(xh.readyState==4){ 
      if(xh.status==200 || xh.status==0){
        dataObj=JSON.parse(xh.responseText);
      }
    }
  }
  xh.ontimeout = function(ev) { debug.innerHTML='Timeout'; };
  xh.open('GET', ipAndPort, true);
  xh.send();
}