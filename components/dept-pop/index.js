const componentOptions = {
  // 组件选项
  options: {
    // multipleSlots: true,
  },
  behaviors: [],
  properties: {
    deptModel:{
      type:Object,
      value:{},
      observer(data){
        this.setData({model:data})
      }
    }
  },
  // 组件数据
  data: {
    model:{visible:false,depts:[],field:'nodeName'}
  },
  // 数据监听器
  observers: {
    // deptModel:function(data){
    //   console.log('data: ', data);
    //   this.setData({model:data})
    // }
  },
  // 组件方法
  methods: {
    init() {
    
    },
    closeMask(e,data) {
      this.setData({['model.visible']:false})
      if(!e) this.triggerEvent('callback', data)
    },
    chooseItem(e) {
      const itemData = e.currentTarget.dataset.item
      this.closeMask('',{selected:itemData,type:this.data.model.type})
    }
  },
  // 组件生命周期
  lifetimes: {
    created() {},
    attached() {
      this.init()
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
      // const { isPageHidden } = this.data

      // // show事件发生前，页面不是处于隐藏状态时
      // if (!isPageHidden) {
      //   return
      // }

      // 重新执行定时器等操作
    },
    // 页面被隐藏
    hide() {
      // this.setData({
      //   isPageHidden: true,
      // })

      // 清除定时器等操作
    },
    // 页面尺寸变化时
    resize() {},
  },
}

Component(componentOptions)
