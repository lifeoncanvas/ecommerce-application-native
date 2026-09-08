const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  try {
    console.log('Navigating to http://localhost:8081...');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('Page loaded.');
    
    // Give it a second to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Looking for Profile tab...');
    // We can just find the text "Profile" in a tab button and click it
    const tabs = await page.$$('div');
    let clicked = false;
    
    // Evaluate in page to find the Profile tab and click it
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (let el of elements) {
        if (el.textContent === 'Profile' && el.getAttribute('role') === 'button') {
          console.log('Found Profile button, clicking...');
          el.click();
          return true;
        }
      }
      return false;
    });

    console.log('Waiting 3 seconds after click...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('Done.');

  } catch (err) {
    console.log('Error during puppeteer run:', err);
  } finally {
    await browser.close();
  }
})();
