const db = wx.cloud.database();

Page({
  data: {
    /* 基本信息 */
    goodsDetail: null,
    bedinfo: [],
    
    /* map 部分 */
    longitude:undefined,
    latitude:undefined,
    scale:11,

    /* 留言 部分 */
    content: '', // 用户输入的评论内容
    user: {},
    userId: '',
    userName: '',
    avatarUrl: '',
    avatarUrl2: '',
    bedId: '',
    comments: [], // 存储查询到的留言数据
    bed: [],
    owner: '',

    /* 收藏 部分 */
    isCollected: false // 初始状态设为未收藏

  },
  onLoad(options) {
    /* 留言功能 */
    const user = wx.getStorageSync('userInfo');
    console.log("用户信息", user)
    this.setData({
      user: user,
      userId: user._id, // 确保这里的属性名与实际存储的key匹配
      userName: user.User_name,
      avatarUrl: user.avatarUrl
    })
    console.log("用户id", this.data.userId)
    /* 留言功能结束 */
    // `bedsId` 的值作为URL参数传递给了 `bedinfo`
    // `onLoad` 函数可以通过它的参数 `options` 来访问这个传递过来的 `id` 值。
    const bedsId = options.id;
    db.collection('Bed').doc(bedsId).get().then(res => {
        const bedinfo = res.data;
        this.setData({
          bedinfo: bedinfo,
          bedId: bedinfo._id
        }, () => {
          this.Univ2Location(); 
        });
        console.log("床铺ID", bedinfo._id)
        this.queryComments(bedinfo._id);
        
        /* 收藏功能 */
        this.collected();
      }).catch(error => {
        console.error('获取商品信息失败', error);
      }
    );


  },

  /* 收藏 */
  collected() {
    const db = wx.cloud.database()

    db.collection('save').where({
      bedId: this.data.bedId,
      userId: this.data.userId
    }).get({
      success: res => {
        if (res.data.length > 0) {
          this.setData({
            isCollected: true
          });
        } else {
          this.setData({
            isCollected: false
          });
        }
      }
    })
  },

  /* 查询留言 */
  queryComments(bedId) {
    db.collection('comment').where({
      bedId: bedId // 确保留言数据中有 bedId 字段关联到床铺
    }).limit(15).get({
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

  /*
  申请 WebServiceAPI Key，开启腾讯位置服务，参考： 
    https://lbs.qq.com/faq/serverFaq/webServiceKey
  分配额度，参考：
    https://blog.csdn.net/m0_52993798/article/details/133647174
  配置域名，参考：
    https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html
  参考腾讯位置服务 demo 实现地址转坐标搜索函数, 地图WebserviceAPI地点搜索接口请求路径及参数，参考：
    https://lbs.qq.com/service/webService/webServiceGuide/miniprogram?ref=miniprogram_component_map#5
  例如：
    // url: 'https://apis.map.qq.com/ws/place/v1/search?page_index=1&page_size=20&boundary=region(北京市,0)&keyword=美食&key=PWHBZ-SREKC-AE52A-A3IEA-QDXLQ-CHB5Q',  
  */

 Univ2Location() {
  var _this = this;
  var allMarkers = [];
  var bedinfo = this.data.bedinfo; 
  // console.log("Loading Univ2Location");
  // console.log(bedinfo.address + "," + bedinfo.latitude + "," + bedinfo.longitude);
  // 创建一个基于bedinfo信息的marker
  const marker = {
    id: 0, // 由于只有一个marker，id设置为0
    latitude: bedinfo.latitude,
    longitude: bedinfo.longitude,
    width: 50,
    height: 50,
    iconPath: bedinfo.picture_add, // 自定义图标的路径
    callout: {
      content: bedinfo.address,
      display: 'ALWAYS',
      fontSize: 14,
      bgColor: "#FFF8DC",
      padding: 10,
      borderRadius: 10, // 增加圆角
      // borderRadius: 5,
      // borderWidth: 1,
      borderWidth: 2,
      borderColor: "#FF4500" // 修改边框颜色
      // borderColor: "#cccccc"
    }
  };
  allMarkers.push(marker);

  // 设置地图中心为这个marker的位置，并添加到markers中
  _this.setData({
    latitude: marker.latitude,
    longitude: marker.longitude,
    markers: allMarkers
  });
},


  // 跳转导航APP
  // https://developers.weixin.qq.com/miniprogram/dev/api/location/wx.openLocation.html
  onMarkerTap(e) {
    console.log('Marker ID:', e.markerId);
    const marker = this.data.markers.find(marker => marker.id === e.markerId);
    if (marker) {
      wx.openLocation({
        latitude: marker.latitude,
        longitude: marker.longitude,
        name: marker.callout.content, // 可选，地点名字
        scale: 18 // 可选，缩放级别，默认为18，范围从5~18
      });
    }
  },

  // onClickIcon1() {
  //   wx.navigateTo({
  //     url: '/pages/chat/chat',
  //   })
  // },

  onClickIcon1(event) {
    this.setData({
      isCollected: false
    })
    console.log("collected2", this.data.isCollected)
    const db = wx.cloud.database()
    db.collection('save').where({
      bedId: this.data.bedId,
      userId: this.data.userId
    }).remove().then(res => {
      console.log('取消收藏');
      wx.showToast({
        title: '取消收藏',
        icon: 'success',
        duration: 1500,
      });
      // console.log("collected 取消收藏", this.data.isCollected)
    }).catch(err => {
      wx.showToast({
        title: '取消收藏失败',
        icon: 'none',
        duration: 1500,
      });
    });
  },

  onClickIcon2(event) {
    const userId = event.currentTarget.dataset.name;
    console.log("userId",userId)
    wx.navigateTo({
      url: `/pages/save/save?id=${userId}`,
    });
  },

  onClickButton1(event) {
    const that = this
    const bedId = event.currentTarget.dataset.bedid;
    wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 1500,
    });
    const db = wx.cloud.database();
    console.log(this.data.bedinfo)
    const saveInfo = {
      // 假设的订单信息，根据实际需要进行调整
      Generation_time: new Date(), // 创建时间
      bedId: this.data.bedId,
      userId: this.data.userId,
      ownerId: this.data.bedinfo.ownerId,
      ownerName: this.data.bedinfo.ownerName
    };
    db.collection('save').add({
      data: saveInfo,
      success: function (res) {
        // 数据保存成功后的回调函数
        wx.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 1500,
        });
        that.setData({
          isCollected: true
        })
        console.log(that.data.isCollected)
      },
      fail: function (err) {
        // 数据保存失败后的回调函数
        wx.showToast({
          title: '收藏失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  onClickButton2(event) {
    const bedId = event.currentTarget.dataset.bedid;

    wx.navigateTo({
      url: `/pages/reserve/reserve?id=${bedId}`,
    });
    console.log('navigate to: ', bedId)
  },


});

