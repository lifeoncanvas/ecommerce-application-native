const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    console.log('Navigating to http://localhost:8081...');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('Page loaded.');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Clicking Profile tab as Guest...');
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (let el of elements) {
        if (el.textContent === 'Profile' && el.getAttribute('role') === 'button') {
          el.click();
        }
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Clicking Sign Out of Account...');
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (let el of elements) {
        if (el.textContent === 'Sign Out of Account') {
          el.click();
        }
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Filling login form...');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      if(inputs.length >= 2) {
         // Assuming first is email, second is password
         inputs[0].focus();
         document.execCommand('insertText', false, 'sharonshelke1@gmail.com');
         
         inputs[1].focus();
         document.execCommand('insertText', false, 'password123'); // Assuming valid pass or fake pass that bypasses locally
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Clicking Sign In...');
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (let el of elements) {
        if (el.textContent === 'Sign In' && el.getAttribute('role') === 'button') {
          el.click();
        }
      }
    });

    await new Promise(resolve => setTimeout(resolve, 4000));

    console.log('Clicking Profile tab again (now logged in)...');
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (let el of elements) {
        if (el.textContent === 'Profile' && el.getAttribute('role') === 'button') {
          el.click();
        }
      }
    });

    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('Done.');

  } catch (err) {
    console.log('Error during puppeteer run:', err);
  } finally {
    await browser.close();
  }
})();
