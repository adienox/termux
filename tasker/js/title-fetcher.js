import { readFile, writeFile } from 'fs/promises';

const tempFile = '/storage/emulated/0/Documents/Knowledge Garden/Extras/temp.md';

const parseTitle = (body) => {
  let match = body.match(/<title>([^<]*)<\/title>/) // regular expression to parse contents of the <title> tag
  if (!match || typeof match[1] !== 'string')
    throw new Error('Unable to parse the title tag')
  return match[1]
}

(async () => {
  const url = await readFile(tempFile, 'utf8');
  
  const title = await fetch(url)
    .then(res => res.text()) // parse response's body as text
    .then(body => parseTitle(body)) // extract <title> from body
    .then(title => title.trim())

  await writeFile(tempFile, title.toString());
})();
