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
    iconClass: 'size-5 text-[#DEA584]',
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
    iconClass: 'size-5 text-[#3776AB]',
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
          class="relative p-5 transition-colors duration-150 hover:border-primary/35"
        >
          <div class="relative flex items-start justify-between gap-3">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-lg border"
              :class="repo.iconBoxClass"
            >
              <component :is="repo.icon" :class="repo.iconClass" aria-hidden="true" />
            </div>
            <ArrowUpRight
              class="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>

          <h3 class="relative mt-3 text-base font-semibold leading-none tracking-tight text-card-foreground">
            {{ repo.name }}
          </h3>

          <p class="relative mt-3 text-sm leading-snug text-muted-foreground">
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
</style>
