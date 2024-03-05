let db = wx.cloud.database() //操作数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: "https://img0.baidu.com/it/u=1429435380,946942033&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
    su_av: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  back() {
    wx.navigateBack({
      data: 1
    })
  },
  // 用户提交信息
  submit(e) {
    let dd = e.detail.value
    console.log(dd);
    if (!dd.nickName || !dd.name || !dd.phone || !dd.passWord || !dd.con_passWord) {
      wx.showToast({
        title: '请输入完整信息',
        icon: 'none'
      })
      return;
    } else if (dd.passWord != dd.con_passWord) {
      wx.showToast({
        title: '密码不一致',
        icon: 'none'
      })
      return;
    } else if (!this.data.su_av) {
      wx.showToast({
        title: '请上传头像',
        icon: 'none'
      })
    } else {
      //把用户信息录入数据库    你应该去判断此手机号是否已经被注册了
      //判断手机号是否已经被注册了
      wx.showLoading({
        title: '注册中',
      })
      db.collection("User").where({
          phone: dd.phone
        }).get()
        .then(res => {
          if (res.data.length) //已存在
          {
            wx.hideLoading()
            wx.showToast({
              title: '此手机号已经被注册了',
              icon: 'none'
            })
          } else {
            this.add_user(dd.nickName, dd.name, dd.phone, dd.passWord);
          }
        })
        .catch(err => {
          wx.showToast({
            title: '失败,请重试',
            icon: 'none'
          })
          wx.hideLoading()
        })
    }
  },
  // 添加用户
  add_user(nickName, name, phone, passWord) {
    let that = this
    db.collection("User").add({
        data: {
          Contact_way: '未填写',
          Is_student: false,
          Location: '未填写',
          Points: 0,
          University: '未填写',
          User_name: nickName,
          name,
          phone,
          passWord,
          avatarUrl: that.data.avatarUrl,
          User_gender: '未填写'
        }
      })
      .then(res => {
        wx.hideLoading()
        wx.showModal({
          title: '温馨提示',
          content: '注册成功,是否立即登录',
          complete: (res) => {
            if (res.cancel) {

            }

            if (res.confirm) {
              that.back()
            }
          }
        })
      })
      .catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '注册失败,请重试',
          icon: 'none'
        })
      })
  },
  // 用户选择头像
  // 获取头像
  onChooseAvatar(e) {

    let that = this
    let avatarUrl = e.detail.avatarUrl


    wx.showLoading({
      title: '上传中',
    })
    let time = Date.now() //获取当前的时间戳
    wx.cloud.uploadFile({
        cloudPath: "users.images/" + time, //文件名
        filePath: avatarUrl //文件
      })
      .then(res => {
        that.setData({
          avatarUrl: res.fileID,
          su_av: true
        })
        wx.hideLoading()
        wx.showToast({
          title: '上传成功',
          icon: 'none'
        })
      })


  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})