import request from '../../request'
import {behavior} from 'miniprogram-computed'
const app =  getApp();
let timer = null
const componentOptions = {
  // 组件选项
  options: {
    multipleSlots: true,
  },
  behaviors: [behavior],
  properties: {
    treeModel: {
      type:Object,
      value:{},
      observer(value){
        this.setData({model:value})
        if (value&&value.visible === true) this.init()
      }
    },
  },
  // 组件数据
  data: {
    model:{},
    dataList: [],
    searchInfo: '',
    defaultDragout: false,
    cacheData: [],
  },
  // 数据监听器
  observers: {
    
  },
  computed:{
    treeData(data){
       let showData = data.cacheData || []
       if (data.model&&data.model.visible) {
         if (data.model.params.firstNotSearch) {
           if (data.searchInfo) showData = data.dataList
         } else {
           showData = data.dataList || []
         }
       }
       return showData
    }
  },
  // 组件方法
  methods: {
    init() {
      this.setData({searchInfo:''})
      this.setData({dataList:[]})
      this.setData({cacheData:this.data.treeModel.params.cacheData})
      if (!this.data.treeModel.params.firstNotSearch) this.formTree({})
    },
    // 下拉树数据    
    async formTree(pData, item) {
      if (item && !item.isLeaf) {
        if (item.children && item.children.length > 0 ) {
          item.open = !item.open
          return
        }        
      }
     
      let data = {}
      data = this.data.model.params.pmsObj
      data.searchText = pData.searchInfo||''
      data.nodeId = pData.nodeId
      if (!data.nodeId) delete data.nodeId
      const result = await request.request({url:this.data.model.params.url,token:app.userInfo.auth_token,data})
      if (result.rstCode == '0'){
        let resData = []
        let specialList = ['carWay', 'carModel', 'cause']
        if (item) {
          item.open = true
          item.children = res.data
          if (specialList.includes(this.data.model.name)) item.children = res.data.list
          this.setData({...this.data.dataList})
        } else {
          resData = result.data || []
          if (specialList.includes(this.data.model.name)) resData = result.data.list || []
          this.setData({dataList:resData})    
        }    
      }
    },
    // 选中
    selectItem({detail:item}){
      this.setData({['model.selected']:{nodeId:item.nodeId,nodeName:item.nodeName}})
      if (this.data.model.params.firstNotSearch){
        let flag = true
        this.data.model.params.cacheData.forEach(ele => {
         if (ele.nodeId == item.nodeId)  flag = false
        })
        if (flag) this.setData({['model.params.cacheData']:[...this.data.model.params.cacheData,item]})
        wx.setStorage({key:this.data.model.name,data:JSON.stringify(this.data.model.params.cacheData)})
      }
      this.closeBtn()
    },
    // 展开子集
    expandItem(e){
      const item = e.currentTarget.detail.value
      this.formTree({nodeId: item.nodeId}, item)
    },
    // 关闭
    closeBtn(e){
      this.setData({"model.visible":false})
      if (!e) this.triggerEvent('tree-callback', this.data.model)
    },
    // 清空
    emptyBtn() {
      this.setData({['model.selected']:{nodeId:'',nodeName:''}})
      this.closeBtn()
    },
    // 清空搜索关键字
    inputClear() {
      this.setData({searchInfo:''})
      this.formTree({})
    },
    // 搜索
    inputSearch() {
      this.formTree({searchInfo: this.data.searchInfo})
    },
    debounce: function(){
      let that = this
      if (timer){
        clearTimeout(timer)
      }
      timer = setTimeout(function () {
        timer = undefined
        that.setData({dataList:[]})
        that.inputSearch()
      }, 500)
    }
  },
  // 组件生命周期
  lifetimes: {
    created() {},
    attached() {
      this.setData({"model.visible":false})
    },
    ready() {},
    moved() {},
    detached() {},
  },
  definitionFilter() {},
  // 页面生命周期
  pageLifetimes: {
    // 页面被展示
    show() {

      // 重新执行定时器等操作
    },
    // 页面被隐藏
    hide() {
      // 清除定时器等操作
    },
    // 页面尺寸变化时
    resize() {},
  },
}
Component(componentOptions)
