import { chromium } from 'playwright'

const BASE_URL = 'https://twitter-clone-pearl-two.vercel.app'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    // Login via the form - this will create the account if not exists
    // But we need a password-protected account
    // Let me check if there's a register page
    console.log('Navigating to home...')
    await page.goto(BASE_URL)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    
    // Try to find a register link
    const registerLink = await page.$('a[href*="register"], a[href*="sign-up"], button:has-text("Register"), button:has-text("Sign up")')
    console.log('Register link:', !!registerLink)
    
    // Check for password input in login form
    const passwordInput = await page.$('input[name="password"]')
    const usernameInput = await page.$('input[name="username"]')
    
    if (usernameInput && passwordInput) {
      console.log('Found login form, trying to register/sign in "reze2"...')
      await usernameInput.fill('reze2')
      await passwordInput.fill('testpass123')
      const submitBtn = await page.$('button[type="submit"]')
      if (submitBtn) {
        await submitBtn.click()
        await page.waitForTimeout(3000)
      }
      console.log('Submitted')
    }
    
    // Check the result
    console.log('URL:', page.url())
    const bodyText = await page.evaluate(() => document.body.innerText)
    console.log('Body:', bodyText.slice(0, 400))
    
    // Now try to post via API
    // First get CSRF
    const csrfRes = await page.request.get(BASE_URL + '/api/auth/csrf')
    const csrfData = await csrfRes.json()
    console.log('CSRF token:', csrfData.csrfToken)
    
    // Sign in
    const loginRes = await page.request.post(BASE_URL + '/api/auth/callback/credentials', {
      form: {
        csrfToken: csrfData.csrfToken,
        username: 'reze2',
        password: 'testpass123',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
    console.log('Login status:', loginRes.status())
    console.log('Login URL:', loginRes.url())
    
    // Check session
    const sessionRes = await page.request.get(BASE_URL + '/api/auth/session')
    const sessionData = await sessionRes.json()
    console.log('Session:', JSON.stringify(sessionData))
    
    // Now try posting a tweet
    if (sessionData?.user) {
      console.log('Logged in as:', sessionData.user.name)
      
      const tweetRes = await page.request.post(BASE_URL + '/api/tweets', {
        data: { content: 'Test tweet from API! 🐭' },
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('Tweet status:', tweetRes.status())
      if (tweetRes.ok()) {
        const tweet = await tweetRes.json()
        console.log('Tweet posted! ID:', tweet.id)
      }
    }
    
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await browser.close()
  }
}

main()
