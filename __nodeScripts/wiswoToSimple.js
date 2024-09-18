const path = require('path')
const fs = require('fs')
const { exec } = require('child_process'); 
const { parse } = require('node-html-parser');

let bookID = process.argv.slice(2)[0];

let bookRoot = ``;
try {
    const data = fs.readFileSync('../'+bookID+'/'+'index.html', 'utf8');
    bookRoot = parse(data);
} catch (err) {
    console.error(err);
}

//Get Title and author
let newTitle = ``
let newSubtitle =``
let newAuthor =``
let allTitlePage = bookRoot.querySelectorAll('.titlepage')
for (i in allTitlePage) {
    if (i == 0) {
        newTitle = allTitlePage[i].text
    } else 
    if (i == 1)  {
        if (allTitlePage.length > 1) {
            newSubtitle = allTitlePage[i].text
        } else {
            newAuthor = allTitlePage[i].text
        }
    } else 
    if (i == 2) {
        newAuthor = allTitlePage[i].text
    }
}
//HTML
let newHeaderHTML = `<header id="title-block-header">\n<h1 class="title">${newTitle}</h1>\n<p class="subtitle">${newSubtitle}</p>\n<p class="author">${newAuthor}</p>\n</header>\n`



//Get TOC
let allLis = bookRoot.getElementsByTagName ('li')
let newTOCHTML = `<nav id="TOC" role="doc-toc">\n<ul>\n`
for (i in allLis ) {
    if (allLis[i].classList.contains('noshow')) {
        allLis[i].remove()
    } else {
        if (allLis[i].id.substring(0,3) == 'TOC') {
            let tempTarget = allLis[i].id.substring(3, allLis[i].id.length)
            let tempText = allLis[i].text
            newTOCHTML += `<li><a href="#TOCTarget${tempTarget}" id="TOC${tempTarget}">${tempText}</a></li>\n`
        }
    }
}
//HTML
newTOCHTML += `</ul>\n</nav>`



//Get Notes
let allNotes = bookRoot.querySelectorAll('.booknote')
let newNotesHTML = `<section id="footnotes" class="footnotes footnotes-end-of-document" role="doc-endnotes">\n<hr />\n<ol>\n`
for (i in allNotes) {
    let tempInnerHTML = allNotes[i].innerHTML
    let tempNoteNumber = allNotes[i].getAttribute('data-note')
    newNotesHTML += `<li id="fn${tempNoteNumber}"><p>${tempInnerHTML}<a href="#fnref${tempNoteNumber}" class="footnote-back" role="doc-backlink">↩︎</a></p></li>\n`
}  
//HTML
newNotesHTML += `</ol>\n</section>`



let allSups = bookRoot.querySelectorAll('sup')
 for (i in allSups) {
    let tempText = allSups[i].text
    allSups[i].replaceWith(`<a href="#fn${tempText}" class="footnote-ref" id="fnref${tempText}" role="doc-noteref"><sup>${tempText}</sup></a>`)
}  



let html = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="" xml:lang="">
<head>
  <meta charset="utf-8" />
  <meta name="generator" content="pandoc" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
  <meta name="author" content="${newAuthor}" />
  <title>${newTitle}</title>
</head>
<body>`

html += newHeaderHTML
html += newTOCHTML

html += bookRoot.querySelector('#thebook').innerHTML

html += newNotesHTML
html += `\n</body>\n</html>`

fs.writeFileSync(('../_resources/book-data/'+bookID+'/'+'simple.html'), html, 'utf8')







/* let allSpans = bookRoot.querySelectorAll('span')
for (i in allSpans) {
    if (allSpans[i].classList.contains('sesame')) {
        if (allSpans[i].classList.contains('ref')) {
        } else {
            console.log ('XXX')
        }

    }
} */








/* let allDivs = bookRoot.querySelectorAll('div')
for (i in allDivs) {
    if ((allDivs[i].id == 'topbar') || (allDivs[i].id == 'SearchBar') || (allDivs[i].id == 'tocbtn2')) {
        allDivs[i].remove()
    }
}  
 */


/* let html2 = bookRoot.querySelectorAll('p')
for (i in html2) {
    if (i < 2000) {
        console.log (html2[i].outerHTML)
    } 
} */



/* 
    let allDivs = bookRoot.querySelectorAll('div')
    for (i in allDivs) {
        if (allDivs[i].id == 'thebook') {
            console.log(allDivs[i].innerHTML)
        }
    }   */

       // console.log(bookRoot.querySelector('#thebook').innerHTML)

