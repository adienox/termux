import getTitleAtUrl from 'get-title-at-url';

const url = process.argv.slice(2)[0];

const {title} = await getTitleAtUrl(url);

console.log(title)
