<template>
  <div class="box user-box">
    <div class="form-condition form-inline">
      <div class="form-group">
        <Input class="input-box"  v-model="q.username" placeholder="请输入用户账号" @keyup.enter.native="query"></Input>
      </div>
      <div class="form-group">
        <Button type="primary" class="search" @click="query" >查询</Button>
      </div>
      <div class="form-group">
        <Button type="primary" class="search" @click="downLoad" >导出</Button>
        <iframe src="" id="loadIframe" frameborder="0" style="display:none"></iframe>
      </div>
    </div>
    <div class="table">
      <div class="table-wrap">
        <Table border :width="tableWidth_"  :no-data-text="noDataText" class="table" :data="tableData" :columns="columns" stripe></Table>
      </div>
      <div style="margin: 10px;overflow: hidden;margin-bottom: 60px;">
        <div id="page" class="pull-right">
          <Page size="small" :total="totalCount" :current="currPage" :page-size="size" :page-size-opts="sizeopt" show-elevator show-sizer show-total @on-change="changePage($event)"
                @on-page-size-change="changeSize" placement="top"></Page>
        </div>
      </div>
    </div>
    <BackTop :bottom="150"></BackTop>
  </div>
</template>
<script>
  export default {
    data:function() {
      return {
         q:{
          username:'',
         },
         tableData:[],
         noDataText:'',
         spinShow:true,
         columns: [
          {
            title: '用户账号',
            key: 'appAccount',
          },
          {
            title: '用户名称',
            key: 'displayName',
          },
          {
            title: '主岗/兼职',
            key: 'tPrimary',
          },
          {
            title: '岗位编码',
            key: 'positionCode',
          },
          {
            title: '岗位名称',
            key: 'positionDesc'
          },
          {
            title: '公司代码',
            key: 'companyCode',
          },
          {
            title: '角色编码',
            key: 'zwbm',
          },
          {
            title: '角色名称',
            key: 'zwbmName'
          },

          {
            title: '起始日期',
            key: 'startDate',
          },
          {
            title: '截止日期',
            key: 'endDate',
          },
        ],
         totalCount:0,
         sizeopt:[10,20,50,100],
         size:10,
         currPage:1,
         getPage:true,
         getSize:true,
         fileName:''
      }
    },
    methods:{
      query:function(){

      },
      downLoad:function(){

      },
      // 表格页码切换
      changePage: function (page) {
        vm.spinShow=true;
        this.currPage = page;
        if(this.getPage){
          this.reload();
        }else {
          this.getPage=false;
        }
      },
      // 表格显示条数切换
      changeSize: function (pageSize) {
        vm.spinShow=true;
        this.size = pageSize;
        this.currPage=1;
        if(this.getSize){
          this.reload();
        }else {
          this.getSize=false;
        }
      },
    }
  }
</script>
