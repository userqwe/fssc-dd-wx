const componentOptions = {
  // 组件选项
  options: {
    multipleSlots: true,
  },
  behaviors: [],
  properties: {
    lists:{
      type:Array,
      value:[]
    }
  },
  // 组件数据
  data: {
    
  },
  // 数据监听器
  observers: {},
  // 组件方法
  methods: {
    init() {},
    selectItem(e) {
      const {item} = e.currentTarget.dataset
      if (item.isLeaf) this.triggerEvent('hander-select', item||e.currentTarget.detail)
    },
    expandItem(e) {
      const {item} = e.currentTarget.dataset
      this.triggerEvent('hander-expand', item || e.currentTarget.detail)
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
