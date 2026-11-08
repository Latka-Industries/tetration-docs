<script setup lang="ts">
import { cn } from '../../../lib/utils'

defineProps<{ class?: string }>()
</script>

<template>
  <ul :class="cn('flex w-full min-w-0 flex-col gap-0.5', $props.class)">
    <slot />
  </ul>
</template>
