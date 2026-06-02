<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUpRight, Boxes, Braces } from '@lucide/vue'
import Badge from './ui/Badge.vue'
import Card from './ui/Card.vue'
import { cn } from '../lib/utils'

const active = ref<'tetration' | 'tet-py'>('tetration')

const repos = [
  {
    id: 'tetration' as const,
    name: 'tetration',
    lang: 'Rust',
    description: 'Core crate, tet CLI, and C ABI for .tet I/O.',
    href: 'https://github.com/Latka-Industries/tetration',
    icon: Boxes,
    badges: [
      { label: 'crate', variant: 'secondary' as const },
      { label: 'CLI', variant: 'default' as const },
      { label: 'C ABI', variant: 'outline' as const },
    ],
  },
  {
    id: 'tet-py' as const,
    name: 'tet-py',
    lang: 'Python',
    description: 'Python bindings and NumPy-friendly .tet access.',
    href: 'https://github.com/Latka-Industries/tet-py',
    icon: Braces,
    badges: [
      { label: 'bindings', variant: 'default' as const },
      { label: 'PyPI', variant: 'outline' as const },
    ],
  },
]
</script>

<template>
  <section class="tet-shadcn mx-auto w-full max-w-2xl px-6 pb-10" aria-label="Repositories">
    <p class="mb-3 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
      Repositories
    </p>

    <div class="grid gap-3 sm:grid-cols-2">
      <a
        v-for="repo in repos"
        :key="repo.id"
        :href="repo.href"
        target="_blank"
        rel="noopener"
        class="group block text-left no-underline outline-none"
        @mouseenter="active = repo.id"
        @focus="active = repo.id"
      >
        <Card
          :class="
            cn(
              'relative overflow-hidden p-5 transition-all duration-200',
              'hover:border-primary/40 hover:shadow-md',
              active === repo.id && 'border-primary/50 shadow-md ring-1 ring-ring/20',
            )
          "
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            :class="active === repo.id && 'opacity-100'"
          >
            <div
              class="absolute -right-8 -top-8 size-24 rounded-full bg-primary/5 blur-2xl"
            />
          </div>

          <div class="relative flex items-start justify-between gap-3">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted"
            >
              <component :is="repo.icon" class="size-5 text-foreground" aria-hidden="true" />
            </div>
            <ArrowUpRight
              class="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>

          <div class="relative mt-4 space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {{ repo.lang }}
              </span>
            </div>
            <h3 class="text-base font-semibold leading-none tracking-tight text-card-foreground">
              {{ repo.name }}
            </h3>
            <p class="text-sm leading-snug text-muted-foreground">
              {{ repo.description }}
            </p>
          </div>

          <div class="relative mt-4 flex flex-wrap gap-1.5">
            <Badge v-for="badge in repo.badges" :key="badge.label" :variant="badge.variant">
              {{ badge.label }}
            </Badge>
          </div>
        </Card>
      </a>
    </div>
  </section>
</template>

<style scoped>
.tet-shadcn a {
  color: inherit;
}
</style>
