<script setup lang="ts">
const businesses = [
  { n: '01', title: '现货交易', en: 'SPOT', desc: '从一笔委托出发，理解订单簿、撮合与资产交换。', link: '/pages/0701', tags: '订单簿 / 撮合 / 结算', icon: 'M4 18 10 12 14 15 21 5 M15 5h6v6' },
  { n: '02', title: '合约交易', en: 'CONTRACT', desc: '理解持仓、杠杆、保证金与强平之间的关系。', link: '/pages/0801', tags: '持仓 / 保证金 / 风险', icon: 'M5 6h14M5 18h14M9 3v6m6 6v6M5 12h14' },
  { n: '03', title: '期权交易', en: 'OPTIONS', desc: '辨认产品版本，串联周期、结果判定与收益结算。', link: '/pages/0901', tags: '周期 / 规则 / 结果', icon: 'M4 17 9 12l4 4 7-11M17 5h3v3M4 21h16' },
  { n: '04', title: '钱包与充提', en: 'WALLET', desc: '连接链上交易与内部账务，追踪每一次资金流转。', link: '/pages/1001', tags: '充值 / 提现 / 归集', icon: 'M4 7h15v13H4zM4 7V4h13v3M15 11h6v5h-6z' },
  { n: '05', title: 'OTC 交易', en: 'OTC', desc: '理解商家、付款确认、托管放币和争议处理。', link: '/pages/1101', tags: '广告 / 托管 / 申诉', icon: 'M4 7h15l-3-3m3 3-3 3M20 17H5l3 3m-3-3 3-3' }
]
const steps = [
  { n: '01', title: '建立业务认知', desc: '先弄清订单、成交、账户与资产。', link: '/pages/0401' },
  { n: '02', title: '理解系统协作', desc: '看模块职责与数据如何流转。', link: '/pages/0301' },
  { n: '03', title: '跟完一笔交易', desc: '把订单状态和资金变化串起来。', link: '/pages/070501' },
  { n: '04', title: '补全异常路径', desc: '理解超时、重试、对账与恢复。', link: '/pages/0603' }
]
</script>
<template>
<main class="tg-home">
  <section class="home-hero">
    <div class="hero-copy">
      <div class="eyebrow"><span class="status-dot"></span> TGEX / ENGINEERING DOCUMENTATION</div>
      <h1>看懂交易所，<br>从<span>一笔交易</span>开始。</h1>
      <p class="hero-description">连接业务规则、系统架构与核心流程。<br>为想理解交易所如何运作的你，建立一张完整的知识地图。</p>
      <div class="hero-actions"><a class="primary-action" href="/pages/0104">开始阅读 <span aria-hidden="true">↗</span></a><a class="secondary-action" href="/pages/070501">跟完一笔现货交易 <span aria-hidden="true">→</span></a></div>
      <div class="hero-facts"><span><b>05</b> 核心业务</span><span><b>18</b> 知识栏目</span><span><b>60</b> 专题文档</span></div>
    </div>
    <div class="architecture-card" aria-label="一笔交易的系统协作示意">
      <div class="arch-top"><span class="arch-mark">T<span>↗</span></span><span>SYSTEM OVERVIEW</span><span class="arch-dot"></span></div>
      <div class="arch-caption">一个动作，多个系统协作。</div>
      <div class="arch-node client"><span class="node-indicator"></span> 用户提交交易 <small>CLIENT</small></div>
      <div class="arch-connector"><span></span><em>校验 · 受理</em></div>
      <div class="arch-node engine"><div><span class="small-label">TRADING CORE</span><strong>交易处理</strong></div><span class="engine-symbol">⇄</span></div>
      <div class="branch-line"></div>
      <div class="arch-branches"><div><span>01 / ORDER</span><strong>订单状态</strong></div><div><span>02 / ASSET</span><strong>资产变化</strong></div><div><span>03 / MARKET</span><strong>行情更新</strong></div></div>
      <div class="arch-bottom"><span>FLOW FIRST. UNDERSTAND THE SYSTEM.</span><span>↗</span></div>
    </div>
  </section>
  <section class="business-section">
    <div class="section-header"><div><div class="eyebrow">THE BUSINESS MAP</div><h2>五条主线，理解核心业务。</h2></div><a href="/pages/0102">查看功能全景 <span aria-hidden="true">↗</span></a></div>
    <div class="business-grid">
      <a v-for="b in businesses" :key="b.n" :href="b.link" class="business-card">
        <div class="business-meta"><span>{{ b.n }} / {{ b.en }}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="b.icon" /></svg></div>
        <h3>{{ b.title }}<span aria-hidden="true">↗</span></h3><p>{{ b.desc }}</p><div class="business-tags">{{ b.tags }}</div>
      </a>
    </div>
  </section>
  <section class="reading-section">
    <div class="section-header"><div><div class="eyebrow">A CLEAR LEARNING PATH</div><h2>不止知道功能，更要理解过程。</h2></div><span class="reading-note">建议从左到右，逐步建立认知</span></div>
    <div class="reading-grid"><a v-for="s in steps" :key="s.n" :href="s.link"><span class="reading-number">{{ s.n }}</span><h3>{{ s.title }}</h3><p>{{ s.desc }}</p><span class="reading-arrow" aria-hidden="true">→</span></a></div>
  </section>
  <section class="home-bottom"><div><span class="eyebrow">THE FOUNDATION BEHIND EVERY TRADE</span><h2>订单是起点，账务是闭环。</h2><p>从可用与冻结余额，到流水、对账和故障恢复，理解每一次资产变化的依据。</p></div><a href="/pages/0601">理解资产与账务 <span aria-hidden="true">→</span></a></section>
</main>
</template>
