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
        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        active && 'bg-accent text-accent-foreground',
        props.class,
      )
    "
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
