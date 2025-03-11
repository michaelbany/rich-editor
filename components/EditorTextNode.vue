<script setup lang="ts">
  import type { EditorTextNode } from "~/types";

  const props = defineProps<{
    node: EditorTextNode;
    id: string;
  }>();

  const style = computed(() => {
    let style = {};

    if (props.node.bold) {
      style = { ...style, fontWeight: "bold" };
    }

    if (props.node.italic) {
      style = { ...style, fontStyle: "italic" };
    }
    return style;
  });
</script>
<template>
  <span :style="style" class="whitespace-pre-wrap" :id="id">{{ props.node.text }}</span>
</template>
