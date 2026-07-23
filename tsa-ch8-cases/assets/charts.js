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

  // ===== 1. Pair Prices (CMB vs ICBCC) =====
  var el1 = document.getElementById('chart-pair-prices');
  if (el1) {
    var r1 = randn(2024), n = 500;
    var common = [], cum = 0;
    for (var i = 0; i < n; i++) { cum += (r1() - 0.5) * 2 * 0.012; common.push(cum); }
    var logA = [], cumA = 0;
    for (i = 0; i < n; i++) { cumA += (r1() - 0.5) * 2 * 0.008; logA.push(4.5 + 1.0 * common[i] + cumA); }
    var logB = [], cumB = 0;
    for (i = 0; i < n; i++) { cumB += (r1() - 0.5) * 2 * 0.009; logB.push(4.2 + 0.85 * common[i] + cumB); }
    var pA = logA.map(function(v){return Math.exp(v);});
    var pB = logB.map(function(v){return Math.exp(v);});
    echarts.init(el1, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['招商银行 CMB','工商银行 ICBCC'],top:4,textStyle:{fontSize:12,color:muted}},
      grid:{top:40,bottom:40,left:60,right:20},
      xAxis:{type:'category',data:makeCats(500),show:false},
      yAxis:{type:'value',name:'价格 (元)',nameGap:50,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'招商银行 CMB',type:'line',data:pA,lineStyle:{width:1.8,color:accent},symbol:'none'},
        {name:'工商银行 ICBCC',type:'line',data:pB,lineStyle:{width:1.8,color:accent2},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el1).resize();});
  }

  // ===== 2. Cointegration Residuals =====
  var el2 = document.getElementById('chart-coint-resid');
  if (el2) {
    var r2 = randn(2024), n2 = 500;
    var com2 = [], cc2 = 0;
    for (var j = 0; j < n2; j++) { cc2 += (r2() - 0.5) * 2 * 0.012; com2.push(cc2); }
    var lA2 = [], ca2 = 0;
    for (j = 0; j < n2; j++) { ca2 += (r2() - 0.5) * 2 * 0.008; lA2.push(4.5 + com2[j] + ca2); }
    var lB2 = [], cb2 = 0;
    for (j = 0; j < n2; j++) { cb2 += (r2() - 0.5) * 2 * 0.009; lB2.push(4.2 + 0.85 * com2[j] + cb2); }
    // Regress lB on lA, compute residual
    var meanA = lA2.reduce(function(a,b){return a+b;},0)/n2;
    var meanB = lB2.reduce(function(a,b){return a+b;},0)/n2;
    var covAB = 0, varA = 0;
    for (j = 0; j < n2; j++) { covAB += (lA2[j]-meanA)*(lB2[j]-meanB); varA += (lA2[j]-meanA)*(lA2[j]-meanA); }
    var betaEst = covAB / varA;
    var alphaEst = meanB - betaEst * meanA;
    var resid2 = lA2.map(function(va, idx){return va - betaEst * lB2[idx] - alphaEst;});
    echarts.init(el2, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:25,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:makeCats(500),show:false},
      yAxis:{type:'value',name:'协整残差',nameGap:45,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'line',data:resid2,lineStyle:{width:1.2,color:accent},symbol:'none',
        markLine:{silent:true,data:[{yAxis:0,lineStyle:{color:'#94a3b8',type:'dashed',width:1},label:{show:false}}]}}]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el2).resize();});
  }

  // ===== 3. Spread Z-Score with Trading Signals =====
  var el3 = document.getElementById('chart-spread-zscore');
  if (el3) {
    var r3 = randn(3030), n3 = 500;
    var com3 = [], cc3 = 0;
    for (var m = 0; m < n3; m++) { cc3 += (r3() - 0.5) * 2 * 0.012; com3.push(cc3); }
    var lA3 = [], ca3 = 0;
    for (m = 0; m < n3; m++) { ca3 += (r3() - 0.5) * 2 * 0.008; lA3.push(4.5 + com3[m] + ca3); }
    var lB3 = [], cb3 = 0;
    for (m = 0; m < n3; m++) { cb3 += (r3() - 0.5) * 2 * 0.009; lB3.push(4.2 + 0.85 * com3[m] + cb3); }
    var mA3 = lA3.reduce(function(a,b){return a+b;},0)/n3;
    var mB3 = lB3.reduce(function(a,b){return a+b;},0)/n3;
    var cov3 = 0, vrA = 0;
    for (m = 0; m < n3; m++) { cov3 += (lA3[m]-mA3)*(lB3[m]-mB3); vrA += (lA3[m]-mA3)*(lA3[m]-mA3); }
    var beta3 = cov3/vrA, alpha3 = mB3 - beta3*mA3;
    var spread3 = lA3.map(function(va,idx){return va - beta3*lB3[idx] - alpha3;});
    // Rolling Z-score (window=60)
    var win = 60, zArr = [];
    for (m = 0; m < n3; m++) {
      if (m < win - 1) { zArr.push(null); continue; }
      var slice = spread3.slice(m - win + 1, m + 1);
      var sm = slice.reduce(function(a,b){return a+b;},0)/win;
      var ss = Math.sqrt(slice.reduce(function(a,b){return a+(b-sm)*(b-sm);},0)/win);
      zArr.push(ss > 0 ? (spread3[m] - sm) / ss : 0);
    }
    // Signal scatter points
    var sellPts = [], buyPts = [];
    for (m = 0; m < n3; m++) {
      if (zArr[m] === null) continue;
      if (zArr[m] > 2) sellPts.push([m, spread3[m]]);
      else if (zArr[m] < -2) buyPts.push([m, spread3[m]]);
    }
    echarts.init(el3, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['价差','Z-Score','卖出信号','买入信号'],top:4,textStyle:{fontSize:11,color:muted}},
      grid:[{top:40,left:55,right:20,height:'40%'},{top:'60%',bottom:40,left:55,right:20}],
      xAxis:[{type:'category',data:makeCats(n3),gridIndex:0,show:false},{type:'category',data:makeCats(n3),gridIndex:1,show:false}],
      yAxis:[{type:'value',name:'价差',nameGap:40,axisLabel:{color:muted,fontSize:11},splitLine:{lineStyle:{color:rule}},gridIndex:0},
              {type:'value',name:'Z-Score',nameGap:40,axisLabel:{color:muted,fontSize:11},splitLine:{lineStyle:{color:rule}},gridIndex:1,min:-5,max:5}],
      series:[
        {name:'价差',type:'line',data:spread3,xAxisIndex:0,yAxisIndex:0,lineStyle:{width:1.2,color:accent},symbol:'none'},
        {name:'Z-Score',type:'line',data:zArr,xAxisIndex:1,yAxisIndex:1,lineStyle:{width:1.2,color:accent2},symbol:'none'},
        {name:'阈值',type:'line',data:makeCats(n3,1).map(function(){return 2;}),xAxisIndex:1,yAxisIndex:1,lineStyle:{color:'#dc2626',type:'dashed',width:1},symbol:'none'},
        {name:'阈值下界',type:'line',data:makeCats(n3,1).map(function(){return -2;}),xAxisIndex:1,yAxisIndex:1,lineStyle:{color:'#dc2626',type:'dashed',width:1},symbol:'none'},
        {name:'卖出信号',type:'scatter',data:sellPts,xAxisIndex:1,yAxisIndex:1,symbol:'triangle',symbolSize:10,itemStyle:{color:'#dc2626'}},
        {name:'买入信号',type:'scatter',data:buyPts,xAxisIndex:1,yAxisIndex:1,symbol:'triangle',symbolRotate:180,symbolSize:10,itemStyle:{color:'#16a34a'}}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el3).resize();});
  }

  // ===== 4. Pair Trading Cumulative Return =====
  var el4 = document.getElementById('chart-pair-cumret');
  if (el4) {
    var r4 = randn(4040), n4 = 500;
    var com4 = [], cc4 = 0;
    for (var p = 0; p < n4; p++) { cc4 += (r4() - 0.5) * 2 * 0.012; com4.push(cc4); }
    var lA4 = [], ca4 = 0;
    for (p = 0; p < n4; p++) { ca4 += (r4() - 0.5) * 2 * 0.008; lA4.push(4.5 + com4[p] + ca4); }
    var lB4 = [], cb4 = 0;
    for (p = 0; p < n4; p++) { cb4 += (r4() - 0.5) * 2 * 0.009; lB4.push(4.2 + 0.85 * com4[p] + cb4); }
    // Compute diff returns
    var rets = [];
    for (p = 1; p < n4; p++) rets.push((lA4[p] - lA4[p-1]) - 0.93 * (lB4[p] - lB4[p-1]));
    // Simple signal: buy when spread < -0.5 sd, sell when > 0.5 sd
    var sd4 = Math.sqrt(rets.reduce(function(a,b){return a+b*b;},0)/rets.length);
    var cumRet = [1], cr = 1;
    for (p = 0; p < rets.length; p++) {
      var sig = 0;
      if (rets[p] < -0.5 * sd4) sig = 1;
      else if (rets[p] > 0.5 * sd4) sig = -1;
      cr *= (1 + sig * rets[p]);
      cumRet.push(cr);
    }
    // Benchmark: buy and hold equally weighted
    var bhRet = [1], bh = 1;
    for (p = 1; p < n4; p++) { bh *= (1 + 0.5*(lA4[p]-lA4[p-1]) + 0.5*(lB4[p]-lB4[p-1])); bhRet.push(bh); }
    echarts.init(el4, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['配对交易策略','等权买入持有'],top:4,textStyle:{fontSize:12,color:muted}},
      grid:{top:40,bottom:40,left:60,right:20},
      xAxis:{type:'category',data:makeCats(n4),show:false},
      yAxis:{type:'value',name:'累计收益',nameGap:50,axisLabel:{color:muted,formatter:function(v){return v.toFixed(2);}},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'配对交易策略',type:'line',data:cumRet,lineStyle:{width:2,color:accent},symbol:'none',areaStyle:{color:'rgba(124,58,237,0.08)'}},
        {name:'等权买入持有',type:'line',data:bhRet,lineStyle:{width:1.5,color:accent2,type:'dashed'},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el4).resize();});
  }

  // ===== 5. Granger Returns (CSI300 vs SP500) =====
  var el5 = document.getElementById('chart-granger-returns');
  if (el5) {
    var r5 = randn(2024), n5 = 200;
    var sp = [], csi = [];
    for (var g = 0; g < n5; g++) {
      var spv = (r5() - 0.5) * 2 * 0.012;
      sp.push(spv);
      if (g >= 2) {
        csi.push(0.05 * csi[csi.length-1] + 0.15 * sp[sp.length-2] + (r5() - 0.5) * 2 * 0.015);
      } else {
        csi.push((r5() - 0.5) * 2 * 0.015);
      }
    }
    echarts.init(el5, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['沪深300 收益率','标普500 收益率'],top:4,textStyle:{fontSize:12,color:muted}},
      grid:{top:40,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:makeCats(n5),show:false},
      yAxis:{type:'value',name:'日收益率',nameGap:50,axisLabel:{color:muted,formatter:function(v){return (v*100).toFixed(1)+'%';}},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'沪深300 收益率',type:'line',data:csi,lineStyle:{width:0.8,color:accent},symbol:'none'},
        {name:'标普500 收益率',type:'line',data:sp,lineStyle:{width:0.8,color:accent2},symbol:'none'}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el5).resize();});
  }

  // ===== 6. Granger F-Statistic Comparison =====
  var el6 = document.getElementById('chart-granger-fstat');
  if (el6) {
    echarts.init(el6, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      legend:{data:['SP500 -> CSI300','CSI300 -> SP500'],top:4,textStyle:{fontSize:12,color:muted}},
      grid:{top:40,bottom:40,left:55,right:20},
      xAxis:{type:'category',data:['lag=1','lag=2','lag=3','lag=4','lag=5'],axisLabel:{color:muted,fontSize:12}},
      yAxis:{type:'value',name:'F 统计量',nameGap:50,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {name:'SP500 -> CSI300',type:'bar',data:[8.5,10.2,12.45,6.8,4.2],itemStyle:{color:accent},barWidth:20},
        {name:'CSI300 -> SP500',type:'bar',data:[2.1,3.5,4.82,3.0,2.4],itemStyle:{color:accent2},barWidth:20},
        {type:'line',data:makeCats(5,1).map(function(){return 3.0;}),lineStyle:{color:'#dc2626',type:'dashed',width:1.5},symbol:'none',
          markLine:{silent:true,data:[{yAxis:3.0,lineStyle:{color:'#dc2626',type:'dashed',width:1.5},label:{formatter:'5% 临界值',color:'#dc2626',fontSize:11,position:'end'}}]}}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el6).resize();});
  }

  // ===== 7. ECM Scatter (ecm vs delta_Y) =====
  var el7 = document.getElementById('chart-ecm-scatter');
  if (el7) {
    var r7 = randn(5050), n7 = 500;
    var com7 = [], cc7 = 0;
    for (var s = 0; s < n7; s++) { cc7 += (r7() - 0.5) * 2 * 0.012; com7.push(cc7); }
    var lA7 = [], ca7 = 0;
    for (s = 0; s < n7; s++) { ca7 += (r7() - 0.5) * 2 * 0.008; lA7.push(4.5 + com7[s] + ca7); }
    var lB7 = [], cb7 = 0;
    for (s = 0; s < n7; s++) { cb7 += (r7() - 0.5) * 2 * 0.009; lB7.push(4.2 + 0.85 * com7[s] + cb7); }
    var mA7 = lA7.reduce(function(a,b){return a+b;},0)/n7;
    var mB7 = lB7.reduce(function(a,b){return a+b;},0)/n7;
    var cv7 = 0, va7 = 0;
    for (s = 0; s < n7; s++) { cv7 += (lA7[s]-mA7)*(lB7[s]-mB7); va7 += (lA7[s]-mA7)*(lA7[s]-mA7); }
    var bt7 = cv7/va7, al7 = mB7 - bt7*mA7;
    var ecm7 = lA7.map(function(va,idx){return va - bt7*lB7[idx] - al7;});
    var dA7 = [];
    for (s = 1; s < n7; s++) dA7.push(lA7[s] - lA7[s-1]);
    var scatter = [];
    for (s = 0; s < n7-2; s++) scatter.push([ecm7[s], dA7[s+1]]);
    echarts.init(el7, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'item',appendToBody:true},
      grid:{top:25,bottom:45,left:60,right:20},
      xAxis:{type:'value',name:'误差修正项 ecm(t-1)',nameGap:35,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      yAxis:{type:'value',name:'Delta log(P_A)',nameGap:35,axisLabel:{color:muted},splitLine:{lineStyle:{color:rule}}},
      series:[
        {type:'scatter',data:scatter,symbolSize:4,itemStyle:{color:accent2,opacity:0.5}},
        {type:'line',data:[[-0.5,-0.152*(-0.5)],[0.5,-0.152*(0.5)]],
          lineStyle:{color:'#dc2626',width:2,type:'dashed'},symbol:'none',
          markLine:{silent:true,data:[{yAxis:0,lineStyle:{color:'#94a3b8',type:'dashed',width:1},label:{show:false}},{xAxis:0,lineStyle:{color:'#94a3b8',type:'dashed',width:1},label:{show:false}}]}}
      ]
    });
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el7).resize();});
  }

  // ===== 8. ECM Impulse Response =====
  var el8 = document.getElementById('chart-ecm-irf');
  if (el8) {
    var irfData = [];
    for (var k = 0; k <= 20; k++) {
      var val = k === 0 ? 0.015 : 0.015 * 0.089 * Math.exp(-0.152 * k);
      irfData.push(val * 100);
    }
    var irfCats = makeCats(21, 0).map(function(v){return 't+'+v;});
    echarts.init(el8, null, {renderer:'svg'}).setOption({
      animation:false, tooltip:{trigger:'axis',appendToBody:true},
      grid:{top:25,bottom:45,left:55,right:20},
      xAxis:{type:'category',data:irfCats,name:'滞后期数',nameGap:25,axisLabel:{color:muted,fontSize:11}},
      yAxis:{type:'value',name:'响应 (%)',nameGap:40,axisLabel:{color:muted,formatter:function(v){return v.toFixed(3);}},splitLine:{lineStyle:{color:rule}}},
      series:[{type:'bar',data:irfData,itemStyle:{color:function(params){
        return params.dataIndex === 0 ? accent : accent2;
      }},barWidth:18},
        markLine:{silent:true,data:[{yAxis:0,lineStyle:{color:'#94a3b8',type:'dashed',width:1},label:{show:false}}]}}
    );
    window.addEventListener('resize',function(){echarts.getInstanceByDom(el8).resize();});
  }
})();
