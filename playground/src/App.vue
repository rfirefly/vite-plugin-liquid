<script setup lang="ts">
import { template } from './components/test.liquid'
</script>

<template>
  <main class="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl space-y-12">
      <section class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Grid Layout
        </h2>
        <div class="space-y-8">
          <div class="space-y-4">
            <div v-html="template" />
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
