const db = wx.cloud.database();

Page({
  data: {
    goodsDetail: null,
    bedinfo: [],
    show: false,
    owner_name: '',
    owner: '',
    // 以下是留言功能需要的数据
    content: '', // 用户输入的评论内容
    user: {},
    userId: '',
    userName: '',
    avatarUrl: '',
    avatarUrl2: '',
    bedId: '',
    comments: [], // 存储查询到的留言数据
    bed: [],
    ownerName: ''
  },
  showPopup() {
    this.setData({
      show: true
    });
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  onLoad(options) {
    const user = wx.getStorageSync('userInfo');
    console.log("用户信息", user)
    console.log(user)
    this.setData({
      user: user,
      userId: user._id, // 确保这里的属性名与实际存储的key匹配
      userName: user.User_name,
      avatarUrl: user.avatarUrl
    })
    console.log("用户id", this.data.userId)
    const bedsId = options.id;
    // 发起网络请求，获取商品详情数据
    db.collection('Bed').doc(bedsId).get().then(res => {
        // 处理后台返回的商品信息
        const bedinfo = res.data;
        // 在页面中渲染商品信息
        this.setData({
          bedinfo: bedinfo,
          bedId: bedinfo._id
        });
        console.log("床铺ID", bedinfo._id)
        this.queryComments(bedinfo._id);
      })
      .catch(error => {
        console.error('获取商品信息失败', error);
      });

  },

  queryComments(bedId) {
    db.collection('comment').where({
      bedId: bedId // 确保留言数据中有 bedId 字段关联到床铺
    }).limit(5).get({
      success: res => {
        this.setData({
          comments: res.data
        });
      },
      fail: err => {
        console.error('获取留言失败', err);
      }
    });
  },
  handleInput(e) {
    this.setData({
      content: e.detail, // 更新页面数据，保存用户输入的评论内容
    });
  },
  submitComment(event) {
    if (this.data.content.trim() === '') {
      wx.showToast({
        title: '留言内容不能为空',
        icon: 'none',
      });
      return;
    }
    const rId = event.currentTarget.dataset.idId;
    console.log(rId)
    const db = wx.cloud.database();
    db.collection('User').where({
      _id: rId
    }).get({
      success: res => {
        console.log(res.data[0])
        const temp = res.data[0]
        console.log(temp.avatarUrl)
        this.setData({
          owner: temp
        });
        console.log(this.data.owner)
        this.sub()
      },
    });
  },

  sub() {
    console.log(this.data.owner)
    db.collection('comment').add({
      data: {
        content: this.data.content,
        createTime: db.serverDate(),
        userId: this.data.userId,
        userName: this.data.userName,
        avatarUrl: this.data.avatarUrl,
        avatarUrl2: this.data.owner.avatarUrl,
        bedId: this.data.bedId,
        receiverId: this.data.bedinfo.ownerId,
        receiverName: this.data.bedinfo.ownerName,
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

  onClickIcon1() {
    wx.navigateTo({
      url: '/pages/chat/chat',
    })
  },

  onClickIcon2() {
    wx.showToast({
      title: '点击图标2',
      icon: 'none'
    })
    console.log
  },

  onClickButton1() {
    wx.showToast({
      title: '点击按钮1',
      icon: 'none'
    })
  },

  onClickButton2(event) {
    const bedId = event.currentTarget.dataset.bedid;
    wx.navigateTo({
      url: `/pages/reserve/reserve?id=${bedId}`,
    })
  },
});