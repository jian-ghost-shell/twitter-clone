import { chromium } from 'playwright'

const BASE_URL = 'https://twitter-clone-pearl-two.vercel.app'

const STORY_TWEETS = [
  `【电锯人 · 城乡鼠记】第一章：邂逅

在一个下着雨的下午，Denji 第一次见到蕾塞。她问他一个奇怪的问题："嘿，Denji，你会选城市的老鼠，还是乡下的老鼠？"

#电锯人 #蕾塞 #城乡鼠记`,

  `【城乡鼠记】第二章：寓言

Angel 告诉 Aki，这是伊索寓言里的故事。

"乡下老鼠虽然贫穷，但过得安稳。城市的老鼠吃得好，却时刻面临被人类和猫杀死的危险。"

Denji 听得一头雾水。

#电锯人 #天使魔人`,

  `【城乡鼠记】第三章：Denji 的答案

"我喜欢城市的老鼠！" Denji 毫不犹豫地回答。

他受够了乡下的贫穷和孤独。城市有好的食物、有梦想、有新的体验。他想尝尝活着的滋味。

#电锯人 #Denji`,

  `【城乡鼠记】第四章：蕾塞的沉默

蕾塞没有立刻回答。她看着窗外的雨，淡淡地说：

"我选乡下老鼠。"

Denji 觉得奇怪——明明蕾塞总是带给他新鲜的刺激，她怎么会选择安稳？

#电锯人 #蕾塞`,

  `【城乡鼠记】第五章：俄罗斯的冬天

没人知道蕾塞的过去。她是苏联的秘密兵器，是炸弹恶魔与人类融合的产物。

她从小被训练、被利用、被抛弃。在冰雪中，她学会了计算每一次呼吸的风险。

#电锯人 #蕾塞 #炸弹魔人`,

  `【城乡鼠记】第六章：危险的交易

蕾塞可以为了任务接近任何人，包括 Denji。她的笑容、她的温柔、她的一切——都可以是武器。

但那天在学校的走廊上，当 Denji 问她在想什么的时候，她的沉默是真的。

#电锯人`,

  `【城乡鼠记】第七章：两种恐惧

乡下老鼠害怕猫。城市老鼠害怕人类。

而蕾塞呢？她最害怕的不是死亡——是她终于鼓起勇气跳出牢笼的那一刻。

她就像那只乡下老鼠，宁愿在安全中重复每一天，也不敢去敲城市的门。

#电锯人 #蕾塞`,

  `【城乡鼠记】第八章：屋顶的对话

蕾塞说："城市的老鼠吃好吃的，但随时可能死掉。乡下老鼠虽然穷，但至少活着。"

Denji 问："那你为什么还来找我？"

她笑了："因为你让我忘了自己是哪只老鼠。"

#电锯人 #蕾塞 #Denji`,

  `【城乡鼠记】第九章：公寓

那晚 Denji 带蕾塞回了自己的公寓。很破旧，但这是他唯一能去的地方。

蕾塞环顾四周，没有嫌弃的表情。她只是轻轻地说：

"这里没有猫。"

#电锯人 #Denji #蕾塞`,

  `【城乡鼠记】第十章：飞机

蕾塞公寓的上空，总有一架飞机飞过。那是苏联追踪她的信号。

无论她逃到哪里，只要还在这片天空下，就永远有人在监视。

城市的老鼠想逃跑，乡下老鼠也想逃跑。但有些笼子，是用命令铸成的。

#电锯人`,

  `【城乡鼠记】第十一章：Makima 出场

Makima 出现了。

她开着白色的车，穿着得体，像一个来接女儿放学的好姐姐。但蕾塞知道她是什么——一个比她更危险的存在。

Makima 说："我同意你。"

#电锯人 #Makima #蕾塞`,

  `【城乡鼠记】第十二章：扭曲的共鸣

Makima 说她也喜欢乡下老鼠。但她的理由让蕾塞不寒而栗：

"因为它们更容易控制。"

对 Makima 来说，所有的老鼠都只是她棋盘上的棋子。不是恐惧让她选择安全，而是距离让她掌控全局。

#电锯人 #Makima`,

  `【城乡鼠记】第十三章：蕾塞的陷阱

蕾塞知道 Makima 在利用她。她也知道自己只是在执行任务。

但每次任务结束，她都会在那条小巷等着 Denji。她告诉自己这是为了下一次行动。

其实她只是想再见他一面。

#电锯人 #蕾塞`,

  `【城乡鼠记】第十四章：小巷

最后那天，Makima 走进了那条小巷。

蕾塞跪在地上，任务失败了。她看着头顶的天空，那架飞机还在。

她想起 Denji 说的话："城市的老鼠，至少尝过活着的滋味。"

#电锯人 #Makima #蕾塞`,

  `【城乡鼠记】第十五章：结局

Makima 走向蕾塞，说出了那句关于乡下老鼠的话。但她说的，不是蕾塞理解的那个意思。

"你说你喜欢乡下老鼠，" Makima 轻声说，"但你从来不敢真正做一只乡下老鼠。"

蕾塞闭上了眼睛。

#电锯人 #Makima #蕾塞`,

  `【城乡鼠记】第十六章：三种老鼠

伊索的寓言里有两种老鼠。

但电锯人的世界里，还有第三种——假装自己是城市老鼠的乡下老鼠。

Denji 是第一种。蕾塞是第三种。Makima 根本不是老鼠。

#电锯人 #Denji #Makima`,

  `【城乡鼠记】第十七章：贫穷与恐惧

伊索寓言的结尾说："贫穷但安全，好过在恐惧中富有。"

但 Denji 两者都经历过。他知道这句话是谎话。

"没有食物的恐惧，和有食物但随时会死的恐惧——"他喃喃道，"哪个更糟？"

#电锯人 #Denji`,

  `【城乡鼠记】第十八章：蕾塞之后

在蕾塞消失之后，Denji 有时会想起那个雨天的走廊。

她问他的那个问题，他到现在也没有完全想明白。

但他知道一件事——蕾塞不是因为他而留下的。她是因为终于不想再当任何一种老鼠。

#电锯人 #蕾塞 #Denji`,

  `【城乡鼠记】第十九章：两种逃跑

乡下老鼠逃回田野。城市老鼠逃回城市。

蕾塞呢？她选择了消失——不是逃回笼子，而是彻底蒸发。

也许这就是第三种老鼠的命运：不属于任何地方。

#电锯人 #蕾塞`,

  `【城乡鼠记】最终章：雨停了

故事的最后，雨停了。

Denji 站在城市的某个屋顶上，看着远处的飞机消失在天际线。

他想，如果蕾塞还在，她会选哪只老鼠？

他笑了笑。"管它呢。"他转身走下楼梯。

城市的老鼠也好，乡下的老鼠也好——能尝到活着的滋味，就够了。

【完】

#电锯人 #蕾塞 #Denji #Makima #城乡鼠记`,
]

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    // Step 1: Login via credentials
    console.log('Logging in via credentials...')
    const csrfRes = await page.request.get(BASE_URL + '/api/auth/csrf')
    const csrfData = await csrfRes.json()
    console.log('CSRF:', csrfData.csrfToken)
    
    const loginRes = await page.request.post(BASE_URL + '/api/auth/callback/credentials', {
      form: {
        csrfToken: csrfData.csrfToken,
        username: 'reze',
        password: 'testpass123',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
    console.log('Login response status:', loginRes.status())
    console.log('Login response URL:', loginRes.url())
    
    // Check session
    const sessionRes = await page.request.get(BASE_URL + '/api/auth/session')
    const sessionData = await sessionRes.json()
    console.log('Session:', JSON.stringify(sessionData))
    
    // Step 2: Post tweets using the authenticated page
    console.log('\nPosting tweets...')
    for (let i = 0; i < STORY_TWEETS.length; i++) {
      const tweet = STORY_TWEETS[i]
      console.log(`Posting ${i + 1}/${STORY_TWEETS.length}...`)
      
      // Use the API directly with the cookie from the page context
      const apiRes = await page.request.post(BASE_URL + '/api/tweets', {
        data: { content: tweet },
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (apiRes.ok()) {
        console.log(`  ✅`)
      } else {
        console.log(`  ❌ Status: ${apiRes.status()}`)
        const errText = await apiRes.text()
        console.log(`  Error: ${errText.slice(0, 100)}`)
      }
      
      // Small delay between tweets
      await new Promise(r => setTimeout(r, 500))
    }
    
    console.log('\nAll done!')
    
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await browser.close()
  }
}

main()
