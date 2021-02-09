import request from './request'
App({
    userInfo:{},
    firstLoad:true,
    onplace: '',
    offplace: '',
    location: {
        latitude: 22.53332,
        longitude: 113.93041,
    },
    city: '',
    async sso() {
        const res = await request.request({
            url: 'fssc-common/login/passwordLogin',
            method: 'post',
            data: {
                'username': 'jinglin.lin',
                'password': '54ab9d22ca4e4db5c0bee72dadf7abeb',
                'lang': this.lang
            },
            type: 'formData',
            addToken:false,
        })
        if(res.rstCode=='0'){
            this.userInfo = res.data
            return this.userInfo
        }
    },
    onLaunch:function(){
        this.sso()
    }
})