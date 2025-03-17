<script setup lang="ts">
import type { Block, HeadingBlock } from '~/types';


  const props = defineProps<{
    block: Block;
  }>();

  function headingComponent() {
    const level = (props.block as HeadingBlock).props?.level;
    let component = "h1";
    let style = {};

    if (level) component = `h${level}`;

    switch (component) {
      case "h1":
        style = { fontSize: "2rem", fontWeight: "bold", marginBottom: "0.3em" };
        break;
      case "h2":
        style = { fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.3em" };
        break;
      case "h3":
        style = { fontSize: "1.6rem", fontWeight: "bold", marginBottom: "0.3em" };
        break;
      case "h4":
        style = { fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.3em" };
        break;
      case "h5":
        style = { fontSize: "1.4rem", fontWeight: "bold", marginBottom: "0.3em" };
        break;
      case "h6":
        style = { fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.3em" };
        break;
    }

    return h(component, { id: props.block.id, style });
  }

  const component = computed(() => {
    switch (props.block.type) {
      case "paragraph":
        return h("p", { id: props.block.id, style: { marginBottom: "0.5em" } });
      case "heading":
        return headingComponent();
      default:
        return h("div", { id: props.block.id });
    }
  });
</script>
<template>
  <component :is="component" contenteditable @dragstart.prevent @dragover.prevent @drop.prevent class="focus:outline-none" @input="$emit('input')">
    <slot />
  </component>
</template>
