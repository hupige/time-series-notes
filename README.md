# 应用时间序列分析 · 学习手册

> 基于王燕《应用时间序列分析》教材，为金融工程专业学生整理的交互式HTML学习资料。

## 在线访问

部署后可通过 GitHub Pages 访问各章节：

### 知识手册

| 章节 | 主题 | 链接 |
|------|------|------|
| 第一章 | 时间序列分析简介 | `https://hupige.github.io/time-series-notes/tsa-ch1/tsa-ch1.html` |
| 第二章 | 时间序列的预处理 | `https://hupige.github.io/time-series-notes/tsa-ch2/tsa-ch2.html` |
| 第三章 | 平稳时间序列分析 | `https://hupige.github.io/time-series-notes/tsa-ch3/tsa-ch3.html` |
| 第四章 | 非平稳序列的确定性分析 | `https://hupige.github.io/time-series-notes/tsa-ch4/tsa-ch4.html` |
| 第五章 | 非平稳序列的随机分析 | `https://hupige.github.io/time-series-notes/tsa-ch5/tsa-ch5.html` |
| 第六章 | 有季节效应的非平稳序列分析 | `https://hupige.github.io/time-series-notes/tsa-ch6/tsa-ch6.html` |
| 第七章 | 条件异方差模型 | `https://hupige.github.io/time-series-notes/tsa-ch7/tsa-ch7.html` |
| 第八章 | 多元时间序列分析 | `https://hupige.github.io/time-series-notes/tsa-ch8/tsa-ch8.html` |

### 实战案例手册

| 章节 | 案例主题 | 链接 |
|------|---------|------|
| 第一章 | K线分解、对数收益率分析 | `https://hupige.github.io/time-series-notes/tsa-ch1-cases/tsa-ch1-cases.html` |
| 第二章 | ADF检验、白噪声检验、差分处理 | `https://hupige.github.io/time-series-notes/tsa-ch2-cases/tsa-ch2-cases.html` |
| 第三章 | AR/MA/ARMA 建模（Shibor、国债价差、VIX） | `https://hupige.github.io/time-series-notes/tsa-ch3-cases/tsa-ch3-cases.html` |
| 第四章 | 趋势拟合、季节效应、移动平均与指数平滑 | `https://hupige.github.io/time-series-notes/tsa-ch4-cases/tsa-ch4-cases.html` |
| 第五章 | ARIMA 全流程、随机游走与有效市场假说 | `https://hupige.github.io/time-series-notes/tsa-ch5-cases/tsa-ch5-cases.html` |
| 第六章 | 乘法季节模型、Holt-Winters、SARIMA | `https://hupige.github.io/time-series-notes/tsa-ch6-cases/tsa-ch6-cases.html` |
| 第七章 | ARCH效应检验、GARCH(1,1)建模、GARCH族对比 | `https://hupige.github.io/time-series-notes/tsa-ch7-cases/tsa-ch7-cases.html` |
| 第八章 | 协整与配对交易、Granger因果、ECM | `https://hupige.github.io/time-series-notes/tsa-ch8-cases/tsa-ch8-cases.html` |

## 本地浏览

直接在浏览器中打开任意 `tsa-chX/tsa-chX.html` 或 `tsa-chX-cases/tsa-chX-cases.html` 文件即可查看。

## 内容特色

- **交互式图表**：每章配备 ECharts 数据可视化图表（ACF/PACF、趋势拟合、波动率聚类等）
- **流程图**：使用 Mermaid 绘制分析流程图和知识体系树
- **金融案例**：结合金融工程实际应用场景（股价预测、Pairs Trading、GARCH 波动率等）
- **R + Python 双语代码**：案例手册中所有代码均提供 R 和 Python 两种实现
- **响应式设计**：支持桌面端和移动端阅读

## 技术栈

- 原生 HTML5 + CSS3
- ECharts 5.x（数据可视化）
- Mermaid 10.x（流程图/思维导图）
- 无框架依赖，纯静态页面

## 参考教材

- 王燕，《应用时间序列分析》（第三版），中国人民大学出版社
