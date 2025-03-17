<script setup lang="ts">
  import { useForwardPropsEmits } from "radix-vue";
  import type { ExperimentalBlockEmits, ExperimentalBlockProps } from "~/types";

  const props = defineProps<ExperimentalBlockProps>();
  const emit = defineEmits<ExperimentalBlockEmits>();
  const forwarted = useForwardPropsEmits(props, emit);
</script>
<template>
  <Icon name="lucide:dot" />
  <div v-bind="forwarted" class="mb-[0.5em]">
    <slot />
  </div>
</template>
