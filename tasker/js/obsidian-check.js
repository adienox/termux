import { readFile, writeFile, access, copyFile } from 'fs/promises';
import { TodoistApi } from "@doist/todoist-api-typescript";
import { DateTime } from 'luxon';
import 'dotenv/config';
import minimist from 'minimist';

// Setting up variables
const dailyFolder = '/storage/emulated/0/Documents/Knowledge Garden/Cards/Temporal/Daily/';
const dailyTemplate = '/storage/emulated/0/Documents/Knowledge Garden/Extras/Templates/Temporal/Daily.md';
let tempFile = '/storage/emulated/0/Documents/Knowledge Garden/Extras/temp.md';

const api = new TodoistApi(process.env.TODOIST_API);
const today = DateTime.now().toFormat('yyyy-MM-dd');
const todayFile = dailyFolder + today + '.md';
const argv = minimist(process.argv.slice(2));

// function to check if a file is present and if not create it using template
const filePresent = async (file) => {
  try {
    await access(file);
  } catch (error) {
    await copyFile(dailyTemplate, file)
  }
}

const eveningLogCheck = async () => {
  filePresent(todayFile)
  
  // reading file and splitting it into an array
  let fileContent = await readFile(todayFile, 'utf8');
  fileContent = fileContent.split('\n'); 

  const amazingIndex = fileContent.indexOf('##### I am amazing because...') + 1;
   
  const filled = fileContent[amazingIndex].includes("I'm amazing because")

  await writeFile(tempFile, filled.toString());
}

const workoutDoneCheck = async () => {
  const tasks = api.getTasks()
      .then((tasks) => tasks)
      .catch((error) => console.log(error))
  
  await filePresent(todayFile)
  
  // reading file and splitting it into an array
  let fileContent = await readFile(todayFile, 'utf8');
  fileContent = fileContent.split('\n'); 

  const exerciseIndex = fileContent.indexOf('**Exercise**:: false');

  let status = false;
  tasks.map(task => {
    if (task.content.includes("Workout")) {
      if (task.due.date == today) {
        status = false;
      } else {
        status = true;
      };
    };
  })

  fileContent[exerciseIndex] = '**Exercise**:: ' + status.toString();

  // joining back the array and writing the file
  fileContent = fileContent.join('\n'); 
  await writeFile(todayFile, fileContent);
}

if (argv.e) {
  eveningLogCheck()
} else if (argv.w) {
  workoutDoneCheck()
}
