<script setup lang="ts">
  import type { EditorContent } from "~/types";

  useHead({
    title: "Test",
  });

  const content: EditorContent = [
    {
      type: "heading",
      content: [
        {
          text: "Heading 1",
        },
      ],
      props: { level: 2 },
    },
    {
      type: "paragraph",
      content: [
        {
          text: "This is a paragraph with ",
        },
        {
          text: "italic",
          italic: true,
        },
        {
          text: " and",
        },
        {
          text: " bold",
          bold: true,
        },
        {
          text: " text.",
        },
      ],
      props: {},
    },
  ];

  // const editor = useEditor(content)

  /**
   * How SUPER DESCRIPTION
   * Basic text transformation - bold, italic, code, link
   * Components pro jednotlivé typy textu - Headings, Paragraph, Code, Callout, List
   */
</script>
<template>
    <NuxtLayout>
        <Editor :content="content" />
    </NuxtLayout>
</template>
