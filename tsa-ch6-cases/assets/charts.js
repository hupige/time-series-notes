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

  var seed = 2024;
  function rng() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function rnorm() { var u1=rng(),u2=rng(); return Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2); }

  var months = [], retailData = [];
  var sf = [0.88,0.90,0.95,0.98,1.00,1.02,0.98,1.00,1.03,1.05,1.15,1.06];
  for (var i = 0; i < 168; i++) {
    var t = i + 1, trend = 1000 + 8*t + 0.02*t*t;
    retailData.push(Math.round(trend * sf[i%12] + rnorm()*15));
    var yr = 2010 + Math.floor(i/12), mo = (i%12)+1;
    months.push(yr + '-' + (mo<10?'0':'') + mo);
  }

  init('chart-retail-ts', {
    animation: false,
    grid: {top:40,right:30,bottom:60,left:70},
    xAxis: {type:'category',data:months,axisLabel:{rotate:45,fontSize:10,interval:11},axisLine:{lineStyle:{color:'#e2e8f0'}}},
    yAxis: {type:'value',name:'亿元',nameTextStyle:{color:'#64748b'},splitLine:{lineStyle:{color:'#f1f5f9'}}},
    series: [{type:'line',data:retailData,lineStyle:{color:accent,width:2},showSymbol:false,areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:accent+'30'},{offset:1,color:accent+'05'}]}}}],
    tooltip: {trigger:'axis'}
  });

  // Decompose 4-panel
  var trendD=[],seasD=[],residD=[];
  for(var i=0;i<168;i++){t=i+1;trendD.push(Math.round(1000+8*t+0.02*t*t));seasD.push(parseFloat((sf[i%12]*100-100).toFixed(1)));residD.push(parseFloat((rnorm()*0.8).toFixed(2)));}
  var lm=months.slice(72);
  init('chart-retail-decompose',{
    animation:false,
    grid:[{top:50,right:30,bottom:60,left:70},{top:'57%',right:30,bottom:'7%',left:70},{top:50,right:'55%',bottom:60,left:'55%'},{top:'57%',right:'55%',bottom:'7%',left:'55%'}],
    title:[{text:'原始序列',left:'center',top:5,textStyle:{fontSize:13,color:'#1e293b'}},{text:'趋势',left:'center',top:'52%',textStyle:{fontSize:13,color:'#1e293b'}},{text:'季节',left:'73%',top:5,textStyle:{fontSize:13,color:'#1e293b'}},{text:'残差',left:'73%',top:'52%',textStyle:{fontSize:13,color:'#1e293b'}}],
    xAxis:[{type:'category',data:lm,gridIndex:0,axisLabel:{rotate:45,fontSize:9,interval:5}},{type:'category',data:lm,gridIndex:1,axisLabel:{rotate:45,fontSize:9,interval:5}},{type:'category',data:lm,gridIndex:2,axisLabel:{rotate:45,fontSize:9,interval:5}},{type:'category',data:lm,gridIndex:3,axisLabel:{rotate:45,fontSize:9,interval:5}}],
    yAxis:[{type:'value',gridIndex:0},{type:'value',gridIndex:1},{type:'value',gridIndex:2,name:'%'},{type:'value',gridIndex:3}],
    series:[{type:'line',xAxisIndex:0,yAxisIndex:0,data:retailData.slice(72),lineStyle:{color:accent,width:1.5},showSymbol:false},{type:'line',xAxisIndex:1,yAxisIndex:1,data:trendD.slice(72),lineStyle:{color:accent2,width:1.5},showSymbol:false},{type:'bar',xAxisIndex:2,yAxisIndex:2,data:seasD.slice(72).map(function(v){return v||null}),itemStyle:{color:accent+'60'}},{type:'line',xAxisIndex:3,yAxisIndex:3,data:residD.slice(72),lineStyle:{color:'#94a3b8',width:1},showSymbol:false}],
    tooltip:{trigger:'axis'}
  });

  // Seasonal factors bar
  var ml=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  var sFactors=sf.map(function(v){return parseFloat(((v-1)*100).toFixed(1))});
  init('chart-retail-seasonal',{animation:false,grid:{top:40,right:30,bottom:40,left:60},
    xAxis:{type:'category',data:ml,axisLine:{lineStyle:{color:'#e2e8f0'}}},
    yAxis:{type:'value',name:'偏离均值 %',nameTextStyle:{color:'#64748b'},splitLine:{lineStyle:{color:'#f1f5f9'}}},
    series:[{type:'bar',data:sFactors,itemStyle:{color:function(p){return p.value>=0?accent:accent2},borderRadius:[4,4,0,0]}}],tooltip:{trigger:'axis'}
  });

  // HW Compare
  var fM=[],fA=[];seed=42;
  for(var i=0;i<156;i++){fM.push(retailData[i]+Math.round(rnorm()*20));fA.push(retailData[i]+Math.round(rnorm()*40));}
  var fcM=[],fcA=[];
  for(var i=0;i<12;i++){t=157+i;var tr=1000+8*t+0.02*t*t;fcM.push(Math.round(tr*sf[(i+156)%12]+rnorm()*15));fcA.push(Math.round(tr+sf[(i+156)%12]*500+rnorm()*30));}
  init('chart-hw-compare',{animation:false,legend:{data:['实际值','乘法拟合','加法拟合'],top:5,textStyle:{fontSize:12}},grid:{top:50,right:30,bottom:60,left:70},
    xAxis:{type:'category',data:months.slice(120),axisLabel:{rotate:45,fontSize:10}},
    yAxis:{type:'value',name:'亿元'},
    series:[{name:'实际值',type:'line',data:retailData.slice(120),lineStyle:{color:'#1e293b',width:2},showSymbol:false},{name:'乘法拟合',type:'line',data:fM.slice(120).concat(fcM),lineStyle:{color:accent,width:2,type:'dashed'},showSymbol:false},{name:'加法拟合',type:'line',data:fA.slice(120).concat(fcA),lineStyle:{color:accent2,width:2,type:'dotted'},showSymbol:false}],tooltip:{trigger:'axis'}
  });

  // HW Forecast
  init('chart-hw-forecast',{animation:false,legend:{data:['训练数据','实际值','乘法预测'],top:5},grid:{top:50,right:30,bottom:60,left:70},
    xAxis:{type:'category',data:months.slice(132),axisLabel:{rotate:45,fontSize:10}},
    yAxis:{type:'value',name:'亿元'},
    series:[{name:'训练数据',type:'line',data:retailData.slice(132,156),lineStyle:{color:accent,width:2},showSymbol:false},{name:'实际值',type:'line',data:(new Array(24)).fill(null).concat(retailData.slice(156)),lineStyle:{color:accent2,width:2},showSymbol:false},{name:'乘法预测',type:'line',data:(new Array(24)).fill(null).concat(fcM),lineStyle:{color:'#dc2626',width:2.5},showSymbol:true,symbolSize:6,markArea:{silent:true,data:[[{xAxis:'2022-12',itemStyle:{color:accent+'15'}},{xAxis:'2023-12'}]]}}],tooltip:{trigger:'axis'}
  });
  // CPI Raw
  var cpiData=[],cpiMonths=[];seed=2024;var cpiV=100;
  var cpiS=[0.3,0.2,-0.1,-0.2,-0.3,0.1,0.5,0.2,0.0,-0.1,0.2,0.8];
  for(var i=0;i<180;i++){cpiV+=0.15+rnorm()*0.3;cpiData.push(parseFloat((cpiV+cpiS[i%12]).toFixed(1)));var yr=2009+Math.floor(i/12),mo=(i%12)+1;cpiMonths.push(yr+'-'+(mo<10?'0':'')+mo);}

  init('chart-cpi-raw',{animation:false,grid:{top:40,right:30,bottom:60,left:70},
    xAxis:{type:'category',data:cpiMonths,axisLabel:{rotate:45,fontSize:10,interval:11}},
    yAxis:{type:'value',name:'CPI',nameTextStyle:{color:'#64748b'}},
    series:[{type:'line',data:cpiData,lineStyle:{color:accent,width:2},showSymbol:false,areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:accent2+'25'},{offset:1,color:accent2+'03'}]}}}],tooltip:{trigger:'axis'}
  });

  // CPI Diff
  var d12=[],d1d12=[];
  for(var i=12;i<180;i++) d12.push(parseFloat((cpiData[i]-cpiData[i-12]).toFixed(2)));
  for(var i=13;i<180;i++) d1d12.push(parseFloat((cpiData[i]-cpiData[i-1]-(cpiData[i-12]-cpiData[i-13])).toFixed(2)));
  init('chart-cpi-diff',{animation:false,
    grid:[{top:50,right:30,bottom:'7%',left:70},{top:'57%',right:30,bottom:'7%',left:70}],
    title:[{text:'季节差分 (lag=12)',left:'center',top:5,textStyle:{fontSize:13,color:'#1e293b'}},{text:'一阶差分 + 季节差分',left:'center',top:'52%',textStyle:{fontSize:13,color:'#1e293b'}}],
    xAxis:[{type:'category',data:cpiMonths.slice(12),gridIndex:0,axisLabel:{rotate:45,fontSize:10,interval:11}},{type:'category',data:cpiMonths.slice(13),gridIndex:1,axisLabel:{rotate:45,fontSize:10,interval:11}}],
    yAxis:[{type:'value',gridIndex:0},{type:'value',gridIndex:1}],
    series:[{type:'line',xAxisIndex:0,yAxisIndex:0,data:d12,lineStyle:{color:accent2,width:1.5},showSymbol:false},{type:'line',xAxisIndex:1,yAxisIndex:1,data:d1d12,lineStyle:{color:accent,width:1.5},showSymbol:false}],tooltip:{trigger:'axis'}
  });

  // SARIMA Residual ACF + LB
  var rACF=[0.02,-0.05,0.08,-0.03,0.01,-0.04,0.06,-0.02,0.03,-0.01,0.04,-0.03];
  var rLB=[0.89,0.72,0.45,0.61,0.78,0.62,0.38,0.55,0.42,0.68,0.34,0.52];
  var lagL=rACF.map(function(_,i){return 'lag'+(i+1)});
  init('chart-sarima-resid',{animation:false,
    grid:[{top:50,right:'55%',bottom:40,left:60},{top:50,right:30,bottom:40,left:'55%'}],
    title:[{text:'ACF',left:'center',top:5,textStyle:{fontSize:13,color:'#1e293b'}},{text:'Ljung-Box p值',left:'73%',top:5,textStyle:{fontSize:13,color:'#1e293b'}}],
    xAxis:[{type:'category',data:lagL,gridIndex:0},{type:'category',data:lagL,gridIndex:1}],
    yAxis:[{type:'value',min:-0.2,max:0.2,gridIndex:0,splitLine:{lineStyle:{color:'#f1f5f9'}}},{type:'value',min:0,max:1,gridIndex:1,splitLine:{lineStyle:{color:'#f1f5f9'}}}],
    series:[{type:'bar',xAxisIndex:0,yAxisIndex:0,data:rACF,itemStyle:{color:function(p){return Math.abs(p.value)<0.1?'#94a3b8':'#dc2626'},borderRadius:[3,3,0,0}},{type:'bar',xAxisIndex:1,yAxisIndex:1,data:rLB,itemStyle:{color:function(p){return p.value>0.05?'#16a34a':'#dc2626'},borderRadius:[3,3,0,0}},markLine:{data:[{yAxis:0.05,lineStyle:{color:'#dc2626',type:'dashed'},label:{formatter:'\u03b1=0.05',fontSize:11}}]}],tooltip:{trigger:'axis'}
  });

  // SARIMA Forecast
  var fcM2=[];seed=99;
  for(var i=0;i<24;i++){t=cpiData.length+i;cpiV+=0.15+rnorm()*0.15;fcM2.push(parseFloat((cpiV+cpiS[i%12]+rnorm()*0.3).toFixed(1)));}
  var fcLow=fcM2.map(function(v){return v-1.5*Math.sqrt(24+((i+1)/24))}),fcUp=fcM2.map(function(v){return v+1.5*Math.sqrt(24+((i+1)/24))});
  var fcMonths=[];for(var i=0;i<24;i++){var yr=2024+Math.floor(i/12),mo=(i%12)+1;fcMonths.push(yr+'-'+(mo<10?'0':'')+mo);}
  var histM=cpiMonths.slice(144),histD=cpiData.slice(144),allM=histM.concat(fcMonths),allD=histD.concat(fcM2);
  var bandLow=histD.map(function(){return null}).concat(fcLow),bandUp=histD.map(function(){return null}).concat(fcUp);
  init('chart-sarima-forecast',{animation:false,legend:{data:['实际值','预测值','95% CI'],top:5},grid:{top:50,right:30,bottom:60,left:70},
    xAxis:{type:'category',data:allM,axisLabel:{rotate:45,fontSize:10}},
    yAxis:{type:'value',name:'CPI'},
    series:[{name:'实际值',type:'line',data:allD,lineStyle:{color:accent,width:2},showSymbol:false},{name:'95% CI',type:'line',data:bandUp,lineStyle:{opacity:0},areaStyle:{color:accent+'20'},stack:'CI',showSymbol:false},{name:'band',type:'line',data:bandLow,lineStyle:{opacity:0},areaStyle:{color:'#ffffff'},stack:'CI',showSymbol:false},{name:'预测值',type:'line',data:(new Array(histD.length)).fill(null).concat(fcM2),lineStyle:{color:'#dc2626',width:2.5,type:'dashed'},showSymbol:false,markArea:{silent:true,data:[[{xAxis:'2023-12',itemStyle:{color:'#fef2f2'}},{xAxis:'2025-12'}]]}}],tooltip:{trigger:'axis'}});
})();
