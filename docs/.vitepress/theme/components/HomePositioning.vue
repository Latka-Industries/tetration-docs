<script setup lang="ts">
const lines = [
  'One file, chunked & indexed, sealed like a package.',
  "Inspect what's inside a large dataset, then query without loading it all into memory.",
  'Local mmap or cloud range-reads: same layout.',
] as const
</script>

<template>
  <section class="home-positioning" aria-label="Why this shape">
    <p
      v-for="(line, i) in lines"
      :key="i"
      class="home-positioning__line"
      :class="{ 'home-positioning__line--lead': i === 0 }"
    >
      {{ line }}
    </p>
    <p class="home-positioning__more">
      <a href="/format/design-rationale">Why this shape</a>
      <span class="home-positioning__sep" aria-hidden="true">·</span>
      <a
        href="https://bookshop.org/p/books/book-of-numbers-a-novel-joshua-cohen/af5aa739b0fac506?ean=9780812986655&next=t"
        target="_blank"
        rel="noreferrer"
        >More cur?</a
      >
    </p>
  </section>
</template>

<style scoped>
.home-positioning {
  margin: 0 auto;
  max-width: 36rem;
  padding: 0.5rem 1.5rem 0.25rem;
  width: 100%;
}

.home-positioning__line {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  line-height: 1.55;
}

.home-positioning__line + .home-positioning__line {
  margin-top: 0.65rem;
}

.home-positioning__line--lead {
  color: var(--vp-c-text-1);
  font-size: 1.05rem;
  font-weight: 550;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.home-positioning__more {
  margin: 1.1rem 0 0;
  font-size: 0.875rem;
}

.home-positioning__sep {
  margin: 0 0.45rem;
  color: var(--vp-c-text-3);
}

.home-positioning__more a {
  color: var(--vp-c-brand-1);
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.home-positioning__more a:hover {
  color: var(--vp-c-brand-2);
  border-bottom-color: color-mix(in srgb, var(--vp-c-brand-2) 55%, transparent);
}
</style>
