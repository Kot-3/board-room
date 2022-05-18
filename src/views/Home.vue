<template>
  <div class="board w-full grid justify-items-center h-screen bg-slate-50">
    <div
      class="h-screen w-screen overflow-hidden sm:w-10/12 sm:h-4/5 sm: md:w-7/12 bg-slate-50 sm:rounded-lg shadow-md"
    >
      <div class="heards text-right pr-8 leading-8 hidden sm:block">{{ route.params.room }}</div>
      <div class="content-box sm:px-6 relative">
        <div class="border-gray-400 h-full border border-solid leading-8 sm:rounded-lg text-xs">
          <div class="fileList overflow-auto bg-gray-50 pt-3 pb-1 static sm:rounded-t-lg shadow-md">
            <ul ref="fireDom" class="fileList-ul h-20 flex px-2 overflow-x-auto">
              <template v-for="item in fileList.reverse()" :key="item">
                <li class="w-16 mx-2">
                  <icons class="m-auto" :type="filterIconStr(item.url)"></icons>
                  <a
                    :href="'assets/' + item.url"
                    class="leading-8 truncate"
                    style="display: flow-root"
                    download
                    >{{ item.name }}</a
                  >
                </li>
              </template>
            </ul>
          </div>
          <ul ref="contentText" class="content-text px-3 overflow-y-auto py-3">
            <template v-for="item in dataList.data" :key="item.time">
              <li v-if="item.type != 'file'">
                <p>
                  <span class="text-green-400 mr-2"> {{ item.time }}</span>
                  <span class="text-red-400"> {{ item.name }}::</span>
                </p>
                <span
                  v-if="item.type == 'message'"
                  class="break-all flex-1"
                  v-html="item.msg"
                ></span>
                <img v-else :src="'assets/' + item.url" class="break-all flex-1" />
              </li>
            </template>
          </ul>
        </div>
      </div>
      <div class="footers sm:px-6 pt-2 flex">
        <div class="bg-gray-300 p-1 rounded-md focus:border-blue-500 flex-auto mr-3">
          <Editor
            class="weditor"
            style="height: 500px; overflow-y: hidden"
            v-model="userMessage"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="handleCreated"
          />
        </div>
        <span
          class="bg-gray-300 p-2 text-3xl rounded-full mr-3 w-11 h-11 flex items-center justify-center"
        >
          <input
            type="file"
            name=""
            id="myuplod"
            @change="sendFile($event)"
            class="opacity-0 w-11 h-11 absolute"
          />
          <span>+</span>
        </span>
        <button class="bg-gray-300 rounded-xl p-2 w-20" @click="sendmsg">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import { onMounted, ref, watch, reactive, onBeforeUnmount, shallowRef, nextTick } from "vue";
import { useRoute } from "vue-router";
import { getRecordList, fileUpload, recordRoom } from "../require";
import { parseTime } from "../utils";
import "@wangeditor/editor/dist/css/style.css";
import { Editor } from "@wangeditor/editor-for-vue";
import icons from "@/components/icons.vue";
import { userName } from "../assets/userName";

export default {
  components: { Editor, icons },
  setup() {
    const socket = io("http://localhost:3001");
    const contentText = ref(null);
    const userMessage = ref();
    let dataList = reactive({ data: [] });
    const route = useRoute();
    const userNameList = reactive(userName);
    const userNames = userNameList[Math.floor(Math.random() * 300)];
    const fileList = reactive([]);
    socket.on("message", function (msg) {
      let params = {
        room: msg.room,
        name: msg.name,
        time: msg.time,
        msg: msg.msg,
        type: msg.type,
        url: msg.url || "",
        uid: msg.uid,
      };
      dataList.data.push(params);
      setTimeout(() => {
        contentText.value?.scrollTo(0, contentText.value.scrollHeight);
      }, 100);
    });
    function sendmsg() {
      if (isNull(userMessage.value)) return;
      let params = {
        room: route.params.room,
        name: userNames,
        time: parseTime(Date.now()),
        msg: userMessage.value.trim(),
        type: "message",
        url: "",
      };
      socket.emit("message", params);
      userMessage.value = "";
      dataList.data.push(params);
      setTimeout(() => {
        contentText.value.scrollTo(0, contentText.value.scrollHeight);
      }, 10);
    }
    function sendFile(event) {
      let file = event.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      fileUpload(formData).then((res) => {
        let type = res.data.data?.mimetype?.indexOf("image") > -1 ? "image" : "file";
        let name = type == "image" ? userNames : res.data.data.filename;
        let params = {
          room: route.params.room,
          name: name,
          time: parseTime(Date.now()),
          msg: userMessage.value.trim(),
          type: type,
          url: res.data.data.filename,
        };
        socket.emit("message", params);
        if (type == "image") {
          contentText.value.scrollTo(0, contentText.value.scrollHeight);
          dataList.data.push(params);
        } else {
          fileList.push(params);
        }
      });
    }
    function isNull(str) {
      let newStr = str
        .replace(/<[^<p>]+>/g, "") // 将所有<p>标签 replace ''
        .replace(/<[</p>$]+>/g, "") // 将所有</p>标签 replace ''
        .replace(/&nbsp;/gi, "") // 将所有 空格 replace ''
        .replace(/<[^<br/>]+>/g, ""); // 将所有 换行符 replace ''
      if (newStr == "") return true;
      var regu = "^[ ]+$";
      var re = new RegExp(regu);
      return re.test(newStr);
    }
    function filterIconStr(str) {
      let newStr = str.split(".");
      return newStr[1] ? newStr[1] : "unknown";
    }
    onMounted(async () => {
      await recordRoom(route.params.room);
      getRecordList(route.params.room).then(async (res) => {
        dataList.data = res.data.reverse();
        res.data.forEach((item) => {
          if (item.type == "file") {
            fileList.push(item);
          }
        });
        await nextTick();
        setTimeout(() => {
          contentText.value.scrollTo(0, contentText.value.scrollHeight);
        }, 100);
      });
    });

    //富文本编辑器
    const editorRef = shallowRef();
    const toolbarConfig = {};
    const editorConfig = { scroll: "true" };

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value;
      if (editor == null) return;
      editor.destroy();
    });

    const handleCreated = (editor) => {
      editorRef.value = editor; // 记录 editor 实例，重要！
    };
    return {
      contentText,
      sendmsg,
      route,
      userMessage,
      dataList,
      //富文本
      editorRef,
      mode: "simple", // 或 'simple'
      toolbarConfig,
      editorConfig,
      handleCreated,
      sendFile,
      filterIconStr,
      fileList,
    };
  },
};
</script>

<style>
.board {
  align-items: center;
  background: linear-gradient(to right bottom, lightblue, lightgrey);
}
.content-box {
  height: calc(100% - 100px);
}
.content-text {
  height: calc(100% - 100px);
}
/* 设置滚动条的样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
@media screen and (max-width: 638px) {
  .content-box {
    height: calc(100% - 60px);
  }
}
/* 滚动槽 */
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.3);
  border-radius: 10px;
}
/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
}
::-webkit-scrollbar-thumb:window-inactive {
  background: rgba(0, 0, 0, 0.1);
}
.weditor {
  height: 38px !important;
  line-height: 1;
  font-size: 14px;
}

#w-e-textarea-1 p {
  margin: 0 !important;
}
a {
  color: #00a4ff;
}
</style>
