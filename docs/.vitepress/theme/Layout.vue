<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import ShadcnSidebarNav from './components/ShadcnSidebarNav.vue'

const Layout = DefaultTheme.Layout
</script>

<template>
  <Layout>
    <template #sidebar-nav-before>
      <ShadcnSidebarNav />
    </template>
  </Layout>
</template>
