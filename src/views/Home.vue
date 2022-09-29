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
            <li class="w-16 mx-2 relative" v-for="item in fileList.data" :key="item.name">
              <span
                @click="delMessage(item, index, 'file')"
                v-if="isShowdel"
                class="inline-block transform rotate-45 text-lg -top-2.5 right-0 absolute cursor-default"
                >+</span
              >
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
          <template v-for="(item, index) in dataList.data" :key="item.time">
            <li v-if="showYingsi ? true : Boolean(item.show) && item.type != 'file'">
              <p class="relative">
                <span class="text-green-400 mr-2"> {{ item.time }}</span>
                <span class="text-red-400"> {{ item.name }}::</span>
                <span
                  @click="delMessage(item, index, 'msg')"
                  v-if="isShowdel"
                  class="inline-block transform rotate-45 text-lg right-0 absolute cursor-default"
                  style="top: 0.15rem"
                  >+</span
                >
              </p>
              <span v-if="item.type == 'message'" class="break-all flex-1" v-html="item.msg"></span>
              <img
                v-else
                :onload="imgload"
                :src="serveURL + '/' + item.url"
                class="break-all flex-1"
              />
            </li>
          </template>
        </ul>
      </div>
      <div class="footers sm:px-6 pt-2 flex">
        <div
          class="bg-gray-300 footers-item p-1 rounded-md relative focus:border-blue-500 flex-auto mr-3"
        >
          <div id="editor" />
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
        <button class="bg-gray-300 rounded-xl p-2 w-28 mr-2" @click="sendmsg($event)">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import { onMounted, ref, reactive } from "vue";
import { useRoute } from "vue-router";
import { getRecordList, fileUpload, recordRoom, deleteMessage } from "../require";
import { parseTime } from "../utils";
import icons from "@/components/icons.vue";
import { userName } from "../assets/userName";

export default {
  components: { icons },
  setup() {
    const socket = io(serveURl);
    const contentText = ref(null);
    let dataList = reactive({ data: [] });
    const route = useRoute();
    const loadings = ref(false);
    const userNameList = reactive(userName);
    const userNames = userNameList[Math.floor(Math.random() * 300)];
    const fileList = reactive({ data: [] });
    const serveURL = serveURl;
    const userMessage = ref(null);
    let showYingsi = ref(false);
    let isShowdel = ref(false);
    let editor = "";
    let imgNum = 0;
    let stepImg = 0;

    socket.on("message", function (msg) {
      let params = {
        id: msg.id,
        room: msg.room,
        name: msg.name,
        time: msg.time,
        msg: msg.msg,
        type: msg.type,
        url: msg.url || "",
        uid: msg.uid,
        show: msg.show,
      };
      dataList.data.push(params);
      setTimeout(() => {
        contentText.value?.scrollTo(0, contentText.value.scrollHeight);
      }, 100);
    });
    function sendmsg(e) {
      if (editor.getText() == "/admin") {
        isShowdel.value = true;
        editor.clear();
        return;
      } else if (editor.getText() == "/user") {
        isShowdel.value = false;
        editor.clear();
        return;
      } else if (editor.getText() == "/hide") {
        dataList.data.forEach((item, index) => {
          item.show = 1;
        });
        showYingsi.value = true;
        editor.clear();
        return;
      } else if (editor.getText() == "/show") {
        showYingsi.value = false;
        editor.clear();
        return;
      }
      if (isNull(userMessage.value)) return;
      let params = {
        room: route.params.room,
        name: userNames,
        time: parseTime(Date.now()),
        msg: userMessage.value.trim(),
        type: "message",
        url: "",
        show: 1,
      };
      showYingsi.value == true ? (params.show = 0) : (params.show = 1);

      socket.emit("message", params);
      userMessage.value = "";
      editor.clear();
      params.show = 1;
      dataList.data.push(params);
      setTimeout(() => {
        contentText.value.scrollTop = contentText.value.scrollHeight;
      }, 100);
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
          show: 1,
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
    function goBottom() {
      contentText.value.scrollTop = contentText.value.scrollHeight;
    }
    function imgload() {
      stepImg += 1;
      if (imgNum == stepImg) {
        goBottom();
      }
    }
    async function delMessage(item, index, type) {
      if (type == "msg") {
        dataList.data.splice(index, 1);
      } else {
        fileList.data.splice(index, 1);
      }
      await deleteMessage(item.id);
    }

    onMounted(async () => {
      const { createEditor } = window.wangEditor;
      const editorConfig = {
        scroll: true,
      };
      editorConfig.onChange = () => {
        userMessage.value = editor.getHtml();
      };
      editor = createEditor({
        selector: "#editor",
        mode: "simple",
        config: editorConfig,
      });

      // console.info();
      // let contentHeight = document.querySelector(".content-text");
      // console.log(contentHeight);
      // contentHeight.scrollTop(contentHeight.clientHeight * 10);

      document.querySelector("#editor").addEventListener("paste", function (evt) {
        const clipboardItems = evt.clipboardData.items;
        const items = [].slice.call(clipboardItems).filter(function (item) {
          return item.type.indexOf("image") !== -1;
        });
        if (items.length === 0) {
          return;
        }
        const item = items[0];
        const blob = item.getAsFile();
        imgNum += 1;
        new Promise(function (res, rej) {
          const formData = new FormData();
          formData.append("file", blob);
          fileUpload(formData).then((res) => {
            let params = {
              room: route.params.room,
              name: userNames,
              time: parseTime(Date.now()),
              msg: "",
              type: "image",
              url: res.data.data.filename,
            };
            socket.emit("message", params);
            dataList.data.push(params);
          });
        }).then(() => {
          goBottom();
        });
      });

      await recordRoom(route.params.room);

      getRecordList(route.params.room).then((res) => {
        dataList.data = res.data;
        res.data.forEach((item) => {
          item.type == "image" ? (imgNum += 1) : "";
          if (item.type == "file") {
            fileList.data.push(item);
          }
        });

        fileList.data = fileList.data.reverse();
      });
    });

    return {
      contentText,
      sendmsg,
      route,
      userMessage,
      dataList,
      sendFile,
      filterIconStr,
      fileList,
      serveURL,
      loadings,
      imgload,
      delMessage,
      isShowdel,
      showYingsi,
    };
  },
};
</script>

<style lang="postcss">
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
.footers-item {
  max-width: calc(100% - 7rem);
}
#editor {
  height: 38px;
  font-size: 14px;
}
</style>
