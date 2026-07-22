// ====== Chapter 6 Charts ======
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // Helper: generate seasonal data
  function generateSeasonalData(n, trend, seasonAmplitude, seasonPeriod, noise, isMultiplicative) {
    var data = [];
    for (var i = 0; i < n; i++) {
      var t = trend * i;
      var season = seasonAmplitude * Math.sin(2 * Math.PI * i / seasonPeriod);
      var random = (Math.random() - 0.5) * noise;
      if (isMultiplicative) {
        data.push(Math.max(10, t * (1 + season / 100) + random));
      } else {
        data.push(t + season + random);
      }
    }
    return data;
  }

  // ====== Chart 1: Seasonal Compare ======
  var chart1 = echarts.init(document.getElementById('chart-seasonal-compare'), null, { renderer: 'svg' });
  var months = [];
  for (var i = 2018; i <= 2024; i++) {
    for (var j = 1; j <= 12; j++) {
      months.push(i + '/' + j);
    }
  }
  var n = months.length;

  // Additive: CPI-like (stable seasonality around a slowly rising trend)
  var addData = generateSeasonalData(n, 0.15, 0.8, 12, 0.3, false);
  addData = addData.map(function(v) { return (v + 102).toFixed(1); });

  // Multiplicative: Retail sales (growing trend with growing seasonality)
  var mulData = generateSeasonalData(n, 8, 25, 12, 5, true);
  mulData = mulData.map(function(v) { return v.toFixed(0); });

  // Pure trend (no season): Stock index
  var trendData = [];
  var val = 3000;
  for (var i = 0; i < n; i++) {
    val += 20 + (Math.random() - 0.4) * 80;
    trendData.push(val.toFixed(0));
  }

  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      data: ['加法型（CPI指数）', '乘法型（零售总额）', '纯趋势（股指）'],
      top: 0,
      textStyle: { color: ink, fontSize: 12 }
    },
    grid: { left: 50, right: 20, top: 40, bottom: 40 },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { color: muted, fontSize: 11, interval: 11 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: [
      {
        type: 'value',
        name: 'CPI / 股指',
        position: 'left',
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLine: { show: false }
      },
      {
        type: 'value',
        name: '零售(亿)',
        position: 'right',
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { show: false },
        axisLine: { show: false }
      }
    ],
    series: [
      {
        name: '加法型（CPI指数）',
        type: 'line',
        data: addData,
        yAxisIndex: 0,
        smooth: true,
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent },
        symbol: 'none'
      },
      {
        name: '乘法型（零售总额）',
        type: 'line',
        data: mulData,
        yAxisIndex: 1,
        smooth: true,
        lineStyle: { color: accent2, width: 2 },
        itemStyle: { color: accent2 },
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2 + '33' },
              { offset: 1, color: accent2 + '05' }
            ]
          }
        }
      },
      {
        name: '纯趋势（股指）',
        type: 'line',
        data: trendData,
        yAxisIndex: 0,
        smooth: true,
        lineStyle: { color: muted, width: 1.5, type: 'dashed' },
        itemStyle: { color: muted },
        symbol: 'none'
      }
    ]
  });

  // ====== Chart 2: Holt-Winters Forecast ======
  var chart2 = echarts.init(document.getElementById('chart-hw-forecast'), null, { renderer: 'svg' });
  var months2 = [];
  for (var i = 2019; i <= 2025; i++) {
    for (var j = 1; j <= 12; j++) {
      months2.push(i + '年' + j + '月');
    }
  }
  // Generate historical data (first 5 years = 60 months)
  var historyData = [];
  for (var i = 0; i < 60; i++) {
    var t = 100 + 2.5 * i;
    var season = 25 * Math.sin(2 * Math.PI * i / 12 + Math.PI / 2);
    var noise = (Math.random() - 0.5) * 6;
    historyData.push((t + season + noise).toFixed(1));
  }
  // Generate forecast data (last 12 months)
  var forecastData = new Array(60).fill(null);
  var lowerData = new Array(60).fill(null);
  var upperData = new Array(60).fill(null);
  for (var i = 60; i < 72; i++) {
    var t = 100 + 2.5 * i;
    var season = 25 * Math.sin(2 * Math.PI * i / 12 + Math.PI / 2);
    forecastData.push((t + season).toFixed(1));
    lowerData.push((t + season - 12).toFixed(1));
    upperData.push((t + season + 12).toFixed(1));
  }

  chart2.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      data: ['历史数据', 'Holt-Winters预测', '95%置信区间'],
      top: 0,
      textStyle: { color: ink, fontSize: 12 }
    },
    grid: { left: 50, right: 20, top: 40, bottom: 40 },
    xAxis: {
      type: 'category',
      data: months2,
      axisLabel: { color: muted, fontSize: 11, interval: 5 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '零售额（亿元）',
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false }
    },
    series: [
      {
        name: '历史数据',
        type: 'line',
        data: historyData,
        smooth: true,
        lineStyle: { color: accent, width: 2.5 },
        itemStyle: { color: accent },
        symbol: 'none'
      },
      {
        name: 'Holt-Winters预测',
        type: 'line',
        data: forecastData,
        smooth: true,
        lineStyle: { color: accent2, width: 2.5, type: 'dashed' },
        itemStyle: { color: accent2 },
        symbol: 'circle',
        symbolSize: 5
      },
      {
        name: '95%置信区间',
        type: 'line',
        data: upperData,
        lineStyle: { opacity: 0 },
        stack: 'confidence',
        symbol: 'none',
        areaStyle: { color: 'transparent' }
      },
      {
        name: '95%置信区间下限',
        type: 'line',
        data: lowerData.map(function(v, i) {
          if (v === null) return null;
          return upperData[i] === null ? null : (parseFloat(upperData[i]) - parseFloat(v)).toFixed(1);
        }),
        lineStyle: { opacity: 0 },
        stack: 'confidence',
        symbol: 'none',
        areaStyle: {
          color: accent2 + '22',
          origin: 'start'
        }
      }
    ]
  });

  // ====== Chart 3: SARIMA ACF Patterns ======
  var chart3 = echarts.init(document.getElementById('chart-sarima-acf'), null, { renderer: 'svg' });
  var lags = [];
  for (var i = 0; i <= 36; i++) lags.push(i);

  // Pattern 1: Seasonal MA (decays at non-seasonal lags, cuts at seasonal lags)
  var acf_ma = [];
  for (var i = 0; i <= 36; i++) {
    if (i === 0) acf_ma.push(1);
    else if (i === 12) acf_ma.push(0.72);
    else if (i === 24) acf_ma.push(-0.05);
    else if (i === 36) acf_ma.push(0.02);
    else {
      var decay = Math.exp(-i / 6) * 0.8;
      acf_ma.push(decay * Math.cos(i * 0.3) + (Math.random() - 0.5) * 0.05);
    }
  }

  // Pattern 2: Seasonal AR (decays at seasonal lags)
  var acf_ar = [];
  for (var i = 0; i <= 36; i++) {
    if (i === 0) acf_ar.push(1);
    else if (i % 12 === 0) {
      acf_ar.push(Math.pow(0.7, i / 12).toFixed(3));
    } else {
      var base = Math.exp(-i / 10) * 0.6;
      acf_ar.push(base * Math.cos(i * 0.4) + (Math.random() - 0.5) * 0.04);
    }
  }

  // Confidence band
  var conf = 2 / Math.sqrt(240);
  var upperConf = lags.map(function() { return conf; });
  var lowerConf = lags.map(function() { return -conf; });

  chart3.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      data: ['季节MA(Q=1) - ACF', '季节AR(P=1) - ACF', '2倍标准差'],
      top: 0,
      textStyle: { color: ink, fontSize: 12 }
    },
    grid: { left: 50, right: 20, top: 40, bottom: 50 },
    xAxis: {
      type: 'category',
      data: lags,
      name: '延迟阶数 k',
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLabel: { color: muted, fontSize: 11, interval: 3 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: 'ACF 值',
      min: -0.2,
      max: 1.0,
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false }
    },
    series: [
      {
        name: '季节MA(Q=1) - ACF',
        type: 'bar',
        data: acf_ma,
        itemStyle: { color: accent },
        barWidth: '40%'
      },
      {
        name: '季节AR(P=1) - ACF',
        type: 'bar',
        data: acf_ar,
        itemStyle: { color: accent2 },
        barWidth: '40%',
        xAxisIndex: 0
      },
      {
        name: '2倍标准差',
        type: 'line',
        data: upperConf,
        lineStyle: { color: '#ef4444', type: 'dashed', width: 1 },
        symbol: 'none'
      },
      {
        name: '2倍标准差下限',
        type: 'line',
        data: lowerConf,
        lineStyle: { color: '#ef4444', type: 'dashed', width: 1 },
        symbol: 'none',
        showInLegend: false
      }
    ]
  });

  // Fix: put bars side by side instead of overlapping
  // Let's redo with two separate sub-graphs approach is complex, let's simplify to line markers
  // Actually, let's change to two series: line for seasonal MA, bars for seasonal AR
  // Better approach - just use different visual styles
  chart3.setOption({
    series: [
      {
        name: '季节MA(Q=1) - ACF',
        type: 'bar',
        data: acf_ma,
        itemStyle: { color: accent },
        barWidth: '35%',
        barGap: '30%'
      },
      {
        name: '季节AR(P=1) - ACF',
        type: 'bar',
        data: acf_ar,
        itemStyle: { color: accent2 },
        barWidth: '35%'
      },
      {
        name: '2倍标准差',
        type: 'line',
        data: upperConf,
        lineStyle: { color: '#ef4444', type: 'dashed', width: 1 },
        symbol: 'none'
      },
      {
        name: '2倍标准差下限',
        type: 'line',
        data: lowerConf,
        lineStyle: { color: '#ef4444', type: 'dashed', width: 1 },
        symbol: 'none',
        showInLegend: false
      }
    ]
  });

  // Resize listeners
  window.addEventListener('resize', function() {
    chart1.resize();
    chart2.resize();
    chart3.resize();
  });
})();
