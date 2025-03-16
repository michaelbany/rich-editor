<script setup lang="ts">
import type { InlineNode } from '~/types';

  const props = defineProps<{
    node: InlineNode;
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

    if (props.node.underline) {
      style = { ...style, textDecoration: "underline" };
    }

    if (props.node.strikethrough) {
      style = { ...style, textDecoration: "line-through" };
    }

    if (props.node.code) {
      style = { ...style, fontFamily: "monospace", backgroundColor: "#f3f4f6", padding: "0.2em 0.4em", borderRadius: "0.2em", color: "red" };
    }
    return style;
  });
</script>
<template>
  <span :style="style" class="whitespace-pre-wrap" :id="id">{{ props.node.text === '' ? '\u200B' : props.node.text }}</span>
</template>
