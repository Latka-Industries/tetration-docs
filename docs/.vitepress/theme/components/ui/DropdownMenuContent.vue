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
        'absolute left-0 top-[calc(100%+6px)] z-50 max-h-96 min-w-[10rem] w-max overflow-y-auto rounded-[14px] border border-black/8 bg-white p-2 text-popover-foreground shadow-[0_8px_32px_#08090a0d] dark:border-white/8 dark:bg-[#08090a]/90 dark:backdrop-blur-[32px] dark:shadow-[0_8px_32px_#08090a]',
        $props.class,
      )
    "
  >
    <slot />
  </div>
</template>
