<script setup lang="ts">
import VPLink from 'vitepress/dist/client/theme-default/components/VPLink.vue'
import { cn } from '../../../lib/utils'

const props = defineProps<{
  href: string
  class?: string
}>()

defineEmits<{ click: [Event] }>()
</script>

<template>
  <VPLink
    :href="href"
    :no-icon="true"
    :class="
      cn(
        'flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground/80 outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:font-medium active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        props.class,
      )
    "
    @click="$emit('click', $event)"
  >
    <slot />
  </VPLink>
</template>
