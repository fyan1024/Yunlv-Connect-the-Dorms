const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
  const { title, value, name } = event; // 获取传入的参数
  // 构造查询条件
  const condition = {};
  condition[title] = value;

  // 返回数据库查询结果
  return await db.collection(name).where(condition).get();
};