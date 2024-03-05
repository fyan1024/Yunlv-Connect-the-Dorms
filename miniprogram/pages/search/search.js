import Toast from '@vant/weapp/toast/toast';

const db = wx.cloud.database();


Page({
  data: {

    /* 
    Ars:
      beds: 数据集合BED

      cityOptions:  从beds中之间返回的所有城市
      uniqueCityOptions:  去除cityOptions中重复的城市名称
      showCityPicker:  是否弹出城市选择器
      selectedCity：所选城市

      busyOptions:  
      uniqueBusyOptions: 
      showBusyPicker:
      selectedBusy:

      univOptions:  
      uniqueUnivOptions: 
      showUnivPicker:
      selectedUniv:

    Evant:
      onCitySelect
        赋值showCityPicker = truer 打开选择框
      onCityChange(picker) 
        根据 uniqueCityOptions 展示选择框
        赋值 showCityPicker = false 关闭选择框
        赋值 selectedCity = 选择框value 
        filter
      onCitySelectClose 
        赋值 showCityPicker = false 关闭选择框

      onBusySelect
      onBusyChange(picker) 
      onBusySelectClose

      onUnivSelect
      onUnivChange(picker) 
      onUnivSelectClose

    Func:
      GetAllBedData()
      FilterBeds()

    */

    beds: [],

    bedids: [],

    cityOptions: [],
    uniqueCityOptions: [],
    selectedCity: "",
    showCityPicker: false,

    busyOptions: [],
    uniqueBusyOptions: [],
    selectedBusy: "",
    showBusyPicker: false,

    univOptions: [],
    uniqueUnivOptions: [],
    selectedUniv: "",
    showUnivPicker: false,

    filteredBeds: [],

  },

  onLoad(options) {
    this.GetAllBedData();
    this.FilterBeds();
  },

  goToDetail(event) {
    const bedsId = event.currentTarget.dataset.bedidsId;
    console.log(bedsId)
    wx.navigateTo({
      url: `/pages/bedinfo/bedinfo?id=${bedsId}`,
    });
  },

  GetAllBedData() {
    db.collection('Bed').orderBy('likes_num', 'desc').get({
      success: (res) => {
        console.log('查询成功，所有数据：', res.data);

        const cityoptions = res.data.map((bed) => bed.city);
        const uniquecityOptions = Array.from(new Set(cityoptions));
        const univoptions = res.data.map((bed) => bed.university);
        const uniqueunivOptions = Array.from(new Set(univoptions));
        const busyoptions = res.data.map((bed) => bed.Is_busy);
        const uniquebusyOptions = Array.from(new Set(busyoptions)).map(option => option ? "占用" : "空闲");

        console.log('查询所有城市选项：', cityoptions);
        console.log('写入城市选项：', uniquecityOptions);
        console.log('查询所有状态选项：', busyoptions);
        console.log('写入状态选项：', uniquebusyOptions);
        console.log('查询所有学校选项：', univoptions);
        console.log('写入学校选项：', uniqueunivOptions);

        this.setData({
          beds: res.data,
          cityOptions: cityoptions,
          uniqueCityOptions: uniquecityOptions,
          busyOptions: busyoptions,
          uniqueBusyOptions: uniquebusyOptions,
          univOptions: univoptions,
          uniqueUnivOptions: uniqueunivOptions,
        });
      },
      fail: (err) => {
        console.error('查询失败：', err);
      },
    });
  },

  onCitySelect() { // 点击城市输入框时调用弹出城市选择器
    this.setData({
      showCityPicker: true,
    });
  },

  onCitySelectClose() {
    this.setData({
        showCityPicker: false,
        selectedCity: "",
      }),
      console.log('是否写入选择的城市 selectedCity : ', this.data.selectedCity)
    this.FilterBeds();
  },

  onCityChange(event) {
    this.setData({
      selectedCity: event.detail.value,
      showCityPicker: false,
    });
    console.log('是否写入选择的城市 selectedCity : ', this.data.selectedCity)
    this.FilterBeds();
  },

  onUnivSelect() { // 点击城市输入框时调用弹出城市选择器
    this.setData({
      showUnivPicker: true,
    });
  },

  onUnivSelectClose() {
    this.setData({
        showUnivPicker: false,
        selectedUniv: "",
      }),
      console.log('是否写入选择的大学 selectedUniv: ', this.data.selectedUniv)
    this.FilterBeds();
  },

  onUnivChange(event) {
    this.setData({
      selectedUniv: event.detail.value,
      showUnivPicker: false,
    });
    console.log('是否写入选择的大学 selectedUniv: ', this.data.selectedUniv)
    this.FilterBeds();
  },

  onBusySelect() { // 点击城市输入框时调用弹出城市选择器
    this.setData({
      showBusyPicker: true,
    });
  },

  onBusySelectClose() {
    this.setData({
        showBusyPicker: false,
        selectedBusy: "",
      }),
      console.log('是否写入选择的状态 selectedBusy : ', this.data.selectedBusy)
    this.FilterBeds();
  },

  onBusyChange(event) {
    // const { value } = event.detail;
    // const selectedBusy = value === '占用';
    this.setData({
      showBusyPicker: false,
      selectedBusy: event.detail.value,
      // selectedBusy: selectedBusy ? true : false,
    });
    console.log('是否写入选择的状态 selectedBusy : ', this.data.selectedBusy)
    this.FilterBeds();
  },

  // 筛选床
  FilterBeds() {
    const selectedCity = this.data.selectedCity;
    const selectedUniv = this.data.selectedUniv;
    let selectedBusy;
    if (this.data.selectedBusy === '空闲') {
      selectedBusy = false;
    } else if (this.data.selectedBusy === '占用') {
      selectedBusy = true;
    } else {
      selectedBusy = "";
    }
    console.log('查询值 ', '查询 selectedCity 值: ', selectedCity, '查询 selectedBusy 值: ', selectedBusy, '查询 selectedUniv 值: ', selectedUniv)

    const filteredBeds = this.data.beds.filter((bed) => {
      const cityCondition = selectedCity ? bed.city === selectedCity : true;
      const univCondition = selectedUniv ? bed.university === selectedUniv : true;
      const busyCondition = selectedBusy ? bed.Is_busy === selectedBusy : true;

      return cityCondition && busyCondition && univCondition;
    });
    console.log('查询到的 filteredBeds 值: ', filteredBeds)

    this.setData({
      filteredBeds,
    });
  }



});