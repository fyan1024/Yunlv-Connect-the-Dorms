// pages/upload/upload.js
// import Toast from '@vant/weapp/toast/toast';
let db = wx.cloud.database() //操作数据库
Page({
  data: {
    city: '',
    university: '',
    address: '',
    announcements: '',
    bed_num: '',
    deadline: '',
    start_time: '',
    dormitory_num: '',
    likes_num: '0',
    text: '',
    ownerId:'',
    show: false,
    pic: false,
    minDate: new Date().getTime(),
    maxDate: '',
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

    // 地址 Locater
    showLocateSearchPicker: false,
    searchLocaeResults: [],
    selectedLocateOption: null,
    longitude:undefined,
    latitude:undefined,
  },

  /* 以下地址选择器 */
  // Function to initiate the university search based on city and university
  initiateLocateSearch: function() {
    const { city, university } = this.data;
    if (city && university) {
      this.CityAndUniv2Location(university, city);
    } else {
      wx.showToast({
        title: 'Please enter both city and university',
        icon: 'none',
      });
    }
  },
  // Function to perform the location search
  CityAndUniv2Location: function(university, city) {
    const cityWithSuffix = city.endsWith("市") ? city : city + "市";
    wx.request({
      url: `https://apis.map.qq.com/ws/place/v1/search?page_index=1&page_size=10&boundary=region(${encodeURIComponent(cityWithSuffix)},0)&keyword=${encodeURIComponent(university)}&key=PWHBZ-SREKC-AE52A-A3IEA-QDXLQ-CHB5Q`,
      success: (res) => {
        const searchResults = res.data.data.map((item, index) => ({
          id: index,
          title: item.title,
          lat: item.location.lat,
          lng: item.location.lng,
        }));
        this.setData({
          searchResults: searchResults,
          showLocateSearchPicker: true,
        });
        console.log('search results saving to searchResults:  ', searchResults)
      },
      fail: (error) => {
        console.error('Search failed:', error);
        wx.showToast({
          title: 'Search failed, please try again',
          icon: 'none',
        });
      }
    });
  },
  onLocateSelectOption: function(e) {
    const selectedId = e.currentTarget.dataset.id;
    const selectedOption = this.data.searchResults.find(option => option.id === selectedId);
    this.setData({
      selectedLocateOption: selectedOption, // Save the selected option
      showLocateSearchPicker: false, // Close the popup after selection
      address: selectedOption.title,
      latitude: selectedOption.lat, // Set latitude
      longitude: selectedOption.lng, // Set longitude
    });
    console.log('Selected location:', this.data.selectedLocateOption);
    // Additional logic to use the selected location can follow here
    wx.showToast({
      title: '成功保存地址',
      icon: 'success',
      duration: 1500
    });
  },
  onLocateClosePopup: function() {
    this.setData({
      showUnivSearchPopup: false,
    });
  },
  /* 地址选择器部分结束 */


  /**
  * 生命周期函数--监听页面加载
  */
  onLoad(options) {
    this.setData({
      user: wx.getStorageSync('userInfo')
    })
    this.calculateMaxDate();
  },
  calculateMaxDate() {
    const today = new Date();
    const twoMonthsLater = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());
    this.setData({
      maxDate: twoMonthsLater.getTime()
    });
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
    const startDate = this.formatDate(start); // 使用已有的 formatDate 方法或自定义格式
    const endDate = this.formatDate(end);
    this.setData({
      show: false,
      start_time: startDate,
      deadline: endDate,
      date: `${startDate} - ${endDate}`, // 更新页面上显示的日期范围
    });
    console.log(this.data.deadline)
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
    const db = wx.cloud.database();

    // city university address announcements bed_num deadline start_time 
    // dormitory_num likes_num text ownerId
    
    // 解构页面数据
    const { city, university, address, bed_num, announcements, dormitory_num, pic, start_time, deadline, latitude, longitude } = this.data;

    // 检查必填信息是否已填写
    if (!city || !university || !address || !bed_num || !dormitory_num) {
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
    // 向Bed集合添加记录，包括开始和结束日期
    db.collection('Bed').add({
      data: {
        city: city,
        Is_busy: false,
        address: address,
        announcements: announcements,
        bed_num: bed_num,
        start_time: start_time, // 包含开始日期
        deadline: deadline, // 包含结束日期
        dormitory_num: dormitory_num,
        evaluation: '',
        likes_num: 0,
        picture_add: that.data.bedUrl,
        university: university,
        createTime: db.serverDate(), // 服务器时间
        ownerId:that.data.user._id,
        ownerName:that.data.user.User_name,
        
        longitude: longitude,
        latitude: latitude,
      },
      success: res => {
        // 添加成功后的处理
        wx.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 1500
        });
        console.log('上传成功，记录 _id: ', res._id);
        this.setData({
          recordId: res._id // 保存记录ID
        });
        setTimeout(() => {
          wx.navigateBack({
            delta: 1 // 返回上一级页面，如果当前页面是通过 navigateTo 打开的，delta 设置为 1 即可
          });
        }, 1500); // 这里的延时应与 showToast 的 duration 相匹配
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