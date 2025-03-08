<script setup lang="ts">
  import type { EditorAnyBlock, EditorHeadingBlock } from "~/types";

  const props = defineProps<{
    block: EditorAnyBlock;
  }>();

  function headingComponent() {
    const level = (props.block as EditorHeadingBlock).props?.level;
    let component = "h1";
    let style = {};

    if (level) component = `h${level}`;

    switch (component) {
      case "h1":
        style = { fontSize: "2rem" };
        break;
      case "h2":
        style = { fontSize: "1.5rem" };
        break;
      case "h3":
        style = { fontSize: "1.17rem" };
        break;
      case "h4":
        style = { fontSize: "1rem" };
        break;
      case "h5":
        style = { fontSize: "0.83rem" };
        break;
      case "h6":
        style = { fontSize: "0.67rem" };
        break;
    }

    return h(component, { id: props.block.id, style });
  }

  const component = computed(() => {
    switch (props.block.type) {
      case "paragraph":
        return h("p", { id: props.block.id });
      case "heading":
        return headingComponent();
      default:
        return h("div", { id: props.block.id });
    }
  });
</script>
<template>
  <component :is="component">
    <slot />
  </component>
</template>
