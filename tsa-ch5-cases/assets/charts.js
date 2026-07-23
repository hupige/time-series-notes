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
  function makeCats(n, offset) { offset = offset || 1; return Array.from({length:n},function(_,i){return i+offset;}); }
  function genRandomWalk(n, seed, start, drift, vol) {
    var r = randn(seed), v = start || 100, d = drift || 0, sig = vol || 1.5;
    var path = [v];
    for (var i = 1; i < n; i++) { v = v + d + sig * (r() - 0.5) * 2; path.push(v); }
    return path;
  }

  // ===== 1. Stock Price (non-stationary) =====
  var el1 = document.getElementById('chart-stock-price');
  if (el1) {
    var price = genRandomWalk(250, 5001, 15.0, 0.02, 0.4);
    var labels1 = makeCats(250);
    echarts.init(el1, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:25,bottom:40,left:60,right:20},
      xAxis:{type:'category',data:labels1,show:false},
      yAxis:{type:'value',name:'股价(元)',nameGap:45,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'line',data:price,lineStyle:{color:accent,width:1.5},symbol:'none',areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:accent+'20'},{offset:1,color:accent+'05'}]}}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el1).resize();});
  }

  // ===== 2. Stock Return (stationary) =====
  var el2 = document.getElementById('chart-stock-return');
  if (el2) {
    var price2 = genRandomWalk(250, 5002, 15.0, 0.02, 0.4);
    var ret2 = [0];
    for (var i = 1; i < price2.length; i++) { ret2.push(parseFloat(((price2[i]/price2[i-1])-1)*10000)/100); }
    echarts.init(el2, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:25,bottom:40,left:60,right:20},
      xAxis:{type:'category',data:makeCats(250),show:false},
      yAxis:{type:'value',name:'日收益率(%)',nameGap:45,axisLabel:{color:muted,formatter:'{value}%'},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'bar',data:ret2,itemStyle:{color:function(p){return p.data[1]>=0?accent2:'#dc2626'}},barWidth:3}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el2).resize();});
  }

  // ===== 3. ADF Test Comparison =====
  var el3 = document.getElementById('chart-adf-compare');
  if (el3) {
    echarts.init(el3, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:45,bottom:40,left:100,right:30},
      xAxis:{type:'value',name:'统计量',nameGap:25,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      yAxis:{type:'category',data:['一阶差分收益率','对数股价','原始股价'],axisLabel:{color:muted,fontSize:12}},
      series:[
        {type:'bar',data:[
          {value:-12.5,itemStyle:{color:accent2}},
          {value:-1.8,itemStyle:{color:'#d97706'}},
          {value:0.5,itemStyle:{color:'#dc2626'}}
        ],barWidth:18,label:{show:true,position:'right',formatter:function(p){return p.value.toFixed(1)},color:muted,fontSize:12}},
        {type:'bar',data:[{value:-2.86},{value:-2.86},{value:-2.86}],barWidth:12,barGap:'30%',
          itemStyle:{color:'#94a3b8',opacity:0.4},
          label:{show:true,position:'right',formatter:function(p){return '临界值: '+p.value.toFixed(2)},color:'#94a3b8',fontSize:10}}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el3).resize();});
  }

  // ===== 4. CSI300 Return Series =====
  var el4 = document.getElementById('chart-csi300-return');
  if (el4) {
    var r4 = randn(6001), rets4 = [];
    for (var i = 0; i < 200; i++) { rets4.push(parseFloat(((r4()-0.5)*2*1.5*100).toFixed(2))/100); }
    echarts.init(el4, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:25,bottom:40,left:60,right:20},
      xAxis:{type:'category',data:makeCats(200),show:false},
      yAxis:{type:'value',name:'日收益率(%)',nameGap:45,axisLabel:{color:muted,formatter:'{value}%'},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'bar',data:rets4,itemStyle:{color:function(p){return p.data[1]>=0?accent:'#dc2626'}},barWidth:4,
        markLine:{silent:true,data:[{yAxis:0,lineStyle:{color:'#94a3b8',type:'dashed',width:1}}]}]}
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el4).resize();});
  }

  // ===== 5. Return ACF/PACF =====
  var el5 = document.getElementById('chart-return-acf');
  if (el5) {
    var acfVals = [1.0, 0.05, -0.03, 0.08, -0.02, 0.01, -0.04, 0.06, -0.01, 0.03, -0.05, 0.02, 0.01, -0.03, 0.04, -0.02, 0.01, 0.03, -0.02, 0.01];
    var pacfVals = [1.0, 0.05, -0.03, 0.09, -0.01, 0.00, -0.05, 0.07, 0.00, 0.02, -0.04, 0.03, 0.00, -0.02, 0.05, -0.03, 0.00, 0.02, -0.01, 0.01];
    var lagLabels = acfVals.map(function(_,i){return i;});
    var ci = 0.14;
    echarts.init(el5, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['ACF','PACF','95% 置信区间'],top:4,textStyle:{fontSize:11,color:muted}},
      grid:[{top:40,left:50,right:20,height:'40%'},{top:'58%',left:50,right:20,height:'35%',bottom:10}],
      xAxis:[{type:'category',data:lagLabels,gridIndex:0,axisLabel:{color:muted,fontSize:10}},{type:'category',data:lagLabels,gridIndex:1,axisLabel:{color:muted,fontSize:10},name:'滞后阶数'}],
      yAxis:[{type:'value',gridIndex:0,min:-0.3,max:1.1,axisLabel:{color:muted,fontSize:10},splitLine:{lineStyle:{color:rule}},name:'ACF',nameGap:30},{type:'value',gridIndex:1,min:-0.3,max:1.1,axisLabel:{color:muted,fontSize:10},splitLine:{lineStyle:{color:rule}},name:'PACF',nameGap:30}],
      series:[
        {name:'ACF',type:'bar',xAxisIndex:0,yAxisIndex:0,data:acfVals,itemStyle:{color:accent},barWidth:10},
        {name:'95% 置信区间',type:'line',xAxisIndex:0,yAxisIndex:0,data:Array(20).fill(ci),lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},
        {name:'95% 置信区间',type:'line',xAxisIndex:0,yAxisIndex:0,data:Array(20).fill(-ci),lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},
        {name:'PACF',type:'bar',xAxisIndex:1,yAxisIndex:1,data:pacfVals,itemStyle:{color:accent2},barWidth:10},
        {name:'95% 置信区间',type:'line',xAxisIndex:1,yAxisIndex:1,data:Array(20).fill(ci),lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},
        {name:'95% 置信区间',type:'line',xAxisIndex:1,yAxisIndex:1,data:Array(20).fill(-ci),lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el5).resize();});
  }

  // ===== 6. ARIMA Model Comparison =====
  var el6 = document.getElementById('chart-arima-compare');
  if (el6) {
    echarts.init(el6, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['AIC','BIC'],top:4,textStyle:{color:muted}},
      grid:{top:40,bottom:40,left:50,right:20},
      xAxis:{type:'category',data:['ARIMA(1,0,0)','ARIMA(2,0,0)','ARIMA(0,0,1)','ARIMA(1,0,1)','ARIMA(2,0,1)','ARIMA(1,1,1)'],axisLabel:{color:muted,fontSize:10,rotate:20}},
      yAxis:{type:'value',name:'信息准则',nameGap:40,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'AIC',type:'bar',data:[-1180,-1185,-1178,-1183,-1190,-1195],itemStyle:{color:accent},barWidth:18},
        {name:'BIC',type:'bar',data:[-1172,-1173,-1172,-1171,-1174,-1183],itemStyle:{color:accent2},barWidth:18}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el6).resize();});
  }

  // ===== 7. ARIMA Residual Diagnostics =====
  var el7 = document.getElementById('chart-arima-resid');
  if (el7) {
    var r7 = randn(7001), resid = [];
    for (var i = 0; i < 200; i++) { resid.push(parseFloat(((r7()-0.5)*2*1.2*100).toFixed(2))/100); }
    echarts.init(el7, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:25,bottom:40,left:60,right:20},
      xAxis:{type:'category',data:makeCats(200),show:false},
      yAxis:{type:'value',name:'残差',nameGap:40,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'bar',data:resid,itemStyle:{color:function(p){return Math.abs(p.data[1])>2.5?accent:'#94a3b8'}},barWidth:3,
        markLine:{silent:true,data:[{yAxis:0,lineStyle:{color:'#94a3b8',type:'dashed',width:1}},{yAxis:2.5,lineStyle:{color:'#dc2626',type:'dotted',width:1},label:{formatter:'\u00b12\u03c3',color:'#dc2626',fontSize:10}},{yAxis:-2.5,lineStyle:{color:'#dc2626',type:'dotted',width:1}}]}]}
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el7).resize();});
  }

  // ===== 8. ARIMA Forecast =====
  var el8 = document.getElementById('chart-arima-forecast');
  if (el8) {
    var r8 = randn(8001), hist = [], forecast = [], upper = [], lower = [];
    for (var i = 0; i < 200; i++) { hist.push(parseFloat(((r8()-0.5)*2*1.5*100).toFixed(2))/100); }
    var lastVal = hist[hist.length-1];
    for (var i = 0; i < 20; i++) {
      var fv = lastVal * Math.pow(0.95, i+1) * (i < 3 ? 1 : 0.98);
      var w = (i+1) * 0.35;
      forecast.push(parseFloat(fv.toFixed(3)));
      upper.push(parseFloat((fv + w).toFixed(3)));
      lower.push(parseFloat((fv - w).toFixed(3)));
    }
    var allLabels = makeCats(220);
    var fStart = Array(200).fill(null);
    var uStart = fStart.slice(), lStart = fStart.slice();
    echarts.init(el8, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['历史收益率','点预测','95%置信区间'],top:4,textStyle:{fontSize:11,color:muted}},
      grid:{top:40,bottom:40,left:60,right:20},
      xAxis:{type:'category',data:allLabels,show:false},
      yAxis:{type:'value',name:'收益率(%)',nameGap:45,axisLabel:{color:muted,formatter:'{value}%'},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'历史收益率',type:'line',data:hist,lineStyle:{color:accent,width:1.5},symbol:'none'},
        {name:'点预测',type:'line',data:fStart.concat(forecast),lineStyle:{color:accent2,width:2,type:'dashed'},symbol:'none'},
        {name:'95%置信区间',type:'line',data:uStart.concat(upper),lineStyle:{color:accent2,width:1,opacity:0.5},symbol:'none',areaStyle:{color:accent2+'15'}},
        {name:'95%置信区间',type:'line',data:lStart.concat(lower),lineStyle:{color:accent2,width:1,opacity:0.5},symbol:'none',areaStyle:{color:accent2+'15'}}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el8).resize();});
  }

  // ===== 9. Random Walk vs Drifted Random Walk =====
  var el9 = document.getElementById('chart-rw-compare');
  if (el9) {
    var rw1 = genRandomWalk(250, 9001, 100, 0, 2);
    var rw2 = genRandomWalk(250, 9002, 100, 0.05, 2);
    var rw3 = genRandomWalk(250, 9003, 100, 0, 1);
    echarts.init(el9, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['随机游走(\u03bc=0)','有漂移RW(\u03bc>0)','缩放RW(\u03c3\u00b2)'],top:4,textStyle:{fontSize:11,color:muted}},
      grid:{top:40,bottom:40,left:60,right:20},
      xAxis:{type:'category',data:makeCats(250),show:false},
      yAxis:{type:'value',name:'价格/指数',nameGap:45,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'随机游走(\u03bc=0)',type:'line',data:rw1,lineStyle:{color:accent,width:1.5},symbol:'none'},
        {name:'有漂移RW(\u03bc>0)',type:'line',data:rw2,lineStyle:{color:accent2,width:1.5},symbol:'none'},
        {name:'缩放RW(\u03c3\u00b2)',type:'line',data:rw3,lineStyle:{color:'#94a3b8',width:1.5,type:'dashed'},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el9).resize();});
  }

  // ===== 10. EMH Distribution =====
  var el10 = document.getElementById('chart-emh-dist');
  if (el10) {
    var r10 = randn(10001), rets10 = [];
    for (var i = 0; i < 500; i++) { rets10.push(parseFloat(((r10()-0.5)*2*1.2*100).toFixed(2))/100); }
    rets10.sort(function(a,b){return a-b;});
    var bins = [], bCounts = [];
    var binW = 0.3, bMin = Math.floor(Math.min.apply(null,rets10)/binW)*binW;
    var bMax = Math.ceil(Math.max.apply(null,rets10)/binW)*binW;
    for (var b = bMin; b < bMax; b += binW) {
      bins.push(b.toFixed(1)+'%');
      var cnt = 0;
      for (var j = 0; j < rets10.length; j++) { if (rets10[j] >= b && rets10[j] < b+binW) cnt++; }
      bCounts.push(cnt);
    }
    echarts.init(el10, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:25,bottom:40,left:50,right:20},
      xAxis:{type:'category',data:bins,axisLabel:{color:muted,fontSize:9,rotate:45,interval:2},name:'收益率',nameGap:20,nameLocation:'middle'},
      yAxis:{type:'value',name:'频数',nameGap:35,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'bar',data:bCounts,itemStyle:{color:accent},barWidth:'80%',
        markLine:{silent:true,data:[{xAxis:Math.floor(bins.length/2),lineStyle:{color:accent2,type:'dashed',width:1.5},label:{formatter:'均值\u22480',color:accent2,fontSize:11}}]}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el10).resize();});
  }
})();