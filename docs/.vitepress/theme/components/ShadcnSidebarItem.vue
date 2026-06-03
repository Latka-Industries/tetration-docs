<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { ChevronRight } from '@lucide/vue'
import { computed } from 'vue'
import { useSidebarControl } from 'vitepress/dist/client/theme-default/composables/sidebar.js'
import SidebarMenuButton from './ui/sidebar/SidebarMenuButton.vue'
import SidebarMenuItem from './ui/sidebar/SidebarMenuItem.vue'
import SidebarMenuSub from './ui/sidebar/SidebarMenuSub.vue'
import SidebarMenuSubButton from './ui/sidebar/SidebarMenuSubButton.vue'
const props = defineProps<{
  item: DefaultTheme.SidebarItem
  depth: number
}>()

const itemRef = computed(() => props.item)

const { collapsed, collapsible, isLink, isActiveLink, hasChildren, toggle } =
  useSidebarControl(itemRef)
</script>

<template>
  <SidebarMenuItem v-if="hasChildren">
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm text-sidebar-foreground/80 outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2"
      :class="isActiveLink && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'"
      @click="toggle"
    >
      <ChevronRight
        class="size-4 shrink-0 transition-transform"
        :class="!collapsed && 'rotate-90'"
        aria-hidden="true"
      />
      <span class="truncate">{{ item.text }}</span>
    </button>
    <SidebarMenuSub v-show="!collapsed">
      <ShadcnSidebarItem
        v-for="child in item.items"
        :key="child.text"
        :item="child"
        :depth="depth + 1"
      />
    </SidebarMenuSub>
  </SidebarMenuItem>

  <SidebarMenuItem v-else-if="isLink && item.link">
    <SidebarMenuButton
      :href="item.link"
      :class="isActiveLink && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'"
    >
      {{ item.text }}
    </SidebarMenuButton>
  </SidebarMenuItem>

  <SidebarMenuItem v-else-if="item.text">
    <SidebarMenuSubButton v-if="item.link" :href="item.link">
      {{ item.text }}
    </SidebarMenuSubButton>
    <span v-else class="px-2 py-1 text-xs text-sidebar-foreground/60">{{ item.text }}</span>
  </SidebarMenuItem>
</template>
