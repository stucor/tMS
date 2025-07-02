const fs = require('fs')
const { parse } = require('node-html-parser');

const wordLength = 7
//const allBookIds =  ["afcm","bcbl","bmom","doab","journey","milk","outk","sitm","ssbl","vasy","wosb"]
const allBookIds =  ["journey"]

function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

function pushPali (bookID) {
    let bookRoot =``
    try {
        const data = fs.readFileSync('../_resources/book-data/'+bookID+'/'+'pandoc.html', 'utf8')
        bookRoot = parse(data)
    } catch (err) {
        console.error(err);
    }
    let allPalis = bookRoot.querySelectorAll("span[data-custom-style='wwc-pali']")
    for (let i in allPalis) {
        //console.log(allPalis[i].innerText)
        let allPaliWords = allPalis[i].innerHTML.replaceAll('\r\n','').replaceAll('<br>',' ').split(' ')
        for (let j in allPaliWords) {
            let thisPaliWord = allPaliWords[j]
            if(['.','?',',',';',':','…','!'].indexOf(thisPaliWord.slice(-1)) > -1) {
                thisPaliWord = thisPaliWord.slice(0, -1)
            }
            if('‘' == Array.from(thisPaliWord)[0]) {
                thisPaliWord = thisPaliWord.slice(1)
            }
            if (thisPaliWord.length > wordLength) {
                paliWords.push(thisPaliWord)
            }
        }
    }
}


let paliWords = []

for (let i in allBookIds) {
    pushPali(allBookIds[i])
}

uniquePaliWords = uniq(paliWords)

let localShyphenMaster =[]
try {
    const data = fs.readFileSync('../_resources/build-data/shyphenMaster.json', 'utf8')
    localShyphenMaster = JSON.parse(data)
} catch (err) {
    console.error(err);
}

//console.log (localShyphenMaster)

for (let i in uniquePaliWords) {
    for (j in localShyphenMaster) {
        if (uniquePaliWords[i] == localShyphenMaster[j].replaceAll('-','')) {
            uniquePaliWords[i] = localShyphenMaster[j]
        }
    }

}
//console.log(uniquePaliWords.length)

let localJSON = `[\n`
for (let i in uniquePaliWords) {
    localJSON += `"${uniquePaliWords[i]}"`
    if (uniquePaliWords.length-1 == i) {
        localJSON += `\n`
    } else {
        localJSON += `, \n`
    }
    if (!uniquePaliWords[i].includes('-')) {
        console.log (`❎— 🛈 Word not yet hyphenated: ${uniquePaliWords[i]}`)
    } else {
        let wordArr = uniquePaliWords[i].split('-')
        for (let j in wordArr) {
            if (wordArr[j].length > wordLength) {
                console.log(`❎— 🛈 Pre-hyphenated word requires further hyphenation at ${wordArr[j]}: ${uniquePaliWords[i]}`)
            }
        }
    }
}
localJSON += `]`
//console.log(localJSON)

//fs.writeFileSync(('../_resources/build-data/shyphenMaster.json'), localJSON, 'utf8')












/* function uniqx(a) {
    return Array.from(new Set(a));
    } */