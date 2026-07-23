(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var ink = style.getPropertyValue('--ink').trim();

  function randn(seed) {
    var s = seed || 1;
    return function() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function simAR(phi, n, sd, seed) {
    var r = randn(seed), x = [];
    for (var i = 0; i < n; i++) {
      var v = 0;
      for (var j = 0; j < phi.length; j++) v += phi[j] * (i - 1 - j >= 0 ? x[i - 1 - j] : 0);
      x.push(v + (r() - 0.5) * 2 * sd);
    }
    return x;
  }
  function simARMA(phi, theta, n, sd, seed) {
    var r = randn(seed), x = [], eps = [];
    for (var i = 0; i < n; i++) {
      var e = (r() - 0.5) * 2 * sd; eps.push(e);
      var v = 0;
      for (var j = 0; j < phi.length; j++) v += phi[j] * (i - 1 - j >= 0 ? x[i - 1 - j] : 0);
      for (var k = 0; k < theta.length; k++) v -= theta[k] * (i - 1 - k >= 0 ? eps[i - 1 - k] : 0);
      x.push(v + e);
    }
    return x;
  }
  function simMA(theta, n, sd, seed) {
    var r = randn(seed), x = [], eps = [];
    for (var i = 0; i < n; i++) {
      var e = (r() - 0.5) * 2 * sd; eps.push(e);
      var v = e;
      for (var k = 0; k < theta.length; k++) v -= theta[k] * (i - 1 - k >= 0 ? eps[i - 1 - k] : 0);
      x.push(v);
    }
    return x;
  }
  function makeCats(n, offset) { offset = offset || 1; return Array.from({length:n},function(_,i){return i+offset;}); }

  // ===== 1. Shibor time series =====
  var el1 = document.getElementById('chart-shibor-ts');
  if (el1) {
    var shibor = simAR([0.85, -0.12], 500, 0.15, 2024).map(function(v){return v+1.8;});
    echarts.init(el1, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:30,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:makeCats(500),show:false},
      yAxis:{type:'value',name:'利率 (%)',nameGap:45,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'line',data:shibor,lineStyle:{width:1.5,color:accent},symbol:'none',
        markLine:{silent:true,data:[{yAxis:1.8,lineStyle:{color:'#dc2626',type:'dashed',width:1.5},label:{formatter:'均值 1.8%',color:'#dc2626',fontSize:11}}]}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el1).resize();});
  }

  // ===== 2. Shibor ACF/PACF dual panel =====
  var el2 = document.getElementById('chart-shibor-acf');
  if (el2) {
    var phi = [0.85, -0.12];
    var acfAr = [1], rho1 = phi[0]/(1-phi[1]), rho2 = (phi[0]*phi[0]+phi[0]*phi[1]+phi[1])/(1-phi[1]);
    acfAr.push(rho1, rho2);
    for (var k=3;k<=20;k++) acfAr.push(phi[0]*acfAr[k-1]+phi[1]*acfAr[k-2]);
    var pacfAr = [1, rho1, rho2];
    for (k=3;k<=20;k++) pacfAr.push(0);
    var lags = makeCats(21, 0);
    var se = 1/Math.sqrt(500);
    var up = lags.map(function(){return 2*se;});
    var lo = lags.map(function(){return -2*se;});
    echarts.init(el2, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      title:[{text:'ACF (拖尾)',left:'25%',top:5,textStyle:{fontSize:13,color:muted}},{text:'PACF (2阶截尾)',left:'75%',top:5,textStyle:{fontSize:13,color:muted}}],
      grid:[{top:30,left:50,right:30,width:'45%'},{top:30,left:'55%',right:20,width:'43%'}],
      xAxis:[{type:'category',data:lags,gridIndex:0,show:false},{type:'category',data:lags,gridIndex:1,show:false}],
      yAxis:[{type:'value',gridIndex:0,min:-0.2,max:1.1,axisLabel:{fontSize:10,color:muted},splitLine:{lineStyle:{color:rule}}},{type:'value',gridIndex:1,min:-0.2,max:1.1,axisLabel:{fontSize:10,color:muted},splitLine:{lineStyle:{color:rule}}}],
      series:[
        {type:'bar',data:acfAr,xAxisIndex:0,yAxisIndex:0,itemStyle:{color:accent},barWidth:8},
        {type:'line',data:up,xAxisIndex:0,yAxisIndex:0,lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},
        {type:'line',data:lo,xAxisIndex:0,yAxisIndex:0,lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},
        {type:'bar',data:pacfAr,xAxisIndex:1,yAxisIndex:1,itemStyle:{color:accent2},barWidth:8},
        {type:'line',data:up,xAxisIndex:1,yAxisIndex:1,lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},
        {type:'line',data:lo,xAxisIndex:1,yAxisIndex:1,lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el2).resize();});
  }

  // ===== 3. Shibor residual ACF =====
  var el3 = document.getElementById('chart-shibor-resid');
  if (el3) {
    var r3 = randn(99); var residAcf = [1];
    for (k=1;k<=20;k++) residAcf.push((r3()-0.5)*0.16);
    var se3 = 2/Math.sqrt(500);
    echarts.init(el3, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:20,bottom:40,left:50,right:20},
      xAxis:{type:'category',data:makeCats(21,0),name:'滞后k',nameGap:25,axisLabel:{color:muted}},
      yAxis:{type:'value',min:-0.3,max:1.1,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {type:'bar',data:residAcf,itemStyle:{color:'#94a3b8'},barWidth:10},
        {type:'line',data:makeCats(21,0).map(function(){return se3;}),lineStyle:{color:'#dc2626',type:'dashed',width:1.5},symbol:'none'},
        {type:'line',data:makeCats(21,0).map(function(){return -se3;}),lineStyle:{color:'#dc2626',type:'dashed',width:1.5},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el3).resize();});
  }

  // ===== 4. Shibor forecast =====
  var el4 = document.getElementById('chart-shibor-forecast');
  if (el4) {
    var all = simAR([0.85,-0.12], 500, 0.15, 2024).map(function(v){return v+1.8;});
    var hist = all.slice(440, 500);
    var last = all[499];
    var fc = [], fc80u=[], fc80l=[], fc95u=[], fc95l=[];
    for (k=0;k<10;k++) {
      var pred = 1.8 + (last-1.8)*Math.pow(0.73,k);
      fc.push(pred);
      var w = Math.sqrt(0.022*(1+0.73*0.73/(1-0.73*0.73)*(1-Math.pow(0.73,2*k)/(1-Math.pow(0.73,2)))));
      fc80u.push(pred+1.28*w); fc80l.push(pred-1.28*w);
      fc95u.push(pred+1.96*w); fc95l.push(pred-1.96*w);
    }
    var fcCats = makeCats(60, 441);
    var histExt = hist.concat(Array(10).fill(null));
    var fcExt = Array(60).fill(null); for(k=0;k<10;k++) fcExt[50+k]=fc[k];
    var u95 = Array(60).fill(null); for(k=0;k<10;k++) u95[50+k]=fc95u[k];
    var l95 = Array(60).fill(null); for(k=0;k<10;k++) l95[50+k]=fc95l[k];
    var u80 = Array(60).fill(null); for(k=0;k<10;k++) u80[50+k]=fc80u[k];
    var l80 = Array(60).fill(null); for(k=0;k<10;k++) l80[50+k]=fc80l[k];
    echarts.init(el4, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['实际值','预测值','95%置信区间','80%置信区间'],top:4,textStyle:{fontSize:11,color:muted}},
      grid:{top:40,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:fcCats,show:false},
      yAxis:{type:'value',name:'利率 (%)',axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'95%置信区间',type:'line',data:u95,lineStyle:{opacity:0},symbol:'none',areaStyle:{color:'rgba(220,38,38,0.08)'},stack:'a95'},
        {type:'line',data:l95,lineStyle:{opacity:0},symbol:'none',areaStyle:{color:'rgba(220,38,38,0.08)'},stack:'b95'},
        {name:'80%置信区间',type:'line',data:u80,lineStyle:{opacity:0},symbol:'none',areaStyle:{color:'rgba(220,38,38,0.12)'},stack:'a80'},
        {type:'line',data:l80,lineStyle:{opacity:0},symbol:'none',areaStyle:{color:'rgba(220,38,38,0.12)'},stack:'b80'},
        {name:'实际值',type:'line',data:histExt,lineStyle:{width:1.8,color:accent},symbol:'none'},
        {name:'预测值',type:'line',data:fcExt,lineStyle:{width:2.5,color:'#dc2626',type:'dashed'},symbol:'circle',symbolSize:5}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el4).resize();});
  }

  // ===== 5. Basis ACF/PACF =====
  var el5 = document.getElementById('chart-basis-acf');
  if (el5) {
    var theta1 = 0.45;
    var rho_b1 = -theta1/(1+theta1*theta1);
    var acfMa = [1, rho_b1];
    for (k=2;k<=20;k++) acfMa.push(0);
    var pacfMa = [1, rho_b1];
    for (k=2;k<=20;k++) pacfMa.push(rho_b1*Math.pow(-theta1,k-1));
    var se5 = 2/Math.sqrt(300);
    var up5 = makeCats(21,0).map(function(){return se5;});
    var lo5 = makeCats(21,0).map(function(){return -se5;});
    echarts.init(el5, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      title:[{text:'ACF (1阶截尾)',left:'25%',top:5,textStyle:{fontSize:13,color:muted}},{text:'PACF (拖尾)',left:'75%',top:5,textStyle:{fontSize:13,color:muted}}],
      grid:[{top:30,left:50,right:30,width:'45%'},{top:30,left:'55%',right:20,width:'43%'}],
      xAxis:[{type:'category',data:lags,gridIndex:0,show:false},{type:'category',data:lags,gridIndex:1,show:false}],
      yAxis:[{type:'value',gridIndex:0,min:-0.5,max:1.1,axisLabel:{fontSize:10,color:muted},splitLine:{lineStyle:{color:rule}}},{type:'value',gridIndex:1,min:-0.5,max:1.1,axisLabel:{fontSize:10,color:muted},splitLine:{lineStyle:{color:rule}}}],
      series:[
        {type:'bar',data:acfMa,xAxisIndex:0,yAxisIndex:0,itemStyle:{color:accent},barWidth:8},
        {type:'line',data:up5,xAxisIndex:0,yAxisIndex:0,lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},
        {type:'line',data:lo5,xAxisIndex:0,yAxisIndex:0,lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},
        {type:'bar',data:pacfMa,xAxisIndex:1,yAxisIndex:1,itemStyle:{color:accent2},barWidth:8},
        {type:'line',data:up5,xAxisIndex:1,yAxisIndex:1,lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},
        {type:'line',data:lo5,xAxisIndex:1,yAxisIndex:1,lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el5).resize();});
  }

  // ===== 6. VIX time series =====
  var el6 = document.getElementById('chart-vix-ts');
  if (el6) {
    var vix = simARMA([0.92], [-0.55], 500, 1.2, 2024).map(function(v){return Math.max(v+18, 8);});
    echarts.init(el6, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:25,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:makeCats(500),show:false},
      yAxis:{type:'value',name:'VIX',nameGap:35,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'line',data:vix,lineStyle:{width:1.5,color:accent},symbol:'none',areaStyle:{color:'rgba(37,99,235,0.06)'}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el6).resize();});
  }

  // ===== 7. VIX ACF/PACF =====
  var el7 = document.getElementById('chart-vix-acf');
  if (el7) {
    var ph7=0.92, th7=-0.55;
    var rho_v1 = (1-ph7*th7)*(ph7-th7)/(1+th7*th7-2*ph7*th7);
    var acfV = [1, rho_v1];
    for (k=2;k<=20;k++) acfV.push(ph7*acfV[k-1]);
    var pacfV = [1, rho_v1];
    for (k=2;k<=20;k++) pacfV.push(pacfV[k-1]*0.85);
    var se7 = 2/Math.sqrt(500);
    var up7 = makeCats(21,0).map(function(){return se7;});
    var lo7 = makeCats(21,0).map(function(){return -se7;});
    echarts.init(el7, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      title:[{text:'ACF (拖尾)',left:'25%',top:5,textStyle:{fontSize:13,color:muted}},{text:'PACF (拖尾)',left:'75%',top:5,textStyle:{fontSize:13,color:muted}}],
      grid:[{top:30,left:50,right:30,width:'45%'},{top:30,left:'55%',right:20,width:'43%'}],
      xAxis:[{type:'category',data:lags,gridIndex:0,show:false},{type:'category',data:lags,gridIndex:1,show:false}],
      yAxis:[{type:'value',gridIndex:0,min:-0.1,max:1.1,axisLabel:{fontSize:10,color:muted},splitLine:{lineStyle:{color:rule}}},{type:'value',gridIndex:1,min:-0.1,max:1.1,axisLabel:{fontSize:10,color:muted},splitLine:{lineStyle:{color:rule}}}],
      series:[
        {type:'bar',data:acfV,xAxisIndex:0,yAxisIndex:0,itemStyle:{color:accent},barWidth:8},
        {type:'line',data:up7,xAxisIndex:0,yAxisIndex:0,lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},
        {type:'line',data:lo7,xAxisIndex:0,yAxisIndex:0,lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},
        {type:'bar',data:pacfV,xAxisIndex:1,yAxisIndex:1,itemStyle:{color:accent2},barWidth:8},
        {type:'line',data:up7,xAxisIndex:1,yAxisIndex:1,lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},
        {type:'line',data:lo7,xAxisIndex:1,yAxisIndex:1,lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el7).resize();});
  }

  // ===== 8. Model compare AIC/BIC =====
  var el8 = document.getElementById('chart-model-compare');
  if (el8) {
    echarts.init(el8, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['AIC','BIC'],top:4,textStyle:{color:muted}},
      grid:{top:40,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:['ARMA(1,1)','ARMA(2,1)','ARMA(1,2)','ARMA(2,2)'],axisLabel:{color:muted,fontSize:12}},
      yAxis:{type:'value',name:'信息准则值',nameGap:45,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'AIC',type:'bar',data:[1412,1414,1413,1416],itemStyle:{color:accent},barWidth:24},
        {name:'BIC',type:'bar',data:[1428,1434,1433,1442],itemStyle:{color:accent2},barWidth:24}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el8).resize();});
  }
})();
