import { chromium } from 'playwright'

const BASE_URL = 'https://twitter-clone-pearl-two.vercel.app'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    // Login
    const usernameInput = await page.$('input[name="username"]')
    const passwordInput = await page.$('input[name="password"]')
    
    if (usernameInput && passwordInput) {
      await usernameInput.fill('reze')
      await passwordInput.fill('testpass123')
      const submitBtn = await page.$('button[type="submit"]')
      await submitBtn.click()
      await page.waitForTimeout(3000)
      console.log('Logged in')
    }
    
    // Go to home
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Debug: list all textareas
    const textareas = await page.$$('textarea')
    console.log('Found textareas:', textareas.length)
    
    // Check all inputs
    const inputs = await page.$$('input')
    console.log('Found inputs:', inputs.length)
    
    // Get page content snippet
    const body = await page.textContent('body')
    console.log('Body text (first 300 chars):', body?.slice(0, 300))
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/debug.png', fullPage: true })
    console.log('Screenshot saved to /tmp/debug.png')
    
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await browser.close()
  }
}

main()
