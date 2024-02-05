const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);

async function scrapeAndSaveQuestions(subject, baseUrl, totalPages) {
  const questions = [];

  for (let pageIndex = 1; pageIndex <= totalPages; pageIndex++) {
    const pageURL = `${baseUrl}index-${pageIndex}.html`;
    const response = await axios.get(pageURL);
    const $ = cheerio.load(response.data);

    // Extracting questions from the table, excluding "Previous" and "Next" links
    $('.w6-table-all td a.BL').each((index, element) => {
      const questionText = $(element).text().trim();
      questions.push(questionText);
    });
  }

  // Save questions to a text file
  const subjectFolder = `./12/${subject}`;
  await fs.promises.mkdir(subjectFolder, { recursive: true });
  await fs.promises.writeFile(`${subjectFolder}/questions.txt`, questions.join('\n'), 'utf-8');

  console.log(`Questions for ${subject} successfully scraped and saved to ${subjectFolder}/questions.txt.`);
}

async function processTableFile(filePath) {
  try {
    console.log('Reading the HTML table file...');
    const tableHTML = await readFileAsync(filePath, 'utf-8');
    const $ = cheerio.load(tableHTML);
    const subjects = [];

    // Extract subject information from the table
    $('table tr').each((index, element) => {
      if (index > 0) {
        const tds = $(element).find('td');
        const subject = tds.eq(0).text().trim();
        const baseUrl = tds.eq(1).text().trim();
        const totalPages = parseInt(tds.eq(2).text().trim(), 10);
        subjects.push({ subject, baseUrl, totalPages });
      }
    });

    // Scrape and save questions for each subject
    console.log('Processing and scraping questions for each subject...');
    for (const { subject, baseUrl, totalPages } of subjects) {
      console.log(`Scraping questions for ${subject}...`);
      await scrapeAndSaveQuestions(subject, baseUrl, totalPages);
    }

    console.log('Process completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example usage: pass the file path of the table HTML
const tableFilePath = './.main/table.html';
processTableFile(tableFilePath);
