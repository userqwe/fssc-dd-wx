// pages/index/index.js
import request from '../../request'
import {behavior} from 'miniprogram-computed'
const app = getApp();

Component({
	behaviors:[behavior],

	/**
	 * 页面的初始数据
	 */
	data: {
		userInfo:app.userInfo,
		selected:'1',
		formData: {
			departureTime: '',
			onPlace: {},
			offPlace: {},
			project: {},
			cause: {},
			carWay: {},
			carModel: {},
			company: {},
			costCenter: {
				nodeId: ''
			},
			channel: {
				nodeId: ''
			},
			ratio: 100,
			city:{},
			dept:{},
			price: 0, // 实际价格
			realCouponPrice: 0, // 预估价
			underTake:'' //是否分摊
		},
		loadDefault:{},
		deptModel:{}, //部门选择组件model
		treeModel:{}, //下拉树组件model
		undertakeModel: {}, //分摊组件model
		costRequireList:[], //渠道联动必填数组
		compRequireList: [], //渠道联动必填数组
		showNowBtn:false,//是否显示现在按钮
		canOvertime: true,//是否可以加班用车
		subscribeRequired : false, //预约时间是否必填
		warmTip :'加班提示',//提示
	},
	pageLifetimes:{
		show(){
			this.initData()
		}
	},
	methods: {
		// 初始化数据
		async initData(){
			if (!app.userInfo.auth_token) {
				let userInfos = {}
				userInfos = await app.sso()
				app.userInfo = userInfos
			}
			this.setData({
				userInfo: app.userInfo
			})
			this.getLocation()
			this.loadUnfinishedOrder()
		},
		// 是否有未付订单或者行程中订单
		async loadUnfinishedOrder(){
			const result = await request.request({url:'fssc-flight/didi/loadUnfinishedOrder',method:'post'})
			if (result.rstCode == 0){
				const data = result.data
				switch (data.type) {
				case '-1':
					wx.showToast({
						title: '订单异常',
						icon: 'none',
						duration: 1500,
						mask: false,
					});
				case '0':// 正常填单
					if (app.firstLoad) { // 第一次加载
					//   this.formData = {}
					this.getDefaultValue()
					//   this.getcurrentPos()
					app.firstLoad	=false
					} else {
						app.onplace&&this.setData({'formData.onPlace':app.onplace})
						app.offplace && this.setData({'formData.offPlace':app.offplace})
						// this.getPriceCoupon()
						// this.acrossCityCheck()
						app.city && this.setData({'formData.city':app.city})
						// if (this.subscribeRequired && this.formData.departureTime) this.confirmValue(this.formData.departureTime, true)
					}
					break
				case '1':
					// this.diaParams = {
					//   content: this.$t('lang.ddConfig.tip23'),
					//   btnText2: this.$t('lang.ddConfig.tip24'),
					//   data
					// }
					// this.showDia = true
					break
				case '2':
					// this.diaParams = {
					//   content: this.$t('lang.ddConfig.tip21'),
					//   btnText2: this.$t('lang.ddConfig.tip22'),
					//   data
					// }
					// this.showDia = true
					break
				case '3': // 存在预约单
					this.releaseForm(data.billNumber)
					break
				case '4': // 存在实时单
					this.releaseForm(data.billNumber)
					break
				default:
					break
				}
			}
		},
		// 获取默认数据
		async getDefaultValue(){
			const result = await request.request({method:'post',url: 'fssc-flight/didi/loadDefault'})
			if (result.rstCode == 0){
				const data = result.data
				this.setData({loadDefault:data})
				this.setData({['formData.dept']:data.depts[0] || {},['formData.cause']:data.cityTraffic||{},['formData.company']:data.company||{}})
				if (this.data.formData.dept.showWork && !this.data.formData.dept.showBusiness) this.navChange('2') 
				if (!this.data.loadDefault.company) wx.showToast({title:'无默认公司代码',icon:'none'})
				else wx.showToast({title:`已自动为你选中${this.data.formData.company.nodeName}`,icon:'none',duration:3000}) 
				if (!this.data.loadDefault.depts || !this.data.loadDefault.depts.length) wx.showToast({title:'暂无填单部门，请联系运维人员配置'})
				// this.checkOrgIsOpenDiDiService(true)
				this.getLinkageReq()
				this.apportion()
				this.getDefaultCarWay()
			}
		},
		// 获取默认分摊值
		async apportion() {
			this.setData({'formData.costCenter':{},'formData.channel':{},ratio:100})
				if (!this.data.formData.company.nodeId || !this.data.formData.dept.nodeId) return
				const data = {
					dept: this.data.formData.dept.nodeId,
					company: this.data.formData.company.nodeId,
					billId: this.data.loadDefault.billId
				}
				const result = await request.request({method:'post',url:'fssc-flight/didi/defaultSetting',data,type:'formData'})
				if (result.rstCode == 0) {
					const data = result.data
					if (data && Object.keys(data).length) {
						this.setData({
							'formData.costCenter':data.costCenter,
							'formData.channel': data.channel||{},
							'formData.ratio':data.ratio||100,
						})
						this.setChannelRequired()
					} else {
						this.getFieldDefaultVal('costCenter', '3')
						this.getFieldDefaultVal('channel', '4')
						this.setData({'formData.ratio':100})
					}
				}
		},
		// 获取字段默认值
		async getFieldDefaultVal(type, itemType) {
			if (!this.data.formData.dept.nodeId) return
			const data = {
				userId: this.data.userInfo.loginUser.userId,
				deptId: this.data.formData.dept.nodeId,
				companyId: this.data.formData.company.nodeId || '',
				billId: this.data.loadDefault.billId,
				itemType,
			}
			const result = await request.request({url:'fssc-data/data/ecosystemFormTree',data})
			if (result.rstCode == 0) {
				if (result.data.length == 1) {
					this.setData({['formData.'+type]:result.data[0]})
					if (type == 'costCnter') this.setChannelRequired()
				}
			}
		},
		// 获取联动必填
		async getLinkageReq() {
			const result = await request.request({url:'fssc-form/newForm/linkageRequired',data:{billId:this.data.loadDefault.billId}})
			if (result.rstCode == '0') {
				const costRequireList = []
				const compRequireList = []
				result.data.forEach(val => {
					val.linkageValues.map(v => {
						if (val.linkage == '1000000000001731') {
							compRequireList.push(v.value)
						} else if (val.linkage == '1000000000001867') {
							costRequireList.push(v.value)
						}
					})
				})
				this.setData({costRequireList,compRequireList})
				this.setChannelRequired()
			}
		},
		// 设置渠道是否必填
		setChannelRequired() {
			let required = false
			if (this.data.formData.company.nodeId && this.data.compRequireList.length && this.data.compRequireList.inclueds(this.data.formData.company.nodeId)) required = true
			if (this.data.formData.costCenter.nodeId && this.data.costRequireList.length && this.data.costRequireList.inclueds(this.data.formData.costCenter.nodeId)) required = true
			this.setData({'formData.channel.required':required})
		},
		// 保存为默认分摊
		async saveUnderTake(params) {
			const data = {
				billId: this.data.loadDefault.billId,
				company: this.data.formData.company.nodeId,
				dept: this.data.formData.dept.nodeId,
				costCenter: params.costCenter.nodeId,
				channel: params.channel.nodeId,
				ratio: params.ratio,
			}
			const result = await request.request({method:'post',url:'fssc-flight/didi/saveDefaultSetting',data})
			if (result.rstCode == 0) {
				wx.showToast({title:'默认分摊保存成功',icon:'none'})
			}
		},
		// 获取事由
		async getLoadCause (){
			if (!this.data.formData.dept.nodeId) return
			const data = {
				dept: this.data.formData.dept.nodeId,
				project: this.data.formData.project.nodeId || this.data.loadDefault.project.nodeId,
				departureTime: '2021-01-22'
				// departureTime: dateFormat(this.formData.departureTime || Date.now(), 'YYYY-MM-DD')
			}
			if (this.data.selected == '1') data.official = '1'
			const result = await request.request({method:'get',url: 'fssc-flight/didi/loadCause',data})
			if(result.rstCode == 0){
				let data = []
				if (result.data.list && result.data.list.length){
					data = result.data.list
				}
				return data
			}
		},
		// 校验是否可以加班用车
		async overTimeCheck(time = Date.now()) {
			this.setData({'formData.cause':this.data.loadDefault.overTimeUseCar})
			if (!this.data.formData.dept.nodeId) {
				wx.showToast({title:'请先选择预算部门',icon:'none'})
				return
			}
			const data = {
				// time: dateFormat(time, 'YYYY-MM-DD HH:mm:ss'),
				time:'2021-0208 01:22:33',
				dept: this.data.formData.dept.nodeId,
				cause: this.data.loadDefault.overTimeUseCar.nodeId, // 加班用车事由
				project: this.data.formData.project.nodeId || this.data.loadDefault.project.nodeId,
				company: this.data.formData.company.nodeId,
			}
			const result = await request.request({url:'fssc-flight/didi/overTimeCheck',method:'post'})
			if (result.rstCode == 0) {
				let canOvertime = false
				let subscribeRequired = false
				let warmTip = ''
				if (!result.data.success) wx.showToast({title:result.data.msg,icon:'none'}) 
				switch (result.data.type) {
					case '1':
						canOvertime = false
						subscribeRequired = true
						warmTip = '不能加班用车'
						break
					case '2':
						canOvertime = false
						subscribeRequired = true
						warmTip = '不能加班用车'
						this.toggleBtn('','pre')
						result.data.msg && wx.showToast({title:result.data.msg,icon:'none'}) 
						break
					case '3':
						if (this.data.showNowBtn) {
							canOvertime = true
							subscribeRequired = false
							warmTip = '不能加班用车'
						} else {
							this.warmTip = ''
						}
						break
					case '4':
						if (this.data.showNowBtn) {
							canOvertime = true
							subscribeRequired = false
							warmTip = '不能加班用车'
						} else {
							warmTip = ''
						}
						break

					default:
						break
				}
				this.setData({canOvertime,subscribeRequired,warmTip})
			}
		},
		// 获取默认用车方式
		async getDefaultCarWay() {
			if (!this.data.formData.dept.nodeId) return
			const result = await request.request({url:'fssc-flight/didi/loadCarWay',data:{dept:this.data.formData.dept.nodeId}})
			if (result.rstCode == 0) {
				if (result.data.list && result.data.list.length) {
					this.setData({'formData.carWay':result.data.list[0]})
					this.getDefaultCarModel()
				}
			}
		},
		 // 获取默认车型
		async getDefaultCarModel (){
			if (!this.data.formData.dept.nodeId) return
			const result = await request.request({url:'fssc-flight/didi/loadCarModel',data:{dept: this.data.formData.dept.nodeId, sourceId: this.data.formData.carWay.nodeId}})
			if (result.rstCode == 0){
				if (result.data.list && result.data.list.length){
					this.setData({"formData.carModel":result.data.list[0]})
					this.getPriceCoupon()
				}
			}
		},
		// 获取预估价
		async getPriceCoupon() {
			this.setData({price:0,realCouponPrice:0})
			let flag = false
			let data = {
				flat: this.data.formData.onPlace.latitude,
				flng: this.data.formData.onPlace.longitude,
				tlat: this.data.formData.offPlace.latitude,
				tlng: this.data.formData.offPlace.longitude,
				cityId: this.data.formData.onPlace.cityId,
				carWay: this.data.formData.carWay.nodeId,
				carModel: this.data.formData.carModel.nodeId
			}
			for (const item in data) {
				if (!data[item]) flag = true
			}
			if (this.data.subscribeRequired && !this.data.formData.departureTime) flag = true
			if (flag) return
			data.type = this.data.subscribeRequired ? '1' : '0'
			data.departureTime ='2020-02-02 12:23:34'
			// data.departureTime = this.data.formData.departureTime ? dateFormat(this.formData.departureTime, 'YYYY-MM-DD HH:mm:ss') : dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss')
			const result = await request.request({url:'fssc-flight/didi/getPriceCoupon',data})
			if (result.rstCode == 0) {
				if (!result.data.success) wx.showToast({title:result.data.msg,icon:'none'}) 
				const {price=0,realCouponPrice=0} = result.data
				this.setData({realCouponPrice,price})
				this.checkBudget()
			} 
		},
		// 预算校验
		async checkBudget(time = Date.now()) {
			if (!this.data.formData.dept.nodeId) {
				wx.showToast({title:'请先选择预算部门',icon:'none'})
				return
			}
			const data = {
				// departureTime: dateFormat(time, 'YYYY-MM-DD HH:mm:ss'),
				departureTime: '2020-01-22 22:33:33',
				dept: this.data.formData.dept.nodeId,
				cause: this.data.formData.cause.nodeId,
				project: this.data.formData.project.nodeId || this.data.loadDefault.project.nodeId,
				estimatedAmount: this.data.price,
			}
			if (!data.cause) return
			const result = await request.request({url:'fssc-flight/didi/checkBudget',data})
			if (result.rstCode == 0) {
				if (!result.data.success) {
					wx.showToast({title:result.data.msg,icon:'none'})
				} 
				this.setData({selfPay:result.data.success})
			}
		},
		//根据定位获取位置信息及附近信息列表
		getGeocoder({latitude:lat,longitude:lng}) {
			wx.request({
				url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=',
				data: {
				location:lat+','+lng,
				get_poi:1,
				key: 'BPVBZ-V4JLP-ETKDC-VT3DE-Y63E7-IDFSO'
				},
				header: {'content-type':'application/json'},
				method: 'GET',
				success: async (result)=>{
					result = result.data
					if(result.status===0){
						const {ad_info:{city},pois} = result.result
						const cityObj = await this.matchCity({cityName:city})
						app.city = cityObj
						this.setData({'formData.city':cityObj,'formData.onPlace.name':pois[0]&&pois[0].title})
					}
				},
				fail: ()=>{},
				complete: ()=>{}
			});
		},
		// 匹配城市Id
		async matchCity(cityObj){
			const result = await request.request({method:'post',url:'fssc-flight/didi/matchCity',data:{city: cityObj.cityName || cityObj.name},type:'formData'})
			if (result.rstCode == 0){
				cityObj.cityId = result.data.cityId
				return cityObj
			}
		},
		//切换tab
		navChange(e) {
			const tab = e.currentTarget.dataset.tab
			this.setData({selected:tab})
		},
		//双向绑定值
		onInput(e){
			const tag = e.currentTarget.dataset.tag
			const value = e.detail.value
			this.setData({[tag]:value})
		},
		// 打开部门/事由选择弹窗
		async openDept(e){
			const type = e.currentTarget.dataset.tag
			let depts = []
			let selected={}
			if(type=='dept'){
				depts = this.data.loadDefault.depts
				selected=this.data.formData.dept
			}else{
				depts = await this.getLoadCause()
				selected = this.data.formData.cause
			}
			this.setData({
				deptModel: {
					visible: true,
					depts,
					selected,
					field: 'nodeName',
					type
				}
			})
		},
		deptCallback(e){
			const {selected,type} = e.detail
			this.setData({['formData.'+type]:selected})
		},
			// 打开下拉树
		openTree(e){
			const {item,tag:type} = e.currentTarget.dataset
			if (type == 'carModel' && !this.data.formData.carWay.nodeId) return // 未选用车方式，车型不可点击
			this.setData({treeModel: {
							selected: {
								nodeId: item.nodeId,
								nodeName: item.nodeName
							},
							params: this.getParams(type),
							name: type,
							visible: true
						}})
		},
		// 下拉树回调
		treeCallback(e){
			const {name,selected} = e.detail
			this.setData({['formData.'+name]:selected})
			if (name == 'carWay') {
				this.setData({carModel:{}})
				if (this.data.formData.carWay.nodeId) this.getDefaultCarModel()
			}
			//   if (name == 'company'){
			//     this.apportion()
			//   }
			//   if ( this.selected == '2') this.overTimeCheck(this.formData.departureTime || Date.now())
			//   this.getPriceCoupon()
		},
		// 获取下拉树参数
		getParams(type){
		let params = {}
		let pmsData = ( itemType, hideClear = false) => {
			return {
			url: 'fssc-data/data/ecosystemFormTree',
				itemText: type,
				hideClear,
				pmsObj: {
				userId: app.userInfo.loginUser.userId,
				deptId: this.data.formData.dept.nodeId,
				companyId: type=='company'?'': (this.data.formData.company.nodeId || ''),
				billId: this.data.loadDefault.billId,
				itemType,
				}
			}
		}
		switch (type) {
			case 'cause':
			params = {
				url: 'fssc-flight/didi/loadCause',
				itemText: 事由,
				hideSearch: true,
				pmsObj: {
				dept: this.dept.nodeId,
				project: this.formData.project.nodeId || this.loadDefault.project.nodeId,
				departureTime: dateFormat(this.formData.departureTime || Date.now(), 'YYYY-MM-DD')
				}
			}
			if (this.selected == '1') params.pmsObj.official = '1'
			break
			case 'carWay':
			params = {
				url: 'fssc-flight/didi/loadCarWay',
				itemText: '用车方式',
				hideSearch: true,
				lessHight: true,
				pmsObj: {
				dept: this.dept.nodeId,
				}
			}
			break
			case 'carModel':
			params = {
				url: 'fssc-flight/didi/loadCarModel',
				hideSearch: true,
				lessHight: true,
				itemText: '车型',
				pmsObj: {
				dept: this.dept.nodeId,
				sourceId: this.formData.carWay.nodeId,
				}
			}
			break
			case 'project':
			let catchType = wx.getStorageSync(type)
			let cacheData = catchType ? JSON.parse(catchType ): []
			params = {
				url: 'fssc-data/data/getMappingTree',
				itemText:'项目',
				firstNotSearch: true,
				cacheData,
				pmsObj: {
				sourceRootCode: 'GSDM',
				sourceId: this.data.formData.company.nodeId,
				mappingRootCode: 'XM1',
				nodeId: '',
				}
			}
			// params = pmsData('5')
			break
			case 'company':
			// params = {
			//   url: 'fssc-data/data/dimensionAccessTree',
			//   itemText: this.$t('lang.ddConfig.company'),
			//   hideClear: true,
			//   pmsObj: {
			//     rootNode: 'GSDM',
			//     accessType: 'C000',
			//     nodeId: '',
			//   }
			// }
			params = pmsData('0')
			break
			case 'costCenter':
			params = pmsData('3')
			break
			case 'channel':
			params = pmsData( '4')
			break
		
			default:
			break
		}
		return params
		},
		// 打开分摊弹窗
		openUnTake() {
			if (!this.data.formData.company.nodeId) {
				wx.showToast({title:'请先选择公司代码',icon:'none'})
			}
			const {costCenter,channel,ratio=100,price,dept,company} = this.data.formData
			this.setData({undertakeModel:{costCenter,channel,ratio,dept,company,price,visible:true,userId:app.userInfo.loginUser.userId,billId:this.data.loadDefault.billId}})
		},
		// 分摊回调
		undertakeCallback(e) {
			const {data,flag} = e.detail
			this.setData({'formData.channel':data.channel,'formData.costCenter':data.costCenter})
			if (flag) this.saveUnderTake(data)
		},
		// 切换现在与预约按钮
		toggleBtn(e,pType) {
			let type = e ? e.currentTarget.dataset.type:pType
			if (type == 'now') {
				this.formData.departureTime = ''
				this.subscribeRequired = false
			} else {
				let hour = (new Date().getHours()).toString().padStart(2, '0')
				let mintue = Math.ceil(new Date().getMinutes() / 10) + 3
				if (mintue > 5) hour++
				const ym = dateFormat(new Date(), 'YYYY-MM-DD ')
				// let now = (new Date() + 1800000
				let now = (new Date(ym + hour + ':' + (mintue > 5 ? ((mintue - 6) * 10) : mintue * 10)).getTime())
				if (this.formData.departureTime && new Date(this.formData.departureTime).getTime() > now) now = this.formData.departureTime
				this.formData.departureTime = dateFormat(now, 'YYYY-MM-DD HH:mm')
				this.subscribeRequired = true
				this.$nextTick()
			}
			this.getPriceCoupon()
		},
		// 去选择上车下车地址
		choosePlace(e){
			const type = e.currentTarget.dataset.type
			// if (!this.data.formData.city.cityName){
			// 	wx.showToast({title:'请先选择城市',icon:'none'})
			// 	return
			// }
			if (type == 'getOn') wx.navigateTo({url:'/pages/choose-place/index?type='+type}) 
			else wx.navigateTo({url:'/pages/search-place/index?type='+type})
		},
		//获取定位信息
		getLocation(){
			wx.getLocation({
				type: 'gcj02',
				isHighAccuracy: true,
				success: (result) => {
					app.location={latitude:result.latitude,longitude:result.longitude}
					this.getGeocoder(app.location)
				},
				fail: () => {},
				complete: () => {}
			});
		}
	},
	watch:{
		'selected': function (selected) {
			this.warmTip = ''
			if (selected == '2') {
				this.overTimeCheck()
			} else {
				if (selected == '1') {
					this.setData({'formData.cause':this.loadDefault.cityTraffic || {}})
				}
			}
			this.getDefaultCarWay()
		},
		'formData.costCenter,formData.channel': function (costCenter, channel) {
			let title = '已分摊'
			if (!costCenter.nodeId) title = ''
			if (channel.required && !channel.nodeId) title = ''
			this.setData({'formData.underTake':title})
		},
		'selected,canOvertime,formData.departureTime': function (selected, canOvertime, departureTime) {
			let bool = true
			if (selected == '2' && !canOvertime && departureTime) {
				bool = false
				this.setData({subscribeRequired:true})
			}
			this.setData({showNowBtn:bool})
		},
	},
	computed:{

	}
})