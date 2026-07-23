(function(){
  var s=getComputedStyle(document.documentElement);
  var accent=s.getPropertyValue('--accent').trim();
  var accent2=s.getPropertyValue('--accent2').trim();
  var muted=s.getPropertyValue('--muted').trim();
  var rule=s.getPropertyValue('--rule').trim();
  function randn(seed){var r=seed||1;return function(){r=(r*16807)%2147483647;return(r-1)/2147483646;};}
  function makeCats(n,offset){offset=offset||1;return Array.from({length:n},function(_,i){return i+offset;});}
  function simDecompose(n,seed){var r=randn(seed),x=[],t=[],se=[],ir=[];for(var i=0;i<n;i++){var tr=3000+1500*i/n;var se_val=80*Math.sin(2*Math.PI*(i+1)/12);var ir_val=(r()-0.5)*2*120;x.push(tr+se_val+ir_val);t.push(tr);se.push(se_val);ir.push(ir_val);}return {x:x,t:t,se:se,ir:ir};}

  // 1. CSI300 time series
  var el1=document.getElementById('chart-csi300-ts');
  if(el1){
    var d=simDecompose(168,2024);
    echarts.init(el1,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:30,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:makeCats(168),show:false},
      yAxis:{type:'value',name:'指数点',nameGap:45,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'line',data:d.x,lineStyle:{width:1.5,color:accent},symbol:'none',areaStyle:{color:'rgba(21,128,61,0.05)'}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el1).resize();});
  }

  // 2. CSI300 decompose (4 panels)
  var el2=document.getElementById('chart-csi300-decompose');
  if(el2){
    var d2=simDecompose(168,2024);
    echarts.init(el2,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      grid:[{top:40,left:50,right:15,bottom:48,width:'48%'},{top:40,left:'56%',right:10,bottom:48,width:'40%'}],
      xAxis:[{type:'category',data:makeCats(168),gridIndex:0,show:false},{type:'category',data:makeCats(168),gridIndex:1,show:false}],
      yAxis:[{type:'value',name:'原始+趋势',nameGap:45,gridIndex:0,fontSize:10,axisLabel:{color:muted,fontSize:9},splitLine:{lineStyle:{color:rule}}},{type:'value',name:'季节+不规则',nameGap:45,gridIndex:1,fontSize:10,axisLabel:{color:muted,fontSize:9},splitLine:{lineStyle:{color:rule}}}],
      series:[
        {name:'原始',type:'line',data:d2.x,xAxisIndex:0,yAxisIndex:0,lineStyle:{width:1,color:accent},symbol:'none'},
        {name:'趋势',type:'line',data:d2.t,xAxisIndex:0,yAxisIndex:0,lineStyle:{width:2,color:accent2,type:'dashed'},symbol:'none'},
        {name:'季节',type:'bar',data:d2.se,xAxisIndex:1,yAxisIndex:1,itemStyle:{color:accent},barWidth:3},
        {name:'不规则',type:'bar',data:d2.ir,xAxisIndex:1,yAxisIndex:1,itemStyle:{color:muted},barWidth:3}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el2).resize();});
  }

  // 3. Seasonal compare
  var el3=document.getElementById('chart-seasonal-compare');
  if(el3){
    var d3=simDecompose(168,2024);
    echarts.init(el3,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['经典分解','STL'],top:4,textStyle:{color:muted}},
      grid:[{top:35,left:50,right:30,width:'45%'},{top:35,left:'55%',right:15,width:'43%'}],
      xAxis:[{type:'category',data:makeCats(168),gridIndex:0,show:false},{type:'category',data:makeCats(168),gridIndex:1,show:false}],
      yAxis:[{type:'value',name:'经典分解',nameGap:35,gridIndex:0,axisLabel:{color:muted,fontSize:9},splitLine:{lineStyle:{color:rule}}},{type:'value',name:'STL',nameGap:35,gridIndex:1,axisLabel:{color:muted,fontSize:9},splitLine:{lineStyle:{color:rule}}}],
      series:[
        {name:'经典分解',type:'line',data:d3.se,xAxisIndex:0,yAxisIndex:0,lineStyle:{width:1.5,color:accent},symbol:'none'},
        {name:'STL',type:'line',data:d3.se.map(function(v,i){return i>60?v+3*Math.sin(i/30):v;}),xAxisIndex:1,yAxisIndex:1,lineStyle:{width:1.5,color:accent2},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el3).resize();});
  }

  // 4. Rate time series
  var el4=document.getElementById('chart-rate-ts');
  if(el4){
    var r4=randn(2024);var rate=[];
    for(var i=0;i<180;i++) rate.push(3.5+0.5-1.3*i/180+(r4()-0.5)*0.3);
    echarts.init(el4,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:25,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:makeCats(180),show:false},
      yAxis:{type:'value',name:'收益率(%)',nameGap:45,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'line',data:rate,lineStyle:{width:1.5,color:accent},symbol:'none'}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el4).resize();});
  }

  // 5. Roll stats
  var el5=document.getElementById('chart-roll-stats');
  if(el5){
    var r5=randn(2024);var rt=[];for(var i=0;i<180;i++) rt.push(3.5+0.5-1.3*i/180+(r5()-0.5)*0.3);
    var rm=[],rs=[];for(var j=0;j<180;j++){if(j<11){rm.push(null);rs.push(null);}else{var s=0;for(var k=0;k<12;k++) s+=rt[j-k];rm.push(s/12);var m2=0;for(k=0;k<12;k++) m2+=(rt[j-k]-s/12)*(rt[j-k]-s/12);rs.push(Math.sqrt(m2/11));}}
    echarts.init(el5,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['滚动均值','滚动标准差'],top:4,textStyle:{color:muted}},
      grid:[{top:35,left:50,right:30,width:'45%'},{top:35,left:'55%',right:15,width:'43%'}],
      xAxis:[{type:'category',data:makeCats(180),gridIndex:0,show:false},{type:'category',data:makeCats(180),gridIndex:1,show:false}],
      yAxis:[{type:'value',name:'均值(%)',gridIndex:0,axisLabel:{color:muted,fontSize:9},splitLine:{lineStyle:{color:rule}}},{type:'value',name:'标准差(%)',gridIndex:1,axisLabel:{color:muted,fontSize:9},splitLine:{lineStyle:{color:rule}}}],
      series:[{name:'滚动均值',type:'line',data:rm,xAxisIndex:0,yAxisIndex:0,lineStyle:{width:1.5,color:accent},symbol:'none'},{name:'滚动标准差',type:'line',data:rs,xAxisIndex:1,yAxisIndex:1,lineStyle:{width:1.5,color:accent2},symbol:'none'}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el5).resize();});
  }

  // 6. Rate ACF
  var el6=document.getElementById('chart-rate-acf');
  if(el6){
    var acfR=[1,0.95,0.90,0.85,0.80,0.75,0.70,0.65,0.60,0.55,0.50,0.46,0.42,0.38,0.34,0.30,0.27,0.24,0.21,0.18,0.16];
    var se6=2/Math.sqrt(180);
    var lags6=makeCats(21,0);
    echarts.init(el6,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:20,bottom:40,left:50,right:20},
      xAxis:{type:'category',data:lags6,name:'滞后k',nameGap:25,axisLabel:{color:muted}},
      yAxis:{type:'value',min:-0.2,max:1.1,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'bar',data:acfR,itemStyle:{color:accent},barWidth:10},{type:'line',data:makeCats(21,0).map(function(){return se6;}),lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'},{type:'line',data:makeCats(21,0).map(function(){return -se6;}),lineStyle:{color:'#94a3b8',type:'dashed',width:1},symbol:'none'}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el6).resize();});
  }

  // 7. K-line
  var el7=document.getElementById('chart-kline');
  if(el7){
    var r7=randn(2024);var c7=[3000];for(var i=1;i<500;i++) c7.push(c7[i-1]*(1+0.0003+(r7()-0.5)*0.03));
    var kdata=[];var r7b=randn(999);
    for(i=0;i<200;i++){var op=c7[i*2]*(1+(r7b()-0.5)*0.01);var cl=c7[i*2+1];var hi=Math.max(op,cl)*(1+Math.abs(r7b()-0.5)*0.016);var lo=Math.min(op,cl)*(1-Math.abs(r7b()-0.5)*0.016);kdata.push([op,cl,lo,hi]);}
    echarts.init(el7,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:20,bottom:30,left:60,right:15},
      xAxis:{type:'category',data:makeCats(200),show:false},
      yAxis:{type:'value',name:'指数',nameGap:40,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'candlestick',data:kdata,itemStyle:{color:accent,color0:'#dc2626',borderColor:accent,borderColor0:'#dc2626'}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el7).resize();});
  }

  // 8. Log returns
  var el8=document.getElementById('chart-logret');
  if(el8){
    var r8=randn(2024);var c8=[3000];for(var i=1;i<500;i++) c8.push(c8[i-1]*(1+0.0003+(r8()-0.5)*0.03));
    var lr=[];for(i=1;i<500;i++) lr.push(Math.log(c8[i]/c8[i-1]));
    echarts.init(el8,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:20,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:makeCats(499),show:false},
      yAxis:{type:'value',name:'对数收益率',nameGap:45,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'line',data:lr,lineStyle:{width:0.8,color:accent},symbol:'none',markLine:{silent:true,data:[{yAxis:0,lineStyle:{color:'#dc2626',type:'dashed',width:1},label:{show:false}}]}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el8).resize();});
  }
})();