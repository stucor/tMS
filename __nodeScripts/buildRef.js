const path = require('path')
const fs = require('fs')

let outputHTML =''

function buildRef (bookID) {
    let html =``
    let bookBiblioData = require(path.join(__dirname, '..', '_resources', 'book-data', bookID, 'biblio.json'))
    //console.log (bookBiblioData)

    function populateReferences(referencesData) {

        html += `<dl class="references">`
        for (i in referencesData) {
            let urlLabel ='';
            let attachmentLabel = '';
            let tMSShortcode ='';
            
            // get special values from the notes field 
            if ((referencesData[i].hasOwnProperty('note')) && (referencesData[i].note != '')) {
                noteArray = referencesData[i]["note"].split('\n');	
                for (j in noteArray) {
                    [noteKey, noteValue] = noteArray[j].split(':');
                    switch (noteKey) {
                        case "attachment-label":
                            attachmentLabel = noteValue;
                            break;
                        case "tMS":
                            tMSShortcode = noteValue;
                    }
                }
            }

            switch (referencesData[i].type) {
                case "book":
                    urlLabel ='Publishers Page';
                    break;
                case "article-journal":
                    urlLabel ='Journal Page';
                    break;
                case "document":
                    break;
                case "post-weblog":
                    urlLabel ='Blog Post';
                    break;
                case "webpage":
                    urlLabel ='Webpage';
                    break;
            }

            html += `<dt>${referencesData[i].id}</dt>`

            html += `<dd>`;

            let authorAfter ='& ';
            for (j in referencesData[i].author) {
                if (j == referencesData[i].author.length-1) {
                    authorAfter ='&mdash;'
                }
                html += `<strong>${referencesData[i].author[j].family}</strong>, ${referencesData[i].author[j].given} ${authorAfter}`;
            }

            let translatorAfter ='& ';
            for (j in referencesData[i].translator) {
                if (j == referencesData[i].translator.length-1) {
                    translatorAfter ='<em>(tr.) </em>&mdash;'
                }
                html += `<strong>${referencesData[i].translator[j].family}</strong>, ${referencesData[i].translator[j].given} ${translatorAfter}`;
            }

            if (referencesData[i].hasOwnProperty('issued')) {
                html += ` ${referencesData[i]["issued"]["date-parts"][0][0]}.`;
            }

            html += ` <em>${referencesData[i].title}</em>`;

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

            if (referencesData[i].hasOwnProperty('publisher')) {
                html += ` ${referencesData[i]["publisher"]}`;

                if (referencesData[i].hasOwnProperty('publisher-place')) {
                    html += `, ${referencesData[i]["publisher-place"]}`;
                }

                html += `.`;
            }

            let linkSeparator = ' | ';
            if (referencesData[i].hasOwnProperty('URL')) {
                html += `${linkSeparator} <a class="extlink reflink"  href="${referencesData[i].URL}">${urlLabel}</a> `;
            }

            if ((referencesData[i].hasOwnProperty('file')) && (referencesData[i].file != '')) {
                if (attachmentLabel !== '') {
                    let attachmentLabelArray = attachmentLabel.split(';');
                    if (attachmentLabelArray.length > 1) {
                        let fileArray = referencesData[i].file.split(';');
                        for (k in attachmentLabelArray) {
                            html += `${linkSeparator} <a class="refpdf reflink" href="../_resources/zotero-attach/${fileArray[k]}">${attachmentLabelArray[k]}</a> `;
                        }
                    } else {
                        html += `${linkSeparator} <a class="refpdf reflink" href="../_resources/zotero-attach/${referencesData[i].file}">${attachmentLabel}</a> `;
                    }
                } else {
                    html += `${linkSeparator} <a class="refpdf reflink" href="../_resources/zotero-attach/${referencesData[i].file}"></a> `;
                }
            }

            if (tMSShortcode !=='') {
                html += `${linkSeparator} <a class="reflink" href="../${tMSShortcode}">online</a>`
            }

            html += `</dd>`;

        }

        html += `</dl>`
        outputHTML = html;

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

buildRef('vasy');
console.log (outputHTML);