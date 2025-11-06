






						let localFootnotes = ``;
						try {
							const data = fs.readFileSync('../_resources/book-data/'+bookID+'/'+'footnotes.json', 'utf8');
							localFootnotes = JSON.parse(data);
						} catch (err) {
							console.error(err);
						}

						for (let i in localFootnotes) {
							let currentfnNumber = localFootnotes[i].fnNumber
							let currentfnHTMLRoot = parse(localFootnotes[i].fnHTML)

							let allSpans = currentfnHTMLRoot.querySelectorAll('span')

							for (i in allSpans) {
								if ((allSpans[i].classNames == 'anchor')) {
									console.log(anchors[i].id+'::'+currentfnNumber+'::'+target+'::'+allSpans[i].id)
								}
							}

						}




//console.log(target);		