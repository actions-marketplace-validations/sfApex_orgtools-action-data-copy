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

    let task;
    if (startDataCopyResult.data && startDataCopyResult.data.length > 0) {
      task = startDataCopyResult.data[0];
      core.info(`Task Id: ${task.id}`);
      core.info(`Description: ${task.taskdescription}`);
      core.info(`State: ${task.taskstate}`);      
    }
    
    core.endGroup()

    core.startGroup('Detailed Data Copy Progress');
    while(task && task.taskstate === 'In Progress') {
      let taskStateResult = await instance.get(`/task-status/${task.id}`);
      task = taskStateResult.data;

      if(task) {
        let completionPercentage = ((task.completedcount + task.errorcount) / task.totalcount).toString();

        let status = `Progress: ${completionPercentage.padStart(5)}% (Completed: ${task.completedcount.toLocaleString('en')} / Failed: ${task.errorcount.toLocaleString('en')} / Total: ${task.totalcount.toLocaleString('en')})`;
        core.info(status);
      }
    }
    core.endGroup()


    core.setOutput('response', task.id);

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
