// pages/comment/comment.js
const db = wx.cloud.database();
const _ = db.command;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    comments: [], // 用于存储查询到的留言数据
    comments2: [],
    userId: '',
    id: '',
    groupedComments: [],
    groupedComments2: [],
    inputData: '',
    tempComments: [],
    bedId: [],
    user: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userId = options.id;
    this.setData({
      userId: userId,
      user: wx.getStorageSync('userInfo')
    })
    this.queryUserComments();
    this.queryUserComments2();
  },

  groupedComments() {
    let groupedComments = {};
    this.data.comments.forEach(comment => {
      if (!groupedComments[comment.userName]) {
        groupedComments[comment.userName] = [];
      }
      groupedComments[comment.userName].push(comment);
    });

    // 将分组后的数据转换为数组形式
    let groupedCommentsArray = [];
    for (let userName in groupedComments) {
      groupedCommentsArray.push({
        userName: userName,
        comments: groupedComments[userName]
      });
    }

    // 更新页面数据
    this.setData({
      groupedComments: groupedCommentsArray
    });
  },



  queryUserComments: function () {
    // 假设userId是从某处获取的当前用户ID
    const userId = this.data.userId;
    db.collection('comment').where({
      receiverId: userId
    }).orderBy('createTime', 'desc').get().then(res => {
      this.setData({
        comments: res.data
      });
      this.groupedComments();
    });
  },

  queryUserComments2: function () {
    // 假设userId是从某处获取的当前用户ID
    const userId = this.data.userId;
    // 首先查询当前用户的床位
    // 然后查询这些床位的留言
    db.collection('comment').where({
      userId: userId
    }).orderBy('createTime', 'desc').get().then(res => {
      this.setData({
        comments2: res.data
      });
      this.groupedComments2();
    });
  },

  groupedComments2() {
    let groupedComments2 = {};
    console.log(this.data.comments2)
    this.data.comments2.forEach(comment => {
      if (!groupedComments2[comment.receiverName]) {
        groupedComments2[comment.receiverName] = [];
      }
      groupedComments2[comment.receiverName].push(comment);
    });

    // 将分组后的数据转换为数组形式
    let groupedCommentsArray2 = [];
    for (let receiverName in groupedComments2) {
      groupedCommentsArray2.push({
        receiverName: receiverName,
        comments: groupedComments2[receiverName]
      });
    }

    // 更新页面数据
    this.setData({
      groupedComments2: groupedCommentsArray2
    });
  },

  responseComment(event) {
    const that = this;
    const rId = event.currentTarget.dataset.idId;
    wx.showModal({
      title: '请回复留言',
      showCancel: true,
      editable: true,
      success: function (res) {
        if (res.confirm) {
          // 用户点击确定按钮
          const inputData = res.content;
          // 更新页面数据
          that.setData({
            inputData: inputData
          });
          that.send(inputData, rId)
          // 保存数据到本地或发送到服务器
          // 这里可以根据业务需求自行处理
          // 弹出提示框，显示保存成功

        }
      }
    });
  },

  send: function (inputData, rId) {
    const that = this
    const db = wx.cloud.database();
    db.collection('comment').where({
      _id: rId
    }).get({
      success: res => {
        console.log(res.data)
        that.setData({
          tempComments: res.data[0]
        });
        that.send2(inputData, rId)
      },
    });
  },

  send2: function (inputData, rId) {
    console.log(this.data.tempComments)
    const user = wx.getStorageSync('userInfo');
    console.log(user)
    db.collection('comment').add({
      data: {
        content: this.data.inputData,
        createTime: db.serverDate(),
        userId: this.data.userId,
        userName: user.User_name,
        avatarUrl: user.avatarUrl,
        avatarUrl2: this.data.tempComments.avatarUrl,
        bedId: this.data.tempComments.bedId,
        receiverId: this.data.tempComments.userId,
        receiverName: this.data.tempComments.userName
      },
      success: res => {
        wx.showToast({
          title: '留言成功',
          icon: 'success',
        });
        // 评论成功后的处理，例如清空输入框，刷新评论列表等
        this.setData({
          content: '',
        });
        this.queryComments(this.data.bedId); // 重新查询留言
        // 可以在这里添加获取评论列表的函数调用，以更新显示的评论
      },
      fail: err => {
        wx.showToast({
          title: '评论失败',
          icon: 'none',
        });
      },
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

  },

  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
})