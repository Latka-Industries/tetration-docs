<script setup lang="ts">
import { cn } from '../../../lib/utils'

defineProps<{ class?: string }>()
</script>

<template>
  <div
    :class="
      cn(
        'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none',
        $props.class,
      )
    "
  >
    <slot />
  </div>
</template>
