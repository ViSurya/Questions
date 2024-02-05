const fs = require('fs');
const path = require('path');

const inputFolderPath = './question'; // Change this to your actual folder path
const outputFolderPath = './question'; // Change this to your desired output folder

// Function to remove numbers from the beginning of each line
const removeNumbers = (text) => {
  return text.replace(/^\d+\.\s*/, '');
};

// Function to process a single file
const processFile = (folderName, filePath) => {
  const outputFileName = `${folderName}.txt`;
  const outputFilePath = path.join(outputFolderPath, outputFileName);

  const content = fs.readFileSync(filePath, 'utf-8');
  const modifiedContent = content.split('\n').map(removeNumbers).join('\n');

  fs.writeFileSync(outputFilePath, modifiedContent, 'utf-8');
};

// Function to process all files in a folder
const processFolder = (folderPath) => {
  const folderName = path.basename(folderPath);

  const files = fs.readdirSync(folderPath);

  // Look for a file with a name containing "question"
  const questionFile = files.find((file) => file.toLowerCase().includes('question'));

  if (questionFile) {
    const filePath = path.join(folderPath, questionFile);
    processFile(folderName, filePath);
    console.log(`Questions for ${folderName} successfully processed.`);
  } else {
    console.log(`No questions file found for ${folderName}.`);
  }
};

// Create output folder if it doesn't exist
if (!fs.existsSync(outputFolderPath)) {
  fs.mkdirSync(outputFolderPath);
}

// Start processing files
fs.readdirSync(inputFolderPath).forEach((folderName) => {
  const folderPath = path.join(inputFolderPath, folderName);
  const stat = fs.statSync(folderPath);

  if (stat.isDirectory()) {
    processFolder(folderPath);
  }
});

console.log('Files processed successfully!');
