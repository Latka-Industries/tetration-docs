<script setup lang="ts">
import { useSidebar } from 'vitepress/dist/client/theme-default/composables/sidebar.js'
import SidebarGroup from './ui/sidebar/SidebarGroup.vue'
import SidebarGroupContent from './ui/sidebar/SidebarGroupContent.vue'
import SidebarGroupLabel from './ui/sidebar/SidebarGroupLabel.vue'
import SidebarMenu from './ui/sidebar/SidebarMenu.vue'
import ShadcnSidebarItem from './ShadcnSidebarItem.vue'

const { sidebarGroups, hasSidebar } = useSidebar()
</script>

<template>
  <div v-if="hasSidebar" class="shadcn-sidebar-nav w-full">
    <SidebarGroup v-for="group in sidebarGroups" :key="group.text ?? group.items?.[0]?.text">
      <SidebarGroupLabel v-if="group.text">{{ group.text }}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <ShadcnSidebarItem
            v-for="item in group.items"
            :key="item.text"
            :item="item"
            :depth="0"
          />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </div>
</template>
