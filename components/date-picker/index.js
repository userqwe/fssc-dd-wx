const componentOptions = {
  // 组件选项
  options: {
    multipleSlots: true,
  },
  behaviors: [],
  properties: {
    model:{
      type:Object,
      value:{}
    }
  },
  // 组件数据
  data: {
    dataOne: [],
    dataTwo: [],
    dataThree: [],
    timeModel: {
      one: [],
      two: [],
      three: [],
    },
    isFirst: true,
    cur: {
      day: '',
      hour: '',
    },
    value:[999,1,1]
  },
  // 数据监听器
  observers: {
    'model.visible':function(value){
      console.log('value: ', value);
      if (value === true) {
        let hour = (new Date().getHours()).toString().padStart(2, '0')
        let mintue = Math.ceil(new Date().getMinutes() / 10) + 3
        if (mintue > 5) hour++
        let cur = {}
        let dataOne = []
        cur.day = this.GetDateStr(0).value
        cur.hour = hour
        this.setData({cur})
        if (hour > 23) dataOne = [this.GetDateStr(1), this.GetDateStr(2), this.GetDateStr(3)]
        else dataOne = [this.GetDateStr(0), this.GetDateStr(1), this.GetDateStr(2)]
        this.setData({dataOne,isFirst:true})
      }
    }
  },
  // 组件方法
  methods: {
    // 获取前后几天
    GetDateStr(AddDayCount) {
      var dd = new Date()
      dd.setDate(dd.getDate() + AddDayCount) // 获取AddDayCount天后的日期  
      var y = dd.getFullYear()
      var m = (dd.getMonth() + 1) < 10 ? '0' + (dd.getMonth() + 1) : (dd.getMonth() + 1) // 获取当前月份的日期，不足10补0  
      var d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate() // 获取当前几号，不足10补0 
      // var week = new Date(y + '-' + m  + '-' +  d).getDay()
      // var dayTip = [this.$t('lang.ddConfig.today'), this.$t('lang.ddConfig.tomorrow'), this.$t('lang.ddConfig.nextDay')]
      var dayTip = ['今天', '明天', '后天']
      // if (AddDayCount == 0) this.minMD = y + '-' + m  + '-' +  d
      return {
        name: `${m}${'月'}${d}${'日'}  ${dayTip[AddDayCount] || ''}`,
        value: y + '-' + m + '-' + d,
        parent: '0'
      }
    },
    // 设置小时列表
    setHourList(i = 0) {
      const list = []
      for (i; i < 24; i++) {
        // let keyval = i < 10 ? '0' + i : i
        let keyval = i.toString().padStart(2, '0')
        list.push({
          name: keyval,
          value: keyval,
          parent: '0'
        })
      }
      return list
    },
    // 设置分钟列表
    setMintuteList(i = 0) {
      const list = []
      for (i; i < 6; i++) {
        let nameKey = i == '0' ? '00' : i * 10
        list.push({
          name: nameKey,
          value: nameKey,
          parent: '0'
        })
      }
      return list
    },
    confirm() {
      const {
        one,
        two,
        three
      } = this.timeModel
      const time = [one] + ' ' + [two] + ':' + [three]
      this.cancel('',time)
    },
    cancel(e,data) {
      this.setData({'model.visible':false})
      !e&&this.trggerEvent('callback',data)
    },
    changeOne([value]) {
      if (value == this.cur.day) { // 当天
        let hour = (new Date().getHours()).toString().padStart(2, '0')
        let mintue = Math.ceil(new Date().getMinutes() / 10) + 3
        if (mintue > 5) {
          hour++
        }
        if (hour > 23) {
          this.dataTwo = this.setHourList()
          this.dataThree = this.setMintuteList(mintue > 5 ? (mintue - 6) : mintue)
        } else {
          this.dataTwo = this.setHourList(hour)
          this.dataThree = this.setMintuteList(mintue > 5 ? (mintue - 6) : mintue)
        }
      } else {
        this.dataTwo = this.setHourList()
        this.dataThree = this.setMintuteList()
      }
    },
    changeTwo([value]) {
      if (value == this.cur.hour) { // 当前小时
        let mintue = Math.ceil(new Date().getMinutes() / 10) + 3
        this.dataThree = this.setMintuteList(mintue > 5 ? (mintue - 6) : mintue)
      } else {
        // this.slots[2].values = this.setMintuteList()
        this.dataThree = this.setMintuteList()
      }
      if (this.isFirst) {
        this.timeModel = {
          one: [dateFormat(this.time, 'YYYY-MM-DD')],
          two: [new Date(this.time).getHours().toString().padStart(2, '0')],
          three: [new Date(this.time).getMinutes().toString().padStart(2, '0')],
        }
        this.isFirst = false
      }
    },
    changeThree([value]) {
      // console.log('value: ', value)
      // this.secList = this.setHourList(value[0])
    },
    pickerChange(e){
      console.log(this.data.value,'data-value')
      console.log(e.detail.value,'dcrrr-value')
    }
  },
  // 组件生命周期
  lifetimes: {
    created() {},
    attached() {
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
