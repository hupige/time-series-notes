(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // Helper: seeded random walk generator
  function randWalk(n, seed, sigma) {
    var s = seed || 42;
    var data = [0];
    for (var i = 1; i < n; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      data.push(data[i-1] + (s / 0x7fffffff - 0.5) * (sigma || 1));
    }
    return data;
  }

  // ========== Chart 1: Spurious Regression ==========
  var el1 = document.getElementById('chart-spurious');
  if (el1) {
    var n = 200;
    var x1 = randWalk(n, 42, 1.2);
    var x2 = randWalk(n, 137, 1.2);
    var categories = [];
    for (var i = 0; i < n; i++) categories.push(i);

    // Compute R-squared manually
    var mx1 = 0, mx2 = 0;
    for (i = 0; i < n; i++) { mx1 += x1[i]; mx2 += x2[i]; }
    mx1 /= n; mx2 /= n;
    var ssRes = 0, ssTot = 0;
    for (i = 0; i < n; i++) { ssTot += (x1[i] - mx1) * (x1[i] - mx1); }
    var num = 0, den = 0;
    for (i = 0; i < n; i++) { num += (x1[i] - mx1) * (x2[i] - mx2); den += (x2[i] - mx2) * (x2[i] - mx2); }
    var beta = num / den;
    for (i = 0; i < n; i++) { ssRes += (x1[i] - (mx1 - beta * mx2) - beta * x2[i]) * (x1[i] - (mx1 - beta * mx2) - beta * x2[i]); }
    var r2 = 1 - ssRes / ssTot;

    var chart1 = echarts.init(el1, null, { renderer: 'svg' });
    chart1.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      legend: { data: ['X (RW1)', 'Y (RW2)', 'OLS Fit'], top: 4, textStyle: { fontSize: 12, color: muted } },
      grid: { top: 50, bottom: 40, left: 55, right: 20 },
      xAxis: { type: 'category', data: categories, show: false },
      yAxis: { type: 'value', name: '', axisLabel: { color: muted, fontSize: 11 }, splitLine: { lineStyle: { color: rule } } },
      graphic: [
        { type: 'text', left: 'center', top: 8, style: { text: 'R\u00b2 = ' + r2.toFixed(3) + '  (\u4e24\u4e2a\u5b8c\u5168\u72ec\u7acb\u7684\u968f\u673a\u6e38\u8d70!)', fill: '#dc2626', fontSize: 14, fontWeight: 700, textAlign: 'center' } }
      ],
      series: [
        { name: 'X (RW1)', type: 'line', data: x1, lineStyle: { width: 2, color: accent }, symbol: 'none', z: 1 },
        { name: 'Y (RW2)', type: 'line', data: x2, lineStyle: { width: 2, color: accent2 }, symbol: 'none', z: 1 },
        { name: 'OLS Fit', type: 'line', data: x2.map(function(v) { return (mx1 - beta * mx2) + beta * v; }), lineStyle: { width: 2, color: '#dc2626', type: 'dashed' }, symbol: 'none', z: 0 }
      ]
    });
    window.addEventListener('resize', function() { chart1.resize(); });
  }

  // ========== Chart 2: Cointegration ==========
  var el2 = document.getElementById('chart-cointegration');
  if (el2) {
    var n2 = 300;
    // Generate cointegrated series: Y_t = 2*X_t + stationary error
    var ec = randWalk(n2, 999, 0.01); // near-stationary (tiny steps)
    var Xbase = randWalk(n2, 77, 1.0);
    var Ybase = Xbase.map(function(v, i) { return 2 * v + ec[i]; });
    var spread = Xbase.map(function(v, i) { return Ybase[i] - 2 * v; });
    var cats2 = [];
    for (i = 0; i < n2; i++) cats2.push(i);

    var chart2 = echarts.init(el2, null, { renderer: 'svg' });
    chart2.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      legend: { data: ['X (I(1))', 'Y (I(1))'], top: 4, textStyle: { fontSize: 12, color: muted } },
      grid: [{ type: 'value', top: 40, bottom: '38%', left: 55, right: 20 }, { type: 'value', top: '70%', bottom: 30, left: 55, right: 20 }],
      xAxis: [
        { type: 'category', data: cats2, gridIndex: 0, show: false },
        { type: 'category', data: cats2, gridIndex: 1, axisLabel: { color: muted, fontSize: 11 }, splitLine: { lineStyle: { color: rule } } }
      ],
      yAxis: [
        { type: 'value', gridIndex: 0, name: 'X, Y \u503c', nameTextStyle: { color: muted, fontSize: 11 }, axisLabel: { color: muted, fontSize: 11 }, splitLine: { lineStyle: { color: rule } } },
        { type: 'value', gridIndex: 1, name: 'Y - 2X (\u534f\u6574\u6b8b\u5dee)', nameTextStyle: { color: muted, fontSize: 11 }, axisLabel: { color: muted, fontSize: 11 }, splitLine: { lineStyle: { color: rule } } }
      ],
      graphic: [
        { type: 'text', left: 'center', top: '36%', style: { text: '\u2193 \u7ebf\u6027\u7ec4\u5408 Y - 2X \u59cb\u7ec8\u56f4\u7ed5\u96f6\u503c\u6ce2\u52a8 \u2193', fill: accent, fontSize: 13, fontWeight: 600, textAlign: 'center' } }
      ],
      series: [
        { name: 'X (I(1))', type: 'line', data: Xbase, xAxisIndex: 0, yAxisIndex: 0, lineStyle: { width: 1.8, color: accent }, symbol: 'none' },
        { name: 'Y (I(1))', type: 'line', data: Ybase, xAxisIndex: 0, yAxisIndex: 0, lineStyle: { width: 1.8, color: accent2 }, symbol: 'none' },
        { name: 'Spread', type: 'line', data: spread, xAxisIndex: 1, yAxisIndex: 1, lineStyle: { width: 1.5, color: '#dc2626' }, areaStyle: { color: 'rgba(220,38,38,0.08)' }, symbol: 'none' }
      ]
    });
    window.addEventListener('resize', function() { chart2.resize(); });
  }

  // ========== Chart 3: ECM Dynamics ==========
  var el3 = document.getElementById('chart-ecm');
  if (el3) {
    var gammas = [-0.1, -0.3, -0.6, -0.9];
    var labels = ['\u03b3 = -0.1 (\u6162\u901f\u8c03\u6574)', '\u03b3 = -0.3', '\u03b3 = -0.6 (\u4e2d\u901f)', '\u03b3 = -0.9 (\u5feb\u901f\u8c03\u6574)'];
    var colors = [muted, accent2, accent, '#dc2626'];
    var ecmCats = [];
    var ecmSeries = [];
    for (i = 0; i < 30; i++) ecmCats.push(i);
    for (var g = 0; g < gammas.length; g++) {
      var path = [10]; // initial deviation = 10
      for (i = 1; i < 30; i++) {
        path.push(path[i-1] + gammas[g] * path[i-1]);
      }
      ecmSeries.push({ name: labels[g], type: 'line', data: path, lineStyle: { width: 2.2, color: colors[g] }, symbol: 'none' });
    }

    var chart3 = echarts.init(el3, null, { renderer: 'svg' });
    chart3.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      legend: { data: labels, top: 4, textStyle: { fontSize: 11, color: muted } },
      grid: { top: 55, bottom: 40, left: 55, right: 20 },
      xAxis: { type: 'category', data: ecmCats, name: '\u65f6\u671f t', nameLocation: 'middle', nameGap: 25, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
      yAxis: { type: 'value', name: '\u504f\u79bb\u7a0b\u5ea6', axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
      series: ecmSeries,
      markLine: { data: [{ yAxis: 0, lineStyle: { color: '#94a3b8', type: 'dashed', width: 1 } }] }
    });
    // Add markLine to first series
    var opt = chart3.getOption();
    opt.series[0].markLine = { silent: true, data: [{ yAxis: 0, lineStyle: { color: '#94a3b8', type: 'dashed', width: 1.5 }, label: { show: true, formatter: '\u5747\u8861\u6c34\u5e73', color: muted, fontSize: 11 } }] };
    chart3.setOption(opt);
    window.addEventListener('resize', function() { chart3.resize(); });
  }

  // ========== Chart 4: Mindmap / Tree ==========
  var el4 = document.getElementById('chart-mindmap');
  if (el4) {
    var chart4 = echarts.init(el4, null, { renderer: 'svg' });
    chart4.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}' },
      series: [{
        type: 'tree',
        data: [{
          name: '\u591a\u5143\u65f6\u95f4\u5e8f\u5217\u5206\u6790',
          children: [
            { name: 'ARIMAX', children: [
              { name: '\u5916\u751f\u53d8\u91cf\u5f15\u5165' },
              { name: '\u4f20\u9012\u51fd\u6570\u6a21\u578b' }
            ]},
            { name: '\u5e72\u9884\u5206\u6790', children: [
              { name: '\u9636\u8dc3\u5e72\u9884' },
              { name: '\u8109\u51b2\u5e72\u9884' }
            ]},
            { name: '\u4f2a\u56de\u5f52', children: [
              { name: 'Granger-Newbold (1974)' },
              { name: 'R\u00b2 > DW \u7ecf\u9a8c\u89c4\u5219' }
            ]},
            { name: '\u534f\u6574\u5206\u6790', children: [
              { name: 'EG \u4e24\u6b65\u6cd5' },
              { name: 'Johansen \u68c0\u9a8c' }
            ]},
            { name: 'ECM', children: [
              { name: 'Granger \u8868\u8ff0\u5b9a\u7406' },
              { name: '\u7edf\u8ba1\u5957\u5229 / Pairs Trading' }
            ]},
            { name: 'Granger \u56e0\u679c\u68c0\u9a8c', children: [
              { name: 'F \u68c0\u9a8c' },
              { name: 'VECM \u6846\u67b6' }
            ]}
          ]
        }],
        top: '5%',
        left: '10%',
        bottom: '5%',
        right: '25%',
        symbolSize: 9,
        orient: 'LR',
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 13,
          color: ink
        },
        leaves: {
          label: { position: 'right', verticalAlign: 'middle', align: 'left', fontSize: 11.5, color: muted }
        },
        lineStyle: { color: rule, width: 1.5, curveness: 0.5 },
        itemStyle: { color: accent, borderColor: accent },
        expandAndCollapse: false,
        emphasis: { focus: 'ancestor', itemStyle: { color: accent2 } }
      }]
    });
    window.addEventListener('resize', function() { chart4.resize(); });
  }

})();
