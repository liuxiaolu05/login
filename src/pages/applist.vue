<script src="../../../n/.postcssrc.js"></script>
<template>
  <div class="app-home">
    <div class="app-wrapper">
      <div class="app-list">
        <figure v-for="item in appList" @click="toApp(item)" >
          <div class="appIcon" :class="item.icon.slice(0, -4)"></div>
          <p v-text="item.name"></p>
        </figure>
      </div>
    </div>
  </div>
</template>
<script>
  import "@/assets/css/applist"
  export default {
    data: function(){
      return {
        appList: []
      }
    },
    methods: {
      toApp(item){
        if(item.url!=''){
          top.location.href = getUrl(item.url);
        }else {
          this.$Message.warning('暂无此应用权限');
        }
      }
    },
    mounted (){
      var _vm = this, $Message = this.$Message;
      // 获取用户的应用列表
      axios.get(getUrl("userApps")).then(function(data){
        if(data.code == 0){
          _vm.appList = data.userApps;
          _vm.appList.forEach(function(v,i){
            if(v.checked==true){
              v.url=v.url;
            }else {
              v.url='';
            }
          });
        }else{
          $Message.warning("应用列表查询失败");
        }
      });
    }
  }
</script>
