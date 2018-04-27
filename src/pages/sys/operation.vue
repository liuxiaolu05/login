<template>
  <div class="box user-box operation">
    <div class="groups form-condition" @keyup.enter='query'>
      <Input class="w-md" v-model="q.user" placeholder="请输入用户名"></Input>
      <Input  class="w-md" v-model="q.app" placeholder="请输入应用名称"></Input>
      <Input  class="w-md" v-model="q.menu" placeholder="请输入菜单名称"></Input>
      <DatePicker class="date-w180" :value="rangeTime" :options='disabledTime' format="yyyy/MM/dd" type="daterange" placement="bottom-end"
                   placeholder="请选择时间范围"  @on-change="getTime"></DatePicker>
      <Button type="primary" class="search" @click="query">查询</Button>
      <!--<Button type="primary" class="search" @click="downLoad">导出</Button>-->
      <!--<iframe src="" id="loadIframe" frameborder="0" style="display:none"></iframe>-->
    </div>
    <div class="table">
      <div class="table-wrap">
        <Table border   :no-data-text="noDataText" class="table" :data="tableData" :columns="columns"
               stripe></Table>
      </div>
      <div style="margin: 10px;overflow: hidden;margin-bottom: 60px;">
        <div id="page" class="pull-right">
          <Page size="small" :total="totalCount" :current="currPage" :page-size="size" :page-size-opts="sizeopt"
                show-elevator show-sizer show-total @on-change="changePage($event)"
                @on-page-size-change="changeSize" placement="top"></Page>
        </div>
      </div>
    </div>
    <BackTop :bottom="150"></BackTop>
  </div>
</template>
<script>
  export default {
    data: function () {
      return {
        q: {
          user: '',
          app: '',
          menu:'',
          beginTime:null,
          endTime:null
        },
        disabledTime: {
          disabledDate (date) {
            return date && date.valueOf() > Date.now();
          }
        },

        rangeTime:[],
        tableData: [],
        noDataText: '',
        spinShow: true,
        columns: [
//          {
//            title: '主机名',
//            key: 'host',
//          },
          {
            title: '主机地址',
            key: 'client',
          },
          {
            title: '用户名称',
            key: 'user',
          },
          {
            title: '应用名称',
            key: 'app',
          },
          {
            title: '菜单名称',
            key: 'menu'
          },
          {
            title: '操作时间',
            key: 'infoTime',
          }
        ],
        totalCount: 0,
        sizeopt: [10, 20, 50, 100],
        size: 10,
        currPage: 1,
        getPage: true,
        getSize: true,
      }
    },
    methods: {
      query: function () {
        this.currPage=1;
        this.reload();
      },
      downLoad: function () {

      },
      getTime:function(e){
        this.q.beginTime=(e[0]?new Date(e[0]+ ' 00:00:00').toString():null);
        this.q.endTime=(e[1]?new Date(e[1]+ ' 23:59:59').toString():null);

      },
      // 表格页码切换
      changePage: function (page) {
        this.currPage = page;
        this.reload();
      },
      reload:function(){
        var vm=this;
        axios.get(getUrl('History/OpeHisList'),{params:{
          user: vm.q.user,
          app: vm.q.app,
          menu: vm.q.menu,
          beginTime:vm.q.beginTime,
          endTime:vm.q.endTime,
          currPage:vm.currPage,
          pageSize:vm.size
        },
          loading: true,
          unload: true
        }).then(function(data){
          vm.totalCount=data.pager.totalCount
          if(data.pager.list  && data.pager.list.length>0){
            vm.tableData=data.pager.list;
          }else {
            vm.tableData=[];
            vm.noDataText='暂无数据';
          }

        }).catch(function(){
          vm.noDataText='暂无数据';
        })
      },
      // 表格显示条数切换
      changeSize: function (pageSize) {
        this.size = pageSize;
        this.currPage = 1;
        this.reload()
      },
    },
    mounted:function(){
      this.reload();
    }
  }
</script>
