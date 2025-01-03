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
let builtInfoData = JSON.parse(fs.readFileSync(`../_resources/built-info-data/${bookID}/info.json`, 'utf8'))

let bookTitle = builtInfoData.BookTitle
let bookSubtitle = builtInfoData.BookSubtitle
let bookAuthor = builtInfoData.Authors


let preamble = `
\\documentclass[10pt, openany]{book}

%PACKAGES%

\\usepackage[inner=0.75in, outer=0.75in, top=0.75in, bottom=0.75in, a5paper]{geometry}
\\usepackage{graphicx}
\\usepackage{fontspec, newunicodechar}
%\\usepackage{sectsty}
\\usepackage{titlesec}
\\usepackage{verse}
\\usepackage[unicode, pdfauthor={${bookAuthor}}, pdftitle={${bookTitle}: ${bookSubtitle}}, pdfsubject={Buddhism}, pdfkeywords={Buddhism}, pdfcreator={Wiswo-texBuilder}, hyperfootnotes=false]{hyperref} 

%links and cites
\\hypersetup{
    colorlinks = true,
    linkcolor = [rgb]{0.1, 0.1, 0.56},
    anchorcolor = blue,
    citecolor = blue,
    filecolor = blue,
    urlcolor = [rgb]{0.4, 0.6, 0.91}
    }

%MICROTYPOGRAPHY%
\\usepackage{microtype}

\\hyphenpenalty=750

%LINESPACE%
\\usepackage{setspace}
\\setstretch{1.20}
\\setlength{\\parskip}{0pt}

%Minimum space before footnotes
\\setlength{\\skip\\footins}{1\\baselineskip}
\\setlength{\\footnotesep}{11pt}

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

\\fancyhead[RO]{\\headerfont\\scshape\\small\\textcolor[rgb]{0.5, 0.5, 0.5}{Viññāṇa Anidassana —\\hspace{0.18em}\\thepage}}
\\fancyhead[LE]{\\headerfont\\scshape\\small\\textcolor[rgb]{0.5, 0.5, 0.5}{\\thepage\\hspace{0.18em}— Bhikkhu Sunyo}}

\\renewcommand{\\headrulewidth}{0pt}
\\fancypagestyle{plain}{ %
\\fancyhf{} % remove everything
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
}

\\renewcommand\\footnoterule{{\\color[rgb]{0.8, 0.8, 0.8} \\hrule width 1in height 0.2pt}} % a 1 inch gray line 


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
{\\linespread{0.75}\\center\\Large\\scshape\\Secfont}
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
\\newenvironment{epigraph}\n

%HANGING LEFT%
\\newcommand*{\\vleftofline}[1]{\\leavevmode\\llap{#1}}

%WIDOWS & ORPHANS%
\\widowpenalty=10000
\\clubpenalty=10000

\\counterwithout{footnote}{chapter}
\\usepackage[hang,flushmargin,bottom]{footmisc}
%\\graphicspath{ {./images/} }

\\newcommand{\\nocontentsline}[3]{}
\\newcommand{\\tocless}[2]{\\bgroup\\let\\addcontentsline=\\nocontentsline#1{#2}\\egroup}

\\makeatletter
\\newcommand{\\epubchapter}[1]{%
  \\begingroup
  \\let\\@makechapterhead\\@gobble % make \\@makechapterhead do nothing
  \\tocless \\chapter{#1}
  \\endgroup
}
\\makeatother

\\usepackage{verbatim}


\\pretolerance=400
\\tolerance=800
\\emergencystretch=3pt

\\newenvironment{aphorism}%
{%
\\begin{center}\\begin{itshape}
}%
{\\end{itshape}\\end{center}
}%

\\hyphenation{manu-scripts}

`
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
\\Titlefont\scshape{${bookAuthor}}
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

let copyright = `
\\newpage
\\begin{small}
\\begin{sffamily}
\\noindent Copyright © — ${bookAuthor}\\\\\n\r
${copyrightTEX}
\\end{sffamily}
\\end{small}
`

const docStart = `\n\\begin{document}\n`
const docEnd = `\n\\end{document}`

let localTex = preamble
localTex += docStart
localTex += frontMatter
localTex += copyright
localTex+= docEnd

fs.writeFileSync((`../_resources/book-data/${bookID}/${bookID}.tex`), localTex, 'utf8')

exec(`lualatex --output-directory=../_resources/book-data/${bookID}  --aux-directory=../_resources/book-data/${bookID}/texlog -interaction=nonstopmode ../_resources/book-data/${bookID}/${bookID}.tex`)


