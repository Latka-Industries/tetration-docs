<script setup lang="ts">
import { cn } from '../../lib/utils'

const props = defineProps<{
  active?: boolean
  class?: string
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    role="menuitem"
    :aria-selected="active"
    :class="
      cn(
        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-black/[0.04] hover:text-foreground focus:bg-black/[0.04] focus:text-foreground dark:hover:bg-white/[0.04] dark:focus:bg-white/[0.04]',
        active && 'bg-black/[0.04] text-foreground dark:bg-white/[0.04]',
        props.class,
      )
    "
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
