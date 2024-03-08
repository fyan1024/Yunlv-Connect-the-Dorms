// pages/reserve/reserve.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: '',
    userId: '',
    bedId: '',
    isDisabled: true, // 初始设置为false，表示不禁用
    tip: '',
    showTip: true,
    tipMessage: "",
    currentTime: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const bedId = options.id
    console.log("床铺Id是", bedId)
    const user = wx.getStorageSync('userInfo');
    this.setData({
      userId: user._id,
      bedId: bedId,
      user: user
    })
    console.log("user是", user)
    console.log("用户Id是", this.data.userId)
    this.checkCondition();
    this.setCurrentTime();
  },
  checkCondition: function () {
    const db = wx.cloud.database();
    const _ = db.command; // 获取数据库查询命令对象
    const userId = this.data.userId; // 需要替换为实际获取当前用户ID的代码
    const bedId = this.data.bedId;
    console.log("用户头像", this.data.user.avatarUrl)
    db.collection('User').where({
      _id: userId, // 假设使用_id字段标识用户ID
      Points: _.lt(20) // 检查Points字段是否小于20
    }).get().then(res => {
      if (res.data.length > 0) {
        // 如果查询到当前用户且其Points小于20
        this.setData({
          isDisabled: true, // 禁用提交按钮
          showTip: true,
          tipMessage: "您的积分不足！" // 设置提示信息内容
        });
        console.log("小于20分")
      } else {
        // 如果没有查询到符合条件的用户记录（即当前用户Points不小于20）
        this.setData({
          isDisabled: false, // 启用提交按钮
          showTip: false
        });
        console.log("大于20")
      }
    }).catch(err => {
      console.error(err);
    });
    db.collection('Bed').doc(bedId).get().then(res => {
      // 处理后台返回的商品信息
      const bedinfo = res.data;
      // 在页面中渲染商品信息
      this.setData({
        bedinfo: bedinfo,
      });
    })
      .catch(error => {
        console.error('获取商品信息失败', error);
      });
  },
  setCurrentTime: function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    const formattedTime = `${year}-${this.formatNumber(month)}-${this.formatNumber(day)} ${this.formatNumber(hour)}:${this.formatNumber(minute)}:${this.formatNumber(second)}`;
    this.setData({
      currentTime: formattedTime
    });
  },
  formatNumber: function (n) {
    n = n.toString();
    return n[1] ? n : '0' + n;
  },
  onSubmit: function () {
    const that = this
    const db = wx.cloud.database(); // 获取数据库的引用
    const bedId = this.data.bedId;
    const orderInfo = {
      // 假设的订单信息，根据实际需要进行调整
      Generation_time: new Date(), // 创建时间
      Is_like: false,
      Is_report: false,
      Is_reviewed: false,
      Is_success: false,
      Bed_id: this.data.bedId,
      university: this.data.bedinfo.university,
      User_id: this.data.userId,
      status: 'To be returned',
      user_status: 'To be used',
      user_id: this.data.bedinfo.ownerId,
      picture_add: this.data.user.avatarUrl,
    };
    db.collection('Order').add({
      data: orderInfo,
      success: function (res) {
        // 数据保存成功后的回调函数
        that.updateBedStatus(bedId); // 调用更新床铺状态的方法
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 1500,
        });
        setTimeout(() => {
          wx.navigateBack({
            delta: 2 // 返回上一级页面，如果当前页面是通过 navigateTo 打开的，delta 设置为 1 即可
          });
        }, 1500); // 这里的延时应与 showToast 的 duration 相匹配
      },
      fail: function (err) {
        // 数据保存失败后的回调函数
        wx.showToast({
          title: '订单提交失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  updateBedStatus: function (bedId) {
    const db = wx.cloud.database();
    db.collection('Bed').doc(bedId).update({
      data: {
        Is_busy: true
      },
      success: function (res) {
      },
      fail: function (err) {
        wx.showToast({
          title: '状态更新失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
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