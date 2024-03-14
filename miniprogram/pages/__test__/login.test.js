const { submit } = require('./utils'); // Adjust the path as necessary

// Assuming the rest of your global wx and db mock setup remains the same...

describe('Login Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks to their initial state before each test
  
    // Mock global `wx` object's methods that are used within your submit function
    global.wx = {
      navigateTo: jest.fn(),
      showToast: jest.fn(),
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
      reLaunch: jest.fn(),
      getStorageSync: jest.fn(),
      setStorageSync: jest.fn(),
      cloud: {
        database: jest.fn(() => ({
          collection: jest.fn().mockReturnThis(), // Supports chaining like db.collection().where().get()
          where: jest.fn().mockReturnThis(),
          get: jest.fn(), // Initially, do not define implementation to allow custom behavior per test
          // Add other database methods here as needed
        })),
        // Include other `wx.cloud` services you're using, such as `callFunction`, if necessary
      },
      // Mock any other wx methods you utilize
    };
  
    // Default mock implementations or setups for database queries can be defined here if consistent across most tests
    // For example, a successful get operation:
    // global.wx.cloud.database().get.mockResolvedValue({ data: [{ /* default mock data */ }] });
  });
  


  test('Login with incorrect credentials', async () => {
    const wxMock = global.wx;
    const dbMock = wx.cloud.database();

    dbMock.get.mockResolvedValueOnce({ data: [] }); // Simulate no matching user found

    await expect(submit({ wx: wxMock, db: dbMock, phone: 'wrong', passWord: '123' }))
      .rejects
      .toThrow('账号不存在或者密码错误'); // Assuming submit rejects with this error message

    expect(wxMock.showToast).toHaveBeenCalledWith({
      title: '账号不存在或者密码错误',
      icon: 'none'
    });
  });
});
