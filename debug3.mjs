import { chromium } from 'playwright'

const BASE_URL = 'https://twitter-clone-pearl-two.vercel.app'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    await page.fill('input[name="username"]', 'reze4')
    await page.fill('input[name="password"]', 'pass1234')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(6000)
    
    // Check session more carefully
    const sessionResult = await page.evaluate(async (url) => {
      const res = await fetch(url + '/api/auth/session')
      const data = await res.json()
      return data
    }, BASE_URL)
    console.log('Session:', JSON.stringify(sessionResult))
    
    // Check if page is showing the logged-in state
    const html = await page.evaluate(() => document.body.innerHTML.slice(0, 500))
    console.log('HTML snippet:', html)
    
    // Try the tweet API directly
    const tweetResult = await page.evaluate(async (url) => {
      const res = await fetch(url + '/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Quick test tweet' }),
      })
      const text = await res.text()
      return { status: res.status, body: text.slice(0, 100) }
    }, BASE_URL)
    console.log('Tweet result:', JSON.stringify(tweetResult))
    
    // Check cookies before post
    const cookies = await page.context.cookies(BASE_URL)
    console.log('Cookies:', cookies.map(c => ({ name: c.name, httpOnly: c.httpOnly, sameSite: c.sameSite })))
    
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await browser.close()
  }
}

main()
