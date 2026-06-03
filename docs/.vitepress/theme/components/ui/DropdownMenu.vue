<script setup lang="ts">
import { provide, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { cn } from '../../lib/utils'
import { dropdownMenuKey } from './dropdown-menu'

defineProps<{ class?: string }>()

const root = ref<HTMLElement | null>(null)
const open = ref(false)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

provide(dropdownMenuKey, { open, toggle, close })
onClickOutside(root, close)

defineExpose({ open, toggle, close })
</script>

<template>
  <div ref="root" :class="cn('relative inline-block', $props.class)">
    <slot />
  </div>
</template>
