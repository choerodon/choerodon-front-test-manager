/*eslint-disable */
import filefunc from "../../apiFunction/fileService/FileFunction";
import path from 'path';

let uploaded = {}

describe('File Api', function () {
  
  it('[POST] 上传附件', (done) => {
    
    let query = { bucket_name: 'test', attachmentLinkId: 1636, 'attachmentType': 'CYCLE_CASE' };
    let formData = { file: path.resolve(__dirname, '../../../static/fileUploadTestFile.txt') };
    filefunc.uploadFile(query, formData).then(data => {
      uploaded = data[0];      
      done();
    });

  });

  it('[DELETE] 删除附件', function () {
    let id = uploaded.id;
    return filefunc.deleteFile(id);
  });
});
