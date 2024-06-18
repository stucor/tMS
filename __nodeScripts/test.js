const { exec } = require('child_process'); 
 
exec('pandoc --from docx+styles C:/Data/tMS/books/_resources/book-data/milk/milk.docx -s --toc -o C:/Data/tMS/books/_resources/book-data/milk/pandoc.html --wrap=none', 
(error, stdout, stderr) => { 
  if (error) { 
    console.error(`Error: ${error.message}`); 
    return; 
  } 
  if (stderr) { 
    console.error(`stderr: ${stderr}`); 
    return; 
  } 
  console.log(`pandoc.html created sucessfully`); 
}); 