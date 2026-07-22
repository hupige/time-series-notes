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

  var months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

  // ===== Chart 1: Trend fitting comparison =====
  var el1 = document.getElementById('chart-trend-fit');
  if (el1) {
    var t = Array.from({length:60},function(_,i){return i+1;});
    var trend_linear = t.map(function(v){return 10+0.5*v;});
    var trend_exp = t.map(function(v){return 10*Math.exp(0.02*v);});
    var noisy = t.map(function(v,i){return trend_exp[i]+(Math.sin(v/3)*2)+(Math.random()-0.5)*3;});
    echarts.init(el1, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['原始序列','线性趋势','指数趋势'],top:4,textStyle:{color:muted,fontSize:12}},
      grid:{top:45,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:t,name:'时期',nameGap:25,axisLabel:{color:muted}},
      yAxis:{type:'value',axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'原始序列',type:'line',data:noisy,lineStyle:{width:1.5,color:'#94a3b8'},symbol:'none'},
        {name:'线性趋势',type:'line',data:trend_linear,lineStyle:{width:2.5,color:accent},symbol:'none'},
        {name:'指数趋势',type:'line',data:trend_exp,lineStyle:{width:2.5,color:accent2,type:'dashed'},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el1).resize();});
  }

  // ===== Chart 2: Seasonal effect =====
  var el2 = document.getElementById('chart-seasonal');
  if (el2) {
    var r = randn(33);
    var seasonal_pattern = [0.85,0.82,0.88,0.95,1.02,1.10,1.15,1.12,1.05,0.98,0.92,0.88];
    var seasonal_data = [];
    for (var year=0; year<5; year++) {
      for (var m=0; m<12; m++) {
        seasonal_data.push((100 + year*10) * seasonal_pattern[m] + (r()-0.5)*5);
      }
    }
    var seasonal_cats = Array.from({length:60},function(_,i){return (i+1)+'';});
    echarts.init(el2, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:45,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:seasonal_cats,show:false},
      yAxis:{type:'value',name:'销售额',axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'月度销售额',type:'line',data:seasonal_data,lineStyle:{width:1.8,color:accent},areaStyle:{color:'rgba(67,56,202,0.08)'},symbol:'none'},
        {name:'季节指数',type:'line',data:seasonal_pattern.map(function(v){return v*100;}),lineStyle:{width:2,color:accent2,type:'dashed'},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el2).resize();});
  }

  // ===== Chart 3: Decomposition (4-panel) =====
  var el3 = document.getElementById('chart-decomposition');
  if (el3) {
    var r2 = randn(44);
    var obs = [], tr = [], seas = [], resid = [];
    var sp = [5,3,0,-4,-6,-5,0,4,6,5,2,-1];
    for (var i=0; i<48; i++) {
      var trend_i = 50 + 0.8*i;
      var seas_i = sp[i%12];
      var res_i = (r2()-0.5)*3;
      tr.push(trend_i); seas.push(seas_i); resid.push(res_i);
      obs.push(trend_i + seas_i + res_i);
    }
    var cats3 = Array.from({length:48},function(_,i){return (i+1)+'';});
    var baseOpt = function(title, data, color) {
      return {
        animation:false, grid:{top:22,bottom:18,left:50,right:10}, xAxis:{type:'category',data:cats3,show:false}, yAxis:{type:'value',axisLabel:{fontSize:9,color:muted},splitLine:{lineStyle:{color:rule}},axisLine:{show:false}},
        series:[{type:'line',data:data,lineStyle:{width:1.5,color:color},symbol:'none',areaStyle:color==='transparent'?undefined:{color:color.replace(')','').replace('rgb','rgba')+',0.1)'}}]
      };
    };
    // Use a single chart with multiple grids
    echarts.init(el3, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      title:[
        {text:'原始序列',left:60,top:5,textStyle:{fontSize:12,color:muted}},
        {text:'趋势',left:60,top:135,textStyle:{fontSize:12,color:muted}},
        {text:'季节',left:60,top:265,textStyle:{fontSize:12,color:muted}},
        {text:'残差',left:60,top:395,textStyle:{fontSize:12,color:muted}}
      ],
      grid:[
        {top:22,height:90,left:55,right:20},
        {top:152,height:90,left:55,right:20},
        {top:282,height:90,left:55,right:20},
        {top:412,height:90,left:55,right:20}
      ],
      xAxis:[
        {type:'category',data:cats3,gridIndex:0,show:false},{type:'category',data:cats3,gridIndex:1,show:false},{type:'category',data:cats3,gridIndex:2,show:false},{type:'category',data:cats3,gridIndex:3,axisLabel:{fontSize:9,color:muted}}
      ],
      yAxis:[
        {type:'value',gridIndex:0,axisLabel:{fontSize:9,color:muted},splitLine:{lineStyle:{color:rule}}},
        {type:'value',gridIndex:1,axisLabel:{fontSize:9,color:muted},splitLine:{lineStyle:{color:rule}}},
        {type:'value',gridIndex:2,axisLabel:{fontSize:9,color:muted},splitLine:{lineStyle:{color:rule}}},
        {type:'value',gridIndex:3,axisLabel:{fontSize:9,color:muted},splitLine:{lineStyle:{color:rule}}}
      ],
      series:[
        {type:'line',data:obs,xAxisIndex:0,yAxisIndex:0,lineStyle:{width:1.5,color:accent},symbol:'none'},
        {type:'line',data:tr,xAxisIndex:1,yAxisIndex:1,lineStyle:{width:1.5,color:accent2},symbol:'none'},
        {type:'line',data:seas,xAxisIndex:2,yAxisIndex:2,lineStyle:{width:1.5,color:'#d97706'},symbol:'none'},
        {type:'line',data:resid,xAxisIndex:3,yAxisIndex:3,lineStyle:{width:1,color:'#94a3b8'},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el3).resize();});
  }
})();
