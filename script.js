
const biome = document.getElementById("biome_input");
// Add an input event listener for biome input
biome.addEventListener("change", (event) => {
    const result = document.getElementById('biome');
    result.textContent = `${event.target.value}`;
});

const age = document.getElementById("age_input");
// Add an input event listener for age input
age.addEventListener("change", (event) => {
    const result = document.getElementById('age');
    result.textContent = `${event.target.value}`;
});

const root = document.getElementById("roots_input");
// Add an input event listener for root input
root.addEventListener("change", (event) => {
    const result = document.getElementById('roots');
    result.textContent = `${event.target.value}`;
});

const nut_source = document.getElementById("nut_source_input");
// Add an input event listener for nutrient source input
nut_source.addEventListener("change", (event) => {
    const result = document.getElementById('nut_source');
    result.textContent = `${event.target.value}`;
});

const notes = document.getElementById("notesInput");
// Add an input event listener for notes input
notes.addEventListener("change", (event) => {
    const result = document.getElementById('notes');
    result.textContent = `${event.target.value}`;
});

const primaryResource = document.getElementById("element_primary_input");
// Add an input event listener for primary resource input
primaryResource.addEventListener("change", (event) => {
    const result = document.getElementById('element_primary');
    result.textContent = `${event.target.value}`;
});

const secondaryResource = document.getElementById("element_secondary_input");
// Add an input event listener for secondaryr esource input
secondaryResource.addEventListener("change", (event) => {
    const result = document.getElementById('element_secondary');
    result.textContent = `${event.target.value}`;
});

// Function to process the uploaded image and perform OCR on the grayscale cropped area
function processImage(imageNumber) {
    const imageInput = document.getElementById(`imageInput${imageNumber}`);
    const outputDiv = document.getElementById(`output${imageNumber}`);
    const imagePreviewDiv = document.getElementById(`imagePreview${imageNumber}`);
    if (imageNumber === 1) {
        var loader = document.getElementById('loaderOne');
        outputDiv.style.display = 'block'; // Show output1 div
    } else {
        var loader = document.getElementById('loaderTwo');
        outputDiv.style.display = 'block'; // Show output2 div
    }
    const file = imageInput.files[0];

    if (!file) {
        console.error(`Please select an image for Image ${imageNumber}.`);
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const image = new Image();
        image.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            loader.style.display = 'block'; // Show loader while processing

            // Define cropping coordinates for each image 
            let startX, startY, endX, endY;

            // Coordinates for Nintendo Switch Screenshots
            if (image.width == 1280){
                if (imageNumber === 1) {
                    startX = 125;
                    startY = 190;
                    endX = 275;
                    endY = 375;
                } else if (imageNumber === 2) {
                    // Start: (116, 359), End: (414, 484)
                    startX = 240;
                    startY = 290;
                    endX = 400;
                    endY = 425;
                }
            // Coordinates for 1920x1080 Screenshots    
            } else if (image.width == 1920){
                if (imageNumber === 2) {
                    startX = 300;
                    startY = 470;
                    endX = 500;
                    endY = 625;
                }
            }

            // Get the cropped area of the image based on coordinates
            const croppedImage = ctx.getImageData(startX, startY, endX - startX, endY - startY);
            canvas.width = endX - startX;
            canvas.height = endY - startY;
            ctx.putImageData(croppedImage, 0, 0);

            // Convert the cropped area to grayscale
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;
                data[i + 1] = avg;
                data[i + 2] = avg;
            }
            ctx.putImageData(imageData, 0, 0);

            // Perform OCR on the grayscale cropped area of the image using Tesseract.js
            Tesseract.recognize(canvas, 'eng', { logger: m => console.log(m) })
                .then(({ data: { text } }) => {
                    // Remove newlines from the OCR output
                    const processedText = text.replace(/\n/g, ' ');

                    // Filter the OCR output text to only contain letters, numbers, commas, periods, and dashes
                    const filteredText = processedText.replace(/[^A-Za-z0-9,. -]/g, '');

                    // Hide loader after processing
                    loader.style.display = 'none';
                    // Display the filtered OCR output text as editable
                    outputDiv.innerHTML = `<pre contenteditable="true">${filteredText}</pre>`;
                })
                .catch(error => {
                    console.error('Error:', error);
                    loader.style.display = 'none'; // Hide loader on error
                    outputDiv.innerHTML = '<p>Error performing OCR. Please try again.</p>';
                });

            // Display the cropped grayscale area in the image preview
            imagePreviewDiv.innerHTML = '';
            const previewImg = new Image();
            previewImg.style.maxWidth = '100%';
            previewImg.src = canvas.toDataURL('image/jpeg');
            imagePreviewDiv.appendChild(previewImg);
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function addOcrTextToForm() {

    // Get text from OCR output
    const outputDiv = document.getElementById(`output2`);
    const output = outputDiv.textContent;

    fetch('floraData.json')
        .then(response => response.json())
        .then(floraDatalists => {
            
            const valuesFoundInOutput = [];
            const phrases = Object.values(floraDatalists).flat();

            for (let i = 0; i < output.length; i++) {
                for (let j = i + 1; j <= output.length; j++) {
                    const substring = output.substring(i, j);
                    if (phrases.includes(substring)) {
                        valuesFoundInOutput.push(substring);
                    }
                }
            }

            var age = 'no age';
            var notes = 'no notes';
            var nutSource = 'no nutSource';
            var roots = 'no roots';
            var primaryResource = 'no primaryResource';
            var secondaryResource = 'no secondaryResource';
            var isTwoResources = false;

            for (i in valuesFoundInOutput) {

                if (valuesFoundInOutput.length > 2){                                       
                    // AGE  
                    if (floraDatalists['ageData'].includes(valuesFoundInOutput[i])) {
                        var age = valuesFoundInOutput[i]; 
                    } 
                    // NOTES
                    else if (floraDatalists['floraNotesData'].includes(valuesFoundInOutput[i])) {
                        var notes = valuesFoundInOutput[i];
                    }
                    // NUT SOURCE
                    else if (floraDatalists['nutSourceData'].includes(valuesFoundInOutput[i])) {
                        var nutSource = valuesFoundInOutput[i];
                    }
                    // ROOTS
                    else if (floraDatalists['rootData'].includes(valuesFoundInOutput[i])) {
                        var roots = valuesFoundInOutput[i];
                    }
                    // PRIMARY RESOURCE AND SECONDARY RESOURCE
                    else if (floraDatalists['floraResources'].includes(valuesFoundInOutput[i])) {
                        if (isTwoResources == false) {
                            var primaryResource = valuesFoundInOutput[i];
                            var isTwoResources = true;
                        }
                        else if (isTwoResources == true) {
                            var secondaryResource = valuesFoundInOutput[i];
                        }
                    }   
                } 
            }
            if (age != 'no age') {
                document.getElementById('age_input').value = age;
                document.getElementById('age').value = age;
            }
            if (nutSource != 'no nutSource') {
                document.getElementById('nut_source_input').value = nutSource;
                document.getElementById('nut_source').value = nutSource;
            }
            if (roots != 'no roots') {
                document.getElementById('roots_input').value = roots;
                document.getElementById('roots').value = roots;
            }
            if (notes != 'no notes') {
                document.getElementById('notesInput').value = notes;
                document.getElementById('notes').value = notes;
            }
            if (primaryResource != 'no primaryResource') {
                document.getElementById('element_primary_input').value = primaryResource;
                document.getElementById('element_primary').value = primaryResource;
            }
            if (secondaryResource != 'no secondaryResource') {
                document.getElementById('element_secondary_input').value = secondaryResource;
                document.getElementById('element_secondary').value = secondaryResource;
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}