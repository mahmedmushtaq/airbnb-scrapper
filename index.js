const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const sampleProject = {
  guests: 1,
  bedrooms: 1,
  beds: 2,
  baths: 3,
  dollarPerNight: 2,
};

const url =
  'https://www.airbnb.com/s/Other-International/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&location_search=NEARBY&checkin=2020-09-04&checkout=2020-09-05&adults=2&source=structured_search_input_header&search_type=pagination&map_toggle=false&federated_search_session_id=24ead6d2-1dcb-48d6-ae55-167253f05446&place_id=ChIJJ2fFkY9cNzkRPkv15sraR8o&items_offset=20&section_offset=5';
//https://www.airbnb.com/s/Other-International/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&location_search=NEARBY&checkin=2020-09-04&checkout=2020-09-05&adults=2&source=structured_search_input_header&search_type=pagination&map_toggle=false&federated_search_session_id=24ead6d2-1dcb-48d6-ae55-167253f05446&place_id=ChIJJ2fFkY9cNzkRPkv15sraR8o&items_offset=20&section_offset=5

let browser;

async function scrapeHomeIntoIndexPage(url) {
  try {
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const homes = $('[itemprop="url"]')
      .map((i, element) => {
        const rawContent = $(element).attr('content');
        return rawContent.replace('null', 'https://www.airbnb.com');
      })
      .get();

    return homes;
  } catch (err) {
    console.error(err);
  }
}

async function scrapeDescriptionPage(url, page) {
  try {
    await page.waitFor(1000); // 1sec delay for each page
    await page.goto(url, { waitUntil: 'networkidle2' }); // wait for until element is loading
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    const pricePerNight = $(
      '#site-content > div > div > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div > span > span'
    ).text();

    const siteContent = $('#site-content').text();
    const guestAllowed = matchResult(siteContent,/\d+ guest/);
    const bedrooms = matchResult(siteContent,/\d+ bedroom/)
    const bed = matchResult(siteContent,/\d+ bed/)
    
    console.log({
      url,
      guestAllowed,
      bedrooms,
      bed
    })


  




  } catch (err) {
    console.error(err);
  }
}

const matchResult = (siteCotent, regex) => {
  const matchRegex = siteCotent.match(regex);
  return matchRegex ? matchRegex[0] : 'N/A';
};

async function main() {
  browser = await puppeteer.launch({ headless: false });
  const homes = await scrapeHomeIntoIndexPage(url);
  const descriptionPage = await browser.newPage();

  for (let i = 0; i < homes.length; i++) {
    await scrapeDescriptionPage(homes[i], descriptionPage);
  }
}

main();
