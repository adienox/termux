import { readFile, writeFile, access, copyFile } from 'fs/promises';
import { DateTime } from 'luxon';

// Setting up variables
const dailyFolder = '/storage/emulated/0/Documents/Knowledge Garden/Cards/Temporal/Daily/';
const dailyTemplate = '/storage/emulated/0/Documents/Knowledge Garden/Extras/Templates/Temporal/Daily.md';
let tempFile = '/storage/emulated/0/Documents/Knowledge Garden/Extras/temp.md';
const dailyFormat = "yyyy-MM-dd";

// function to check if a file is present and if not create it using template
const filePresent = async (file) => {
  try {
    await access(file);
  } catch (error) {
    await copyFile(dailyTemplate, file)
  }
}

const eveningLogCheck = async () => {
  const todayFile = dailyFolder + DateTime.now().toFormat(dailyFormat) + '.md'
  filePresent(todayFile)
  
  // reading file and splitting it into an array
  let fileContent = await readFile(todayFile, 'utf8');
  fileContent = fileContent.split('\n'); 

  const amazingIndex = fileContent.indexOf('##### I am amazing because...') + 1;
   
  const filled = fileContent[amazingIndex].includes("I'm amazing because")

  await writeFile(tempFile, filled.toString());
}

eveningLogCheck()
