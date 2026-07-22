(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();

  function randn(seed) {
    var s = seed || 1;
    return function() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  // ===== Chart 1: Original vs Differenced Series =====
  var el1 = document.getElementById('chart-diff');
  if (el1) {
    var r1 = randn(66);
    var original = [100];
    for (var i=1; i<100; i++) original.push(original[i-1] + 0.3 + (r1()-0.5)*2);
    var diff1 = [];
    for (i=1; i<original.length; i++) diff1.push(original[i]-original[i-1]);
    var cats = Array.from({length:99},function(_,i){return i+1;});
    echarts.init(el1, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['原始序列 (非平稳)','一阶差分 (平稳)'],top:4,textStyle:{color:muted,fontSize:12}},
      grid:{top:45,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:cats,show:false},
      yAxis:[
        {type:'value',name:'原始值',position:'left',axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
        {type:'value',name:'差分值',position:'right',axisLabel:{color:muted},splitLine:{show:false}}
      ],
      series:[
        {name:'原始序列 (非平稳)',type:'line',data:original,yAxisIndex:0,lineStyle:{width:2,color:accent},symbol:'none'},
        {name:'一阶差分 (平稳)',type:'line',data:diff1,yAxisIndex:1,lineStyle:{width:2,color:accent2},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el1).resize();});
  }

  // ===== Chart 2: ARIMA(1,1,1) Simulation =====
  var el2 = document.getElementById('chart-arima-sim');
  if (el2) {
    var r2 = randn(77);
    var eps = [0], y = [0];
    var phi=0.6, theta=0.3;
    for (var i=1; i<120; i++) {
      var e = (r2()-0.5)*2;
      eps.push(e);
      y.push(y[i-1] + phi*(y[i-1]-y[i-2]) + e - theta*eps[i-1]);
    }
    var cats2 = Array.from({length:120},function(_,i){return i+1;});
    echarts.init(el2, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:30,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:cats2,show:false},
      yAxis:{type:'value',axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'ARIMA(1,1,1)',type:'line',data:y,lineStyle:{width:1.8,color:accent},symbol:'none',areaStyle:{color:'rgba(190,24,93,0.06)'}}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el2).resize();});
  }

  // ===== Chart 3: Random Walk Properties =====
  var el3 = document.getElementById('chart-random-walk');
  if (el3) {
    var cats3 = Array.from({length:100},function(_,i){return i+1;});
    var series = [];
    var colors = [accent, accent2, '#d97706', '#7c3aed', '#94a3b8'];
    for (var s=0; s<5; s++) {
      var rs = randn(100+s*7);
      var path = [0];
      for (var i=1; i<100; i++) path.push(path[i-1] + (rs()-0.5)*2.5);
      series.push({name:'路径'+(s+1),type:'line',data:path,lineStyle:{width:1.5,color:colors[s]},symbol:'none'});
    }
    echarts.init(el3, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:series.map(function(v){return v.name;}),top:4,textStyle:{color:muted,fontSize:11}},
      grid:{top:55,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:cats3,name:'时期',nameGap:25,axisLabel:{color:muted}},
      yAxis:{type:'value',axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:series
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el3).resize();});
  }
})();
