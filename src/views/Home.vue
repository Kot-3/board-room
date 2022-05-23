<template>
  <div class="board h-full w-full grid justify-items-center bg-slate-50">
    <div
      class="w-screen h-full overflow-hidden sm:w-10/12 sm:h-4/5 sm: md:w-7/12 bg-slate-50 sm:rounded-lg shadow-md"
    >
      <div class="heards text-right pr-8 leading-8 hidden sm:block">{{ route.params.room }}</div>
      <div
        class="border-gray-400 sm:mx-6 content-box re overflow-auto h-full border border-solid leading-8 sm:rounded-lg text-xs"
      >
        <div class="fileList overflow-auto bg-gray-50 pt-3 pb-1 static sm:rounded-t-lg shadow-md">
          <ul ref="fireDom" class="fileList-ul h-20 flex px-2 overflow-x-auto">
            <li class="w-16 mx-2" v-for="item in fileList.data" :key="item.name">
              <icons class="m-auto" :type="filterIconStr(item.url)"></icons>
              <a
                :href="serveURL + '/' + item.url"
                class="leading-8 truncate text-center"
                style="display: flow-root"
                download
                >{{ item.name }}</a
              >
            </li>
          </ul>
        </div>
        <ul ref="contentText" class="content-text px-3 overflow-y-auto py-3">
          <template v-for="item in dataList.data" :key="item.time">
            <li v-if="item.type != 'file'">
              <p>
                <span class="text-green-400 mr-2"> {{ item.time }}</span>
                <span class="text-red-400"> {{ item.name }}::</span>
              </p>
              <span v-if="item.type == 'message'" class="break-all flex-1" v-html="item.msg"></span>
              <img v-else :src="serveURL + '/' + item.url" class="break-all flex-1" />
            </li>
          </template>
        </ul>
      </div>
      <div class="footers sm:px-6 pt-2 flex">
        <div class="bg-gray-300 p-1 rounded-md relative focus:border-blue-500 flex-auto mr-3">
          <Editor
            class="weditor"
            style="overflow-y: hidden"
            v-model="userMessage"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="handleCreated"
          />
          <div class="absolute right-0 top-0" style="width: 44px; height: 44px">
            <span
              class="p-2 text-3xl mr-3 flex items-center justify-center"
              style="width: 44px; height: 44px"
            >
              <input
                type="file"
                name=""
                id="myuplod"
                @change="sendFile($event)"
                class="opacity-0 absolute overflow-hidden"
              />
              <icons v-if="loadings" class="load" type="jiazai"></icons>
              <icons v-else type="shangchuan"></icons>
            </span>
          </div>
        </div>
        <button class="bg-gray-300 rounded-xl p-2 w-28 mr-2" @click="sendmsg">Send</button>
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
    const socket = io(serveURl);
    const contentText = ref(null);
    const userMessage = ref();
    let dataList = reactive({ data: [] });
    const route = useRoute();
    const loadings = ref(false);
    const userNameList = reactive(userName);
    const userNames = userNameList[Math.floor(Math.random() * 300)];
    const fileList = reactive({ data: [] });
    const serveURL = serveURl;
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
      loadings.value = true;
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
        loadings.value = false;
        if (type == "image") {
          contentText.value.scrollTo(0, contentText.value.scrollHeight);
          dataList.data.push(params);
        } else {
          fileList.data.unshift(params);
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
      getRecordList(route.params.room).then((res) => {
        dataList.data = res.data;
        res.data.forEach((item) => {
          if (item.type == "file") {
            fileList.data.push(item);
          }
        });
        fileList.data = fileList.data.reverse();
        setTimeout(() => {
          contentText.value.scrollTo(0, contentText.value.scrollHeight);
        }, 200);
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
      serveURL,
      loadings,
    };
  },
};
</script>

<style>
html,
body,
#app {
  height: 100%;
}

.board {
  align-items: center;
  background: linear-gradient(to right bottom, lightblue, lightgrey);
}
.content-box {
  height: calc(100% - 96px);
}
.content-text {
  height: calc(100% - 96px);
}
@media screen and (max-width: 640px) {
  .content-box {
    height: calc(100% - 60px);
  }
}

.weditor {
  height: 38px !important;
  line-height: 1;
  font-size: 14px;
}

#w-e-textarea-1 p {
  margin: 0 !important;
  padding-right: 20px;
}
a {
  color: #00a4ff;
}
*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

*::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 5px;
}

* {
  scrollbar-width: 10px;
  scrollbar-base-color: rgba(0, 0, 0, 0.3);
  scrollbar-track-color: rgba(0, 0, 0, 0.3);
  scrollbar-arrow-color: rgba(255, 255, 255, 0);
}
*::-webkit-scrollbar {
  width: 10px;
}

*::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 5px;
}

*::-webkit-scrollbar-thumb:hover {
  background: #b5d7e2;
}

*::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0);
}
.load {
  animation: fadenum 5s infinite;
}

@keyframes fadenum {
  100% {
    transform: rotate(360deg);
  }
}
#myuplod {
  width: 44px;
  height: 44px;
  display: block !important;
}
</style>
