// Function to load and inject HTML content into an element using Fetch API
function loadHTML(url, elementId) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(htmlContent => {
            document.getElementById(elementId).innerHTML = htmlContent;
        })
        .catch(error => {
            console.error(error);
        });
}

// Load header content
loadHTML('/static/html/header.html', 'header');

// Load footer content
loadHTML('/static/html/footer.html', 'footer');



  // Function to load and inject HTML content into an element using Fetch API
  async function loadHTML(url, elementId) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      }

      const htmlContent = await response.text();
      document.getElementById(elementId).innerHTML = htmlContent;

      // After loading HTML content, you can attach event listeners or perform other tasks here
      setupHeader();
    } catch (error) {
      console.error(error);
    }
  }

  // Function to set up event listeners and functionality for the header
  function setupHeader() {
    const navbarToggleButton = document.querySelector('button[data-collapse-toggle="navbar-sticky"]');
    const navbarMenu = document.getElementById('navbar-sticky');

    // Add a click event listener to the toggle button
    navbarToggleButton.addEventListener('click', () => {
      // Toggle the "hidden" class on the navbar menu to show/hide it
      navbarMenu.classList.toggle('hidden');

      // Update the aria-expanded attribute of the toggle button
      navbarToggleButton.setAttribute('aria-expanded', navbarMenu.classList.contains('hidden') ? 'false' : 'true');

      // Log a message to the console
      console.log('Navbar toggle button clicked!');
    });
  }

  // Load header content with a delay of 5 seconds
  setTimeout(() => {
    loadHTML('/static/html/header.html', 'header');
  }, 5000);

  // Load footer content
  loadHTML('/static/html/footer.html', 'footer');
