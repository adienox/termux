import { readFile, writeFile, access, copyFile } from 'fs/promises';
import { DateTime } from 'luxon';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

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

const extractor = async () => {
  const todayFile = dailyFolder + DateTime.now().toFormat(dailyFormat) + '.md'
  filePresent(todayFile)
  
  // reading file and splitting it into an array
  let fileContent = await readFile(todayFile, 'utf8');
  fileContent = fileContent.split('\n'); 

  const quoteIndex = fileContent.indexOf('> [!quote] Quote of the Day') + 1;
   
  const quote = fileContent[quoteIndex].replace('> ', '').trim()
  const author = fileContent[quoteIndex + 1].replace('> — <cite>' , '').replace('</cite>', '').trim()

  const content = quote + '<>' + author
  
  await writeFile(tempFile, content);
}

const generator = async () => {
  const todayFile = dailyFolder + DateTime.now().toFormat(dailyFormat) + '.md';
  await filePresent(todayFile)
  
  // reading file and splitting it into an array
  let fileContent = await readFile(todayFile, 'utf8');
  fileContent = fileContent.trim().split('\n'); 

  const lastLine = fileContent.slice(-1)[0];

  if (!lastLine.startsWith('> — <cite>')) {
    const url = "https://api.quotable.io/quotes/random?tags=technology|famous-quotes|wisdom|success|courage|creativity&limit=1"
   
    const json = await fetch(url).then(res => res.json())
    const author = json[0].author
    const quote = json[0].content

    fileContent.push(`> ${quote}`);
    fileContent.push(`> — <cite>${author}</cite>`);
    
    // joining back the array and writing the file
    fileContent = fileContent.join('\n'); 
    await writeFile(todayFile, fileContent);
  }
}

if (argv.g) {
  generator()
} else if (argv.x) {
  extractor()
}
