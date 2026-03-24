import { chromium } from 'playwright'

const BASE_URL = 'https://twitter-clone-pearl-two.vercel.app'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    // Login
    console.log('1. Going to site...')
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    // Fill and submit login
    console.log('2. Filling login form...')
    await page.fill('input[name="username"]', 'reze4')
    await page.fill('input[name="password"]', 'pass1234')
    console.log('3. Clicking submit...')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)
    console.log('4. URL after submit:', page.url())
    
    // Check cookies
    const cookies = await page.context.cookies()
    console.log('5. Cookies:', JSON.stringify(cookies.map(c => ({ name: c.name, value: c.value.slice(0, 20) }))))
    
    // Check session via page context
    const sessionText = await page.evaluate(async (url) => {
      const res = await fetch(url + '/api/auth/session')
      return await res.json()
    }, BASE_URL)
    console.log('6. Session:', JSON.stringify(sessionText))
    
    // Try posting via page context
    console.log('7. Trying to post tweet...')
    const postResult = await page.evaluate(async (url) => {
      const res = await fetch(url + '/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Test from page.evaluate!' }),
        credentials: 'include'
      })
      return { status: res.status, ok: res.ok }
    }, BASE_URL)
    console.log('8. Post result:', JSON.stringify(postResult))
    
    // Try navigating to home and check
    console.log('9. Navigating to home...')
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    const homeText = await page.evaluate(() => document.body.innerText.slice(0, 200))
    console.log('10. Home page text:', homeText)
    
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await browser.close()
  }
}

main()
