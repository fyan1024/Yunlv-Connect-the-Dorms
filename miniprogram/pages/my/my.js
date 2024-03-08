// pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: '',
    user2: [],
    amount: '',
    active: 'my',
    inputData: ''
  },
  onChange(event) {
    this.setData({
      active: event.detail,
      user: wx.getStorageSync('userInfo')
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
    this.setData({
      user: wx.getStorageSync('userInfo')
    })
  },

  idenfy() {
    const user = this.data.user;
    if (user.Is_student == false) {
      wx.showModal({
        title: '请输入数据',
        content: '请在下方输入框中输入数据',
        showCancel: true,
        editable: true,
        success: function (res) {
          if (res.confirm) {
            // 用户点击确定按钮
            const inputData = res.content;
            // 更新页面数据
            const db = wx.cloud.database();
            db.collection('User').doc(user._id).update({
                data: {
                  Code: inputData,
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
            // 保存数据到本地或发送到服务器
            // 这里可以根据业务需求自行处理
            // 弹出提示框，显示保存成功

          }
        }
      });
    } else {
      wx.showToast({
        title: '您已验证学生身份',
        icon: 'none',
      })
    }
  },

  fillinfo() {
    wx.navigateTo({
      url: '/pages/my/fill',
    })
  },

  cancle() {
    wx.showModal({
      title: '温馨提示',
      content: '退出登录后...是否退出',
      complete: (res) => {
        if (res.cancel) {
          wx.showToast({
            title: '不退出',
            icon: 'none'
          })
        }

        if (res.confirm) {
          wx.removeStorageSync('userInfo')
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }
      }
    })
  },

  goToOrder(event) {
    const userId = event.currentTarget.dataset.user2Id;
    console.log(userId)
    wx.navigateTo({
      url: `/pages/order/order?id=${userId}`,
    });
  },

  goToComment(event) {
    const userId = event.currentTarget.dataset.user2Id;
    console.log(userId)
    wx.navigateTo({
      url: `/pages/comment/comment?id=${userId}`,
    });
  },

  goToPoints(event) {
    const userId = event.currentTarget.dataset.user3Id;
    console.log(userId)
    wx.navigateTo({
      url: `/pages/points/points?id=${userId}`,
    });
  },

  goToSaves(event) {
    const userId = event.currentTarget.dataset.user3Id;
    console.log(userId)
    wx.navigateTo({
      url: `/pages/save/save?id=${userId}`,
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      user: wx.getStorageSync('userInfo')
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.setData({
      user: wx.getStorageSync('userInfo')
    })
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