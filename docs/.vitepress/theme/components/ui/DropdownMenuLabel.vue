<script setup lang="ts">
import { cn } from '../../lib/utils'

defineProps<{ class?: string }>()
</script>

<template>
  <div
    :class="
      cn('px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground', $props.class)
    "
  >
    <slot />
  </div>
</template>
