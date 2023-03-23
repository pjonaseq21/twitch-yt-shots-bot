const  puppeteer = require("puppeteer");

const firefoxOptions = {
    executablePath: "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
    dumpio: true,
    devtools: true,
    headless: "false"

  };
async function pupet(){
    const browser = await puppeteer.launch(firefoxOptions);
      const page = await browser.newPage();
  
      await page.goto('https://www.youtube.com/');


      const cookiesAccept = "#content > div.body.style-scope.ytd-consent-bump-v2-lightbox > div.eom-buttons.style-scope.ytd-consent-bump-v2-lightbox > div:nth-child(1) > ytd-button-renderer:nth-child(1) > yt-button-shape > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill"
      await page.waitForSelector(cookiesAccept)
      await page.click(cookiesAccept)

      const logIn = "#buttons > ytd-button-renderer > yt-button-shape > a > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill"
      await page.waitForSelector(logIn)
      await page.click(logIn)

     const emailInput = "#identifierId"
     await page.waitForSelector(emailInput)
     await page.click(emailInput)
     await page.type("g-chamula@wp.pl")
     const logInEmail = "#identifierNext > div > button > div.VfPpkd-RLmnJb"
     await page.click(logInEmail)

      await page.setViewport({width: 1500, height: 1024});
  
      // Type into search box
     
  }
  module.exports = { pupet };
