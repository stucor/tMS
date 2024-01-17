const path = require('path')
const fs = require('fs')

let outputHTML =`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>test biblio</title>
<style>
body {
    margin: 2em 15%;
}

dt {
    margin-top: 0.5em;
    font-variant: small-caps;
    font-size: smaller;
}

/*
.references > dt {
	font-variant: small-caps;
	color:#00000000;
	user-select: none;
	max-width: 0;
	max-height: 0;
}

.references > dd {
	text-indent: -2em;
	margin-left: 2em;
	margin-bottom: 0;
	font-size: var(--fontsize);
	line-height: var(--lineheight);
	text-align:left;
}
*/


.linkContainer {
    background: aliceblue;
    white-space: nowrap;
    margin: 0 0 -0.3em 0;
    padding: 0 0.2em;
    border-radius: 5px;
}

.refpdf {
    font-size: smaller;
}

.refpdf::before {
    background-image: url('../_resources/images/icons/PDF_file_icon.svg');
    background-size: 1em;
    display: inline-block;
    width: 1em; 
    height: 1.3em;
    content:"";
	margin-bottom: -0.3em;
	margin-left: 0.2em;
	margin-right: 0.2em;
}


.refaudio::before {
	background-image: url('../_resources/images/icons/play-button-round-icon.svg');
    background-size: 1em;
    display: inline-block;
    width: 1em; 
    height: 1em;
    content:"";
	margin-bottom: -0.2em;
	margin-left: 0.1em;
	filter: invert(61%) sepia(10%) saturate(2596%) hue-rotate(182deg) brightness(92%) contrast(102%);
}


.reflink {
	font-size: smaller;
	font-variant: small-caps;
}

.online::before {
    background-image: url('../_resources/images/icons/internet.svg');
    background-size: 1em;
    display: inline-block;
    width: 1em; 
    height: 1em;
    content:"";
	margin-bottom: -0.2em;
	margin-left: 0;
	margin-right: 0;
	filter: invert(61%) sepia(10%) saturate(2596%) hue-rotate(182deg) brightness(92%) contrast(102%);
}

.library::before {
    background-image: url('../_resources/images/icons/library.svg');
    background-size: 3.5em;
    display: inline-block;
    width: 3.5em; 
    height: 1.2em;
    content:"";
	margin-bottom: -0.3em;
	margin-left: 0.1em;
	background-repeat: no-repeat;
	filter: invert(61%) sepia(10%) saturate(2596%) hue-rotate(182deg) brightness(92%) contrast(102%);
}

.internetArchive::before {
    background-image: url('../_resources/images/icons/archive-ar21.svg');
    background-size: 3.5em;
    display: inline-block;
    width: 3.5em; 
    height: 1.5em;
	line-height: 0;
    content:"";
	margin-bottom: -0.2em;
	margin-left: 0.2em;
	margin-right: 0;
	background-repeat: no-repeat;
	filter: invert(61%) sepia(10%) saturate(2596%) hue-rotate(182deg) brightness(92%) contrast(102%);
}

.internetArchive:hover, .library:hover, .online:hover, .refaudio:hover {
	filter: invert(61%) sepia(10%) saturate(2596%) hue-rotate(182deg) brightness(92%) contrast(102%);
}
</style> 
</head>
<body>
`

let compareData = ``

function buildRef (bookID) {
    let html =``
    let biblioMappArr = require(path.join(__dirname, '..', '_resources', 'book-data', bookID, 'biblioMapArr.json'))
    let bookBiblioData = require(path.join(__dirname, '..', '_resources', 'book-data', bookID, 'biblio.json'))
    
    function compareRefs (referencesData) {
        for (i in referencesData) {
            compareData += `${referencesData[i].id}::${referencesData[i].title}\n`
        }
    }

    function populateReferences(referencesData) {
        html += `<dl class="references">\n`
        for (i in referencesData) {
            let urlLabel = '';
            let attachmentLabel = '';
            let tMSShortcode = '';
            let internetArchiveURL = ''
            let audioFile = ''
            
            // get special values from the notes field 
            if ((referencesData[i].hasOwnProperty('note')) && (referencesData[i].note != '')) {
                noteArray = referencesData[i]["note"].split('\n')
                for (j in noteArray) {
                    [noteKey, noteValue] = noteArray[j].split(':')
                    switch (noteKey) {
                        case "attachment-label":
                            attachmentLabel = `${noteValue.replace(/ /g, '\u00a0').trim()}`
                            break
                        case "tMS":
                            tMSShortcode = noteValue.trim()
                            break
                        case "IACode":
                            internetArchiveURL = `${noteValue.trim()}`
                            break
                        case "audio-file":
                            audioFile = `${noteValue.trim()}`
                        }
                }
            }

            switch (referencesData[i].type) {
                case "book":
                    urlLabel ='Publisher: '
                    break;
                case "article-journal":
                    urlLabel ='Journal: '
                    break;
                case "document":
                    urlLabel ='Publisher: '
                    break;
                case "post-weblog":
                    urlLabel ='Blog Post: '
                    break;
                case "post":
                    urlLabel ='Forum Post: '
                    break;
                case "webpage":
                    urlLabel ='';
                    break;
                case "thesis":
                    urlLabel ='University: ';
                    break;
                case "song":
                    urlLabel ='Audio Source: '
                    break;
              }

            //html += `<dt>${referencesData[i].id}</dt>\n`

            for (k in biblioMappArr ) {
                if (referencesData[i].id == biblioMappArr[k][0]) {
                    html +=`<dt>${biblioMappArr[k][1].trim()}</dt>`
                }
            }

            html += `<dd>`;
            html += `<span class='bibhead'>`
            // author
            let authorAfter ='';
            for (j in referencesData[i].author) {
                
                if (j == referencesData[i].author.length-1) {
                    authorAfter =` &ndash; `
                    
                } else if (j == referencesData[i].author.length-2) {
                    authorAfter =` & `
                    
                } else {
                    authorAfter =`, `
                }

                html += `<strong>${referencesData[i].author[j].family}</strong>, ${referencesData[i].author[j].given}${authorAfter}`;
            }

            //translator
            let translatorAfter ='& ';
            for (j in referencesData[i].translator) {
                if (j == referencesData[i].translator.length-1) {
                    translatorAfter ='<em>(tr.) </em>&ndash;'
                }
                html += `<strong>${referencesData[i].translator[j].family}</strong>, ${referencesData[i].translator[j].given} ${translatorAfter}`;
            }

            // editor - add the editor only in case there is no author
            if (!referencesData[i].author) {
                let editorAfter ='& ';
                for (j in referencesData[i].editor) {
                    if (j == referencesData[i].editor.length-1) {
                        editorAfter ='<em>(ed.) </em>&ndash;'
                    }
                    html += `<strong>${referencesData[i].editor[j].family}</strong>, ${referencesData[i].editor[j].given} ${editorAfter}`;
                }
            }

            //title
            if (referencesData[i]["title-short"]) {
                html += ` <em>${referencesData[i]["title-short"]}</em>`;
            } else {
                html += ` <em>${referencesData[i]["title"]}</em>`;
            }

            //container
            if (referencesData[i].hasOwnProperty('container-title')) {
                html += `. ${referencesData[i]["container-title"]}`;
            }

            html += `</span>`
            

            if (referencesData[i].hasOwnProperty('volume')) {
                html += `, Vol. ${referencesData[i]["volume"]}`;
                if (referencesData[i].hasOwnProperty('issue')) {
                    html += `/${referencesData[i]["issue"]}`;
                }
            } else if (referencesData[i].hasOwnProperty('issue')) {
                html += `, No. ${referencesData[i]["issue"]}`;
            }

            if (referencesData[i].hasOwnProperty('number-of-volumes')) {
                html += ` of ${referencesData[i]["number-of-volumes"]}`;
            }

            if (referencesData[i].hasOwnProperty('page')) {
                if (referencesData[i].page.includes("-")) { //is a range of pages
                    html += `. pp. ${referencesData[i].page}`;
                } else {
                    html += `. p. ${referencesData[i].page}`;
                }
            }

            html += `.`;

            // date
            if (referencesData[i].hasOwnProperty('issued')) {
                html += ` ${referencesData[i]["issued"]["date-parts"][0][0]} `;
            }

            //publisher

/*             if (referencesData[i].hasOwnProperty('publisher')) {
                html += ` ${referencesData[i]["publisher"]}`;

                if (referencesData[i].hasOwnProperty('publisher-place')) {
                    html += `, ${referencesData[i]["publisher-place"]}`;
                }

                html += `.`;
            } */

            //url
            let linkSeparator = `<span style='color:grey; opacity:0.4'>•</span>`;
            html += `<span class = "linkContainer">`
            if (tMSShortcode !=='') {
                html += `${linkSeparator} <a class="library" href="https://wiswo.org/books/${tMSShortcode}"></a>`
            }

            if (internetArchiveURL !== '') {
                html += `${linkSeparator} <a class="internetArchive" href="https://archive.org/details/${internetArchiveURL}"></a>`
            }

            if (audioFile !=='') {
                html += `${linkSeparator} <a class="refaudio" href="https://wiswo.org/books/_resources/zotero-attach/audio/${audioFile}.mp3"></a>`
            }

            if (referencesData[i].hasOwnProperty('URL')) {
                html += `${linkSeparator} <span class='reflink'>${urlLabel}</span><a class="online"  href="${referencesData[i].URL}"></a> `;
            }

            if ((referencesData[i].hasOwnProperty('file')) && (referencesData[i].file != '')) {
                if (attachmentLabel !== '') {
                    let attachmentLabelArray = attachmentLabel.split(';');
                    if (attachmentLabelArray.length > 1) {
                        let fileArray = referencesData[i].file.split(';');
                        for (k in attachmentLabelArray) {
                            html += `${linkSeparator} <span class='reflink'>${attachmentLabelArray[k]}:</span><a class="refpdf" href="https://wiswo.org/books/_resources/zotero-attach/${fileArray[k]}"></a> `;
                        }
                    } else {
                        html += `${linkSeparator} <span class='reflink'>${attachmentLabel}:</span><a class="refpdf" href="https://wiswo.org/books/_resources/zotero-attach/${referencesData[i].file}"></a> `;
                    }
                } else {
                    html += `${linkSeparator} <a class="refpdf" href="https://wiswo.org/books/_resources/zotero-attach/${referencesData[i].file}"></a> `;
                }
            }

            html += `${linkSeparator}</span></dd>\n`;

        }

        html += `</dl>\n`
        outputHTML += html;

    }

    populateReferences(bookBiblioData);
    compareRefs (bookBiblioData);

}

buildRef('seeds');
outputHTML += `</body>
</html>`
//console.log (outputHTML);
fs.writeFileSync(path.join(__dirname, '.', 'testBiblio.html'), outputHTML);
fs.writeFileSync(path.join(__dirname, '.', 'compare.txt'), compareData);