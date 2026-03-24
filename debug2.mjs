import { chromium } from 'playwright'

const BASE_URL = 'https://twitter-clone-pearl-two.vercel.app'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    // Login
    await page.goto(BASE_URL)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    
    const usernameField = await page.$('input[name="username"]')
    if (usernameField) {
      console.log('Found login form')
      await usernameField.fill('reze')
      const pwField = await page.$('input[name="password"]')
      if (pwField) {
        await pwField.fill('testpass123')
        const submitBtn = await page.$('button[type="submit"]')
        if (submitBtn) {
          await submitBtn.click()
          console.log('Clicked submit')
          await page.waitForTimeout(5000)
        }
      }
    }
    
    // Now check what's on the page
    console.log('URL after login:', page.url())
    
    // Wait for hydration
    await page.waitForTimeout(3000)
    
    // Get text content
    const bodyText = await page.evaluate(() => document.body.innerText)
    console.log('Body text:', bodyText.slice(0, 500))
    
    // Check for textarea
    const ta = await page.$('textarea')
    console.log('Textarea found:', !!ta)
    
    // Check for all buttons
    const buttons = await page.$$('button')
    console.log('Buttons found:', buttons.length)
    for (const btn of buttons.slice(0, 5)) {
      const text = await btn.textContent()
      console.log('  Button:', text?.trim().slice(0, 50))
    }
    
    await page.screenshot({ path: '/tmp/home.png', fullPage: true })
    console.log('Screenshot saved')
    
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await browser.close()
  }
}

main()
