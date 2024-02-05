const fs = require('fs');
const util = require('util');
const path = require('path');
const { JSDOM } = require('jsdom');

const subjectsDirectory = './12';
const sitemapDirectory = './sitemap';
const baseURL = 'https://ans.easycalculator.net';

// Create the sitemap directory if it doesn't exist
if (!fs.existsSync(sitemapDirectory)) {
  fs.mkdirSync(sitemapDirectory);
}

// Function to generate individual subject sitemaps
async function generateSubjectSitemap(subjectName, links) {
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${links.map(link => `<url><loc>${baseURL}${link}</loc></url>`).join('\n')}
</urlset>`;

  const sitemapPath = path.join(sitemapDirectory, `${subjectName.toLowerCase()}.xml`);

  try {
    await util.promisify(fs.writeFile)(sitemapPath, sitemapContent, 'utf-8');
    console.log(`Generated sitemap for ${subjectName} at ${sitemapPath}`);
  } catch (writeError) {
    console.error(`Error writing sitemap file for ${subjectName}:`, writeError.message);
  }
}

// Function to generate main sitemap linking all subject sitemaps
async function generateMainSitemap(subjects) {
  const links = subjects.map(subject => `/sitemap/${subject.toLowerCase()}.xml`);

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${links.map(link => `<sitemap><loc>${baseURL}${link}</loc></sitemap>`).join('\n')}
</sitemapindex>`;

  const mainSitemapPath = path.join(sitemapDirectory, 'sitemap.xml');

  try {
    await util.promisify(fs.writeFile)(mainSitemapPath, sitemapContent, 'utf-8');
    console.log(`Generated main sitemap at ${mainSitemapPath}`);
  } catch (writeError) {
    console.error('Error writing main sitemap file:', writeError.message);
  }
}

// Function to read links from subject index.html files
async function extractLinksFromSubject(subjectName) {
  const subjectDirectory = path.join(subjectsDirectory, subjectName.toLowerCase());
  const indexPath = path.join(subjectDirectory, 'index.html');

  try {
    const indexContent = await util.promisify(fs.readFile)(indexPath, 'utf-8');
    const dom = new JSDOM(indexContent);
    const links = Array.from(dom.window.document.querySelectorAll('a')).map(a => a.getAttribute('href'));

    return links;
  } catch (readError) {
    console.error(`Error reading index file for ${subjectName}:`, readError.message);
    return [];
  }
}

// Function to process all subjects and generate sitemaps
async function generateSitemapsForAllSubjects() {
  try {
    const subjects = fs.readdirSync(subjectsDirectory);

    for (const subject of subjects) {
      const subjectName = subject.replace(/\.html$/, '');
      const links = await extractLinksFromSubject(subjectName);
      await generateSubjectSitemap(subjectName, links);
    }

    await generateMainSitemap(subjects);

    console.log('Sitemap generation completed.');
  } catch (error) {
    console.error('Error generating sitemaps:', error.message);
  }
}

generateSitemapsForAllSubjects();
