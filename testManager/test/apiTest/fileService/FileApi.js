/*eslint-disable */
let filefunc = require("../../apiFunction/fileService/FileFunction");
const path=require('path')
describe('File Api', function () {
  it('[POST] 上传文件', function () {
    let query = { bucket_name: 'test', attachmentLinkId: 313, 'attachmentType': 'CYCLE_CASE' };
    let formData = { file: path.resolve(__dirname,'../../../static/fileUploadTestFile.txt' )};
    return filefunc.uploadFile(query, formData);
  });

  // it('[DELETE] 删除文件', function () {
  //     let query = {bucket_name: uuidv1().substring(3, 63), url: uuidv1().substring(0, 45)};
  //     return filefunc.deleteFile(query);
  // });
});
