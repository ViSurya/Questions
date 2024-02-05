const fs = require('fs');
const util = require('util');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const API_KEY = "AIzaSyAneUeoqoTILntpO8c1MSDlj4ESvkmGS2s";
const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = "gemini-pro";
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
  temperature: 0.1,
  topK: 1,
  topP: 1,
  maxOutputTokens: 1024,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

function createUrlFromQuestion(question) {
  const cleanedQuestion = question.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
  return cleanedQuestion.replace(/^[\d_]+/g, '');
}

// Function to truncate a string to a specified length
function truncateString(str, maxLength) {
  if (str.length > maxLength) {
    return str.substring(0, maxLength);
  }
  return str;
}
async function generateAnswer(question, subject, index) {
  try {
    const prompt = [
      {
        "role": "user",
        "parts": [
          {
            "text": `Generate a comprehensive and accurate answer for the following Class 12 ${subject} Advance question. Ensure that your response is presented in an easy-to-understand English tone suitable for students. Align your answer with the content found in Class 12 ${subject} books commonly used in Indian schools, strictly adhering to the NCERT or CBSE curriculum. Utilize HTML tags appropriately, such as <div id='answer'>, and provide a well-structured response within 3-5 sentences, incorporating HTML tags like <p> paragraphs. Feel free to extend the answer as needed, considering the format of Class 12 examinations and the educational standards set by the NCERT or CBSE books.`
          },
          { "text": `Subject: ${subject} Advance` },
          { "text": `Class: 12` },
          { "text": `Country: India` },
          { "text": `Board: NCERT or CBSE` },
          { "text": `Question: ${question}` },
          { "text": `Note: You can enhance the response with styling using Tailwind CSS classes. In this example, Tailwind CSS v3 is used for styling. For reference, use classes such as <p class="mb-3 text-gray-500 dark:text-gray-400">, <ol class="ps-5 mt-2 max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">, <li class="mb-2">, <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 overflow-x-auto">, <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">, <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">, and more based on your styling needs. Use tables for difference questions for better structure.` },
          { "text": `Please use an easy English tone to make the answer accessible and understandable for students.`},
          { "text": `And please don't add lists unless absolutely necessary. Primarily use paragraphs, but you can use any HTML tags to structure the answer.` },
          { "text": `For mathematical calculations and equations, ensure to use MathJax version 2.7.1. Use proper HTML tags for mathematical equations, utilizing MathJax for rendering. For numerical questions, solve step by step with a beautiful design, error-free MathJax, and provide clear explanations.` },
          { "text": `Note: These questions are for students, so provide concise answers according to the exam pattern. Ensure the answer is in theory, in 3-5 sentences, and completes in one paragraph. If the answer has equations and formulas, you can extend, and remember to use proper MathJax version 2.7.1. You can add more detailed content if necessary, such as using tables with borders for differences, employing Tailwind CSS classes for proper styling.` },
          { "text": `Remember to ensure that answers are in accordance with the books used in Indian schools, accurate, and if needed, expand the answer with proper HTML tags for a clear and professional structure for Indian board exams` },
          { "text": `MathJax Example: $$\sum_{i=0}^n i^2 = \frac{(n^2+n)(2n+1)}{6}$$ For proper reference, use this guide [MathJax Basic Tutorial and Quick Reference](https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference)` },
          { "text": `Note: if use table so make usre in top add heading <th> and make responsive using tailwindcss classes for short screens `}
        ]
      }
    ];




    let result;
    let attempt = 0;

    do {
      try {
        result = await model.generateContent({
          contents: prompt,
          generationConfig,
          safetySettings,
        });
      } catch (error) {
        attempt++;
        console.error(`Error generating answer (Attempt ${attempt}):`, error.message);

        if (attempt >= 3) {
          console.error(`Max attempts reached. Skipping question: "${question}"`);
          return null;
        }

        // Wait for a moment before retrying
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } while (!result);

    return {
      question,
      subject,
      answer: result.response.text(),
      index,
    };
  } catch (error) {
    console.error('Error generating answer:', error.message);
    return null;
  }
}

async function processQuestionsForSubject(subjectFileName) {
  try {
    const answersFolder = `./answers`;
    if (!fs.existsSync(answersFolder)) {
      fs.mkdirSync(answersFolder, { recursive: true });
    }

    const subjectName = subjectFileName.replace(/\.txt$/, ''); // Extract subject name from file name

    console.log(`Processing questions for ${subjectName}...`);

    const filePath = `./questions/${subjectFileName}`;

    const questions = await util.promisify(fs.readFile)(filePath, 'utf-8');
    const questionList = questions.split('\n');

    const allLinks = [];
    let pageCounter = 0;

    for (let i = 0; i < questionList.length; i++) {
      const question = questionList[i].trim();

      if (question.length === 0) {
        continue;
      }

      let answer, index;
      try {
        const result = await generateAnswer(question, subjectName, i);
        if (result === null) {
          continue;
        }
        ({ answer, index } = result);
      } catch (error) {
        console.error('Error generating answer:', error.message);
        continue;
      }

      // Ensure the generated HTML file name is not more than 50 characters
      const truncatedFileName = truncateString(createUrlFromQuestion(question), 200);
      const fileName = `${truncatedFileName}`;
      const answerFilePath = `${answersFolder}/${fileName}`;

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${question}</title>
          <script type="text/javascript" src="/static/js/main.js"></script>
          <link rel="stylesheet" href="/static/css/flowbite.min.css">
          <link rel="stylesheet" href="/static/css/style.css">
      </head>
      
      <body class="font-sans bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
          <header id="header">
              <!-- Your header content here -->
          </header>
          <div class="container mx-auto my-8">
              <article class="max-w-2xl mx-auto bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md">
                  <h1 id="question" class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">${question}</h1>
                  <div id="answer" class="prose">
                      ${answer || ''}
                  </div>
              </article>
          </div>
          <footer id="footer">
              <!-- Your footer content here -->
          </footer>
          <script type="text/javascript" src="/static/js/flowbite.min.js"></script>
          <script type="text/javascript" src="/static/js/MathJax.js"></script>
      </body>
      
      </html>
    `;
    
      try {
        // Ensure the required directories exist before attempting to write the file
        const folderPath = `./12/${subjectName.toLowerCase()}`;
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        await util.promisify(fs.writeFile)(answerFilePath, htmlContent, 'utf-8');
        console.log(`Generated HTML answer for question "${question}" at ${answerFilePath}`);
      } catch (writeError) {
        console.error(`Error writing HTML file for question "${question}":`, writeError.message);
        continue;
      }

      const linkContainer = `<div class="w-full max-w-md mx-auto border border-gray-300 p-4 my-4 rounded-md text-center">
      <a href="/answers/${fileName}" class="block font-medium text-blue-600 dark:text-blue-500 hover:underline">${question}</a>
  </div>`;

      allLinks.push(linkContainer);
      pageCounter++;

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate a single index file with links to all answers for the subject
    const indexFilePath = `./12/${subjectName.toLowerCase()}/index`;
    const indexHtmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subjectName} - All Answers</title>
          <script src="/static/js/main.js"></script>
          <link rel="stylesheet" href="/static/css/flowbite.min.css">
          <link rel="stylesheet" href="/static/css/style.css">
      </head>
      
      <body class="font-sans bg-gray-100 flex flex-col min-h-screen">
          <header id="header" class="container mx-auto p-4"><!-- Your header content here --></header>
          <div class="container mx-auto p-4 flex-grow flex flex-col items-center justify-center">
              <h1 class="text-3xl font-bold mb-6">${subjectName} - All Answers</h1>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  ${allLinks.join('')}
              </div>
          </div>
          <footer id="footer" class="container mx-auto p-4"><!-- Your footer content here --></footer>
          <script src="/static/js/flowbite.min.js"></script>
      </body>
      
      </html>
      `;

    try {
      // Ensure the required directories exist before attempting to write the file
      const folderPath = `./12/${subjectName.toLowerCase()}`;
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      await util.promisify(fs.writeFile)(indexFilePath, indexHtmlContent, 'utf-8');
      console.log(`Generated index file for ${subjectName} at ${indexFilePath}`);
    } catch (writeError) {
      console.error(`Error writing index file for ${subjectName}:`, writeError.message);
    }

    console.log(`Processing for ${subjectName} completed.`);
  } catch (error) {
    console.error(`Error processing questions for ${subjectFileName}:`, error.message);
  }
}

async function processAllSubjects() {
  try {
    const questionFiles = fs.readdirSync('./questions');
    for (const subjectFile of questionFiles) {
      await processQuestionsForSubject(subjectFile);
    }

    console.log("Processing completed for all subjects.");
  } catch (error) {
    console.error(`Error processing all subjects:`, error.message);
  }
}

processAllSubjects();
