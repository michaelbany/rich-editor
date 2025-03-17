<script setup lang="ts">
  import { useForwardPropsEmits } from "radix-vue";
  import type { ExperimentalBlockEmits, ExperimentalBlockProps } from "~/types";

  const props = defineProps<ExperimentalBlockProps>();
  const emit = defineEmits<ExperimentalBlockEmits>();
  const forwarted = useForwardPropsEmits(props, emit);
</script>
<template>
  <h1 v-bind="forwarted" class="mb-[0.3em] text-[1.4rem] font-bold">
    <slot />
  </h1>
</template>
