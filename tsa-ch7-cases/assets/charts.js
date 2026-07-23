(function() {
  var cs = getComputedStyle(document.documentElement);
  var accent = cs.getPropertyValue('--accent').trim();
  var accent2 = cs.getPropertyValue('--accent2').trim();

  function init(id, opt) {
    var el = document.getElementById(id);
    if (!el) return;
    var chart = echarts.init(el, null, {renderer: 'svg'});
    chart.setOption(opt);
    window.addEventListener('resize', function() { chart.resize(); });
  }

  var seed=2024;
  function rng(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
  function rnorm(){var u1=rng(),u2=rng();return Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);}
  function rt(df){var u=rng(),v=rng();return Math.sqrt(df/2)*(Math.pow(u,-2/df)-1)/Math.sqrt(Math.pow(u,-2/df)-1+Math.pow(v,-2/df)-1);}

  // Simulate GARCH(1,1) returns
  var n=1200,omega=1e-6,alpha=0.08,beta=0.90;
  var sig2=new Array(n),ret=new Array(n),dates=[];
  sig2[0]=omega/(1-alpha-beta);
  for(var i=0;i<n;i++){
    if(i>0) sig2[i]=omega+alpha*ret[i-1]*ret[i-1]+beta*sig2[i-1];
    ret[i]=Math.sqrt(sig2[i])*rt(7);
    var d=new Date(2019,0,2);d.setDate(d.getDate()+Math.floor(i*365/252));
    dates.push(d.getFullYear()+'-'+(d.getMonth()+1<10?'0':'')+(d.getMonth()+1)+'-'+(d.getDate()<10?'0':'')+d.getDate());
  }

  // Chart 1: Returns
  init('chart-hs300-ret',{animation:false,grid:{top:40,right:30,bottom:60,left:70},
    xAxis:{type:'category',data:dates.slice(0,1200),axisLabel:{rotate:45,fontSize:9,interval:119}},
    yAxis:{type:'value',name:'日收益率',nameTextStyle:{color:'#64748b'}},
    series:[{type:'line',data:ret,lineStyle:{color:accent,width:1},showSymbol:false,areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:accent+'30'},{offset:1,color:accent+'03'}]}}}],tooltip:{trigger:'axis'}});

  // Chart 2: ACF of r^2
  var acfData=[0.45,0.38,0.32,0.28,0.24,0.21,0.18,0.15,0.13,0.11,0.09,0.08,0.06,0.05,0.04,0.03,0.025,0.02,0.018,0.015];
  var acfLabels=acfData.map(function(_,i){return 'lag'+(i+1)});
  init('chart-arch-acf',{animation:false,grid:{top:40,right:30,bottom:40,left:60},
    xAxis:{type:'category',data:acfLabels},
    yAxis:{type:'value',min:-0.1,max:0.6,name:'ACF'},
    series:[{type:'bar',data:acfData,itemStyle:{color:function(p){return p.value>0.1?accent:'#94a3b8'},borderRadius:[3,3,0,0}},markLine:{data:[{yAxis:0.1,lineStyle:{color:accent2,type:'dashed'},label:{formatter:'95% CI',fontSize:11}},{yAxis:-0.1,lineStyle:{color:accent2,type:'dashed'}}]}],tooltip:{trigger:'axis'}});

  // Chart 3: GARCH fit (returns + conditional vol)
  var condVol=sig2.map(function(v){return Math.sqrt(v)*100});
  init('chart-garch-fit',{animation:false,legend:{data:['收益率','GARCH条件波动率'],top:5},grid:{top:50,right:60,bottom:60,left:70},
    xAxis:[{type:'category',data:dates.slice(600),gridIndex:0,axisLabel:{rotate:45,fontSize:9,interval:59}},{type:'category',data:dates.slice(600),gridIndex:1}],
    yAxis:[{type:'value',name:'收益率',gridIndex:0},{type:'value',name:'波动率%',gridIndex:1}],
    series:[{name:'收益率',type:'line',xAxisIndex:0,yAxisIndex:0,data:ret.slice(600),lineStyle:{color:accent2,width:1.2},showSymbol:false},{name:'GARCH条件波动率',type:'line',xAxisIndex:1,yAxisIndex:1,data:condVol.slice(600),lineStyle:{color:accent,width:2},showSymbol:false,areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:accent+'40'},{offset:1,color:accent+'05'}]}}}],tooltip:{trigger:'axis'}});

  // Chart 4: GARCH forecast
  var fcV=[],lastSig=sig2[n-1],lastR=ret[n-1];
  for(var i=0;i<22;i++){lastSig=omega+alpha*lastR*lastR+beta*lastSig;fcV.push(Math.sqrt(lastSig)*100);lastR=rnorm()*Math.sqrt(lastSig);}
  var fcLabels=[];for(var i=0;i<22;i++) fcLabels.push('T+'+(i+1));
  var uncond=Math.sqrt(omega/(1-alpha-beta))*100;
  var fcBandU=fcV.map(function(v,i){return v+0.3*(uncond-v)*(i+1)/22});
  var fcBandL=fcV.map(function(v,i){return v-0.3*(uncond-v)*(i+1)/22});
  init('chart-garch-forecast',{animation:false,grid:{top:40,right:30,bottom:40,left:60},
    xAxis:{type:'category',data:fcLabels},
    yAxis:{type:'value',name:'预测波动率%'},
    series:[{type:'line',data:fcV,lineStyle:{color:accent,width:2.5},showSymbol:true,symbolSize:6},{type:'line',data:fcBandU,lineStyle:{opacity:0},areaStyle:{color:accent+'15'},stack:'b',showSymbol:false},{type:'line',data:fcBandL,lineStyle:{opacity:0},areaStyle:{color:'#ffffff'},stack:'b',showSymbol:false},markLine:{data:[{yAxis:uncond,lineStyle:{color:accent2,type:'dashed'},label:{formatter:'无条件波动率',fontSize:11}}]}],tooltip:{trigger:'axis'}});

  // Chart 5: GARCH compare
  var last400=dates.slice(800);
  var gVol=[],egVol=[],gjrVol=[];seed=77;
  for(var i=800;i<1200;i++){
    var base=Math.sqrt(sig2[i])*100;
    gVol.push(parseFloat((base+rnorm()*0.02).toFixed(2)));
    egVol.push(parseFloat((base+ret[i]<0?-0.03:0.01+rnorm()*0.015).toFixed(2)));
    gjrVol.push(parseFloat((base+(ret[i]<0?0.04:0)+rnorm()*0.02).toFixed(2)));
  }
  init('chart-garch-compare',{animation:false,legend:{data:['GARCH','EGARCH','GJR-GARCH'],top:5},grid:{top:50,right:30,bottom:60,left:70},
    xAxis:{type:'category',data:last400,axisLabel:{rotate:45,fontSize:9,interval:39}},
    yAxis:{type:'value',name:'条件波动率%'},
    series:[{name:'GARCH',type:'line',data:gVol,lineStyle:{color:accent,width:1.5},showSymbol:false},{name:'EGARCH',type:'line',data:egVol,lineStyle:{color:accent2,width:1.5,type:'dashed'},showSymbol:false},{name:'GJR-GARCH',type:'line',data:gjrVol,lineStyle:{color:'#16a34a',width:1.5,type:'dotted'},showSymbol:false}],tooltip:{trigger:'axis'}});

  // Chart 6: AIC compare
  init('chart-aic-compare',{animation:false,grid:{top:40,right:30,bottom:40,left:120},
    xAxis:{type:'value',name:'AIC (越小越好)'},
    yAxis:{type:'category',data:['GJR-GARCH(1,1)','EGARCH(1,1)','GARCH(1,1)']},
    series:[{type:'bar',data:[{value:5208,itemStyle:{color:'#16a34a'}},{value:5201,itemStyle:{color:accent2}},{value:5234,itemStyle:{color:accent}}],barWidth:30,borderRadius:[0,4,4,0],label:{show:true,position:'right',fontSize:13,fontWeight:'bold'}}],tooltip:{trigger:'axis'}});
})();
