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
        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-black/[0.04] hover:text-foreground focus:bg-black/[0.04] focus:text-foreground dark:hover:bg-white/[0.04] dark:focus:bg-white/[0.04]',
        active && 'bg-black/[0.04] font-medium text-foreground dark:bg-white/[0.04]',
        props.class,
      )
    "
    @click="onClick"
  >
    <slot />
  </a>
</template>
