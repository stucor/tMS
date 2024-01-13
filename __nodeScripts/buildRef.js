const path = require('path')
const fs = require('fs')

let outputHTML =`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<link rel="stylesheet" type="text/css" href="../css/biblio.css">
<title>test biblio</title>
<style>
</style> 
</head>
<body>`

function buildRef (bookID) {
    let html =``
    let bookBiblioData = require(path.join(__dirname, '..', '_resources', 'book-data', bookID, 'biblio.json'))
    //console.log (bookBiblioData)

    function populateReferences(referencesData) {

        html += `<dl class="references">\n`
        for (i in referencesData) {
            let urlLabel ='';
            let attachmentLabel = '';
            let tMSShortcode ='';
            let internetArchiveURL=''
            
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
                        }
                }
            }

            switch (referencesData[i].type) {
                case "book":
                    urlLabel ='Publisher: ';
                    break;
                case "article-journal":
                    urlLabel ='Journal: ';
                    break;
                case "document":
                    urlLabel ='Publisher: ';
                    break;
                case "post-weblog":
                    urlLabel ='Blog Post: ';
                    break;
                case "post":
                    urlLabel ='Forum Post: ';
                    break;
                case "webpage":
                    urlLabel ='Webpage: ';
                    break;
            }

            html += `<dt>${referencesData[i].id}</dt>\n`

            html += `<dd>`;

            // author
/*             let authorAfter ='';
            for (j in referencesData[i].author) {
                
                if (j == referencesData[i].author.length-1) {
                    authorAfter =`[${j},${referencesData[i].author.length}]&ndash;`
                } else {
                    authorAfter =`[${j},${referencesData[i].author.length}] & `
                }
                html += `<strong>${referencesData[i].author[j].family}</strong>, ${referencesData[i].author[j].given}${authorAfter}`;
            }
 */


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



            //title
            html += ` <em>${referencesData[i].title}</em>`;

            //container
            if (referencesData[i].hasOwnProperty('container-title')) {
                html += `. ${referencesData[i]["container-title"]}`;
            }
            if (referencesData[i].hasOwnProperty('volume')) {
                html += `, Vol. ${referencesData[i]["volume"]}`;
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
                //console.log(`${referencesData[i].id}`)
                html += ` ${referencesData[i]["issued"]["date-parts"][0][0]}.`;
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
            let linkSeparator = ' | ';

            if (tMSShortcode !=='') {
                html += `${linkSeparator} <a class="library" href="https://wiswo.org/books/${tMSShortcode}"></a>`
            }

            if (internetArchiveURL !== '') {
                html += `${linkSeparator} <a class="internetArchive" href="https://archive.org/details/${internetArchiveURL}"></a>`
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



            html += `</dd>\n`;

        }

        html += `</dl>\n`
        outputHTML += html;

    }

populateReferences(bookBiblioData);
/*
			fetch(`../_resources/book-data/${shortCode}/reference.json`)
				.then(response => response.json())
				.then (data => populateReferences(data))
				.catch(error => {
					console.log(`ERROR: Can't fetch ../_resources/book-data/${shortCode}/reference.json`);
				}

			);
*/
}

buildRef('seeds');
outputHTML += `</body>
</html>`
//console.log (outputHTML);
fs.writeFileSync(path.join(__dirname, '.', 'testBiblio.html'), outputHTML);