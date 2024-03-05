import Toast from '@vant/weapp/toast/toast';

const db = wx.cloud.database();
// pages/my/fill.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    User_gender: '', // 初始化性别为空字符串
    Location: '', // 初始化地区为空字符串
    University: '', // 初始化学校为空字符串

    user: '',

    show: false,

    columns: ['男', '女']
  },
  showPopup() {
    this.setData({
      show: true
    });
  },
  
  onChangePop(event) {
    const { picker, value, index } = event.detail;
    Toast(`当前值：${value}, 当前索引：${index}`);
    this.setData({
      User_gender: value
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 从本地缓存中获取之前保存的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    // 如果本地缓存中存在用户信息，则根据用户名从云端数据库中获取对应的用户信息
    if (userInfo) {
      // 获取云数据库引用
      const db = wx.cloud.database();
      const usersCollection = db.collection('User'); // 假设你的集合名称为 'User'

      // 查询对应用户名的用户信息
      usersCollection.where({
        User_name: userInfo.User_name
      }).get().then(res => {
        // 获取查询结果
        const userData = res.data;
        if (userData.length > 0) {
          // 将从云端数据库中获取到的用户信息更新到页面的 user 中
          this.setData({
            user: userData[0] // 假设返回的结果为一个数组，取第一个元素作为用户信息
          });
        } else {
          console.error('未找到对应的用户信息');
        }
      }).catch(err => {
        console.error('查询用户信息失败', err);
      });
    } else {
      console.error('未找到本地缓存的用户信息');
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  onChange(event) {
    const name = event.currentTarget.dataset.name; // 通过 dataset 获取 data-name 属性的值
    const value = event.detail
    this.setData({
      [name]: value, // 动态设置对应的数据属性
    });
  },


  submit(event) {
    const {
      User_gender,
      Location,
      University
    } = this.data;
    this.fill_info(User_gender, Location, University)
  },

  fill_info(aUser_gender, aLocation, aUniversity) {
    const user = this.data.user
    db.collection('User').doc(user._id).update({
        data: {
          User_gender: aUser_gender,
          Location: aLocation,
          University: aUniversity
        }
      })
      .then(res => {
        wx.hideLoading()
        wx.showModal({
          content: '修改成功',
          complete: (res) => {
            wx.reLaunch({
              url: '/pages/my/my',
            })
          }
        })
      })
      .catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '修改失败,请重试',
          icon: 'none'
        })
      })
  },

  cancelsub() {
    wx.navigateTo({
      url: '/pages/my/my',
    })
  },
  onClose() {
    this.setData({
      show: false
    });
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