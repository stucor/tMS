					if (sesameData[i].type == `externalQuote`) {

						let bibReference = ''
						if (sesameData[i].biblio) {
							bibReference = `<div style='text-align:left'><hr style='width:50%; margin:1em auto;'><span style='font-variant:small-caps'>Bibliography Entry: </span>${getFullReference(sesameData[i].biblio)}`
						}

						let fetchPath = `../_resources/external-quotes/${sesameData[i].directory}/${sesameData[i].file}.json`

						function populateQuote(quoteData) {
							let subSectionSpacer = ''
							if (quoteData.SubSection) {
								subSectionSpacer = '<br>'
							}
							let linkHTML = ''
							if (sesameData[i].directory == 'wiki-entry') {
								linkHTML = `<span class='extlink'><a alt='wikipedia page' href = 'https://en.wikipedia.org/wiki/${sesameData[i].file.replace('-', '#')}'>source: <img class='icon' src='../_resources/images/icons/Wikipedia-logo-v2.svg'> Wikipedia</a></span><br>`
							} else {
								let [directory,subdirectory] = sesameData[i].directory.split('/')
								if (directory == 'sujato-nikaya-notes') {
									linkHTML = `<br><span class='extlink'><a alt='SuttaCentral Guide' href = 'https://suttacentral.net/${subdirectory}'>source: <img class='icon' src='../_resources/images/icons/sc-icon.png'>SuttaCentral</a></span>`
								}
							}
							let author = ''
							if (quoteData.Author) {
								author = `by ${quoteData.Author}`
							}
							let quoteHTML = ''
							quoteHTML += `<h3>${quoteData.Document}<br>${quoteData.Section}${subSectionSpacer}${quoteData.SubSection}<br>${quoteData.Title}<br>${author}${linkHTML}</h3>`
							quoteHTML += quoteData.Quote.replaceAll(/<sup>[0-9]+<\/sup>/gi, '');
							el.insertAdjacentHTML("afterend", `<div class=opensesame>${quoteHTML}${bibReference}</div>`);
							el.classList.add('closebutton')
						}

						fetch(fetchPath)
							.then(response => response.json())
							.then (data => populateQuote(data))
							.catch(error => {
								console.log(`${error}ERROR: Can't fetch ${fetchPath}`);
							}
						);

					} else 
					if (sesameData[i].type == `scBlurb`) {
						let fetchPath = `../_resources/bilara-data/published/root/en/blurb/${sesameData[i].file}.json`
						function populateQuote(quoteData) {
							function capitalizeFirstLetter(val) {
								return String(val).charAt(0).toUpperCase() + String(val).slice(1);
							}
							let scRefHTML = `<a class="extlink" href="https://suttacentral.net/${(sesameData[i].file)}"><br>source: <img src='../_resources/images/icons/sc-icon.png' style='width:1em; position:relative; top:0.2em;' alt="SuttaCentral Logo">SuttaCentral</a>`;
							let blurbKeyHead = sesameData[i].file.split('_')[0]
							let blurbKey = `${blurbKeyHead}:${sesameData[i].directory}`
							scRefHTML = `<a class="extlink" href="https://suttacentral.net/${(sesameData[i].directory)}">source: <img src='../_resources/images/icons/sc-icon.png' style='width:1em; position:relative; top:0.2em;' alt="SuttaCentral Logo">SuttaCentral</a>`;
							let linkHTML = ``
							if (sesameData[i].file.substr(0,6) != 'super-') {
								let linkTextArr = sesameData[i].directory.match(/[a-z]+|[^a-z]+/gi);
								switch (linkTextArr[0]) {
									case "dn":
									case "an":
									case "sn":
									case "mn":
										linkTextArr[0] = linkTextArr[0].toUpperCase()
										break
									case "snp":
										if (linkTextArr[2]) { // its a vagga
											linkTextArr[0] = ``
										} else {
										linkTextArr[0] = capitalizeFirstLetter(linkTextArr[0]);
										}
										break
								}
								if (linkTextArr[0]) {
									let linkText = `${linkTextArr[0]} ${linkTextArr[1]}`
									linkHTML= `(<span class='sclinktext'>${linkText}</span>)`
								}
							}
							let quoteHTML =`${scRefHTML}<br><h3>${sesameData[i].sesame} ${linkHTML}</h3><p>${quoteData[blurbKey]}</p>`
							el.insertAdjacentHTML("afterend", `<div class=opensesame>${quoteHTML}</div>`);
							el.classList.add('closebutton')
						}
						fetch(fetchPath)
						.then(response => response.json())
						.then (data => populateQuote(data))
						.catch(error => {
							console.log(`${error}ERROR: Can't fetch ${fetchPath}`);
						}
					);
					} else
					if ((sesameData[i].type == 'suttaplex') || (sesameData[i].type == 'sutta')) {
						let strippedSCRef = sesameData[i].file.replace(/\s+/g, '').toLowerCase()
						let scRefHTML = ''
						if (sesameData[i].type == 'sutta') {
							scRefHTML = `<span class="sclinktext">${(sesameData[i].file)}</span>`
						} else {
 							scRefHTML = `<a class="extlink" href="https://suttacentral.net/${(sesameData[i].file)}"><br>source: <img src='../_resources/images/icons/sc-icon.png' style='width:1em; position:relative; top:0.2em;' alt="SuttaCentral Logo">SuttaCentral</a>`;
 						}

						function doSCAPI(scData) {
							el.insertAdjacentHTML("afterend", `<div class=opensesame><h3>${scData[0].translated_title} (${scData[0].original_title}) ${scRefHTML}</h3>${scData[0].blurb}</div>`);
							el.classList.add('closebutton')
						}
						fetch(`https://suttacentral.net/api/suttaplex/${strippedSCRef}`)
						.then(response => response.json())
						.then (data => doSCAPI(data))
						.catch(error => {
							console.log(`${error}ERROR: Can't fetch https://suttacentral.net/api/suttaplex/${strippedSCRef}`);
						});		
						
					}  else