<script setup lang="ts">
  import { useForwardPropsEmits } from "radix-vue";
  import type { ExperimentalBlockEmits, ExperimentalBlockProps } from "~/types";

  const props = defineProps<ExperimentalBlockProps>();
  const emit = defineEmits<ExperimentalBlockEmits>();
  const forwarted = useForwardPropsEmits(props, emit);
</script>
<template>
  <div class="mb-[0.5em] w-full border-l-[4px] border-border p-4">
    <div v-bind="forwarted">
      <slot />
    </div>
  </div>
</template>