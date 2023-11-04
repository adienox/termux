import { readFile, writeFile, access, copyFile } from 'fs/promises';
import { DateTime } from 'luxon';
import * as chrono from 'chrono-node';


const dailyFolder = '/storage/emulated/0/Documents/Knowledge Garden/Cards/Temporal/Daily/';
const dailyTemplate = '/storage/emulated/0/Documents/Knowledge Garden/Extras/Templates/Temporal/Daily.md';
let taskFile = '/storage/emulated/0/Documents/Knowledge Garden/Atlas/Tasks.md';
const dueDelimeter = ">";
const dailyFormat = 'yyyy-MM-dd';

// function to check if a file is present and if not create it using template
const filePresent = async (file) => {
  try {
    await access(file);
  } catch (error) {
    await copyFile(dailyTemplate, file)
  }
}

// function to add log to the log section of today's daily note
const addToLog = async (log) => {
  const todayFile = dailyFolder + DateTime.now().toFormat(dailyFormat) + '.md'
  await filePresent(todayFile)
  
  // reading file and splitting it into an array
  let fileContent = await readFile(todayFile, 'utf8');
  fileContent = fileContent.split('\n'); 
  
  // finding the end of the # Log heading section
  const logHeading = fileContent.indexOf('# Log');
  const endOfLog = fileContent.slice(logHeading + 1).findIndex((item) => !item.startsWith("-"));
  // adding log to the end of the section
  fileContent.splice(logHeading + 1 + endOfLog, 0, `- ${log.trim()}`);
  
  // joining back the array and writing the file
  fileContent = fileContent.join('\n'); 
  await writeFile(todayFile, fileContent);
}

// function to add tasks to the end of tasks heading conditionally
// if scheduled date is present, adds task to the scheduled date's tasks heading
// else adds tasks to the default tasks file
const addToTasks = async (task) => {
  const {formattedTask, taskFile} = taskFormatter(task);
  await filePresent(taskFile)
  
  // reading file and splitting it into an array
  let fileContent = await readFile(taskFile, 'utf8');
  fileContent = fileContent.split('\n'); 
  
  // finding the end of the # Tasks heading section
  const tasksHeading = fileContent.indexOf('# Tasks');
  const endOfTasks = fileContent.slice(tasksHeading + 1).findIndex((item) => !item.startsWith("-"));
  // adding formatted task to the end of tasks section
  fileContent.splice(tasksHeading + endOfTasks, 0, formattedTask);
  
  // joining back the array and writing the file
  fileContent = fileContent.join('\n'); 
  await writeFile(taskFile, fileContent);
}

// function to format natural language dates of a task into obsidian-tasks format
const taskFormatter = (task) => {
  const parsedData = chrono.parse(task);

  let formattedTask = task.trim();
  if (parsedData.length != 0) {
    const dates = parsedData.map(data => {
      return {
        isoDate: data.start.date().toISOString().slice(0, 10),
        index: data.index,
        text: data.text,
        type: task[data.index - 1] == dueDelimeter || task[data.index - 2] == dueDelimeter ? "due" : "scheduled",
      }
    })

    dates.forEach(date => {
      if (date.type == "due") {
        formattedTask = formattedTask.replace(date.text, `📅 ${date.isoDate}`);
      } else if (date.type == "scheduled") {
        formattedTask = formattedTask.replace(date.text, `⏳ ${date.isoDate}`);
        taskFile = dailyFolder + date.isoDate + '.md';
      }
    })
  }

  formattedTask = formattedTask.replace("#", "#task/");
  formattedTask = formattedTask.replace("p1", "🔺");
  formattedTask = formattedTask.replace("p2", "⏫");
  formattedTask = formattedTask.replace("p3", "🔼");
  formattedTask = formattedTask.replace("p4", "🔽");
  formattedTask = formattedTask.replace("=", "🔁");
  formattedTask = formattedTask.replace("!", "- [ ]");
  formattedTask = formattedTask.replace(">", "");

  return {formattedTask, taskFile}
}

const log = process.argv.slice(2).join(' ')

if (log.startsWith("!")) {
  addToTasks(log);
} else {
  addToLog(log);
}
