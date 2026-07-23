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

  // Helper: generate GDP-like trend data
  function genGDP(n, seed) {
    var r = randn(seed), t = [], y_lin = [], y_quad = [], y_exp = [], y_true = [];
    for (var i = 0; i < n; i++) {
      var year = 2000 + i;
      t.push(year);
      var trend = 50 + 3.2 * i + 0.02 * i * i;
      var noise = (r() - 0.5) * 2 * 1.8;
      y_true.push(trend);
      y_quad.push(trend + noise);
      y_lin.push(50 + 5.5 * i + noise);
      y_exp.push(50 * Math.pow(1.06, i) + noise);
    }
    return { t: t, y_true: y_true, y_lin: y_lin, y_quad: y_quad, y_exp: y_exp };
  }

  // ===== 1. GDP Trend Fitting =====
  var el1 = document.getElementById('chart-gdp-trend');
  if (el1) {
    var gdp = genGDP(24, 2024);
    echarts.init(el1, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['实际GDP','线性趋势','二次趋势','指数趋势'],top:4,textStyle:{fontSize:11,color:muted}},
      grid:{top:45,bottom:45,left:65,right:20},
      xAxis:{type:'category',data:gdp.t.map(String),axisLabel:{color:muted,fontSize:10,rotate:45}},
      yAxis:{type:'value',name:'GDP指数',nameGap:50,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'实际GDP',type:'scatter',data:gdp.y_quad,symbolSize:6,itemStyle:{color:accent}},
        {name:'线性趋势',type:'line',data:gdp.y_lin,lineStyle:{color:'#94a3b8',type:'dashed',width:2},symbol:'none'},
        {name:'二次趋势',type:'line',data:gdp.y_quad,lineStyle:{color:accent2,width:2.5},symbol:'none'},
        {name:'指数趋势',type:'line',data:gdp.y_exp,lineStyle:{color:'#d97706',type:'dotted',width:2},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el1).resize();});
  }

  // ===== 2. GDP Residual Comparison =====
  var el2 = document.getElementById('chart-gdp-residual');
  if (el2) {
    var r2 = randn(2025), res_lin = [], res_quad = [], res_exp = [];
    for (var i = 0; i < 24; i++) {
      var n2 = (r2()-0.5)*2*1.8;
      res_lin.push(50+3.2*i+0.02*i*i+ n2 - (50+5.5*i));
      res_quad.push(n2);
      res_exp.push(50+3.2*i+0.02*i*i+n2 - 50*Math.pow(1.06,i));
    }
    echarts.init(el2, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['线性残差','二次残差','指数残差'],top:4,textStyle:{fontSize:11,color:muted}},
      grid:{top:40,bottom:45,left:55,right:20},
      xAxis:{type:'category',data:makeCats(24,2000).map(String),axisLabel:{color:muted,fontSize:10,rotate:45}},
      yAxis:{type:'value',name:'残差',nameGap:40,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'线性残差',type:'bar',data:res_lin,itemStyle:{color:'#94a3b8'},barWidth:10},
        {name:'二次残差',type:'bar',data:res_quad,itemStyle:{color:accent2},barWidth:10},
        {name:'指数残差',type:'bar',data:res_exp,itemStyle:{color:'#d97706'},barWidth:10}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el2).resize();});
  }

  // ===== 3. GDP Model Comparison (R² / RSS) =====
  var el3 = document.getElementById('chart-gdp-rss');
  if (el3) {
    echarts.init(el3, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['R\u00b2','残差平方和(RSS)'],top:4,textStyle:{color:muted}},
      grid:{top:40,bottom:40,left:55,right:55},
      xAxis:{type:'category',data:['线性模型','二次模型','指数模型'],axisLabel:{color:muted,fontSize:12}},
      yAxis:[
        {type:'value',name:'R\u00b2',nameGap:40,min:0.85,max:1,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
        {type:'value',name:'RSS',nameGap:40,axisLabel:{color:muted},splitLine:{show:false}}
      ],
      series:[
        {name:'R\u00b2',type:'bar',data:[0.92,0.98,0.90],itemStyle:{color:accent},barWidth:28},
        {name:'残差平方和(RSS)',type:'bar',data:[85,12,95],itemStyle:{color:accent2},barWidth:28,yAxisIndex:1}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el3).resize();});
  }

  // ===== 4. CSI300 Monthly Time Series =====
  var el4 = document.getElementById('chart-csi300-monthly');
  if (el4) {
    var r4 = randn(3001), months = [];
    var vals = [];
    for (var i = 0; i < 60; i++) {
      var m = i % 12;
      var trend = 3500 + 15 * i;
      var seasonal = 200 * Math.sin(2 * Math.PI * m / 12 + 1.0);
      var noise = (r4()-0.5)*2*150;
      vals.push(Math.round(trend + seasonal + noise));
      months.push('2019-' + String(m+1).padStart(2,'0'));
    }
    echarts.init(el4, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:25,bottom:55,left:65,right:20},
      xAxis:{type:'category',data:months,axisLabel:{color:muted,fontSize:9,rotate:60,interval:2}},
      yAxis:{type:'value',name:'沪深300指数',nameGap:50,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'line',data:vals,lineStyle:{width:1.5,color:accent},symbol:'none',
        markLine:{silent:true,data:[{yAxis:3800,lineStyle:{color:'#dc2626',type:'dashed',width:1},label:{formatter:'均值',color:'#dc2626',fontSize:10}}]}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el4).resize();});
  }

  // ===== 5. Seasonal Index Bar =====
  var el5 = document.getElementById('chart-seasonal-index');
  if (el5) {
    var seasonIdx = [102.5, 98.7, 103.1, 101.2, 97.5, 95.8, 94.2, 96.3, 101.8, 103.5, 104.2, 101.2];
    var monthLabels = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    var barColors = seasonIdx.map(function(v){return v >= 100 ? accent2 : accent;});
    echarts.init(el5, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:25,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:monthLabels,axisLabel:{color:muted,fontSize:11}},
      yAxis:{type:'value',name:'季节指数 (%)',nameGap:45,min:90,max:110,axisLabel:{color:muted,formatter:'{value}%'},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'bar',data:seasonIdx,itemStyle:{color:function(p){return p.dataIndex>=0?barColors[p.dataIndex]:accent;}},
        barWidth:20,
        markLine:{silent:true,data:[{yAxis:100,lineStyle:{color:'#94a3b8',type:'dashed',width:1.5},label:{formatter:'基准 100%',color:'#94a3b8',fontSize:11}}]}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el5).resize();});
  }

  // ===== 6. Seasonal Decomposition =====
  var el6 = document.getElementById('chart-seasonal-decomp');
  if (el6) {
    var r6 = randn(4001);
    var nd = [], td = [], sd = [], rd = [];
    for (var i = 0; i < 60; i++) {
      var m6 = i % 12;
      var t6 = 3500 + 15*i;
      var s6 = 200 * Math.sin(2*Math.PI*m6/12+1.0);
      var n6 = (r6()-0.5)*2*150;
      nd.push(t6+s6+n6); td.push(t6); sd.push(s6); rd.push(n6);
    }
    var mLabels = Array.from({length:60},function(_,i){return '2019-'+String((i%12)+1).padStart(2,'0');});
    echarts.init(el6, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['原始序列','趋势成分','季节成分','残差成分'],top:4,textStyle:{fontSize:11,color:muted}},
      grid:[{top:40,left:55,right:20,height:'22%'},{top:'30%',left:55,right:20,height:'20%'},{top:'56%',left:55,right:20,height:'18%'},{top:'78%',left:55,right:20,height:'18%',bottom:10}],
      xAxis:[
        {type:'category',data:mLabels,gridIndex:0,show:false},
        {type:'category',data:mLabels,gridIndex:1,show:false},
        {type:'category',data:mLabels,gridIndex:2,show:false},
        {type:'category',data:mLabels,gridIndex:3,axisLabel:{color:muted,fontSize:9,interval:5}}
      ],
      yAxis:[
        {type:'value',gridIndex:0,axisLabel:{color:muted,fontSize:10},splitLine:{lineStyle:{color:rule}}},
        {type:'value',gridIndex:1,axisLabel:{color:muted,fontSize:10},splitLine:{lineStyle:{color:rule}}},
        {type:'value',gridIndex:2,axisLabel:{color:muted,fontSize:10},splitLine:{lineStyle:{color:rule}}},
        {type:'value',gridIndex:3,axisLabel:{color:muted,fontSize:10},splitLine:{lineStyle:{color:rule}}}
      ],
      series:[
        {name:'原始序列',type:'line',data:nd,xAxisIndex:0,yAxisIndex:0,lineStyle:{color:accent,width:1.5},symbol:'none'},
        {name:'趋势成分',type:'line',data:td,xAxisIndex:1,yAxisIndex:1,lineStyle:{color:'#dc2626',width:2},symbol:'none'},
        {name:'季节成分',type:'line',data:sd,xAxisIndex:2,yAxisIndex:2,lineStyle:{color:accent2,width:1.5},symbol:'none'},
        {name:'残差成分',type:'bar',data:rd,xAxisIndex:3,yAxisIndex:3,itemStyle:{color:'#94a3b8'},barWidth:6}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el6).resize();});
  }

  // ===== 7. Moving Average vs Exponential Smoothing =====
  var el7 = document.getElementById('chart-smooth-compare');
  if (el7) {
    var r7 = randn(7001);
    var orig = [], ma3 = [], ma5 = [], ma12 = [], ses03 = [], ses08 = [];
    var prev3 = 0, prev5 = 0, prev12 = 0, s3 = 0, s8 = 0;
    for (var i = 0; i < 120; i++) {
      var v7 = 3000 + 5*i + 150*Math.sin(2*Math.PI*i/12) + (r7()-0.5)*2*80;
      orig.push(Math.round(v7));
      if (i >= 2) {
        var s = 0, cnt = 0;
        for (var j = 0; j < 3 && i-j >= 0; j++) { s += orig[i-j]; cnt++; }
        ma3.push(Math.round(s/cnt));
      } else { ma3.push(null); }
      if (i >= 4) {
        var s5 = 0;
        for (var j5 = 0; j5 < 5; j5++) s5 += orig[i-j5];
        ma5.push(Math.round(s5/5));
      } else { ma5.push(null); }
      if (i >= 11) {
        var s12 = 0;
        for (var j12 = 0; j12 < 12; j12++) s12 += orig[i-j12];
        ma12.push(Math.round(s12/12));
      } else { ma12.push(null); }
      if (i === 0) { s3 = v7; s8 = v7; }
      else { s3 = 0.3*orig[i]+0.7*s3; s8 = 0.8*orig[i]+0.2*s8; }
      ses03.push(Math.round(s3));
      ses08.push(Math.round(s8));
    }
    var labels7 = makeCats(120);
    echarts.init(el7, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['原始序列','MA(3)','MA(5)','MA(12)','SES(\u03b1=0.3)','SES(\u03b1=0.8)'],top:4,textStyle:{fontSize:10,color:muted}},
      grid:{top:50,bottom:40,left:60,right:20},
      xAxis:{type:'category',data:labels7,show:false},
      yAxis:{type:'value',name:'指数',nameGap:40,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'原始序列',type:'line',data:orig,lineStyle:{color:'#94a3b8',width:1},symbol:'none'},
        {name:'MA(3)',type:'line',data:ma3,lineStyle:{color:accent,width:2},symbol:'none'},
        {name:'MA(5)',type:'line',data:ma5,lineStyle:{color:accent2,width:2},symbol:'none'},
        {name:'MA(12)',type:'line',data:ma12,lineStyle:{color:'#d97706',width:2,type:'dashed'},symbol:'none'},
        {name:'SES(\u03b1=0.3)',type:'line',data:ses03,lineStyle:{color:'#dc2626',width:2,type:'dotted'},symbol:'none'},
        {name:'SES(\u03b1=0.8)',type:'line',data:ses08,lineStyle:{color:'#7c3aed',width:2,type:'dotted'},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el7).resize();});
  }

  // ===== 8. Smoothing Parameter Comparison (zoom on recent) =====
  var el8 = document.getElementById('chart-alpha-compare');
  if (el8) {
    var r8 = randn(8001);
    var orig8 = [], sArr = [0.1,0.3,0.5,0.8,0.95];
    var smooths = sArr.map(function(){return [];});
    var sVals = sArr.map(function(){return 0;});
    for (var i = 0; i < 100; i++) {
      var v8 = 3500 + 100*Math.sin(2*Math.PI*i/12) + (r8()-0.5)*2*60;
      orig8.push(Math.round(v8));
      for (var a = 0; a < sArr.length; a++) {
        if (i === 0) sVals[a] = v8;
        else sVals[a] = sArr[a]*v8 + (1-sArr[a])*sVals[a];
        smooths[a].push(Math.round(sVals[a]));
      }
    }
    var sr = orig8.slice(60); var srs = smooths.map(function(s){return s.slice(60);});
    var lab8 = makeCats(40, 61);
    var sNames = sArr.map(function(a){return '\u03b1='+a;});
    var sColors = ['#94a3b8','#2563eb','#4338ca','#dc2626','#d97706'];
    var sers8 = [{name:'原始数据',type:'line',data:sr,lineStyle:{color:'#94a3b8',width:1.5},symbol:'none'}];
    for (var si = 0; si < sArr.length; si++) {
      sers8.push({name:sNames[si],type:'line',data:srs[si],lineStyle:{color:sColors[si],width:2},symbol:'none'});
    }
    echarts.init(el8, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['原始数据'].concat(sNames),top:4,textStyle:{fontSize:10,color:muted}},
      grid:{top:50,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:lab8,show:false},
      yAxis:{type:'value',name:'指数',nameGap:40,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series: sers8
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el8).resize();});
  }

  // ===== 9. MA Window Size Effect =====
  var el9 = document.getElementById('chart-ma-window');
  if (el9) {
    var r9 = randn(9001);
    var orig9 = [], m3_ = [], m5_ = [], m10_ = [], m20_ = [];
    var buf3 = [], buf5 = [], buf10 = [], buf20 = [];
    for (var i = 0; i < 120; i++) {
      var v9 = 3200 + 200*Math.sin(2*Math.PI*i/24+0.5) + (r9()-0.5)*2*120;
      orig9.push(Math.round(v9));
      buf3.push(v9); if(buf3.length>3) buf3.shift();
      buf5.push(v9); if(buf5.length>5) buf5.shift();
      buf10.push(v9); if(buf10.length>10) buf10.shift();
      buf20.push(v9); if(buf20.length>20) buf20.shift();
      var sum = function(a){var s=0;for(var j=0;j<a.length;j++)s+=a[j];return s/a.length;};
      m3_.push(Math.round(sum(buf3)));
      m5_.push(Math.round(sum(buf5)));
      m10_.push(Math.round(sum(buf10)));
      m20_.push(Math.round(sum(buf20)));
    }
    echarts.init(el9, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['原始序列','MA(3)','MA(5)','MA(10)','MA(20)'],top:4,textStyle:{fontSize:10,color:muted}},
      grid:{top:45,bottom:40,left:60,right:20},
      xAxis:{type:'category',data:makeCats(120),show:false},
      yAxis:{type:'value',name:'指数',nameGap:40,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'原始序列',type:'line',data:orig9,lineStyle:{color:'#94a3b8',width:1},symbol:'none'},
        {name:'MA(3)',type:'line',data:m3_,lineStyle:{color:accent,width:1.5},symbol:'none'},
        {name:'MA(5)',type:'line',data:m5_,lineStyle:{color:accent2,width:1.5},symbol:'none'},
        {name:'MA(10)',type:'line',data:m10_,lineStyle:{color:'#d97706',width:2},symbol:'none'},
        {name:'MA(20)',type:'line',data:m20_,lineStyle:{color:'#dc2626',width:2,type:'dashed'},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el9).resize();});
  }
})();
