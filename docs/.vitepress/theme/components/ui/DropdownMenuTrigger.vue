<script setup lang="ts">
import { inject } from 'vue'
import { cn } from '../../lib/utils'
import { dropdownMenuKey } from './dropdown-menu'

const ctx = inject(dropdownMenuKey)
if (!ctx) throw new Error('DropdownMenuTrigger must be used within DropdownMenu')

defineProps<{
  id?: string
  ariaLabel?: string
  class?: string
}>()
</script>

<template>
  <button
    :id="id"
    type="button"
    :class="
      cn(
        'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        $props.class,
      )
    "
    :aria-label="ariaLabel"
    :aria-expanded="ctx.open.value"
    aria-haspopup="menu"
    @click="ctx.toggle()"
  >
    <slot />
  </button>
</template>
