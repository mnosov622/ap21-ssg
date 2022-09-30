import fs from 'fs';
import path from 'path';
import readline from 'readline';

const dist_path = './dist';

var bookNames = new Array();

export function generateWebsite(inputStr)
{
    // If the 'dist' dir already exists, remove it.
	if (fs.existsSync(dist_path)) {
		fs.rmSync(dist_path, { recursive: true, force: true });
	}

    // If the 'dist' dir doesn't exist, create it.
	if (!fs.existsSync(dist_path)) {
		fs.mkdirSync(dist_path);
	}

    // Get the filename from the full pathname.
    const fileName = path.basename(inputStr);

    // Check whether the filepath is a single file or a folder.
	fs.lstat(inputStr, (err, stats) => {
        // Check for any errors.
		if (err) {
			console.log(err);
			return;
		}
        else {
            // If a folder was specified, parse each file individually.
			if (stats.isDirectory()) {
				fs.readdir(inputStr, (err, files) => {

					files.forEach((oneFile) => {
						if (err) {
							console.log(err);
							return;
						}
                        // If the file is a '.txt' file, call 'readBookFileTxt'
						else if (path.extname(oneFile) == '.txt') {
                            console.log(".txt file found");

							readBookFileTxt(inputStr + '/' + oneFile)
                            .then(function (data) {
								writeBookFile(oneFile, data);
							}).catch(function (err) {
                                console.log(err);
                            });
						}
                        // If the file is an '.md' file, call 'readBookFileMd'
                        else if (path.extname(oneFile) == '.md') {
                            console.log(".md file found");

                            /*readBookFileMd(inputStr + '/' + oneFile).then(function (data) {
                                writeBookFile(oneFile, data);
                            }, function (err) {
                                console.log(err);
                            });*/
                            readBookFileMd(inputStr + '/' + oneFile)
                            .then(function (data) {
                                writeBookFile(oneFile, data);
                            }).catch(function (err) {
                                console.log(err);
                            });
                        }
                        else {
                            console.log("neither .txt nor .md file, cannot parse");
                        }
					});

					generateIndexHtmlFile(files, true);
				});
			}
            // Otherwise, if the filepath was a single file.
            else {
				if (path.extname(fileName) == '.txt') {

					readBookFileTxt(inputStr).then((data) => {
						writeBookFile(fileName, data);
						generateIndexHtmlFile(inputStr);
					});
				}
                else {
                    console.log(".md file found");
                    readBookFileMd(inputStr).then (function (data){
                        writeBookFile(fileName, data);
                    }, function (err){
                        console.log(err);
                    });
                }
			}
		} // end else no errors
	});
}

function makeDistFolder() {
    // If the /dist directory exists, remove the folder and all of its contents
    if ( fs.existsSync(dist_path) )
    {
        fs.rmSync(dist_path, {
            recursive: true,
            force: true
        });
    }

    // Create a new /dist directory, if it does not already exist.
    /* Note: This IF statement may be redundant, since the /dist folder should be deleted 
       by the above code block before execution reaches this line. */
    if ( !fs.existsSync(dist_path) )
    {
        fs.mkdirSync(dist_path);
    }

    return dist_path;
}

// Accepts the name of a file as a string literal. Reads the file line by line and returns a object containing the file's contents.
function readBookFileTxt(filePath) {
    return new Promise(async (res, rej) => {
        let array = [];
        var contents = {
            title: "",
            paragraphs: new Array()
        };
        
        const fileReadStream = readline.createInterface({input: fs.createReadStream(filePath),})

        for await (const line of fileReadStream) {
            if (line != '') {
                array.push(line);
            } else {
                array.push('<br>');
             
            }
        }
          res(array);

        /*
        // variable to track the number of empty lines
        let emptyLines = 0;

        // variable to hold the text before it is set as a paragraph or the title
        let textBlock = "";

        // variable to store a paragraph once it's been completely parsed
        let oneParagraph = "";

        // stores TRUE if the title has been found, FALSE otherwise
        let titleFound = false;

        // Read the file line by line
        lineStr.on("line", (data) => {
            // If the line is empty then increment the empty lines counter
            if (line.length === 0) {
                emptyLines++;
            }
            // If 2 or more consecutive empty lines are found AND the title has NOT been set, then set the title.
            else if (!titleFound && emptyLines === 2)
            {
                // Set the title and set 'titleFound' to TRUE
                contents.title = textBlock;
                titleFound = true;

                // Append the book's title to the 'bookTitles' array
                bookNames.push(textBlock);
                
                // Set 'textBlock' to the next line.
                textBlock = line;

                // Reset the empty lines counter
                emptyLines = 0;
            }
            // If any empty lines are found and the title has already been set then create a new paragraph.
            else if (titleFound && emptyLines > 0 && emptyLines < 2) {
                // Set 'paragraph' to an HTML string containing the completed paragraph in 'textBlock'.
                oneParagraph = `<p>${textBlock}</p>`;

                // Append the completed paragraph to 'contents.paragraphs'
                contents.paragraphs.push(paragraph);

                // Set 'textBlock' to the next line.
                textBlock = line;

                // Reset the empty lines counter
                emptyLines = 0;
            }
            // Otherwise, append the current line to the text block.
            else {
                textBlock += (' ' + line);
            }
        });
    */
      
    });
}

// Accepts the contents of a file as a string literal. Creates an HTML file containing the content.
function writeBookFile(fileName, data) {
    return new Promise( (res, rej) => {
        var htmlFilePath = dist_path + "/" + getFileNameNoExt(fileName) + '.html';
        var body_str = "";
        // getting the error here commented out for now and used mine to test mine .md work
        /*for (let i = 0; i < data.paragraphs.length; i++) {
            if (i > 0) {
                body_str += "<br/>";
            }
            body_str += data.paragraphs[i];
        }
        */
        for (var line of data) {
			if (line !== '\n') {
				body_str += `<p>${line}</p>`;
			} else {
				body_str += '\n';
			}
		}
       // content = htmlTemplateStart + title + htmlTemplateMiddle;
        //content += htmlTemplateEnd;   

        const htmlStr =
            `<!doctype html>
            <html lang="en">
            <head>
            <meta charset="utf-8">
            <title>${data.title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
            <h1>${data.title}</h1>
            ${body_str}
            </body>
            </html>`;

        // Write the html file contents ('htmlStr') to the specified file path
        fs.writeFile(htmlFilePath, htmlStr, (err)=>{
            if (err) {
                console.log(err);
            }
            console.log('file created ' + fileName);
        });

        res(htmlFilePath);
    });
}

// Generates the index.html file.
function generateIndexHtmlFile(books) {
    const indexFilePath = dist_path + "/index.html";
    const indexTitle = "AP21 SSG";

    // Generate the head and the beginning of the body elements for the index.html file.
    var htmlStr = 
    `<!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>${indexTitle}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>`;
    
    // Create an unordered list of hyperlinks for each of the books in the array.
    for (let i=0; i < books.length; i++) {
        htmlStr += 
        `<li><ul>
        <a href="${dist_path}/${books[i]}.html">${books[i]}</a>
        </ul></li>`;
    }
    
    // Finish the html string.
    htmlStr += `</body></html>`;

    // Write the html file contents ('htmlStr') to the specified file path
    fs.writeFile(indexFilePath, htmlStr, (err) => {
        if (err) {
            console.log(err);
        }
        console.log("File created");
    });
}

// Accepts the name of a file as a string literal. Returns TRUE if it is a .txt file, else returns FALSE.
function isTxtFile(fileName) {
    var r = false;

    if (path.extname(fileName) = ".txt") {
        r = true;
    }

    return r;
}

// Accepts the name of a file as a string literal. Returns the filename without the .txt extenstion.
function getFileNameNoExt(fileName) {
    var str = new String();
    str = fileName;
    
    // Get the index of the last '.' char in the filename
    var last_dot = str.lastIndexOf('.');

    // Make a substring from index 0 up to but excluding the char at 'last_dot'
    str.substring(0, last_dot);

    return str;
}

// lab 2 work here
// made the changes on the above functions to make it work with the new lab 2 requirements
// fe bugs in the code, but it works for the most part
// please review my changes

//new function to deal with .md files

function  readBookFileMd(fileName) {
    return new Promise((res, rej) => {
        // create a read stream
        const fileReadStream = fs.createReadStream(fileName, 'utf8');
        // create an array to store the lines
        const array = [];
        // md pattern
        const mdPattern = /\*\*(.*)\*\*/g;
        // read the file line by line
        (async () => {
        for await (const line of fileReadStream)  {
            if (line != '') {
                do {
                    // match the pattern
                    var match = mdPattern.exec(line);
                    if (match) {
                        // push the match to the array
                        console.log(match[1]);
                        array.push(match[1]);
                    }
                } while (match);
            } else {
                // push the line to the array
                array.push(line);
            }
            }
        })();
        res(array);
    });
}