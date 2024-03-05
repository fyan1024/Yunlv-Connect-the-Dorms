wx.cloud.callFunction({
  name: 'login',
  success: res => {
    const openid = res.result.openid;

    // 使用 OpenID 查询当前用户信息
    db.collection('Users').where({
      openid: openid
    }).get({
      success: res => {
        this.setData({
          userInfo: res.data[0]
        })
      },
      fail: err => {
        console.error('查询用户信息失败：', err)
      }
    })
  },
  fail: err => {
    console.error('登录失败：', err)
  }
})