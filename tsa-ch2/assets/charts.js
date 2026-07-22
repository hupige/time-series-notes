(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();

  function randn(seed) {
    var s = seed || 1;
    return function() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // ===== Chart 1: ACF comparison (stationary vs random walk) =====
  var el1 = document.getElementById('chart-stationary-acf');
  if (el1) {
    var r1 = randn(42);
    var acf_stationary = [1];
    var phi = 0.7;
    for (var k = 1; k <= 20; k++) acf_stationary.push(Math.pow(phi, k));
    var acf_rw = [];
    for (k = 0; k <= 20; k++) acf_rw.push(1 - 0.015 * k); // slowly decaying

    echarts.init(el1, null, {renderer:'svg'}).setOption({
      animation: false,
      tooltip: {trigger:'axis', appendToBody:true},
      legend: {data:['平稳AR(1) ACF','随机游走 ACF'], top:4, textStyle:{color:muted,fontSize:12}},
      grid: {top:45,bottom:40,left:55,right:20},
      xAxis: {type:'category', data:Array.from({length:21},function(_,i){return i;}), name:'滞后k', nameGap:25, axisLabel:{color:muted}},
      yAxis: {type:'value', min:-0.2, max:1.1, axisLabel:{color:muted}, splitLine:{lineStyle:{color:rule}}},
      series: [
        {name:'平稳AR(1) ACF', type:'bar', data:acf_stationary, itemStyle:{color:accent}, barWidth:10},
        {name:'随机游走 ACF', type:'line', data:acf_rw, lineStyle:{width:2.5,color:accent2}, symbol:'circle', symbolSize:5}
      ]
    });
    window.addEventListener('resize', function() { echarts.getInstanceByDom(el1).resize(); });
  }

  // ===== Chart 2: ADF demo (random walk vs stationary) =====
  var el2 = document.getElementById('chart-adf-demo');
  if (el2) {
    var r2a = randn(77), r2b = randn(99);
    var rw = [0], ar1 = [0];
    for (var i = 1; i < 200; i++) {
      rw.push(rw[i-1] + (r2a() - 0.5));
      ar1.push(0.7 * ar1[i-1] + (r2b() - 0.5));
    }
    var cats = Array.from({length:200},function(_,i){return i;});
    echarts.init(el2, null, {renderer:'svg'}).setOption({
      animation: false,
      tooltip: {trigger:'axis', appendToBody:true},
      legend: {data:['随机游走 (非平稳)','AR(1) (平稳)'], top:4, textStyle:{color:muted,fontSize:12}},
      grid: {top:45,bottom:40,left:55,right:20},
      xAxis: {type:'category', data:cats, show:false},
      yAxis: {type:'value', axisLabel:{color:muted}, splitLine:{lineStyle:{color:rule}}},
      series: [
        {name:'随机游走 (非平稳)', type:'line', data:rw, lineStyle:{width:1.8,color:accent}, symbol:'none'},
        {name:'AR(1) (平稳)', type:'line', data:ar1, lineStyle:{width:1.8,color:accent2}, symbol:'none'}
      ]
    });
    window.addEventListener('resize', function() { echarts.getInstanceByDom(el2).resize(); });
  }

  // ===== Chart 3: White noise ACF with confidence bands =====
  var el3 = document.getElementById('chart-wn-acf');
  if (el3) {
    var r3 = randn(55);
    var wn = Array.from({length:100}, function() { return r3() - 0.5; });
    var n = wn.length;
    var mean = wn.reduce(function(a,b){return a+b;},0)/n;
    var acf = [1];
    for (var lag = 1; lag <= 20; lag++) {
      var num = 0, den = 0;
      for (var t = 0; t < n; t++) { den += Math.pow(wn[t]-mean, 2); }
      for (t = 0; t < n - lag; t++) { num += (wn[t]-mean)*(wn[t+lag]-mean); }
      acf.push(num/den);
    }
    var se = 1/Math.sqrt(n);
    var upper = Array.from({length:21},function(){return 2*se;});
    var lower = Array.from({length:21},function(){return -2*se;});
    var lags = Array.from({length:21},function(_,i){return i;});

    echarts.init(el3, null, {renderer:'svg'}).setOption({
      animation: false,
      tooltip: {trigger:'axis', appendToBody:true},
      legend: {data:['样本ACF','95%置信界'], top:4, textStyle:{color:muted,fontSize:12}},
      grid: {top:45,bottom:40,left:55,right:20},
      xAxis: {type:'category', data:lags, name:'滞后k', nameGap:25, axisLabel:{color:muted}},
      yAxis: {type:'value', min:-0.4, max:1.1, axisLabel:{color:muted}, splitLine:{lineStyle:{color:rule}}},
      series: [
        {name:'样本ACF', type:'bar', data:acf, itemStyle:{color:accent}, barWidth:10},
        {name:'95%置信界', type:'line', data:upper, lineStyle:{width:1.5,color:'#94a3b8',type:'dashed'}, symbol:'none'},
        {type:'line', data:lower, lineStyle:{width:1.5,color:'#94a3b8',type:'dashed'}, symbol:'none', showInLegend:false}
      ]
    });
    window.addEventListener('resize', function() { echarts.getInstanceByDom(el3).resize(); });
  }
})();
