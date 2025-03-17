<script setup lang="ts">
  import { useForwardPropsEmits } from "radix-vue";
  import type { ExperimentalBlockEmits, ExperimentalBlockProps } from "~/types";

  const props = defineProps<ExperimentalBlockProps>();
  const emit = defineEmits<ExperimentalBlockEmits>();
  const forwarted = useForwardPropsEmits(props, emit);
</script>
<template>
  <div class="mb-[0.5em] flex w-full items-center gap-2">
    <div class="h-4 w-4">
      <Icon name="lucide:dot" class="align-top" />
    </div>
    <div v-bind="forwarted">
      <slot />
    </div>
  </div>
</template>
