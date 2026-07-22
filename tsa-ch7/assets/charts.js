// ====== Chapter 7 Charts: Conditional Heteroscedasticity Models ======
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ====== Chart 1: Volatility Clustering ======
  var chart1 = echarts.init(document.getElementById('chart-clustering'), null, { renderer: 'svg' });

  // Simulate returns with GARCH-like clustering
  var n = 500;
  var returns = [];
  var volatility = [];
  var h = 0.0004; // initial variance
  var alpha0 = 0.00002, alpha1 = 0.1, beta1 = 0.85;

  for (var i = 0; i < n; i++) {
    var z = (Math.random() + Math.random() + Math.random() - 1.5) * 1.414; // approx N(0,1) with heavier tails
    var ret = Math.sqrt(h) * z;
    returns.push((ret * 100).toFixed(3)); // in percentage
    volatility.push((Math.sqrt(h) * 100 * Math.sqrt(252)).toFixed(1)); // annualized vol
    h = alpha0 + alpha1 * h * z * z + beta1 * h;
    h = Math.max(h, 0.000001);
  }

  var dates = [];
  for (var i = 0; i < n; i++) dates.push(i + 1);

  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      data: ['日收益率(%)', '年化波动率(%)'],
      top: 0,
      textStyle: { color: ink, fontSize: 12 }
    },
    grid: { left: 55, right: 55, top: 40, bottom: 35 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: muted, fontSize: 11, interval: 99 },
      axisLine: { lineStyle: { color: rule } },
      name: '交易日',
      nameTextStyle: { color: muted }
    },
    yAxis: [
      {
        type: 'value', position: 'left',
        name: '收益率(%)',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLine: { show: false }
      },
      {
        type: 'value', position: 'right',
        name: '年化波动率(%)',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { show: false },
        axisLine: { show: false }
      }
    ],
    series: [
      {
        name: '日收益率(%)',
        type: 'bar',
        data: returns,
        yAxisIndex: 0,
        itemStyle: {
          color: function(p) { return p.value >= 0 ? accent + '99' : accent2 + '99'; }
        },
        barMaxWidth: 3
      },
      {
        name: '年化波动率(%)',
        type: 'line',
        data: volatility,
        yAxisIndex: 1,
        smooth: true,
        lineStyle: { color: '#f59e0b', width: 2 },
        itemStyle: { color: '#f59e0b' },
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245,158,11,0.25)' },
              { offset: 1, color: 'rgba(245,158,11,0.02)' }
            ]
          }
        }
      }
    ]
  });

  // ====== Chart 2: ARCH Effect Diagnosis ======
  var chart2 = echarts.init(document.getElementById('chart-diagnosis'), null, { renderer: 'svg' });

  // Generate residual squared series
  // Homoscedastic: pure white noise
  var homoSq = [];
  for (var i = 0; i < 200; i++) {
    var z = (Math.random() - 0.5) * 2;
    homoSq.push((z * z).toFixed(4));
  }

  // Heteroscedastic: clustered
  var hetSq = [];
  var hh = 0.0003;
  for (var i = 0; i < 200; i++) {
    var z = (Math.random() - 0.5) * 2;
    hetSq.push((hh * z * z).toFixed(4));
    hh = 0.00001 + 0.15 * hh * z * z + 0.8 * hh;
    hh = Math.max(hh, 0.000001);
  }

  var xLabels = [];
  for (var i = 1; i <= 200; i++) xLabels.push(i);

  chart2.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      data: ['同方差残差平方', '异方差残差平方（含ARCH效应）'],
      top: 0,
      textStyle: { color: ink, fontSize: 12 }
    },
    grid: { left: 55, right: 20, top: 45, bottom: 35 },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: { color: muted, fontSize: 11, interval: 49 },
      axisLine: { lineStyle: { color: rule } },
      name: '时间 t',
      nameTextStyle: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: 'ε²ₜ',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false }
    },
    series: [
      {
        name: '同方差残差平方',
        type: 'bar',
        data: homoSq,
        itemStyle: { color: accent2 + '66' },
        barMaxWidth: 3
      },
      {
        name: '异方差残差平方（含ARCH效应）',
        type: 'bar',
        data: hetSq,
        itemStyle: { color: accent + '99' },
        barMaxWidth: 3
      }
    ]
  });

  // ====== Chart 3: Persistence Comparison ======
  var chart3 = echarts.init(document.getElementById('chart-persistence'), null, { renderer: 'svg' });

  var days = [];
  for (var i = 0; i <= 60; i++) days.push(i);

  // Half-life lines for different persistence levels
  function decayCurve(persis, initial) {
    var data = [initial];
    for (var i = 1; i <= 60; i++) {
      data.push(data[i - 1] * persis);
    }
    return data;
  }

  // 0.90: half-life ~7 days
  // 0.95: half-life ~14 days
  // 0.97: half-life ~23 days
  // 0.99: half-life ~69 days
  var c090 = decayCurve(0.90, 1);
  var c095 = decayCurve(0.95, 1);
  var c097 = decayCurve(0.97, 1);
  var c099 = decayCurve(0.99, 1);

  chart3.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true,
      formatter: function(p) {
        var idx = p[0].dataIndex;
        var lines = ['第' + idx + '天'];
        p.forEach(function(s) {
          lines.push(s.seriesName + ': ' + s.data.toFixed(4));
        });
        return lines.join('<br/>');
      }
    },
    legend: {
      data: ['α+β=0.90（半衰期~7天）', 'α+β=0.95（半衰期~14天）', 'α+β=0.97（半衰期~23天）', 'α+β=0.99（半衰期~69天）', '半衰期线'],
      top: 0,
      textStyle: { color: ink, fontSize: 11 }
    },
    grid: { left: 55, right: 30, top: 55, bottom: 40 },
    xAxis: {
      type: 'category',
      data: days,
      name: '冲击后天数',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11, interval: 9 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '冲击影响程度',
      min: 0, max: 1.05,
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false }
    },
    series: [
      {
        name: 'α+β=0.90（半衰期~7天）',
        type: 'line', data: c090, smooth: true,
        lineStyle: { color: '#22c55e', width: 2.5 },
        itemStyle: { color: '#22c55e' }, symbol: 'none'
      },
      {
        name: 'α+β=0.95（半衰期~14天）',
        type: 'line', data: c095, smooth: true,
        lineStyle: { color: '#0ea5e9', width: 2.5 },
        itemStyle: { color: '#0ea5e9' }, symbol: 'none'
      },
      {
        name: 'α+β=0.97（半衰期~23天）',
        type: 'line', data: c097, smooth: true,
        lineStyle: { color: accent, width: 2.5 },
        itemStyle: { color: accent }, symbol: 'none'
      },
      {
        name: 'α+β=0.99（半衰期~69天）',
        type: 'line', data: c099, smooth: true,
        lineStyle: { color: '#7c3aed', width: 2.5, type: 'dashed' },
        itemStyle: { color: '#7c3aed' }, symbol: 'none'
      },
      {
        name: '半衰期线',
        type: 'line',
        data: days.map(function() { return 0.5; }),
        lineStyle: { color: '#f59e0b', type: 'dotted', width: 1.5 },
        itemStyle: { color: '#f59e0b' },
        symbol: 'none',
        markArea: {
          silent: true,
          data: [[
            { xAxis: 0, itemStyle: { color: 'rgba(245,158,11,0.06)' } },
            { xAxis: 60 }
          ]]
        },
        label: {
          show: true, position: 'insideEndTop',
          formatter: '半衰期 = 0.5',
          color: '#f59e0b', fontSize: 11, fontWeight: 600
        }
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