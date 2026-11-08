<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
import Card from './ui/Card.vue'
import PythonIcon from './icons/PythonIcon.vue'
import RustIcon from './icons/RustIcon.vue'

const repos = [
  {
    id: 'tetration',
    name: 'tetration',
    description: 'Core crate, tet CLI, and C ABI for .tet I/O.',
    href: 'https://github.com/Latka-Industries/tetration',
    icon: RustIcon,
    iconClass: 'size-[1.35rem] text-[#DEA584]',
    iconBoxClass: 'border-[#DEA584]/20 bg-[#DEA584]/10',
    links: [
      { label: 'crates.io', href: 'https://crates.io/crates/tetration' },
      { label: 'docs.rs', href: 'https://docs.rs/tetration' },
    ],
  },
  {
    id: 'tet-py',
    name: 'tet-py',
    description: 'Python bindings and NumPy-friendly .tet access.',
    href: 'https://github.com/Latka-Industries/tet-py',
    icon: PythonIcon,
    iconClass: 'size-[1.35rem] text-[#3776AB]',
    iconBoxClass: 'border-[#3776AB]/20 bg-[#3776AB]/10',
    links: [{ label: 'PyPI', href: 'https://pypi.org/project/tet-py/' }],
  },
] as const
</script>

<template>
  <section class="home-impls tet-shadcn" aria-label="Repositories">
    <div class="home-impls__grid">
      <a
        v-for="repo in repos"
        :key="repo.id"
        :href="repo.href"
        target="_blank"
        rel="noopener"
        class="group block text-left no-underline outline-none"
      >
        <Card
          class="home-impls__card relative p-5 transition-[border-color,background-color] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] hover:border-primary/40 hover:bg-primary/[0.04]"
        >
          <div class="relative flex items-start justify-between gap-3">
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-xl border"
              :class="repo.iconBoxClass"
            >
              <component :is="repo.icon" :class="repo.iconClass" aria-hidden="true" />
            </div>
            <ArrowUpRight
              class="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>

          <h3 class="relative mt-3.5 text-[0.95rem] font-semibold leading-none tracking-[-0.02em] text-card-foreground">
            {{ repo.name }}
          </h3>

          <p class="relative mt-2.5 text-[0.8125rem] leading-snug text-muted-foreground">
            {{ repo.description }}
          </p>

          <div class="relative mt-3 flex flex-wrap gap-x-3 gap-y-1">
            <a
              v-for="link in repo.links"
              :key="link.href"
              class="home-impls__link font-mono text-xs text-muted-foreground"
              :href="link.href"
              target="_blank"
              rel="noopener"
              @click.stop
            >
              {{ link.label }}
            </a>
          </div>
        </Card>
      </a>
    </div>
  </section>
</template>

<style scoped>
.home-impls {
  margin: 2rem auto 0;
  max-width: 42rem;
  padding: 0 1.5rem 1.25rem;
  width: 100%;
}

.home-impls__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .home-impls__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.tet-shadcn a {
  color: inherit;
}

.home-impls__link {
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.home-impls__link:hover {
  color: var(--vp-c-brand-1);
  border-bottom-color: color-mix(in srgb, var(--vp-c-brand-1) 55%, transparent);
}

/* Two opposite edge runners — painted on the real border box. */
@property --home-impls-run {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

:deep(.home-impls__card)::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  padding: 1.5px;
  pointer-events: none;
  opacity: 0;
  background: conic-gradient(
    from var(--home-impls-run),
    var(--vp-c-brand-1) 0deg 42deg,
    transparent 42deg 180deg,
    var(--vp-c-brand-1) 180deg 222deg,
    transparent 222deg 360deg
  );
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  transition: opacity 0.35s cubic-bezier(0.19, 1, 0.22, 1);
  animation: home-impls-frame-run 3.8s linear infinite;
  animation-play-state: paused;
}

.group:hover :deep(.home-impls__card)::before {
  opacity: 1;
  animation-play-state: running;
}

@keyframes home-impls-frame-run {
  to {
    --home-impls-run: 360deg;
  }
}

@media (hover: none) {
  :deep(.home-impls__card)::before {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  :deep(.home-impls__card)::before {
    animation: none;
  }

  .group:hover :deep(.home-impls__card)::before {
    background: var(--vp-c-brand-1);
    opacity: 0.55;
  }
}
</style>
