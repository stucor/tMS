//const path = require('path')
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

//Get Info

let builtInfoData = JSON.parse(fs.readFileSync(`../_resources/book-data/${bookID}/info.json`, 'utf8'))

// Build Copywrite
let copyrightHTML = 
`\n<section class='copyright'>
<h1 style = 'display:none' title='Copyright' class='chapter'></h1>
`
/* let copyrightHTML = 
`\n<section class='copyright'>
<h1 style='margin:0; font-size: 0.1em; color: rgba(255, 255, 255, 0);' class='chapter'>Copyright</h1>
`
 */

for (i in builtInfoData.Copyright) {
    if (!(i == builtInfoData.Copyright.length-1)) {
        copyrightHTML += `<p>${builtInfoData.Copyright[i].replaceAll('**','')}</p>\n`
    }
}
copyrightHTML += `
<p>This electronic edition published by Wisdom & Wonders Books</p>
<p>Go to <a href='https://wiswo.org/books'>wiswo.org/books</a> for more publications.</p>`
copyrightHTML += builtInfoData.CCLicense
/* copyrightHTML += `<p style = 'text-align:center; margin-top: 3em'>The gift of the Dhamma excels all gifts;<br>
the taste of the Dhamma excels all tastes;<br>
delight in the Dhamma excels all delights.<br>
The eradication of craving overcomes all suffering.</p>
<p style = text-align:'right'>— The Buddha,<br>Dhammapada 354</p>` */
copyrightHTML += `</section>\n`


// Build Author Info

let authorsBio = builtInfoData.AuthorsData
let authorImgSrc = ``
let authorShortBio = `<p>`
for (i in authorsBio) {
    authorImgSrc = authorsBio[i].InfoImage
    for (k in authorsBio[i].ShortBio)  {
        authorShortBio += `${authorsBio[i].ShortBio[k]}`
    }
    authorShortBio += `</p>`
}
let authorBioHTML = `<section> <h1 class= 'chapter'>About the Author</h1><p style='text-align:center'><img src= '../../${authorImgSrc}'></p>${authorShortBio}</section>`


//Build Title Page
let newTitle = builtInfoData.BookTitle
let newSubtitle = builtInfoData.BookSubtitle
let newAuthor = builtInfoData.Authors

let newTitlePageHTML = `<div class="titlepage title">${newTitle}</div>\n<div class="titlepage subtitle"><em>${newSubtitle}</em></div>\n<div class="titlepage author">${newAuthor}</div>\n`

let allTitlePage = bookRoot.querySelectorAll('.titlepage')
    for (i in allTitlePage) {
        if (i==0) {
            newTitlePageHTML = `<h1 id="${allTitlePage[i].id}" style='display: none' title = 'Title Page' class='chapter'></h1>\n` + newTitlePageHTML
        }
        if (allTitlePage[i].tagName == 'DIV') {
            newTitlePageHTML += `${allTitlePage[i].outerHTML}\n`
        }
        if (i == allTitlePage.length-1) {
            allTitlePage[i].insertAdjacentHTML('afterend', `${newTitlePageHTML}\n<div class = 'logo-block'>\n<div class='logo'><img src = '../../../_resources/images/icons/logo-enso-large.png'></div>\n<div class=logo-text>Wisdom & Wonders<br>Books<br><a href='https://wiswo.org/books'>www.wiswo.org/books</a></div>\n</div>`)
        }
        allTitlePage[i].remove()
    }

//newTitlePageHTML += `<div class='logo'><img src = '../../../_resources/images/icons/logo-enso-large.png'><div>Wisdom & Wonders<br>Books</div></div>`





//HTML
let newHeaderHTML = `<header id="title-block-header">\n<h1 class="title">${newTitle}</h1>\n<p class="subtitle">${newSubtitle}</p>\n<p class="author">${newAuthor}</p>\n</header>\n`

//Get TOC
let allLis = bookRoot.getElementsByTagName ('li')
let newTOCHTML = `<h1 style='margin-bottom:0' class='chapter'>Contents</h1><nav id="TOC" role="doc-toc">\n<ul>\n`
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
//<span style="page-break-after: always" />


//strips sesame functionality
let allSesames = bookRoot.querySelectorAll('.sesame')
for (i in allSesames) {
    let tempText = allSesames[i].text
    allSesames[i].innerHTML = `${tempText}`
}


// make suttacentral (sujato) links explicit
function suttaCentralIt (suttaReference) {
    let newHTML = ''
     let [head,tail] = suttaReference.replace(/\s+/g, '').toLowerCase().split('–')[0].split(',')[0].split(':')
      if (tail) {
         tail = '#' + tail
         newHTML = `<a class="extlink tipref" href='https://suttacentral.net/${head}/en/sujato${tail}'>${allSCLinktexts[i].text}<a>`
     } else {
         newHTML = `<a class="extlink tipref" href='https://suttacentral.net/${head}/en/sujato'>${allSCLinktexts[i].text}<a>`
     }
      return newHTML
 }
 let allSCLinktexts = bookRoot.querySelectorAll('.sclinktext')
 for (i in allSCLinktexts) {
     allSCLinktexts[i].replaceWith(suttaCentralIt(allSCLinktexts[i].text))
 }

// make other anchors explicit
let allAnchors = bookRoot.querySelectorAll('a')
for (i in allAnchors) {
    if (allAnchors[i].classList.contains('library')) {
        let linkBookShortcode = allAnchors[i].getAttribute('href').slice(3)
        allAnchors[i].setAttribute('href', `https://wiswo.org/books/${linkBookShortcode}`)
        allAnchors[i].innerHTML = ` (wiswo.org/books/${linkBookShortcode})`
    }
}


//Get Notes
let allNotes = bookRoot.querySelectorAll('.booknote')
let newNotesHTML = `<section id="footnotes" class="footnotes footnotes-end-of-document" role="doc-endnotes">\n<h1 class='chapter' >Endnotes</h1>\n`
for (i in allNotes) {
    let tempInnerHTML = allNotes[i].innerHTML
    let tempNoteNumber = allNotes[i].getAttribute('data-note')
    newNotesHTML += `<div id="fn${tempNoteNumber}"><a href="#fnref${tempNoteNumber}" class="footnote-back" role="doc-backlink"><sup>${tempNoteNumber}</sup></a>&#x2005;${tempInnerHTML}</div>\n`
}  
//HTML
newNotesHTML += `\n</section>`

// Reformat sups
let allSups = bookRoot.querySelectorAll('sup')
 for (i in allSups) {
    let tempText = allSups[i].text
    allSups[i].replaceWith(`<a href="#fn${tempText}" class="footnote-ref" id="fnref${tempText}" role="doc-noteref"><sup>${tempText}</sup></a>`)
}  

//Remove end-of-book bits
let eobDiv = bookRoot.querySelectorAll('.eob')
eobDiv[0].remove()

let terminator = bookRoot.querySelector('#TOCTarget999999999')
terminator.remove()


let allNoShows = bookRoot.querySelectorAll('.noshow')
for (i in allNoShows) {
    if (allNoShows[i].tagName == 'CAPTION') {
        allNoShows[i].remove()
    }
}

let allChapterNumbers = bookRoot.querySelectorAll('.chapnum')
let allEpigramImgs =  bookRoot.querySelectorAll('.epigram-img')

for (i in allChapterNumbers) {
    if (allEpigramImgs[0]) {
        tempEpigramImgHTML = allEpigramImgs[i].innerHTML
        allChapterNumbers[i].innerHTML = tempEpigramImgHTML
        allChapterNumbers[i].classList.remove('chapnum')
        allChapterNumbers[i].classList.add('epigram-img')
        allEpigramImgs[i].remove();
    }
}



let messages = bookRoot.querySelectorAll('.special-message')
for (i in messages) {
    messages[i].remove()
}

//Change the bibliography and other references to divs and add ids
let allDls = bookRoot.querySelectorAll('.references')
for (i in allDls) {
    tempRefInner = allDls[i].innerHTML
    refRoot = parse(tempRefInner)
    let allDts = refRoot.querySelectorAll('dt')
    let allDds = refRoot.querySelectorAll('dd')
    for (j in allDts) {
        let tempDt = allDts[j].text
        allDts[j].remove();
        if (tempDt) {
            allDds[j].setAttribute('id', `${tempDt}`)
        }
        allDds[j].tagName = 'div';
    }

    allDls[i].innerHTML = refRoot.innerHTML;
    allDls[i].tagName = 'div'

}

let allh1s = bookRoot.querySelectorAll('h1')
for (i in allh1s) {
    if (allh1s[i].classList.contains('engrave'))  {
        allh1s[i].remove()
    } else 
    if (allh1s[i].classList.contains('noshow')) {
        allh1s[i].remove()
    } else {
        allh1s[i].classList.add ('chapter');
        allh1s[i].innerHTML = allh1s[i].innerHTML.replace('<br>', ' <br>')
    }
}




// Now build the HTML
let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<meta name="author" content="${newAuthor}" />

<title>${newTitle}</title>
</head>
<body>`

html += bookRoot.querySelector('#thebook').innerHTML
html += newNotesHTML
html += copyrightHTML
html += authorBioHTML
html += `\n</body>\n</html>`

fs.writeFileSync((`../_resources/book-data/${bookID}/${bookID}.html`), html, 'utf8')
exec(`ebook-convert ../_resources/book-data/${bookID}/${bookID}.html ../_resources/book-data/${bookID}/${bookID}.azw3 --page-breaks-before "/" --embed-all-fonts --extra-css ../_resources/css/epubJ.css --cover ../_resources/book-data/${bookID}/FrontLarge.jpg --allow-local-files-outside-root --language en`)
exec(`ebook-convert ../_resources/book-data/${bookID}/${bookID}.html ../_resources/book-data/${bookID}/${bookID}.epub --page-breaks-before "/" --embed-all-fonts --extra-css ../_resources/css/epubJ.css --cover ../_resources/book-data/${bookID}/FrontLarge.jpg --preserve-cover-aspect-ratio --allow-local-files-outside-root --language en`)

