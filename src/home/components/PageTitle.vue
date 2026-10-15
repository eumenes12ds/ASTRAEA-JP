<template>
  <div class="page-title-section">
    <h1 class="page-super-title"><span>アスタリア：</span><span>運命の詩</span></h1>
    <p class="page-subtitle-english">Astalia: The Poem of Destiny</p>
    <hr class="ornamental-divider" />
  </div>
</template>

<style scoped>
.page-super-title {
  font-family:
    'Cinzel', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, 'Times New Roman', serif;
  font-weight: 700;
  text-align: center;
  font-size: 2.8em;
  color: var(--title-color);
  margin: 10px 0 0 0;
  letter-spacing: 2px;
}

.page-super-title span {
  display: inline-block;
}

.page-subtitle-english {
  font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif;
  font-style: italic;
  text-align: center;
  font-size: 1.3em;
  color: #eacf97;
  margin: 8px 0 0 0;
  letter-spacing: 3px;
  font-weight: 400;
}

.ornamental-divider {
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #a8842f 50%, transparent);
  position: relative;
  margin: 25px auto 30px auto;
  width: 85%;
  overflow: visible;
}

.ornamental-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 9px;
  height: 9px;
  padding: 0;
  transform: translate(-50%, -50%) rotate(45deg);
  background: linear-gradient(135deg, #ecd49a, #a8842f);
  background-color: transparent;
  border: 1px solid #e6c88f;
  box-shadow: 0 0 10px rgba(216, 182, 120, 0.75);
}

/* Responsive */
@media screen and (max-width: 600px) {
  .page-super-title {
    font-size: clamp(1.6rem, 7.5vw, 2rem);
  }

  .page-super-title span {
    display: block;
  }
}
</style>
