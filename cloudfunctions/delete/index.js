const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 删除数据库集合中的数据云函数入口函数
exports.main = async (event, context) => {
  const { id, name } = event; // 获取传入的参数，id为要删除的数据的_id，name为集合名称
  try {
    // 根据_id删除数据
    const res = await db.collection(name).doc(id).remove();
    return res;
  } catch (error) {
    return error;
  }
};