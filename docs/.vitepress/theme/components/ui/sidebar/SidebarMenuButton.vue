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
        'flex w-full items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left text-[13px] font-normal text-sidebar-foreground/65 outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>span:last-child]:truncate',
        'active:bg-sidebar-accent active:font-medium active:text-sidebar-accent-foreground',
        props.class,
      )
    "
    @click="$emit('click', $event)"
  >
    <slot />
  </VPLink>
</template>
