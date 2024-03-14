const noop = () => {};
const isFn = fn => typeof fn === 'function';
let wId = 0;

global.wx = {
  navigateTo: jest.fn(),
  cloud: {
    database: jest.fn(() => ({
      // 模拟你需要使用的数据库操作，例如 collection
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({/* 模拟数据 */}),
      add: jest.fn().mockResolvedValue({/* 模拟数据 */}),
      // 根据需要添加更多方法
    })),
    // 根据需要添加其他 cloud 方法，例如 init, callFunction 等
  },
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn(),
  request: jest.fn(),
  getStorageSync: jest.fn(),
  showShareMenu: jest.fn(),
};

global.Page = ({ data, ...rest }) => {
  const page = {
    data,
    setData: jest.fn(function (newData, cb) {
      this.data = {
        ...this.data,
        ...newData,
      };
      if (isFn(cb)) {
        cb();
      }
    }),
    onLoad: noop,
    onReady: noop,
    onUnload: noop, // 注意这里应该是onUnload，而不是onUnLoad
    __wxWebviewId__: wId++,
    ...rest,
  };

  global.wxPageInstance = page;
  return page;
  
};

module.exports = {
  noop,
  isFn,
  // 如果需要导出其他内容，继续在这里添加
};
