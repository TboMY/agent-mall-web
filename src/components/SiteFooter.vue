<template>
  <footer class="am-footer">
    <div class="page-container am-footer__grid">
      <section>
        <div class="am-footer__brand">Agent Mall</div>
        <p class="am-footer__copy">
          为你挑选正在升温的数码、美妆、穿搭与生活方式商品，帮你更快找到值得下单的好物。
        </p>
      </section>

      <section>
        <h4>逛商城</h4>
        <ul>
          <li>热门推荐</li>
          <li>分类会场</li>
          <li>新品上架</li>
        </ul>
      </section>

      <section>
        <h4>服务保障</h4>
        <ul>
          <li>精选商品</li>
          <li>透明价格</li>
          <li>多规格选择</li>
        </ul>
      </section>
    </div>
  </footer>
</template>

<style>
.am-footer {
  margin-top: 56px;
  padding: 40px 0 48px;
  background:
    radial-gradient(circle at top left, rgba(242, 170, 88, 0.18), transparent 30%),
    linear-gradient(180deg, #102033 0%, #162a42 100%);
  color: rgba(255, 255, 255, 0.78);
}

.am-footer__grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 28px;
}

.am-footer__brand {
  font-size: 26px;
  font-weight: 800;
  color: #fff;
}

.am-footer__copy {
  margin: 12px 0 0;
  max-width: 420px;
  line-height: 1.75;
}

.am-footer h4 {
  margin: 0 0 14px;
  color: #fff2d8;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.am-footer ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.am-footer li {
  position: relative;
  padding-left: 14px;
}

.am-footer li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f1b75f;
}

@media (max-width: 900px) {
  .am-footer__grid {
    grid-template-columns: 1fr;
  }
}
</style>
