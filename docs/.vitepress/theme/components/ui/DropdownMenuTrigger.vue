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
        'inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-medium text-muted-foreground transition-[color,background-color] duration-150 hover:bg-foreground/8 hover:text-foreground focus-visible:outline-none focus-visible:bg-foreground/8 focus-visible:text-foreground data-[state=open]:bg-foreground/8 data-[state=open]:text-foreground',
        $props.class,
      )
    "
    :data-state="ctx.open.value ? 'open' : 'closed'"
    :aria-label="ariaLabel"
    :aria-expanded="ctx.open.value"
    aria-haspopup="menu"
    @click="ctx.toggle()"
  >
    <slot />
  </button>
</template>
