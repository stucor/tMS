//const path = require('path')
const fs = require('fs')
const { exec } = require('child_process'); 
const { parse } = require('node-html-parser');
const { json } = require('stream/consumers');

let bookID = process.argv.slice(2)[0];

// let metaData = require(`../_resources/book-data/${bookID}/meta.json`)

let sesameRefArr = require(`../_resources/book-data/${bookID}/sesameref.json`) 

let indexRoot = ``;
try {
    const data = fs.readFileSync('../'+bookID+'/'+'index.html', 'utf8');
    indexRoot = parse(data);
} catch (err) {
    console.error(err);
}
let bookRoot = parse(indexRoot.querySelector('#thebook').innerHTML)

function suttaCentralIt (suttaReference) {
    let newTEX = ''
     let [head,tail] = suttaReference.replace(/\s+/g, '').toLowerCase().split('–')[0].split(',')[0].split(':')
      if (tail) {
         tail = '#' + tail
         newTEX = `\\href{https://suttacentral.net/${head}/en/sujato\\${tail}}{${suttaReference}}`
     } else {
         newTEX = `\\href{https://suttacentral.net/${head}/en/sujato}{${suttaReference}}`
     }
      return newTEX
 }

function processInlines (StrHtml) {
    let localRoot = parse(StrHtml)
    let allSpansArr = localRoot.querySelectorAll('span')
    for (let i in allSpansArr) {
        if ((allSpansArr[i].getAttribute('lang') == 'pi') ) {
            let tempText = allSpansArr[i].text
            allSpansArr[i].replaceWith(`\\textit{${tempText}}`)
        } else 
        if ((allSpansArr[i].getAttribute('lang') == 'sa') ) {
            let tempText = allSpansArr[i].text
            allSpansArr[i].replaceWith(`\\textit{${tempText}}`)
        } else 
        if ((allSpansArr[i].classList.contains('sesame')) && (!allSpansArr[i].classList.contains('ref'))) {
            let tempText = allSpansArr[i].text.replaceAll(`&`,`&amp;`)
            allSpansArr[i].replaceWith(`${tempText}`)
        } else
        if ((allSpansArr[i].classList.contains('sesame')) && (allSpansArr[i].classList.contains('ref'))) {
            let tempText = allSpansArr[i].text.replaceAll(`&`,`&amp;`)
            let sesamerefText =``
            for (let i in sesameRefArr) {
                if (tempText == sesameRefArr[i].sesame) {
                    tempText = `${sesameRefArr[i].biblio}`
                    sesamerefText = sesameRefArr[i].sesame
                }
            }
            if (sesamerefText) {
                allSpansArr[i].replaceWith(`${sesamerefText} (\\cite{${tempText}})`)
            } else {
                allSpansArr[i].replaceWith(`\\cite{${tempText}}`)
            }
        } else
        if (allSpansArr[i].classList.contains('ptsref')) {
            let tempText = allSpansArr[i].text
            allSpansArr[i].replaceWith(`[${tempText}]`)
        } else
        if (allSpansArr[i].classList.contains('list-margin')) {
            let tempText = allSpansArr[i].text
            allSpansArr[i].replaceWith(`\\item[{${tempText}}]`)
        } else
        if (allSpansArr[i].classList.contains('linkseparator')) {
            let tempText = allSpansArr[i].text
            allSpansArr[i].replaceWith(`{~${tempText}~}`)
        } else
        if (allSpansArr[i].classList.contains('reflink')) {
            let tempText = allSpansArr[i].text
            allSpansArr[i].replaceWith(`{${tempText}} `)
        } else
        if (allSpansArr[i].classList.contains('sclinktext')) {
            let tempText = suttaCentralIt(allSpansArr[i].text)
            allSpansArr[i].replaceWith(`${tempText}`)
        }
    }

    let allEmTagsArr = localRoot.querySelectorAll('em')
    for (i in allEmTagsArr) {
        let tempText = allEmTagsArr[i].text
        allEmTagsArr[i].replaceWith(`\\textit{${tempText}}`)
    }

    let allStrongTagsArr = localRoot.querySelectorAll('strong')
    for (i in allStrongTagsArr) {
        let tempText = allStrongTagsArr[i].text
        allStrongTagsArr[i].replaceWith(`\\textbf{${tempText}}`)
    }

    let allAnchorsArr = localRoot.querySelectorAll('a') 

    for (let i in allAnchorsArr) {
            let tempText =``
            let tempAddress =``
        if (allAnchorsArr[i].classList.contains('online')) {
            tempText = 'online'
            tempAddress = allAnchorsArr[i].getAttribute('href')
        } else 
        if (allAnchorsArr[i].classList.contains('internetArchive')) {
            tempText = 'Internet Archive'
            tempAddress = allAnchorsArr[i].getAttribute('href')
        } else 
        if (allAnchorsArr[i].classList.contains('library')) {
            tempText = 'tMS Library'
            tempAddress = allAnchorsArr[i].getAttribute('href').replace('../', 'https://wiswo.org/books/')
        } else 
        if (allAnchorsArr[i].classList.contains('refpdf')) {
//            tempText = 'PDF'
            tempText = '{\\includegraphics[scale = 0.5, trim = 0 5 0 0]{../_resources/images/icons/pdf_24.png}}'
            tempAddress = allAnchorsArr[i].getAttribute('href').replace('../', 'https://wiswo.org/books/')
        } else {
            tempText = allAnchorsArr[i].text
            tempAddress = allAnchorsArr[i].getAttribute('href')
        }
        
        allAnchorsArr[i].replaceWith(`\\href{${tempAddress}}{${tempText}}`)
    }
    

    return localRoot.innerHTML.replaceAll(`&amp;`,`&`)
                              .replaceAll(`&nbsp;`,` `)
                              .replaceAll(`&ndash;`, `—`)
                              .replaceAll(`&`, `\\&`)
                              .replaceAll(`<br>`, '\\\\\r\n')
}

function processSpans () {
    let allSpansArr = bookRoot.querySelectorAll('span')
    for (i in allSpansArr) {
        if ((allSpansArr[i].getAttribute('lang') == 'pi') ) {
            let tempText = allSpansArr[i].text
            allSpansArr[i].replaceWith(`\\textit{${tempText}}`)
        } else 
        if ((allSpansArr[i].classList.contains('sesame')) && (!allSpansArr[i].classList.contains('ref'))) {
            let tempText = allSpansArr[i].text
            allSpansArr[i].replaceWith(`${tempText}`)
        } else
        if ((allSpansArr[i].classList.contains('sesame')) && (allSpansArr[i].classList.contains('ref'))) {
            let tempText = allSpansArr[i].text.replaceAll(`&`,`&amp;`)
            allSpansArr[i].replaceWith(`\\cite{${tempText}}`)
        } else
        if (allSpansArr[i].classList.contains('list-margin')) {
            let tempText = allSpansArr[i].text
            allSpansArr[i].replaceWith(`\\item[{${tempText}}]`)
        }
        if (allSpansArr[i].classList.contains('superscript')) {
            let tempText = allSpansArr[i].text
            allSpansArr[i].replaceWith(`\\textsuperscript{${tempText}}`)
        }
        if (allSpansArr[i].classList.contains('manualLink')) {
            let tempText = allSpansArr[i].text
            allSpansArr[i].replaceWith(`${tempText}`)
        }
    }
}

function processEmTags () {
    let allEmTagsArr = bookRoot.querySelectorAll('em')
    for (i in allEmTagsArr) {
        let tempText = allEmTagsArr[i].text
        allEmTagsArr[i].replaceWith(`\\textit{${tempText}}`)
    }
}

function processStrongTags () {
    let allStrongTagsArr = bookRoot.querySelectorAll('strong')
    for (let i in allStrongTagsArr) {
        let tempText = allStrongTagsArr[i].text
        allStrongTagsArr[i].replaceWith(`\\textbf{${tempText}}`)
    }
}

function processParas () {
    let allParasArr = bookRoot.querySelectorAll('p')
    for (i in allParasArr) {
        let tempHTML = allParasArr[i].innerHTML.replaceAll(`$`, `\\$`)
        allParasArr[i].replaceWith(`${tempHTML}\n\r`)
    }
}

function processSups () {
    let allSupsArr = bookRoot.querySelectorAll('sup')
    for (let i in allSupsArr) {
        let tempFootnoteText = allSupsArr[i].text
        let footnotesData = JSON.parse(fs.readFileSync(`../_resources/book-data/${bookID}/footnotes.json`, 'utf8'))
        for (let j in footnotesData){
            if (tempFootnoteText == footnotesData[j].fnNumber) {
                tempFootnoteText = processInlines(footnotesData[j].fnHTML).replaceAll('<p>','').replaceAll('</p>','') //(footnoteRoot.innerHTML)
            }
        }  
      
        allSupsArr[i].replaceWith(`\\footnote {${tempFootnoteText}}`)
    }
}

function processH1s () {
    let allH1sArr = bookRoot.querySelectorAll ('h1')
    for (let i in allH1sArr) {
        let headingLabel =``
        let headingLabelForTOC =``
        let headingNumber =``
        let headingName =``
        let headingNameForToc =``
        let headingNumberDot =`. `
        let headingLineBreak =`\\\\`

        if (allH1sArr[i].classList.contains('titlepage')) {
            allH1sArr[i].remove()
        } else
        if (allH1sArr[i].id ==`TOCTarget999999999`) {
            allH1sArr[i].remove()
        } else {
            let headingArr = allH1sArr[i].innerHTML.replace(`<span class="chapnum">`,``).split(`</span><br>`)
            if (!headingArr[1]) {
                headingName= headingArr[0]
                headingNumberDot =``
                headingPageBreak =``
            } else {
                if (headingArr[0].substring(0,8) == 'Chapter ') {
                    headingLabel = 'chapter '
                    headingNumber = `${headingArr[0].substring(8)}`

                } else 
                if (headingArr[0].substring(0,9) == 'appendix ') {
                    headingLabel = 'appendix '
                    headingLabelForTOC = 'App. '
                    headingNumber = `${headingArr[0].substring(9)}`
                } else {
                    headingNumber = headingArr[0]
                }
                headingName = headingArr[1]
            }
            headingNameForToc = headingName
            if (headingName.length > 45) {
                let headingNameArr = headingName.split(` `)
                let splitAt = Math.floor(headingNameArr.length/3)
                headingNameForToc = ``
                for (let i in headingNameArr) {
                    headingNameForToc += headingNameArr[i] + ' '
                    if (i == splitAt) {
                        headingNameForToc += '\\\\'
                    }
                }
            }
            allH1sArr[i].replaceWith(`\\chapter[${headingLabelForTOC}${headingNumber}${headingNumberDot}${headingNameForToc}]{${headingLabel}${headingNumber}${headingLineBreak}${headingName}\\markboth{${headingName}}{OOOO}}`)
        }
    }
}

function processH2s () {
    let allH2sArr = bookRoot.querySelectorAll ('h2')
    for (i in allH2sArr) {
        if (allH2sArr[i].classList.contains('titlepage')) {
            allH2sArr[i].remove()
        } else
        if (allH2sArr[i].text == 'Bibliography') {
            allH2sArr[i].remove()
        } else {
            let tempText = allH2sArr[i].text
            allH2sArr[i].replaceWith(`\n\r\\section{${tempText}}`)
        }
    }
}

function processH4s () {
    let allH4sArr = bookRoot.querySelectorAll ('h4')
    for (i in allH4sArr) {
        if (allH4sArr[i].classList.contains('titlepage')) {
            allH4sArr[i].remove()
        } else {
            //let tempText = allH4sArr[i].text
            allH4sArr[i].replaceWith(`YIKES`)
        }
    }
}

function processUls () {
    let allUlsArr = bookRoot.querySelectorAll ('ul') 
    for (i in allUlsArr) {
        tempHTML = allUlsArr[i].innerHTML.replaceAll('<li>', '\\item' ).replaceAll('</li>', '')
        allUlsArr[i].replaceWith(`\\begin{itemize}\n\r\\itemsep5pt\\parskip0pt\\parsep0pt\n\r${tempHTML}\n\r\\end{itemize}`)
    }
}

function processDls () {
    let allDlsArr = bookRoot.querySelectorAll ('dl') 
    for (i in allDlsArr) {
        allDlsArr[i].remove()
    }
}

function processDivs () {
    let allDivsArr = bookRoot.querySelectorAll ('div')
    for (let i in allDivsArr) {
        if (allDivsArr[i].classList.contains('eob')) {
            allDivsArr[i].remove()
        } else 
        if (allDivsArr[i].classList.contains('epigram-2')) {
            let tempText = allDivsArr[i].text.replaceAll(`\r\n`,``).replaceAll(`\n\r`,``)
            if ((i > 0) && (allDivsArr[i-1].classList.contains(`epigram-2`))) {
                allDivsArr[i].replaceWith (`\\begin{epigram-2-followOn}\r\n${tempText}\r\n\\end{epigram-2-followOn}`)
            } else {
                allDivsArr[i].replaceWith (`\\begin{epigram-2}\r\n${tempText}\r\n\\end{epigram-2}`)
            }
        } else 
        if (allDivsArr[i].classList.contains('epigram-2-cite')) {
            let tempText = allDivsArr[i].text.replaceAll(`\r\n`,``).replaceAll(`\n\r`,``)
            allDivsArr[i].replaceWith (`\\begin{epigram-2-cite}\r\n${tempText}\r\n\\end{epigram-2-cite}\r\n`)
        } else
        if (allDivsArr[i].classList.contains('tight-right-cite')) {
            let tempHTML = allDivsArr[i].innerHTML
            //console.log(JSON.stringify(tempHTML))
            let tempTEX = processInlines(tempHTML)
            allDivsArr[i].replaceWith(`\\begin{flushright}${tempTEX}\\end{flushright}`)
        }
    } 

}

function processLineBlocks () {
    let allLineBlocksArr = bookRoot.querySelectorAll('.line-block, .line-block-center') 
    for (i in allLineBlocksArr) {
        let tempHTML = allLineBlocksArr[i].innerHTML
        allLineBlocksArr[i].replaceWith(`\n\r\\begin{itemize}\n\r${tempHTML.replaceAll('<br>', ' \\\\ ')}\\end{itemize}`)
    }
}

function processBlockquotes () {
    let allBQArr = bookRoot.querySelectorAll('blockquote')
    for (i in allBQArr) {
       let tempHTML = allBQArr[i].innerHTML;
       allBQArr[i].replaceWith (`\\begin{quote}\n\r${tempHTML.replaceAll(`\\end{itemize}\n\r\\begin{itemize}`, '')}\n\r\\end{quote}`) // the replaceAll here cleans up the multiple line-block items in the itemize
    }
}

function processHrs () {
    let allHrsArr = bookRoot.querySelectorAll('hr') 
    for (i in allHrsArr) {
        allHrsArr[i].replaceWith (`\\vspace* {1em}\\noindent`)
    }
}

function processTables () {
    let allTables = bookRoot.querySelectorAll('.tablewrap')

    for (let i in allTables) {
        let localTableRoot = parse(allTables[i].innerHTML)
        let caption = localTableRoot.querySelector('caption').text.replaceAll(`\r\n`, '')
        let colcount = localTableRoot.querySelector('tr').querySelectorAll('td').length
        let tabularStr = ``
        for (let i = 1; i <= colcount; i++) {
            tabularStr += 'l'
        }
        let allTableRows = localTableRoot.querySelectorAll('tr')
        let allTableRowsTEX = ``
        for (let i in allTableRows) {
            allTableRowsTEX += allTableRows[i].innerHTML.replaceAll(`\r\n`, '')
                                                        .replaceAll(`\n\r`, '')
                                                        .replaceAll(`</td><td>`, ' & ')
                                                        .replace(`<td>`, ``)
                                                        .replace(`</td>`, ``)

            allTableRowsTEX += ` \\\\\r\n`

        }
       // console.log (allTableRowsTEX)

       let headerTEX = ``

       if (caption == 'Abbreviations') {
            headerTEX = `\\section{${caption}}\r\n`;
       }

       let startTEX = `\\bgroup\r\n\\def\\arraystretch{1.2}\r\n\\begin{tabular}{${tabularStr}}\r\n`

       let endTEX = `\r\n\\end{tabular}\\\r\n\\egroup`

       let newTEX = headerTEX + startTEX + allTableRowsTEX + endTEX


        //let newTEX = `\\begin{table}[]\r\n\\caption{}\r\n\\label{${caption}}\r\n\\begin{tabular}{${tabularStr}}\r\n${allTableRowsTEX}\\end{tabular}\r\n\\end{table}`
        allTables[i].replaceWith(newTEX)
    }
}

processSpans ()
processEmTags ()
processStrongTags ()
processParas ()
processSups ()
processH1s ()
processH2s ()
processH4s ()
processUls ()
processDls ()
processDivs ()
processLineBlocks ()
processBlockquotes ()
processHrs ()
processTables ()


//Get Info
let builtInfoData = JSON.parse(fs.readFileSync(`../_resources/book-data/${bookID}/info.json`, 'utf8'))

let bookTitle = builtInfoData.BookTitle
let bookSubtitle = builtInfoData.BookSubtitle
let bookAuthor = builtInfoData.Authors


let preamble = `
\\documentclass[10pt, openright]{book}

%PACKAGES%

\\usepackage[inner=0.75in, outer=0.75in, top=0.75in, bottom=0.75in, a5paper]{geometry}
\\usepackage{graphicx}
\\usepackage{fontspec, newunicodechar}
%\\usepackage{sectsty}
\\usepackage{titlesec}
\\usepackage{verse}
\\usepackage[unicode, pdfauthor={${bookAuthor}}, pdftitle={${bookTitle}: ${bookSubtitle}}, pdfsubject={Buddhism}, pdfkeywords={Buddhism}, pdfcreator={Wiswo-texBuilder}, hyperfootnotes=false]{hyperref} 
\\usepackage{emptypage}
\\usepackage{quoting}

%links and cites
\\hypersetup{
    colorlinks = true,
    linkcolor = [rgb]{0.1, 0.1, 0.56},
    anchorcolor = blue,
    citecolor = [rgb]{0.1, 0.1, 0.56},
    filecolor = blue,
    urlcolor = [rgb]{0.10, 0.46, 0.94}
    }

%MICROTYPOGRAPHY%
\\usepackage{microtype}

\\hyphenpenalty=750

\\usepackage{enumitem}
\\setlist[itemize]{labelsep=1em, leftmargin=10mm}

%LINESPACE%
\\usepackage{setspace}
\\setstretch{1.20}
\\setlength{\\parskip}{0pt}

%Minimum space before footnotes
\\setlength{\\skip\\footins}{1\\baselineskip}
\\setlength{\\footnotesep}{10pt}

%VERSE%
\\settowidth{\\versewidth}
{mmmmmmmmmmmmmmmmmmm}%THIS SETS THE GLOBAL DEFAULT WIDTH OF CENTERING. IT IS USUALLY DETERMINED LOCALLY, HOWEVER.%
%VERSE%

%HEADER%
\\usepackage{fancyhdr}
\\setlength{\\headheight}{15pt}
\\pagestyle{fancy}

\\fancyhf{}
%\\fancyfoot[CE,CO]{– \\thepage \\hspace{0.18em}–}

\\fancyhead[RO]{\\headerfont\\scshape\\small\\textcolor[rgb]{0.5, 0.5, 0.5}{\\leftmark\\hspace{0.18em}—\\hspace{0.18em}\\thepage}}
\\fancyhead[LE]{\\headerfont\\scshape\\small\\textcolor[rgb]{0.5, 0.5, 0.5}{\\thepage\\hspace{0.18em}—\\hspace{0.18em}${bookTitle}}}

\\makeatletter
\\renewcommand{\\chaptermark}[1]{%
  \\markboth{%
    \\ifnum\\c@secnumdepth>\\m@ne
      \\@chapapp\\ {\\footnotesize\\thechapter}. \\ %
    \\fi
  #1%
  }{}%
}
\\makeatother

\\renewcommand{\\headrulewidth}{0pt}
\\fancypagestyle{plain}{ %
\\fancyhf{} % remove everything
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
}

%\\renewcommand\\footnoterule{{\\color[rgb]{0.8, 0.8, 0.8} \\hrule width 1in height 0.4pt }} % a 1 inch gray line 
\\renewcommand\\footnoterule{{\\color[rgb]{0.8, 0.8, 0.8} \\kern-2 \\hrule width 1in \\kern 3 }} % a 1 inch gray line 


%FONTS%
\\setmainfont[]{Gentium Book Plus}
\\setsansfont[]{Linux Biolinum O}
%FONTS%

\\titleformat{\\chapter}
{\\center\\Huge\\Chapfont\\scshape}
{}
{0pt}
{}

\\titleformat{\\section}
{\\vspace{4pt}\\linespread{1}\\center\\Large\\scshape\\Secfont}
{}
{0pt}
{}

\\setcounter{secnumdepth}{-1}

\\newfontfamily\\Chapfont[]{Wiswo Small Caps}
%\\newfontfamily\\Chapnumfont{Source Sans 3}
\\newfontfamily\\Secfont[]{Wiswo Small Caps}
%\\sectionfont{\\linespread{0.75}\\center\\Large\\Secfont}
\\newfontfamily\\headerfont[]{Wiswo Small Caps}

\\newfontfamily\\Titlefont[]{Wiswo Small Caps}

%EPIGRAPH%
\\newenvironment{epigraph}\n\r

%HANGING LEFT%
\\newcommand*{\\vleftofline}[1]{\\leavevmode\\llap{#1}}

%WIDOWS & ORPHANS%
\\widowpenalty=10000
\\clubpenalty=10000

\\counterwithout{footnote}{chapter}
\\usepackage[hang,flushmargin,bottom]{footmisc}
\\setlength{\\footnotemargin}{6mm}

%Make footnote non-superscript
\\makeatletter%%
\\patchcmd{\\@makefntext}{%
\\ifFN@hangfoot
\\bgroup}%
{%
\\ifFN@hangfoot
\\bgroup\\def\\@makefnmark{\\rlap{\\normalfont\\@thefnmark.}}}{}{}%
% %%%
\\patchcmd{\\@makefntext}{%
\\ifdim\\footnotemargin>\\z@
\\hb@xt@ \\footnotemargin{\\hss\\@makefnmark}}%
{%
\\ifdim\\footnotemargin>\\z@
\\hb@xt@ \\footnotemargin{\\@makefnmark\\hss}}{}{}%
\\makeatother

\\newcommand{\\nocontentsline}[3]{}
\\newcommand{\\tocless}[2]{\\bgroup\\let\\addcontentsline=\\nocontentsline#1{#2}\\egroup}

\\usepackage{verbatim}

\\pretolerance=400
\\tolerance=800
\\emergencystretch=3pt

\\usepackage{noindentafter}
\\NoIndentAfterEnv{epigram-2-cite}

\\newenvironment{epigram-2}%
{%
\\setstretch{1.4}
\\vspace{1em}
\\noindent
\\quoting[leftmargin=2cm,rightmargin=2cm]%
\\begin{itshape}
\\large
}%
{\\end{itshape}\\endquoting
}%

\\newenvironment{epigram-2-followOn}%
{%
\\setstretch{1.4}
\\vspace{-1em}
\\noindent
\\quoting[leftmargin=2cm,rightmargin=2cm]%
\\begin{itshape}
\\large
}%
{\\end{itshape}\\endquoting
}%

\\newenvironment{epigram-2-cite}%
{%
\\quoting[leftmargin=2cm,rightmargin=2cm]%
\\noindent\\normal\\hspace*{\\fill} 
}%
{\\endquoting
}%



%\\hyphenation{manu-scripts}

\\makeatletter
\\def\\@biblabel#1{}
\\renewcommand\\@cite[2]{{#1\\if@tempswa,\\nolinebreak[3] #2\\fi}}
\\makeatother

\\makeatletter
\\renewenvironment{thebibliography}[1]
     {\\section{\\bibname}% <-- this line was changed from \\chapter* to \\section
      %\\@mkboth{\\MakeUppercase\\bibname}{\\MakeUppercase\\bibname}%
      \\list{\\@biblabel{\\@arabic\\c@enumiv}}%
           {\\settowidth\\labelwidth{\\@biblabel{#1}}%
            \\leftmargin\\labelwidth
            \\advance\\leftmargin\\labelsep
            \\@openbib@code
            \\usecounter{enumiv}%
            \\let\\p@enumiv\\@empty
            \\renewcommand\\theenumiv{\\@arabic\\c@enumiv}}%
      \\sloppy
      \\clubpenalty4000
      \\@clubpenalty \\clubpenalty
      \\widowpenalty4000%
      \\sfcode\`\\.\\@m}
     {\\def\\@noitemerr
       {\\@latex@warning{Empty \`thebibliography' environment}}%
      \\endlist}
\\makeatother

`
const docStart = `\n\r\\begin{document}\n`
let frontMatter =`
\\frontmatter

\\pagestyle{empty}

\\includegraphics[scale= 2, trim= 0 0 0 0]{../_resources/book-data/${bookID}/FrontLarge.jpg}

\\newpage~\\newpage~

\\begin{center}
\\vspace{2em}

\\Huge\\Titlefont\\scshape{${bookTitle}}\\\\
\\vspace{0.5em}
\\large\\Titlefont\\scshape{${bookSubtitle}}\\\\

\\begin{Large}
\\vspace{4em}
\\Titlefont\\scshape{${bookAuthor}}
\\end{Large}


\\vspace*{\\fill}
\\includegraphics[scale=0.06, trim = 0 13 5 0 ]{../_resources/images/icons/logo-enso-large}\\\\
\\vspace{4pt}
\\begin{small}
\\scshape{Wisdom \\& Wonders\\\\
Books}
\\end{small}
\\end{center}
`
function buildCopyright () {

    let copyrightTEX =``
    for (i in builtInfoData.Copyright) {
        if (!(i == builtInfoData.Copyright.length-1)) {
            copyrightTEX += `\\noindent ${builtInfoData.Copyright[i].replaceAll('**','')}\\\\`
        }
    }
    
    let ccLicenceTEXroot = parse(builtInfoData.CCLicense)
    
    let ccLicenceTitle = ccLicenceTEXroot.querySelector('h3').text
    let ccLicenceDetailArr = ccLicenceTEXroot.querySelectorAll('p, li')
    
    copyrightTEX += `\n\r`
    copyrightTEX += `\\noindent\\textbf{${ccLicenceTitle}}\\\\\n\r`
    copyrightTEX += `\n\r`
    
    for (i in ccLicenceDetailArr) {
        if (ccLicenceDetailArr[i].tagName == 'P') {
            copyrightTEX += `\n\r\\noindent\\textbf{${ccLicenceDetailArr[i].text}}\n\r`
        } else {
            copyrightTEX += `\\noindent ${ccLicenceDetailArr[i].text}\n\r`
        }
    }
    return copyrightTEX

}
let copyright = `
\\newpage
\\begin{small}
\\begin{sffamily}
\\noindent Copyright © — ${bookAuthor}\\\\\n\r
${buildCopyright()}
\\end{sffamily}
\\end{small}
`
function buildBiblio () {
    let biblioMapArr = JSON.parse(fs.readFileSync(`../_resources/book-data/${bookID}/biblioMapArr.json`, 'utf8'))
    let biblioHTML = parse(fs.readFileSync(`../_resources/book-data/${bookID}/biblio.html`, 'utf8'))
    let localBiblio =`\\bibliographystyle{apalike}\n\r\\bibliography{biblatex-examples}\n\r\\begin{thebibliography}{${biblioMapArr.length}}`
//remove linkcontainers span tags
    let allLinkcontainers = biblioHTML.querySelectorAll('.linkContainer')
    for (let i in allLinkcontainers) {
        tempHTML = allLinkcontainers[i].innerHTML
        allLinkcontainers[i].replaceWith(`\\\\ \\textsc{Links:} ${tempHTML}`)
    }
//remove all bibheads
    let allBibheads = biblioHTML.querySelectorAll('.bibhead')
    for (let i in allBibheads) {
        let tempHTML = allBibheads[i].innerHTML;
        allBibheads[i].replaceWith(tempHTML)
    }
//build the entries
    let allDTs = biblioHTML.querySelectorAll('dt')
    let allDDs =biblioHTML.querySelectorAll('dd')
    let biblioEntriesArr = new Array()
    for (let i in allDTs) {
        let newBibTEX = processInlines(allDDs[i].innerHTML)
        biblioEntriesArr.push ([allDTs[i].innerHTML, newBibTEX])
    }

    for (let i in biblioMapArr) {
        for (let j in biblioEntriesArr) {
            if (biblioMapArr[i][0] == biblioEntriesArr[j][0]) {
                localBiblio += `\n\r\\bibitem[${biblioMapArr[i][1]}]{${biblioMapArr[i][1]}} ${biblioEntriesArr[j][1]}`
            }
        }
    }
    localBiblio += `\n\r\\end{thebibliography}`
    return localBiblio
}

const docTOC = `\n\r\\tableofcontents\n\r`
const docMain =`\\mainmatter\n\\pagestyle{fancy}\n\r`
const docBib = `${buildBiblio()}`
const docEnd = `\n\r\\end{document}`

let localTex = preamble
localTex += docStart
localTex += frontMatter
localTex += copyright
localTex += docTOC
localTex += docMain
localTex += bookRoot
localTex += docBib
localTex+= docEnd

fs.writeFileSync((`../_resources/book-data/${bookID}/${bookID}.tex`), localTex, 'utf8')

exec(`lualatex --output-directory=../_resources/book-data/${bookID}  -interaction=nonstopmode ../_resources/book-data/${bookID}/${bookID}.tex`)


//exec(`lualatex --output-directory=../_resources/book-data/${bookID}  --aux-directory=../_resources/book-data/${bookID}/texlog -interaction=nonstopmode ../_resources/book-data/${bookID}/${bookID}.tex`)
