
import ServiceManager from '../services/SvcManager'
import express from 'express'
import path from 'path'

import IndoorGML_Core_1_0_3_Module_Factory from '../utils/IndoorGML_Core_1_0_3'
import BGJsonix from 'jsonix'

module.exports = function() {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const router = express.Router()

  const uploadSvc = ServiceManager.getService(
      'UploadSvc')
  /////////////////////////////////////////////////////////////////////////////
  // POST /igml/:filename
  // Post IndoorGML file
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/:filename',
    uploadSvc.uploader.single('file'),
    async(req, res) => {

    try {
      console.log("got it!");
      if (!req.file)
          return res.status(400).json('No files were uploaded.');

      const file = req.file

      var IndoorGML_Core_1_0_3 = IndoorGML_Core_1_0_3_Module_Factory().IndoorGML_Core_1_0_3;
      var mappings = [IndoorGML_Core_1_0_3];
      var context = new BGJsonix.Jsonix.Context(mappings);
      var unmarshaller = context.createUnmarshaller();

      console.log(file.path);

      var resume = unmarshaller.unmarshalFile(file.path, function(result) {
        console.log("1.0.3 >> converting complete");

        var responseData = JSON.stringify(result, null, null);
        res.json(responseData);

        console.log("1.0.3 >> send json");
      });

    } catch (error) {
      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  return router
}
