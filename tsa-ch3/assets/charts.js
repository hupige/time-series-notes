(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();

  var lags = Array.from({length:21},function(_,i){return i;});

  // ===== Chart 1: AR(1) ACF拖尾 + PACF截尾 =====
  var el1 = document.getElementById('chart-ar-acf');
  if (el1) {
    var phi = 0.7;
    var acf_ar = lags.map(function(k){return Math.pow(phi, k);});
    var pacf_ar = lags.map(function(k){return k===0?1:(k===1?phi:0);});
    echarts.init(el1, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['ACF (拖尾)','PACF (截尾)'],top:4,textStyle:{color:muted,fontSize:12}},
      grid:{top:45,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:lags,name:'滞后k',nameGap:25,axisLabel:{color:muted}},
      yAxis:{type:'value',min:-0.2,max:1.1,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'ACF (拖尾)',type:'line',data:acf_ar,lineStyle:{width:2.5,color:accent},symbol:'circle',symbolSize:5},
        {name:'PACF (截尾)',type:'bar',data:pacf_ar,itemStyle:{color:accent2},barWidth:10}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el1).resize();});
  }

  // ===== Chart 2: MA(1) ACF截尾 + PACF拖尾 =====
  var el2 = document.getElementById('chart-ma-acf');
  if (el2) {
    var theta = 0.6;
    var rho1 = -theta/(1+theta*theta);
    var acf_ma = lags.map(function(k){return k===0?1:(k===1?rho1:0);});
    var pacf_ma = [1];
    for (var k=1;k<=20;k++) pacf_ma.push(rho1*Math.pow(0.4,k-1)); // approx拖尾
    echarts.init(el2, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['ACF (截尾)','PACF (拖尾)'],top:4,textStyle:{color:muted,fontSize:12}},
      grid:{top:45,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:lags,name:'滞后k',nameGap:25,axisLabel:{color:muted}},
      yAxis:{type:'value',min:-0.5,max:1.1,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'ACF (截尾)',type:'bar',data:acf_ma,itemStyle:{color:accent},barWidth:10},
        {name:'PACF (拖尾)',type:'line',data:pacf_ma,lineStyle:{width:2.5,color:accent2},symbol:'circle',symbolSize:5}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el2).resize();});
  }

  // ===== Chart 3: ARMA(1,1) ACF和PACF都拖尾 =====
  var el3 = document.getElementById('chart-arma-acf');
  if (el3) {
    var phi2=0.7, theta2=0.4;
    var acf_arma=[1], pacf_arma=[1];
    var rho1_arma = (1-phi2*theta2)*(phi2-theta2)/(1+theta2*theta2-2*phi2*theta2);
    acf_arma.push(rho1_arma);
    for (var k=2;k<=20;k++) acf_arma.push(phi2*acf_arma[k-1]);
    pacf_arma.push(rho1_arma);
    for (k=2;k<=20;k++) pacf_arma.push(pacf_arma[k-1]*0.5); // approx拖尾
    echarts.init(el3, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['ACF (拖尾)','PACF (拖尾)'],top:4,textStyle:{color:muted,fontSize:12}},
      grid:{top:45,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:lags,name:'滞后k',nameGap:25,axisLabel:{color:muted}},
      yAxis:{type:'value',min:-0.2,max:1.1,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'ACF (拖尾)',type:'line',data:acf_arma,lineStyle:{width:2.5,color:accent},symbol:'circle',symbolSize:5},
        {name:'PACF (拖尾)',type:'line',data:pacf_arma,lineStyle:{width:2.5,color:accent2,type:'dashed'},symbol:'circle',symbolSize:5}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el3).resize();});
  }
})();
