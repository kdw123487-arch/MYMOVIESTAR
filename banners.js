/* My Movie Star — 배너 그림
   상세 페이지 배너(1600×640)와, 포스터 사진이 없을 때의 대체 포스터(480×720)를 캔버스에 그린다.
   SCENES["r:키"]가 있으면 그 작품 전용 배너, 없으면 엑셀 '문양' 칸(m)의 기본 문양을 쓴다.
   index.html보다 먼저 불러온다(index.html의 paint() 호출이 여기 정의된 함수를 쓴다). */
/* ---------- painted fallback art ---------- */
function hash(s){let h=7;for(const ch of String(s))h=(h*31+ch.codePointAt(0))%100003;return h}
/* every film has 배경색/포인트색, so bannerPal() always supplies the palette; this one is only a safety net */
const PAL0=["#c9a46a","#2a1a12","#050302"];
function look(f){return{seed:hash(f.key||f.ko),pal:PAL0,m:f.m||"waves"}}
/* ---------- per-film banner scenes: one simple emblem drawn from each film's own imagery, in the film's colours ---------- */
function sceneKit(x,W,H,cx,cy,r,[a,b,c],pal){
  const u=Math.min(W,H)*.5,ice=pal?.ice?.[3]||b;
  const D={x,W,H,cx,cy,u,r,a,b,c,ice,w:pal?.wall||b,h:pal?.hole||c,l:pal?.line||a};
  D.cir=(px,py,rr,col,al=1)=>{x.globalAlpha=al;x.fillStyle=col;x.beginPath();x.arc(px,py,rr,0,7);x.fill()};
  D.ring=(px,py,rr,col,lw=2,al=1)=>{x.globalAlpha=al;x.strokeStyle=col;x.lineWidth=lw;x.beginPath();x.arc(px,py,rr,0,7);x.stroke()};
  D.rect=(px,py,w,h,col,al=1)=>{x.globalAlpha=al;x.fillStyle=col;x.fillRect(px,py,w,h)};
  D.poly=(p,col,al=1)=>{x.globalAlpha=al;x.fillStyle=col;x.beginPath();p.forEach(([px,py],i)=>i?x.lineTo(px,py):x.moveTo(px,py));x.closePath();x.fill()};
  D.ln=(x1,y1,x2,y2,col,lw=2,al=1)=>{x.globalAlpha=al;x.strokeStyle=col;x.lineWidth=lw;x.lineCap="round";x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke()};
  D.ell=(px,py,rx,ry,col,al=1,rot=0,lw=0)=>{x.globalAlpha=al;x.beginPath();x.ellipse(px,py,rx,ry,rot,0,7);if(lw){x.strokeStyle=col;x.lineWidth=lw;x.stroke()}else{x.fillStyle=col;x.fill()}};
  D.hill=(y0,amp,col,al=1,fr=1,ph=0)=>{x.globalAlpha=al;x.fillStyle=col;x.beginPath();x.moveTo(0,H);for(let t=0;t<=W;t+=6)x.lineTo(t,y0-amp*(Math.sin(t/W*fr*6.28+ph)*.5+.5+Math.sin(t/W*fr*15+ph*2)*.15));x.lineTo(W,H);x.fill()};
  D.glow=(px,py,rr,col,al=.4)=>{for(let i=0;i<8;i++)D.cir(px,py,rr*(1-i/8),col,al/6)};
  D.stars=(n,ymax,al=.6)=>{for(let i=0;i<n;i++)D.cir(r()*W,r()*ymax,.6+r()*1.5,ice,al*(.4+r()*.6))};
  return D}
const SCENES={
"r:spider-man-into-the-spider-verse":d=>{const{cir,W,H,a}=d,st=Math.max(10,W/110);
  for(let yy=st/2;yy<H;yy+=st)for(let xx=(yy/st%2)*st/2;xx<W;xx+=st){const t=Math.max(0,(xx/W*.9+(1-yy/H)*.6)-.45);if(t>0)cir(xx,yy,Math.min(st*.48,t*st*.75),a,.45)}},
"r:the-power-of-the-dog":d=>{const{hill,cir,cx,cy,u,H,a,w,h}=d;cir(cx+u*.9,cy-u*.35,u*.2,a,.35);
  hill(H*.58,H*.28,a,.22,.8,1);hill(H*.68,H*.22,w,.8,1.1,3);hill(H*.8,H*.12,h,1,1.6,5)},
"r:the-trial-of-the-chicago-7":d=>{const{rect,cx,u,W,H,a,l}=d,w=u*.2,st=u*.4,n=Math.ceil(W/st)+2;
  for(let i=-n;i<=n;i++){const px=cx+i*st-w/2,f=Math.max(0,1-Math.abs(px+w/2-cx)/(W*.5)),al=Math.pow(f,1.3)*.85;if(al<.02)continue;rect(px,0,w,H,a,al*.75)}},
"r:whiplash":d=>{const{x,cy,u,W,a,l,w}=d,hits=[.14,.36,.54,.68,.79,.87];
  x.lineJoin="round";x.globalAlpha=.9;x.strokeStyle=a;x.lineWidth=2;x.beginPath();x.moveTo(0,cy);
  hits.forEach((p,i)=>{const hx=W*p,amp=u*(.22+i*.09),last=i==hits.length-1;x.lineTo(hx,cy);
    for(let k=1;k<=6;k++){x.lineTo(hx+k*u*.025,cy+(k%2?-1:1)*amp*Math.exp(-k*.55))}x.lineTo(hx+u*.17,cy);if(last){x.stroke();x.strokeStyle=l;x.lineWidth=3;x.beginPath();x.moveTo(hx,cy);for(let k=1;k<=6;k++)x.lineTo(hx+k*u*.025,cy+(k%2?-1:1)*amp*1.3*Math.exp(-k*.55));x.lineTo(hx+u*.17,cy);x.stroke();x.strokeStyle=a;x.lineWidth=2;x.beginPath();x.moveTo(hx+u*.17,cy)}});
  x.lineTo(W,cy);x.stroke()},
"r:oppenheimer":d=>{const{x,cir,rect,cx,cy,u,W,H,a,b,h}=d,y0=H*.72;
  [1.15,.8,.5].forEach((k,i)=>{x.globalAlpha=.8-i*.15;x.strokeStyle=a;x.lineWidth=2.5;x.beginPath();x.arc(cx,y0,u*k,Math.PI,0);x.stroke()});
  x.globalAlpha=.95;x.fillStyle=a;x.beginPath();x.arc(cx,y0,u*.28,Math.PI,0);x.fill();rect(0,y0,W,H-y0,h,1)},
"r:spotlight":d=>{const{x,rect,glow,cx,cy,u,W,H,r,a,ice,l}=d,n=W>900?7:3,gap=W/n,cw=gap*.72,L=[],sx=cx+u*.2,sy=cy,R=u*.55;
  for(let c=0;c<n;c++){const x0=gap*c+(gap-cw)/2;for(let y=H*.14,k=0;y<H*.92;y+=u*.065,k++)L.push([x0,y,k%6==5?cw*(.3+r()*.3):cw*(.85+r()*.15)])}
  L.forEach(([lx,ly,lw])=>rect(lx,ly,lw,2,a,.3));glow(sx,sy,R*1.5,ice,.22);
  x.save();x.beginPath();x.arc(sx,sy,R,0,7);x.clip();L.forEach(([lx,ly,lw],i)=>rect(lx,ly,lw,2.5,ice,.85));
  L.filter(([lx,ly])=>Math.hypot(lx+cw*.4-sx,ly-sy)<R*.6).slice(0,3).forEach(([lx,ly,lw])=>rect(lx,ly-1,lw*.6,4.5,l,1));x.restore()},
"r:roma":d=>{const{ell,ln,cx,cy,u,W,H,a,w}=d;
  for(let t=0;t<W;t+=u*.3)ln(t,H*.45,t,H,w,1,.3);for(let y=H*.45;y<H;y+=u*.22)ln(0,y,W,y,w,1,.3);
  for(let i=1;i<6;i++)ell(cx,cy+u*.15,u*.28*i,u*.05*i,a,.9-i*.14,0,2)},
"r:all-quiet-on-the-western-front":d=>{const{x,glow,rect,cir,ln,cx,cy,u,W,H,a,l,ice}=d,hz=H*.74,sx=cx;
  glow(sx,hz,u*1.3,l,.3);
  x.save();x.beginPath();x.rect(0,0,W,hz);x.clip();cir(sx,hz,u*.2,l,.9);
  x.restore();
  rect(0,hz,W,H-hz,a,.2);ln(0,hz,W,hz,a,1.5,.7)},
"r:amelie":d=>{const{cir,glow,cx,cy,u,W,H,a,l}=d,st=u*.16,px=Math.round((cx+u*.3-st/2)/st)*st+st/2,py=Math.round((cy-st/2)/st)*st+st/2;
  for(let y=st/2;y<H;y+=st)for(let t=st/2;t<W;t+=st){if(Math.abs(t-px)<1&&Math.abs(y-py)<1)continue;const dd=Math.hypot(t-cx,y-cy)/(u*1.6);cir(t,y,u*.018,a,Math.max(.08,.55-dd*.35))}
  glow(px,py,u*.3,l,.55);cir(px,py,u*.055,l,1)},
"r:anatomy-of-a-fall":d=>{const{x,ln,ring,cx,u,W,H,a,ice,l}=d,px=cx+u*.9;
  for(let k=0;k<8;k++){const y0=H*(.3+k*.07),amp=u*(.05+k*.012);x.beginPath();for(let t=0;t<=W;t+=6)x.lineTo(t,y0+Math.sin(t/(u*(.9+k*.15))+k)*amp);x.globalAlpha=.18+k*.06;x.strokeStyle=k==7?a:ice;x.lineWidth=1.6;x.stroke()}},
"r:your-name":d=>{const{x,u,W,H,l:line}=d;
  /* 추락의 해부와 같은 물결선, 선 색은 포인트색(주황) */
  for(let k=0;k<8;k++){const y0=H*(.3+k*.07),amp=u*(.05+k*.012);x.beginPath();for(let t=0;t<=W;t+=6)x.lineTo(t,y0+Math.sin(t/(u*(.9+k*.15))+k)*amp);x.globalAlpha=.5+k*.07;x.strokeStyle=line;x.lineWidth=2.4;x.stroke()}},
"r:frankenstein":d=>{const{x,W,H,u,a:line,r}=d,pw=u*.46,ph=u*.32,g=u*.03,cols=Math.ceil(W/(pw+g))+1,rows=Math.ceil(H/(ph+g))+1;
  /* 균일한 사각 패널 격자. 패널마다 투명도만 조금씩 다름 */
  const ox=-((cols*(pw+g)-W)/2),oy=-((rows*(ph+g)-H)/2);x.fillStyle=line;x.strokeStyle=line;x.lineWidth=1;
  for(let rr=0;rr<rows;rr++)for(let cc=0;cc<cols;cc++){const px=ox+cc*(pw+g),py=oy+rr*(ph+g);
    x.globalAlpha=.05+r()*.11;x.fillRect(px,py,pw,ph);x.globalAlpha=.22;x.strokeRect(px+.5,py+.5,pw-1,ph-1)}
  /* 양옆 비네팅 */
  {const v=x.createLinearGradient(0,0,W,0);v.addColorStop(0,"rgba(0,0,0,.5)");v.addColorStop(.28,"rgba(0,0,0,0)");v.addColorStop(.72,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,.5)");x.globalAlpha=1;x.fillStyle=v;x.fillRect(0,0,W,H)}
  x.globalAlpha=1},
"r:mad-max-fury-road":d=>{const{x,cx,cy,u,W,H,a}=d,y0=cy+u*.55,sy=y0-u*.12,R=u*.72;
  /* 레트로 선셋(레퍼런스: 야자수 없는 신스웨이브 태양). 태양은 포인트색 한 가지 */
  x.save();x.beginPath();x.rect(0,0,W,y0);x.clip();
  /* 지평선 쪽 하늘을 같은 색으로 은은하게 밝혀 언덕 실루엣이 드러나게 */
  {const g=x.createLinearGradient(0,y0-u*1.1,0,y0);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,a);x.globalAlpha=.5;x.fillStyle=g;x.fillRect(0,y0-u*1.1,W,u*1.1)}
  /* 빛번짐 */
  {const g=x.createRadialGradient(cx,sy,R*.8,cx,sy,R*2.2);g.addColorStop(0,a);g.addColorStop(1,"rgba(0,0,0,0)");x.globalAlpha=.25;x.fillStyle=g;x.fillRect(0,0,W,y0)}
  x.restore();
  /* 태양: 따로 그린 뒤 줄무늬를 '뚫어서'(배경이 비치게) 얹는다 */
  const c=document.createElement("canvas");c.width=W;c.height=H;const t=c.getContext("2d");
  t.fillStyle=a;t.beginPath();t.arc(cx,sy,R,0,7);t.fill();
  /* 줄무늬: 태양 안에서만 어두운 띠로 또렷하게 */
  t.globalCompositeOperation="source-atop";t.fillStyle="#0c0807";t.globalAlpha=.88;
  {const top=sy-R*.5,n=5,st=(y0-top)/n;for(let i=0;i<n;i++){const hh=st*(.1+i*.07);t.fillRect(0,top+(i+1)*st-hh,W,hh)}}
  t.globalAlpha=1;t.globalCompositeOperation="destination-out";t.fillRect(0,y0,W,H-y0);
  x.globalAlpha=1;x.drawImage(c,0,0);
  /* 지평선의 낮은 언덕 실루엣 */
  x.fillStyle="#070405";
  [[.16,.75,1.1,.9],[.07,1,1.9,2.3]].forEach(([amp,al,fr,ph])=>{x.globalAlpha=al;x.beginPath();x.moveTo(0,H);
    for(let tt=0;tt<=W;tt+=6){const k=tt/W;x.lineTo(tt,y0+u*.02-u*amp*(.55+Math.sin(k*fr*6.28+ph)*.45+Math.sin(k*fr*17+ph*2)*.12))}x.lineTo(W,H);x.fill()});
  /* 비네팅: 가장자리와 아래쪽 */
  x.globalAlpha=1;{const v=x.createRadialGradient(cx,sy,R*.9,cx,sy,Math.hypot(W,H)*.62);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,.65)");x.fillStyle=v;x.fillRect(0,0,W,H)}
  {const v=x.createLinearGradient(0,H*.4,0,H);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(.6,"rgba(0,0,0,.45)");v.addColorStop(1,"rgba(0,0,0,.85)");x.fillStyle=v;x.fillRect(0,H*.4,W,H*.6)}},
"r:inception":d=>{const{x,rect,ln,cx,cy,u,W,H,a}=d,bw=u*.09,gp=u*.035,n=Math.ceil(W/(bw+gp))+1,o=(cx-bw/2)%(bw+gp)-(bw+gp);
  for(let i=0;i<n;i++){const px=o+i*(bw+gp),dx=Math.min(1,Math.abs(px+bw/2-cx)/(Math.min(W/2,u*2.2))),bh=u*(.1+.8*dx**1.6);rect(px,cy-bh,bw,bh,a,.7);rect(px,cy+u*.05,bw,bh,a,.22)}
  ln(0,cy+u*.025,W,cy+u*.025,a,1.5,.8);
  x.globalAlpha=1;[[0,1],[W,-1]].forEach(([x0,dr])=>{const ew=Math.max(0,(W-u*4)/2)+u*.6,g=x.createLinearGradient(x0,0,x0+dr*ew,0);g.addColorStop(0,"rgba(0,0,0,.82)");g.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=g;x.fillRect(dr>0?0:W-ew,0,ew,H)})},
"r:the-dark-knight":d=>{const{x,W,H,u,l:line,r}=d;
  /* 불타는 고담의 밤: 아래에서 번지는 주황 열기, 높이가 다른 가는 수직선(도시의 결)은 포인트색 */
  {const g=x.createLinearGradient(0,H*.8,0,H*.15);g.addColorStop(0,line);g.addColorStop(1,"rgba(0,0,0,0)");x.globalAlpha=.4;x.fillStyle=g;x.fillRect(0,H*.15,W,H*.85)}
  const st=u*.075;x.strokeStyle=line;x.lineWidth=Math.max(1,u*.004);
  for(let px=st*.5;px<W;px+=st){const top=H*(.12+r()*.5);x.globalAlpha=.32+r()*.26;x.beginPath();x.moveTo(px,H);x.lineTo(px,top);x.stroke()}
  x.globalAlpha=1},
"r:interstellar":d=>{const{x,cir,cx,cy,u,W,a}=d;
  for(let k=-5;k<=5;k++){const y0=cy-u*.1+k*u*.16;x.globalAlpha=.85-Math.abs(k)*.12;x.strokeStyle=a;x.lineWidth=k?1.4:2.4;x.beginPath();
    for(let t=0;t<=W;t+=6){const dx=(t-cx)/(u*.55);x.lineTo(t,y0+u*.6*Math.exp(-dx*dx)*(1-Math.abs(k)*.13))}x.stroke()}
  cir(cx,cy+u*.5,u*.045,a,1)},
"r:arrival":d=>{const{x,W,cy,u,a,ice}=d,st=u*.1,n=Math.ceil(W*.75/st);
  [[W*.3,a],[W*.7,ice]].forEach(([sx,c])=>{for(let k=1;k<=n;k++){x.beginPath();x.arc(sx,cy,k*st,0,7);x.globalAlpha=Math.max(0,.75-k/n*.7);x.strokeStyle=c;x.lineWidth=1.6;x.stroke()}})},
"r:gone-girl":d=>{const{x,cir,ln,cx,cy,u,W,H,a,l}=d,R=u*.55,px=W*.6,sh=u*.14;
  x.save();x.beginPath();x.rect(0,0,px,H);x.clip();cir(px,cy,R,a,.7);x.restore();
  x.save();x.beginPath();x.rect(px,0,W,H);x.clip();cir(px,cy+sh,R,l,.45);x.restore();
  ln(px,0,px,H,l,1.5,.3)},
"r:knives-out":d=>{const{poly,W,H,u,a,l,r}=d,n=20;
  for(let i=0;i<n;i++){const x0=W*(i+.2+r()*.6)/n,len=H*(.35+r()*.75),w=u*(.03+r()*.07),sk=u*(.15+r()*.25),al=.12+r()*.35,c=i%6===2?l:a;
    poly([[x0,-4],[x0+w,-4],[x0-sk,len]],c,al)}},
"r:spirited-away":d=>{const{x,rect,ln,W,H,u,a,l}=d,hy=H*.56,px=W*.66;
  x.save();x.filter="blur("+Math.max(3,u*.02)+"px)";
  rect(0,hy-u*.6,W,u*.6,a,.16);rect(px-u*.9,hy-u*.25,u*1.8,u*.25,l,.14);
  for(let i=0;i<15;i++){const y=hy+u*.05+i*u*.05*(1+i*.1),w=u*(1.1-i*.06);rect(px-w/2,y,w,u*.03,i%3?a:l,.95-i*.05)}
  x.restore();ln(0,hy,W,hy,l,2,.55)},
"r:princess-mononoke":d=>{const{x,W,H,u,a}=d;
  /* 원시림의 수관: 겹겹이 포개진 반원(청해파 문양)으로 끝없이 이어지는 숲. 아래 줄일수록 밝게. 배너색 초록 단색 */
  const R=u*.3,dy=R*.5,rows=Math.ceil(H/dy)+2;x.lineWidth=Math.max(1,u*.006);
  for(let j=0;j<rows;j++){const y=j*dy,off=(j%2)*R,t=j/rows;
    for(let px=-R+off;px<W+R*2;px+=R*2){
      for(let k=4;k>=1;k--){x.beginPath();x.arc(px,y,R*k/4,Math.PI,0);x.closePath();
        x.globalAlpha=1;x.fillStyle="#1c1716";x.fill();x.globalAlpha=.22+t*.5;x.strokeStyle=a;x.stroke()}}}
  {const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,"rgba(0,0,0,.5)");g.addColorStop(.3,"rgba(0,0,0,0)");g.addColorStop(.7,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,.5)");x.globalAlpha=1;x.fillStyle=g;x.fillRect(0,0,W,H)}
  x.globalAlpha=1},
"r:guillermo-del-toro-s-pinocchio":d=>{const{ell,cir,cx,cy,u,a}=d;
  for(let i=1;i<13;i++)d.ring(cx,cy,u*.11*i,a,i%3?1.6:3.2,.9-i*.055);cir(cx,cy,u*.05,a,.95)},
"r:coco":d=>{const{x,rect,cir,W,H,u,a,l}=d,n=7,sw=W/n;
  for(let i=0;i<n;i++){const top=H*(.82-i*.115),px=i*sw;rect(px,top,sw*.94,H-top,a,.1+i*.04);
    for(let k=0;k<6;k++)cir(px+sw*(.12+k*.15),top-u*.025,u*.016,l,.45+i*.07)}},
"r:inside-out":d=>{const{x,W,H,u,l:line,r}=d;
  /* 기억 저장소: 화면을 채운 같은 크기의 기억 구슬 격자(원주만), 대부분은 옅고 몇 개만 원주가 밝게 빛남. 포인트 노랑 단색 */
  const R=u*.04,st=u*.14,cols=Math.ceil(W/st)+1,rows=Math.ceil(H/st)+1,ox=(W-(cols-1)*st)/2,oy=(H-(rows-1)*st)/2;
  x.fillStyle=line;x.strokeStyle=line;x.lineWidth=Math.max(2,u*.009);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const px=ox+i*st,py=oy+j*st,on=r()<.05,k=r();
    x.beginPath();x.arc(px,py,R,0,7);
    if(on){x.shadowColor=line;x.shadowBlur=u*.09;x.globalAlpha=.7+k*.3;x.stroke();x.stroke();x.shadowBlur=0}
    else{x.globalAlpha=.1+k*.12;x.stroke()}}
  {const g=x.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H)*.7);g.addColorStop(.4,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,.5)");x.globalAlpha=1;x.fillStyle=g;x.fillRect(0,0,W,H)}
  x.globalAlpha=1},
"r:wall-e":d=>{const{rect,cir,glow,cx,cy,u,W,H,r,a,w}=d,s=u*.085;
  for(let t=0;t<W;t+=s*1.15){const hh=Math.floor(2+5*Math.abs(Math.sin(t/(u*.8)))+r()*3);for(let j=0;j<hh;j++)rect(t,H-(j+1)*s*1.15,s,s,a,.18+r()*.32)}
  glow(cx,cy-u*.2,u*.4,a,.5);cir(cx,cy-u*.2,u*.05,a,1)},
"r:up":d=>{const{x,ln,W,H,u,a,l,r}=d,n=24;x.lineCap="round";
  for(let i=0;i<n;i++){const px=W*(i+.3+r()*.4)/n,len=H*(.35+r()*.65),lw=u*(.02+r()*.045),c=i%4===1?l:a,seg=10;
    for(let k=0;k<seg;k++){const y1=H-len*k/seg,y2=H-len*(k+1)/seg;ln(px,y1,px,y2,c,lw,.8*(1-k/seg))}}},
"r:the-shawshank-redemption":d=>{const{poly,W,H,u,a,l,r}=d,n=14;
  for(let i=0;i<n;i++){const x0=W*(i/n)+r()*u*.2,w=u*(.08+r()*.18),sk=H*.5;poly([[x0,0],[x0+w,0],[x0+w-sk,H],[x0-sk,H]],i%4?a:l,.05+r()*.12)}},
"r:cinema-paradiso":d=>{const{x,poly,rect,W,H,u,a,l,r}=d,sy=H*.3,n=22;
  x.save();x.filter="blur("+Math.max(2,u*.012)+"px)";
  for(let i=0;i<n;i++){const x0=W*.12+W*.9*i/n,x1=x0+W*.9/n+1,t0=(x0-W*.12)/(W*.9),t1=(x1-W*.12)/(W*.9),sp=H*.55;
    poly([[x0,sy-sp*t0*.5],[x1,sy-sp*t1*.5],[x1,sy+sp*t1*.5+H*.2*t1],[x0,sy+sp*t0*.5+H*.2*t0]],i%7===3?l:a,.05+r()*.17)}
  x.restore()},
"r:life-is-beautiful":d=>{const{cir,rect,cx,cy,u,W,H,a,h}=d,y0=cy+u*.62;cir(cx,cy,u*.75,a,.9);rect(0,y0,W,H-y0,h,1);rect(cx-u*.18,y0-u*.2,u*.36,u*.2,h,1)},
"r:back-to-the-future":d=>{const{x,glow,W,H,u,a,l,cx,cy}=d,n=10,ch=Math.min(W,H)*.32,cw=ch*1.5,bw=Math.max(W*1.04-cw,H*1.04-ch)/2/n,fr=i=>{const w=cw+2*(n-i)*bw,h=ch+2*(n-i)*bw;return[cx-w/2,cy-h/2,w,h]};
  /* 맨 안쪽은 정사각형에 가까운 직사각형, 바깥으로 상하좌우 같은 두께의 띠를 둘러 쌓음(화면 밖은 잘림). 각 띠는 안쪽 경계로 갈수록 천천히 어두워짐 */
  for(let i=0;i<=n;i++){const R=fr(i);x.globalAlpha=.13;x.fillStyle=a;x.fillRect(...R);
    if(i<n){const q=fr(i+1);x.save();x.beginPath();x.rect(...R);x.clip();x.filter="blur("+bw*.4+"px)";x.globalAlpha=.3;x.strokeStyle="#000";x.lineWidth=bw*.7;x.strokeRect(q[0]-bw*.25,q[1]-bw*.25,q[2]+bw*.5,q[3]+bw*.5);x.restore()}
    x.globalAlpha=.22;x.strokeStyle=l;x.lineWidth=1;x.strokeRect(R[0]+.5,R[1]+.5,R[2]-1,R[3]-1)}
  glow(cx,cy,u*.22,l,.2)},
"r:leon-the-professional":d=>{const{cir,ln,W,H,u,a,l}=d;
  cir(W*.9,H*.5,u*.9,a,.3);
  ln(W*.22,0,W*.22,H,l,2,.55);cir(W*.22,H*.72,u*.06,l,.9)},
"r:chungking-express":d=>{const{x,rect,W,H,u,r,a,l}=d;
  x.save();x.filter="blur("+Math.max(3,u*.022)+"px)";
  let y=H*.04;while(y<H*.96){const hh=u*(.025+r()*.09);rect(-W*.1,y,W*1.2,hh,r()<.28?l:a,.3+r()*.6);y+=hh+u*(.02+r()*.07)}
  x.restore()},
"r:roman-holiday":d=>{const{x,cir,glow,cx,cy,u,a}=d;glow(cx,cy,u*1.3,a,.5);
  x.save();x.filter="blur("+Math.max(8,u*.09)+"px)";cir(cx,cy,u*.5,a,.55);x.restore()},
"r:pulp-fiction":d=>{const{rect,W,H,u,a,l,r}=d,n=9,sw=W/n,h=H*.55;
  for(let i=0;i<n;i++){const y=(r()-.1)*(H-h);rect(i*sw+sw*.04,y,sw*.92,h,i%4===1?l:a,.2+r()*.5)}}
};
/* 같은 배너를 쓰는 작품: 원본 하나만 두고 가리킨다(원본을 고치면 함께 바뀜) */
SCENES["r:the-irishman"]=SCENES["r:the-godfather"]=SCENES["r:the-trial-of-the-chicago-7"];
SCENES["r:shoplifters"]=SCENES["r:the-power-of-the-dog"];
SCENES["r:the-intouchables"]=SCENES["r:roma"];
SCENES["r:no-country-for-old-men"]=SCENES["r:all-quiet-on-the-western-front"];
SCENES["r:pan-s-labyrinth"]=SCENES["r:get-out"]=SCENES["r:guillermo-del-toro-s-pinocchio"];
function paint(cv,f,W=480,H=720,pal){
  const L=look(f);cv.width=W;cv.height=H;const x=cv.getContext("2d"),[a,b,c]=pal||L.pal;
  let s=L.seed*9301+49297;const r=()=>((s=(s*9301+49297)%233280)/233280);
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,b);g.addColorStop(1,c);x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle=a;x.strokeStyle=a;
  const k=n=>Array.from({length:Math.round(n)},(_,i)=>i),cx=W/2,cy=H*.42;
  const SC=pal&&SCENES[f.key];
  if(SC)SC(sceneKit(x,W,H,cx,cy,r,[a,b,c],pal));else switch(L.m){
    case"waves":x.lineWidth=3;k(16).forEach(i=>{x.globalAlpha=.25+i*.04;x.beginPath();for(let t=0;t<=W;t+=8)x.lineTo(t,H*.35+i*20+Math.sin(t/40+i*.6)*10);x.stroke()});break;
    case"peaks":k(4).forEach(i=>{x.globalAlpha=.25+i*.2;x.beginPath();x.moveTo(-20,H);for(let t=-20;t<=W+40;t+=60)x.lineTo(t,H*.45+i*55-r()*90);x.lineTo(W+20,H);x.fill()});break;
    case"arcade":{/* a stone arcade: arches cut into a wall, the accent kept to one thin line */
      const wall=pal?.wall||b,hole=pal?.hole||c,line=pal?.line||a,n=W>900?5:3,top=H*.1,base=H*.8,w=W/(n+1.4),gap=(W-n*w)/(n+1),r=w/2;
      x.globalAlpha=1;x.fillStyle=hole;x.fillRect(0,0,W,H);
      const g2=x.createLinearGradient(0,top,0,base);g2.addColorStop(0,wall);g2.addColorStop(1,hole);x.fillStyle=g2;x.globalAlpha=.85;x.fillRect(0,top,W,base-top);
      x.globalAlpha=.35;x.fillStyle=wall;x.fillRect(0,top-H*.035,W,H*.02);
      x.globalAlpha=1;x.fillStyle=hole;
      for(let i=0;i<n;i++){const ax=gap+i*(w+gap);x.beginPath();x.moveTo(ax,base);x.lineTo(ax,top+H*.12+r);x.arc(ax+r,top+H*.12+r,r,Math.PI,0);x.lineTo(ax+w,base);x.fill()}
      x.globalAlpha=.9;x.fillStyle=line;x.fillRect(0,base,W,Math.max(2,H*.006));
      x.globalAlpha=.5;x.fillStyle=wall;for(let i=1;i<4;i++)x.fillRect(0,base+i*H*.035,W,1);break}
    case"grid":for(let i=0;i<Math.floor((W-20)/56);i++)for(let j=0;j<13;j++){x.globalAlpha=r()<.18?.95:.12;x.fillRect(30+i*56,40+j*52,40,36)}break;
    case"dots":k(130*W/480).forEach(()=>{x.globalAlpha=.3+r()*.7;x.beginPath();x.arc(r()*W,r()*H*.8,1+r()*4,0,7);x.fill()});x.globalAlpha=.9;x.fillStyle=c;x.beginPath();x.moveTo(0,H);x.quadraticCurveTo(cx,H*.6,W,H);x.fill();break;
  }
  x.globalAlpha=1;const v=x.createRadialGradient(cx,H/2,H*.2,cx,H/2,H*.75);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,.55)");x.fillStyle=v;x.fillRect(0,0,W,H);
  for(let i=0;i<2200*W/480;i++){x.fillStyle=r()<.5?"rgba(255,255,255,.05)":"rgba(0,0,0,.08)";x.fillRect(r()*W,r()*H,1.5,1.5)}
}
