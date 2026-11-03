<script setup lang="ts">
defineProps<{ steps: string[] }>()
</script>
<template>
  <figure class="flow-diagram" aria-label="业务流程图">
    <figcaption>
      <span class="flow-kicker">PROCESS FLOW</span>
      <span class="flow-hint">按业务顺序阅读</span>
    </figcaption>
    <ol>
      <li v-for="(step, i) in steps" :key="`${i}-${step}`">
        <span class="flow-number" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="flow-label">{{ step }}</span>
      </li>
    </ol>
  </figure>
</template>
