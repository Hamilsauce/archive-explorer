import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { download,help, date, array, utils, text } = ham;
help('', 'text')
const sources = {
  style: {
    url: './css/style.css',
    content: null
  },
  fsStyle: {
    url: './css/fs-style.css',
    content: null
  }
}

const fetchFile = async (url) => {
  return await (await fetch(url)).text();
}
const removeComments = (text) => {
  var rx = new RegExp("/\*[\\d\\D]*?\/\*/", "g");
  return text.replace(rx, "");

}


const parseFile = (textContent = '') => textContent.trim()
  .replace(/}/g, '}~~')
  .split('~~')
  .filter(_ => _)
  .reduce((dict, curr, i) => {
    curr = curr.trim()

    const name = curr.slice(0, curr.indexOf('{', 0))
      .replace(/,/g, '_')

    const props = text.textBetween(curr.trim(), '{', '}').trim()
      .split(';')
      .filter(_ => !_.includes('*'))
      .reduce((body, rule, i) => {
        if (!rule) return body
        const [key, value] = rule.split(':')
        return { ...body, [key.trim()]: `${value.trim()}` }
      }, {});

    return { ...dict, [name]: { ...props }, length: ++dict.length }
  }, { length: 0 });


const diff = (style1, style2) => {
  const rulesNotShared = Object.entries(style1)
    .reduce((diff, [name, val], i) => {
      if (style2[name]) {

        return { ...diff, [name]: val }
      } else return diff
    }, {});
  return rulesNotShared
}




sources.style.content = await fetchFile(sources.style.url)
const styleRaw = await fetchFile(sources.style.url)
const fsStyleRaw = await fetchFile(sources.fsStyle.url)
const styleObj = parseFile(styleRaw)
const fsStyleObj = parseFile(styleRaw)

console.log('fsStyleRaw.length', fsStyleRaw.length)
console.log('styleRaw.length', styleRaw.length)

const noComments = removeComments(styleRaw)

// console.log('styleRaw', styleRaw)
// console.log('noComments', noComments)

// const tbt = text.textBetween(styleRaw, '{', '}')
// console.log('styleObj', styleObj)
// console.log('styleObj', fsStyleObj)
const unsharedRules = diff(styleObj, fsStyleObj)
const merge = { ...styleObj, ...fsStyleObj }
console.log('merge', merge)
download('mergeztyle.css',JSON.stringify(merge,null, 2))
// console.log('tbt', tbt)
// console.log('sources.style.content', sources.style.content)