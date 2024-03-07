// pages/upload/upload.js
// import Toast from '@vant/weapp/toast/toast';
let db = wx.cloud.database() //操作数据库
Page({
  data: {
    City: '',
    university: '',
    address: '',
    announcements: '',
    bed_num: '',
    deadline: '',
    start_time: '',
    dormitory_num: '',
    likes_num: '0',
    text: '',
    show: false,
    pic: false,
    minDate: new Date(2024, 2, 28).getTime(),
    maxDate: new Date(2024, 3, 31).getTime(),
    bedUrl: "https://img0.baidu.com/it/u=1429435380,946942033&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
    user: '',
    fileList: [
      {
        url: 'https://img.yzcdn.cn/vant/leaf.jpg',
        name: '图片1',
      },
      // Uploader 根据文件后缀来判断是否为图片文件
      // 如果图片 URL 中不包含类型信息，可以添加 isImage 标记来声明
    ],
    recordId: '',
    fileID: '',
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad(options) {
    this.setData({
      user: wx.getStorageSync('userInfo')
    })
  },
  onDisplay() {
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  formatDate(date) {
    date = new Date(date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  },
  onConfirm(event) {
    const [start, end] = event.detail;
    this.setData({
      show: false,
      date: `${this.formatDate(start)} - ${this.formatDate(end)}`,
    });
  },
  onChange(e) {
    console.log(e.detail); // 打印输入的内容看看
    const name = e.currentTarget.dataset.name;
    const value = e.detail;
    this.setData({
      [name]: value, // 动态设置对应的数据属性
    });
    console.log(name);
    console.log(value)
  },
  uploadcontent: function () {
    let that = this;
    const db = wx.cloud.database(); // 获取数据库引用
    const { university, address, bed_num, announcements, dormitory_num, pic } = this.data;
    // 检查schoolName是否为空
    if (!university || !address || !bed_num || !dormitory_num) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none',
      });
      return;
    }
    if (!pic) {
      wx.showToast({
        title: '请上传照片',
        icon: 'none',
      });
      return;
    }
    // 向Bed集合添加记录
    db.collection('Bed').add({
      data: {
        city: this.data.City,
        Is_busy: false,
        address: address,
        announcements: announcements,
        bed_num: bed_num,
        deadline: '',
        start_time: '',
        dormitory_num: dormitory_num,
        evaluation: '',
        likes_num: '0',
        picture_add: that.data.bedUrl,
        university: university,
        createTime: db.serverDate(), // 服务器时间
      },
      success: res => {
        // 添加成功后的处理
        wx.showToast({
          title: '上传成功',
          icon: 'success',
        });
        console.log('上传成功，记录 _id: ', res._id);
        this.setData({
          recordId: res._id // 保存记录ID
        });
        console.log(this.data.fileID)
        this.updateDatabase(this.data.fileID);
      },
      fail: console.error,
    });
  },
  cancelsub() {
    wx.navigateBack({
      delta: 1
    })
  },
  onChoosepic(e) {
    let benUrl = e.detail.bedUrl
    wx.chooseImage({
      count: 1, // 默认为9, 设置为1表示只选择1张图片
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        // 返回选定照片的本地文件路径列表 tempFilePaths
        const filePath = res.tempFilePaths[0];
        // 接下来可以进行上传操作，这里直接更新页面上的图片预览
        this.setData({
          bedUrl: filePath, // 更新图片预览路径
          pic: true,
        });
        // 上传图片到服务器或云存储的代码可以放在这里
        wx.cloud.uploadFile({
          cloudPath: "bed.images/" + Date.now(), // 为文件生成一个唯一的文件名
          filePath: filePath, // 文件路径
          success: uploadRes => {
            // 文件上传成功后的操作
            console.log('上传成功', uploadRes);
            // 可以在这里获取文件的云存储路径 uploadRes.fileID 并更新到页面或数据库
            // 更新数据库记录
            this.setData({
              fileID: uploadRes.fileID
            });
            console.log(fileID);
            wx.navigateBack(
              { delta: 1, }
            )
          },
          fail: console.error
        });
      }
    });
  },
  updateDatabase(fileID) {
    console.log(123)
    if (!this.data.recordId) {
      console.log('没有记录ID，无法更新');
      return;
    }
    console.log(this.data.recordId)
    db.collection('Bed').doc(this.data.recordId).update({
      data: {
        picture_add: fileID // 假设字段名为bedUrl
      },
      success: res => {
        wx.navigateBack({
          delta: 1
        })
      },
      fail: console.error
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