<template>
  <svg class="svg-icon" aria-hidden="true">
    <use ref="svgs" :xlink:href="'#icon-' + newType"></use>
  </svg>
</template>

<script>
import "../assets/icon";
import { onMounted, ref } from "vue";
export default {
  props: ["type"],
  setup(props) {
    let svgs = ref(null);
    let typeList = [
      "doc",
      "docx",
      "audio",
      "key",
      "csv",
      "excel",
      "exe",
      "html",
      "mp4",
      "pdf",
      "ppt",
      "psd",
      "video",
      "txt",
      "zip",
      "xml",
      "jia",
      "shangchuan",
      "jiazai",
    ];
    let newType = ref();
    onMounted(() => {
      newType.value = typeList.indexOf(props.type) > -1 ? props.type : "unknown";
    });
    return { svgs, newType };
  },
};
</script>

<style>
.svg-icon {
  width: 3em;
  height: 3em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
