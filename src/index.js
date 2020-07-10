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
  notificationEmailAddress: core.getInput('notificationEmailAddress') || null,
  disableValidations: (core.getInput('disableValidations') || 'true') === 'true',
  replaceInactiveUsers: (core.getInput('replaceInactiveUsers') || 'true') === 'true',
  useDefaultRecordType: (core.getInput('useDefaultRecordType') || 'true') === 'true'
};

(async () => {
  try {

    let instance = axios.create({
      baseURL: 'https://orgtools-rest-api-prod.herokuapp.com/',
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

    core.startGroup('Data Copy Progress');
    while(task && task.taskstate === 'In Progress') {
      let taskStateResult = await instance.get(`/task-status/${task.id}`);
      task = taskStateResult.data;

      if(task && task.taskstate === 'In Progress') {
        let completionPercentage = Math.floor(((task.completedcount + task.errorcount) / task.totalcount) * 100.0).toString();

        let status = `Progress: ${completionPercentage.padStart(5)}% (Completed: ${task.completedcount.toLocaleString('en')} / Failed: ${task.errorcount.toLocaleString('en')} / Total: ${task.totalcount.toLocaleString('en')})`;
        core.info(status);

        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    core.endGroup()

    let createddate = new Date(task.createddate);
    let completeddate = new Date(task.completeddate);

    let diffMinutes = Math.abs((((createddate.getTime() - completeddate.getTime()) / 1000) / 60).toFixed(2));

    core.info(`Data copy ${task.taskstate.toLowerCase()} with ${task.completedcount.toLocaleString('en')} successful${task.errorcount > 0 ? ` and ${task.errorcount.toLocaleString('en')} failed` : ''} records in ${diffMinutes} minutes.`);

    core.setOutput('taskId', task.id);

  } catch (error) {
    if (error.toJSON) {
      core.setOutput(error.toJSON());
    }

    if (error.response) {
      core.setFailed(JSON.stringify({ code: error.response.code, message: error.response.data }))
    } else if (error.request) {
      core.setFailed(JSON.stringify({ error: "no response received" }));
    } else {
      core.setFailed(error.message);
    }
  }
})()
