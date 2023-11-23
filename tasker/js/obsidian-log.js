import { readFile, writeFile, access, copyFile } from 'fs/promises';
import { DateTime } from 'luxon';
import minimist from 'minimist';

const dailyFolder = '/storage/emulated/0/Documents/Knowledge Garden/Cards/Temporal/Daily/';
const dailyTemplate = '/storage/emulated/0/Documents/Knowledge Garden/Extras/Templates/Temporal/Daily.md';
const tempFile = '/storage/emulated/0/Documents/Knowledge Garden/Extras/temp.md';

const timezoneOffsetMinutes = 345;
const argv = minimist(process.argv.slice(2));
const todayFile = dailyFolder + DateTime.now().toFormat('yyyy-MM-dd') + '.md';

// function to check if a file is present and if not create it using template
const filePresent = async (file) => {
  try {
    await access(file);
  } catch (error) {
    await copyFile(dailyTemplate, file)
  }
}

const saveFile = async (file) => {
  const fileContent = file.join('\n'); 
  await writeFile(todayFile, fileContent);
}

// function to add log to the log section of today's daily note
const addToLog = async (file) => {
  let fileContent = file;
  
  // finding the end of the # Log heading section
  const logHeading = fileContent.indexOf('# Log');
  const endOfLog = fileContent.slice(logHeading + 1).findIndex((item) => !item.trim().startsWith("-"));
  
  const log = await readFile(tempFile, 'utf8');
  
  // adding log to the end of the section
  if (log.startsWith('p')) {
    let data = log.split('<>');
    data[0] = data[0].replace('p', '[*] ');
    fileContent.splice(logHeading + 1 + endOfLog, 0, `- ${data[0].trim()}\n\t- ${data[1]}`);
  } else {
    fileContent.splice(logHeading + 1 + endOfLog, 0, `- ${log.trim()}`);
  }

  await saveFile(fileContent);
}

const morningLog = async (file) => {
  let fileContent = file;
  const wakeIndex = fileContent.indexOf('**wake**::')
  const dreamIndex = fileContent.indexOf('**dreams**::')
  const weightIndex = fileContent.indexOf('**weight**::')

  const data = await readFile(tempFile, 'utf8').then(data => data.split('<>'));

  // updating the metadata
  fileContent[wakeIndex] = '**wake**:: ' + data[0];
  fileContent[dreamIndex] = '**dreams**:: ' + data[1];
  fileContent[weightIndex] = '**weight**:: ' + data[2];

  await saveFile(fileContent);
}

await filePresent(todayFile);
const file = await readFile(todayFile, 'utf8').then(data => data.trim()).then(data => data.split('\n'));

if (argv.l) {
  addToLog(file);
} else if (argv.m) {
  morningLog(file);
}
