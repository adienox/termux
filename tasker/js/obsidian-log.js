import { readFile, writeFile, access, copyFile } from 'fs/promises';
import { DateTime } from 'luxon';
import minimist from 'minimist';

const dailyFolder = '/storage/emulated/0/Documents/Knowledge Garden/Cards/Temporal/Daily/';
const dailyTemplate = '/storage/emulated/0/Documents/Knowledge Garden/Extras/Templates/Temporal/Daily.md';
const tempFile = '/storage/emulated/0/Documents/Knowledge Garden/Extras/temp.md';
const sleepDataFile = '/storage/emulated/0/Documents/Knowledge Garden/DataInception/Sleep/backup.csv';

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
  
  const log = await readFile(tempFile, 'utf8');
  
  // finding the end of the # Log heading section
  const logHeading = fileContent.indexOf('# Log');
  const endOfLog = fileContent.slice(logHeading + 1).findIndex((item) => !item.startsWith("-"));
  // adding log to the end of the section
  fileContent.splice(logHeading + 1 + endOfLog, 0, `- ${log.trim()}`);

  await saveFile(fileContent);
}

const morningLog = async (file) => {
  let fileContent = file;
  const sleepIndex = fileContent.indexOf('**sleep**::')
  const wakeIndex = fileContent.indexOf('**wake**::')
  const dreamIndex = fileContent.indexOf('**dreams**::')
  const weightIndex = fileContent.indexOf('**weight**::')

  const data = await readFile(tempFile, 'utf8').then(data => data.split('<>'));

  const sleepData = await readFile(sleepDataFile, 'utf8');
  const lastLine = sleepData.trim().split('\n').slice(-1)[0];
  const fields = lastLine.split(',')

  // only using the start and stop time which is in unixtimestamp
  // needed to remove the last 3 digits to make it work properly
  const start = parseInt(fields[1].substring(0, fields[1].length - 3))
  const stop = parseInt(fields[2].substring(0, fields[2].length - 3))

  // the time in the csv is in UTC, converting it to local time zone
  const startTime = new Date(start * 1000 + (timezoneOffsetMinutes * 60 * 1000)).toISOString().substring(0, 16)
  const stopTime = new Date(stop * 1000 + (timezoneOffsetMinutes * 60 * 1000)).toISOString().substring(0, 16)

  // updating the metadata
  const sleepMetadata = `${startTime}, ${stopTime}`

  fileContent[sleepIndex] = '**sleep**:: ' + sleepMetadata;
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
