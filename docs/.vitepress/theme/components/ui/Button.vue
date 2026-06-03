<script setup lang="ts">
import { cn } from '../../lib/utils'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'outline' | 'ghost' | 'secondary'
    size?: 'default' | 'sm' | 'icon'
    type?: 'button' | 'submit' | 'reset'
    class?: string
  }>(),
  {
    variant: 'default',
    size: 'default',
    type: 'button',
  },
)

const variants = {
  default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
  outline:
    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
}

const sizes = {
  default: 'h-9 px-4 py-2',
  sm: 'h-7 gap-1.5 rounded-md px-2.5 text-xs',
  icon: 'h-7 w-7',
}
</script>

<template>
  <button
    :type="type"
    :class="
      cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        props.class,
      )
    "
  >
    <slot />
  </button>
</template>
