<script setup lang="ts">
import { inject } from 'vue'
import { cn } from '../../lib/utils'
import { dropdownMenuKey } from './dropdown-menu'

const ctx = inject(dropdownMenuKey)
if (!ctx) throw new Error('DropdownMenuLink must be used within DropdownMenu')

const props = defineProps<{
  href: string
  active?: boolean
  external?: boolean
  class?: string
}>()

function onClick() {
  ctx.close()
}
</script>

<template>
  <a
    role="menuitem"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="
      cn(
        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        active && 'bg-accent font-medium text-accent-foreground',
        props.class,
      )
    "
    @click="onClick"
  >
    <slot />
  </a>
</template>
