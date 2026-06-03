<script setup lang="ts">
import { inject } from 'vue'
import { cn } from '../../lib/utils'
import { dropdownMenuKey } from './dropdown-menu'

const ctx = inject(dropdownMenuKey)
if (!ctx) throw new Error('DropdownMenuContent must be used within DropdownMenu')

defineProps<{ class?: string }>()
</script>

<template>
  <div
    v-show="ctx.open.value"
    role="menu"
    :class="
      cn(
        'absolute left-0 top-[calc(100%+6px)] z-50 max-h-96 min-w-[10rem] w-max overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
        $props.class,
      )
    "
  >
    <slot />
  </div>
</template>
