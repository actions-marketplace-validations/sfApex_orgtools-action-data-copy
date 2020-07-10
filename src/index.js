const core = require("@actions/core");
const axios = require("axios");

const headers = {
  'Content-Type': 'application/json',
  'authorization': core.getInput('apiToken')
};

let payload = {
  projectname: core.getInput('projectname') || '',
  datatemplatename: core.getInput('datatemplatename') || '',
  maxIterations: parseInt(core.getInput('maxIterations') || 3, 10),
  notificationEmailAddress: core.getInput('notificationEmailAddress') || '',
  disableValidations: (core.getInput('disableValidations') || 'true') === 'true',
  replaceInactiveUsers: (core.getInput('replaceInactiveUsers') || 'true') === 'true',
  useDefaultRecordType: (core.getInput('useDefaultRecordType') || 'true') === 'true'
};

(async () => {
  try {

    let instance = axios.create({
      baseURL: 'https://orgtools-rest-api-qa.herokuapp.com/',
      timeout: 5000,
      headers
    });

    core.startGroup('Starting Data Copy');
    let startDataCopyResult = await instance.post('/start-data-copy', payload);
    core.info(`Started Data Copy.... ${startDataCopyResult.statusText}`);

    let taskId;
    if (startDataCopyResult.data && startDataCopyResult.data.length > 0) {
      core.info(startDataCopyResult.data);
      // taskId = startDataCopyResult.data[0].id;
      // core.info(`Task Id: ${taskId}`);
      // core.info(`Description: ${startDataCopyResult[0].taskdescription}`);
      // core.info(`State: ${startDataCopyResult[0].taskstate}`);      
    }
    
    core.endGroup()

    core.setOutput('response', taskId)

  } catch (error) {
    // if (error.toJSON) {
    //   core.setOutput(error.toJSON());
    // }

    if (error.response) {
      core.setFailed(JSON.stringify({ code: error.response.code, message: error.response.data }))
    } else if (error.request) {
      core.setFailed(JSON.stringify({ error: "no response received" }));
    } else {
      core.setFailed(error.message);
    }
  }
})()
