<script setup lang="ts">
import { cn } from '../../../lib/utils'

defineProps<{ class?: string }>()
</script>

<template>
  <div
    :class="
      cn(
        /* Enerblock hierarchy: section title clearly larger/heavier than link list */
        'mb-1.5 flex min-h-10 shrink-0 items-center rounded-md px-2 text-base font-bold tracking-[-0.02em] text-sidebar-foreground outline-none',
        $props.class,
      )
    "
  >
    <slot />
  </div>
</template>
