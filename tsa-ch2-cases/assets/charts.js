(function(){
  var s=getComputedStyle(document.documentElement);
  var accent=s.getPropertyValue('--accent').trim();
  var accent2=s.getPropertyValue('--accent2').trim();
  var muted=s.getPropertyValue('--muted').trim();
  var rule=s.getPropertyValue('--rule').trim();
  function randn(seed){var r=seed||1;return function(){r=(r*16807)%2147483647;return(r-1)/2147483646;};}
  function makeCats(n,offset){offset=offset||1;return Array.from({length:n},function(_,i){return i+offset;});}

  // 1. SHI return time series
  var el1=document.getElementById('chart-shi-ts');
  if(el1){
    var r1=randn(2024);var ret=[];for(var i=0;i<500;i++) ret.push((r1()-0.5)*3+0.03);
    echarts.init(el1,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:20,bottom:30,left:55,right:20},
      xAxis:{type:'category',data:makeCats(500),show:false},
      yAxis:{type:'value',name:'收益率(%)',nameGap:45,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'line',data:ret,lineStyle:{width:0.8,color:accent},symbol:'none',markLine:{silent:true,data:[{yAxis:0,lineStyle:{color:'#dc2626',type:'dashed',width:1},label:{show:false}}]}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el1).resize();});
  }

  // 2. SHI ACF/PACF
  var el2=document.getElementById('chart-shi-acf');
  if(el2){
    var lags=makeCats(21,0);var se=2/Math.sqrt(500);
    var acfD=[1,-0.02,0.03,-0.01,0.04,0.02,-0.03,0.01,-0.02,0.03,-0.01,0.02,0.01,-0.03,0.02,-0.01,0.03,0.02,-0.01,-0.02,0.01];
    var pacfD=[1,-0.02,0.03,-0.01,0.04,0.03,-0.02,0.02,-0.03,0.02,-0.01,0.01,0.01,-0.02,0.02,-0.02,0.03,0.01,-0.02,-0.01,0.01];
    echarts.init(el2,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      title:[{text:'ACF',left:'25%',top:5,textStyle:{fontSize:13,color:muted}},{text:'PACF',left:'75%',top:5,textStyle:{fontSize:13,color:muted}}],
      grid:[{top:30,left:50,right:30,width:'45%'},{top:30,left:'55%',right:20,width:'43%'}],
      xAxis:[{type:'category',data:lags,gridIndex:0,show:false},{type:'category',data:lags,gridIndex:1,show:false}],
      yAxis:[{type:'value',gridIndex:0,min:-0.15,max:1.1,axisLabel:{fontSize:10,color:muted},splitLine:{lineStyle:{color:rule}}},{type:'value',gridIndex:1,min:-0.15,max:1.1,axisLabel:{fontSize:10,color:muted},splitLine:{lineStyle:{color:rule}}}],
      series:[{type:'bar',data:acfD,xAxisIndex:0,yAxisIndex:0,itemStyle:{color:accent},barWidth:8},{type:'line',data:makeCats(21,0).map(function(){return se;}),xAxisIndex:0,yAxisIndex:0,lineStyle:{color:'#94a3b8',type:'dashed'},symbol:'none'},{type:'line',data:makeCats(21,0).map(function(){return -se;}),xAxisIndex:0,yAxisIndex:0,lineStyle:{color:'#94a3b8',type:'dashed'},symbol:'none'},{type:'bar',data:pacfD,xAxisIndex:1,yAxisIndex:1,itemStyle:{color:accent2},barWidth:8},{type:'line',data:makeCats(21,0).map(function(){return se;}),xAxisIndex:1,yAxisIndex:1,lineStyle:{color:'#94a3b8',type:'dashed'},symbol:'none'},{type:'line',data:makeCats(21,0).map(function(){return -se;}),xAxisIndex:1,yAxisIndex:1,lineStyle:{color:'#94a3b8',type:'dashed'},symbol:'none'}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el2).resize();});
  }

  // 3. LB p-value bar
  var el3=document.getElementById('chart-lb-pval');
  if(el3){
    echarts.init(el3,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:30,bottom:35,left:50,right:20},
      xAxis:{type:'category',data:['lag=6','lag=12','lag=18','lag=24'],axisLabel:{color:muted}},
      yAxis:{type:'value',name:'p-value',nameGap:35,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}},max:1,min:0},
      series:[{type:'bar',data:[0.78,0.65,0.52,0.45],itemStyle:{color:accent},barWidth:40,markLine:{silent:true,data:[{yAxis:0.05,lineStyle:{color:'#dc2626',type:'dashed',width:1.5},label:{formatter:'\u03b1=0.05',color:'#dc2626',fontSize:11}}]}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el3).resize();});
  }

  // 4. Price time series
  var el4=document.getElementById('chart-price-ts');
  if(el4){
    var r4=randn(2024);var p4=[3000];for(var i=1;i<500;i++) p4.push(p4[i-1]+0.5+(r4()-0.5)*40);
    echarts.init(el4,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:25,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:makeCats(500),show:false},
      yAxis:{type:'value',name:'指数点',nameGap:40,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'line',data:p4,lineStyle:{width:1.5,color:accent},symbol:'none',areaStyle:{color:'rgba(234,88,12,0.05)'}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el4).resize();});
  }

  // 5. Diff compare
  var el5=document.getElementById('chart-diff-compare');
  if(el5){
    var r5=randn(2024);var p5=[3000];for(var i=1;i<500;i++) p5.push(p5[i-1]+0.5+(r5()-0.5)*40);
    var d5=[];for(i=1;i<500;i++) d5.push(p5[i]-p5[i-1]);
    echarts.init(el5,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['原始价格(非平稳)','一阶差分(平稳)'],top:4,textStyle:{color:muted}},
      grid:[{top:35,left:50,right:30,width:'45%'},{top:35,left:'55%',right:15,width:'43%'}],
      xAxis:[{type:'category',data:makeCats(500),gridIndex:0,show:false},{type:'category',data:makeCats(499),gridIndex:1,show:false}],
      yAxis:[{type:'value',name:'价格',nameGap:35,gridIndex:0,axisLabel:{color:muted,fontSize:9},splitLine:{lineStyle:{color:rule}}},{type:'value',name:'差分',nameGap:35,gridIndex:1,axisLabel:{color:muted,fontSize:9},splitLine:{lineStyle:{color:rule}}}],
      series:[{name:'原始价格(非平稳)',type:'line',data:p5,xAxisIndex:0,yAxisIndex:0,lineStyle:{width:1.2,color:accent},symbol:'none'},{name:'一阶差分(平稳)',type:'line',data:d5,xAxisIndex:1,yAxisIndex:1,lineStyle:{width:0.8,color:accent2},symbol:'none'}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el5).resize();});
  }

  // 6. Preprocess result
  var el6=document.getElementById('chart-preprocess');
  if(el6){
    echarts.init(el6,null,{renderer:'svg'}).setOption({
      animation:false,tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:30,bottom:30,left:50,right:20},
      xAxis:{type:'category',data:['收益率(ADF)','收益率(LB)','利率(ADF)','利率(LB)','股价(ADF)','差分后(LB)'],axisLabel:{color:muted,fontSize:11,rotate:15}},
      yAxis:{type:'value',name:'p-value',nameGap:35,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}},max:1,min:0},
      series:[{type:'bar',data:[0.001,0.78,0.01,0.03,0.87,0.02],itemStyle:{color:function(p){return p.value<0.05?'#16a34a':accent;}},barWidth:30,markLine:{silent:true,data:[{yAxis:0.05,lineStyle:{color:'#dc2626',type:'dashed',width:1.5},label:{formatter:'\u03b1=0.05',color:'#dc2626',fontSize:11}}]}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el6).resize();});
  }
})();
