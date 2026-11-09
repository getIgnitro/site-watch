window.COURSE = window.COURSE || { weeks: {} };
window.COURSE.weeks[3] = {
  n: 3,
  title: "Digital marketing: the map",
  promise: "By day five you can sort any channel into owned, earned or paid, judge a website in two minutes and pick the right platform.",
  lessons: [
    {
      id: "w3d1", day: 1,
      title: "Owned, earned, paid, and the journey",
      bigIdea: "Every channel is owned, earned or rented. Know which, and you know what it costs and how long it lasts.",
      teach: [
        { h: "Owned: you hold the keys", p: "Your website, your email list, your WhatsApp contacts, your company page. Nobody can raise the price or switch it off. Building owned media is slow, but every month of effort stays on the books. When a platform changes its rules, the business with a strong owned base shrugs." },
        { h: "Earned: others speak for you", p: "Reviews, referrals, press mentions, a client forwarding your report to a colleague. Earned media is the most trusted and the hardest to buy. You cannot order it. You can only deserve it, then make it easy to happen: ask for the review, give the referral a reason." },
        { h: "Paid: you rent attention", p: "Ads on Google, LinkedIn, Instagram. Paid is fast and controllable. You pay, people see. Stop paying and the tap closes the same day. Paid is best used to feed owned and earned: an ad that brings someone onto your list is worth more than one that brings a single click." },
        { h: "AARRR: the customer journey", p: "Dave McClure's pirate metrics, 2007. Acquisition: they find you. Activation: they have a good first experience. Retention: they come back. Referral: they tell others. Revenue: they pay. Each stage leaks. Your job is to find the biggest leak and fix that one first, before buying more traffic for a leaking bucket." },
        { h: "Measure each stage separately", p: "A business with weak sales usually blames acquisition and buys more ads. Often the leak is further down: nobody replies to enquiries, or first-time clients never return. Write the five stages on paper, put one number against each, and the weakest stage will usually be obvious within a minute." }
      ],
      caseStudy: {
        name: "Dropbox referral programme",
        year: "2008–2010",
        story: "Dropbox had a good product and an expensive problem: paid search ads cost more than a customer was worth. So Drew Houston's team built growth into the product. Invite a friend, and both of you get extra free storage. Two-sided, so the person inviting is giving a gift, never asking a favour. The invite sat inside the app, one click away. Users went from 100,000 in September 2008 to 4 million in January 2010, a 3,900% rise in 15 months. Houston described it in a 2010 talk. The referral stage of AARRR became the acquisition engine.",
        lesson: "Make referral two-sided and effortless, and your customers become your sales team. Earned growth beat rented growth.",
        source: "Drew Houston, Dropbox, 2010 talk"
      },
      financeLens: "Owned media appears on no balance sheet, yet it behaves like an asset. You invest in it, it produces returns for years, and it can be impaired if neglected. Think of an email list as an unrecognised intangible. Paid media is pure opex: expensed as consumed, no residual value.",
      doNow: {
        task: "Map your father's group onto owned, earned and paid. Use what you can see publicly or already know.",
        steps: [
          "Draw three columns: Owned, Earned, Paid.",
          "List every channel you can think of for Sail Survey, Built Pulse and Sky Signature: website, LinkedIn page, Google reviews, referrals, ads.",
          "Circle the column with the fewest entries. That is the gap to discuss tomorrow."
        ]
      },
      quiz: [
        { q: "A developer's project manager recommends your survey firm to a colleague. Which type of media is that?", options: ["Earned", "Owned", "Paid", "Shared"], answer: 0, why: "Someone else spoke for you without payment. That is earned media, the most trusted kind." },
        { q: "In AARRR, which stage covers a client coming back for a second job?", options: ["Retention", "Activation", "Referral", "Acquisition"], answer: 0, why: "Retention measures whether customers return. Activation is the first good experience; referral is telling others." },
        { q: "Why did Dropbox make its referral reward two-sided?", options: ["The inviter gives a gift instead of asking a favour", "It was cheaper than one-sided rewards", "Regulators required it", "Paid ads were banned for cloud storage"], answer: 0, why: "When both sides gain, inviting feels generous. That removes the social cost of asking and makes people share more." }
      ],
      homework: "Find one business you admire and list its owned, earned and paid channels. Note which one you think drives most of its customers, and why. Bring it tomorrow.",
      teacherNotes: "The key move today is the asset framing: he understands balance sheets, so let him argue whether an email list should be capitalised. It should not under the rules, which is the point: the most valuable marketing assets are invisible to the accounts. Push him on the Dropbox case: what was the CAC of a referred user compared with a paid one? He has no figure, so make him reason it out qualitatively.",
      terms: [
        { term: "Owned media", def: "Channels you control outright: website, email list, WhatsApp contacts, company pages." },
        { term: "Earned media", def: "Attention you receive free from others: reviews, referrals, press, shares." },
        { term: "Paid media", def: "Attention you rent with money: ads on search, social or other sites." },
        { term: "AARRR", def: "Pirate metrics: Acquisition, Activation, Retention, Referral, Revenue. Dave McClure, 2007." }
      ],
      widget: null
    },
    {
      id: "w3d2", day: 2,
      title: "The website and the landing page",
      bigIdea: "A website is a salesperson that never sleeps. Give each page one job, make it load fast and make it easy to trust.",
      teach: [
        { h: "One page, one job", p: "A homepage introduces. A landing page converts. When someone clicks an ad for a final survey, send them to a page about final surveys with one button, never to the homepage with nine menu items. Every extra choice is a door out. Ask of any page: what is the single thing I want the visitor to do here?" },
        { h: "Speed is the first impression", p: "Most of your visitors arrive on a phone, often on the move. If the page takes ages to load, they leave before reading a word. Test your own site on your phone, on mobile data, away from the office wifi. Heavy images and auto-playing video are the usual culprits." },
        { h: "Trust signals", p: "A buyer decides in seconds whether you are real. Five signals do most of the work: client logos or named projects, reviews, real photos of real people, a physical address and licence details, and a clear phone or WhatsApp number. Stock photos of handshakes in glass towers subtract trust." },
        { h: "Form or WhatsApp button", p: "A form gives you clean data but asks for effort. A WhatsApp button gives you a conversation in one tap, which is how much of the Gulf prefers to do business. Many good sites offer both: WhatsApp for the quick question, a short form for the formal request. Keep forms to three or four fields." },
        { h: "Conversion rate", p: "Visitors who take the action divided by all visitors. If 1,000 people visit and 20 enquire, the rate is 2%. Double the rate and you double enquiries without spending a dirham more on traffic. Small fixes, like a clearer headline or a visible phone number, often move it more than redesigns." }
      ],
      caseStudy: {
        name: "Airbnb, New York",
        year: "2009",
        story: "Airbnb's early listings in New York were not booking. The founders looked at the pages and saw the problem: hosts had taken dim, blurry phone photos of their flats. A guest scrolling the site could not judge the room, so they did not trust it. The founders did something that does not scale. They went to hosts' flats and photographed them professionally. Same flats, same prices, same website. Weekly revenue in the city doubled. The product had not changed. The trust signal on the page had.",
        lesson: "The page is the product until the customer arrives. Fix what the buyer sees before you buy more traffic.",
        source: "Airbnb founders' accounts, New York 2009"
      },
      financeLens: "Conversion rate is a margin lever. Traffic costs money; conversion costs almost nothing once fixed. Raising conversion lowers cost per lead on every visitor you already pay for, so the gain drops straight to contribution margin. Think of it as improving yield on an existing asset instead of buying more inputs.",
      doNow: {
        task: "Open two competitor websites of your father's group on your phone and score each on five trust signals.",
        steps: [
          "Pick two Dubai competitors in surveying, escrow reporting or serviced offices.",
          "Score each 0 or 1 for: named clients or projects, reviews, real photos, address and licence, visible phone or WhatsApp.",
          "Time each load. Note each one's biggest weakness."
        ]
      },
      quiz: [
        { q: "A paid ad for final surveys should send visitors where?", options: ["A page about final surveys with one clear action", "The homepage", "The company's LinkedIn page", "A page listing all services"], answer: 0, why: "One page, one job. A matching page with one action converts better than a general page full of exits." },
        { q: "1,000 visitors, 20 enquiries. What is the conversion rate?", options: ["2%", "20%", "0.2%", "5%"], answer: 0, why: "20 divided by 1,000 is 0.02, which is 2%." },
        { q: "What changed at Airbnb New York in 2009 to double weekly revenue?", options: ["Professional photos of the listings", "Lower prices", "A new website design", "More paid advertising"], answer: 0, why: "Same flats, same prices, same site. Better photos gave guests a reason to trust the listing." }
      ],
      homework: "Open your father's group websites on your phone. Write down the one action each homepage wants you to take. If you cannot tell within five seconds, note that too.",
      teacherNotes: "Let him do the scoring honestly, including on the family sites if he chooses. The Warby Parker case is worth a two-minute mention: they launched in February 2010 with Home Try-On, five frames posted free, hit their first-year sales target in three weeks and built a 20,000-person waiting list. The point: they removed the buyer's risk on the page itself. Ask him what the equivalent risk-remover would be for a developer buying a report.",
      terms: [
        { term: "Landing page", def: "A page built for one campaign and one action, usually reached from an ad or link." },
        { term: "Conversion rate", def: "Visitors who take the wanted action, divided by all visitors, as a percentage." },
        { term: "Trust signal", def: "Anything on a page that proves you are real and competent: reviews, clients, address, faces." },
        { term: "Call to action", def: "The one thing you ask the visitor to do next, such as 'Message us on WhatsApp'." }
      ],
      widget: null
    },
    {
      id: "w3d3", day: 3,
      title: "Search",
      bigIdea: "Search is the one channel where the customer tells you what they want. Be the answer when they ask.",
      teach: [
        { h: "Intent beats interruption", p: "Someone typing 'final survey company Dubai' has a need right now. Someone scrolling Instagram does not. Search traffic is smaller but warmer. Google handles about nine in ten searches worldwide, according to StatCounter, so for most businesses 'search' means Google. Write down the exact phrases a buyer would type." },
        { h: "SEO basics", p: "Search engine optimisation is making your pages the best answer to a search. Three things matter most: a page for each service that uses the words buyers use, content that genuinely answers their questions, and other reputable sites linking to you. There are no tricks worth learning. Useful pages win slowly and keep winning." },
        { h: "Google Business Profile", p: "The free listing that shows on Google Maps and in local results, with your address, hours, photos and reviews. For a local service firm it is often the most valuable page you have, ahead of your website. Fill every field, add real photos, post updates, and keep the phone number correct." },
        { h: "Reviews are ranking and proof", p: "Reviews do two jobs at once. They help you appear in local results, and they persuade the person reading. Ask every satisfied client, at the moment they are happiest, with a direct link. Reply to every review, including the bad ones, calmly. A polite reply to a complaint often wins more trust than ten five-star ratings." },
        { h: "Ads on search", p: "You can also pay to appear at the top of search results, charged per click. Search ads are fast and switchable, good for testing which phrases bring buyers. The best setups use ads to learn quickly and SEO to own the winning phrases for the long run." }
      ],
      caseStudy: {
        name: "HubSpot and inbound marketing",
        year: "2006",
        story: "Brian Halligan and Dharmesh Shah founded HubSpot in 2006 with a simple observation: people had learned to ignore cold calls, junk mail and banner ads. They were searching for answers instead. So HubSpot built the company on giving those answers away. Free articles, free guides, free tools. Buyers found HubSpot through search while trying to solve their own problem, trusted it because it had already helped them, and many later became paying customers. Halligan and Shah coined a name for this: inbound marketing. The customer comes to you.",
        lesson: "Publish the answers your buyers search for. Helping before selling turns search traffic into trust, then into revenue.",
        source: "HubSpot company history; Halligan and Shah, Inbound Marketing"
      },
      financeLens: "SEO is capex with a long tail: you spend now, the page earns traffic for years, and the cost per lead falls over time like an asset depreciating while still producing. Search ads are opex: expensed per click, value ends when spend stops. A sound plan funds both and tracks the shift between them.",
      doNow: {
        task: "Search like a buyer of your father's group and see who Google shows.",
        steps: [
          "On your phone, search three phrases a developer might type, such as 'Oqood registration Dubai' or 'escrow report developer Dubai'.",
          "Note who appears in ads, on the map, and in the first three results.",
          "Check whether any of the group's brands appears, and with how many reviews."
        ]
      },
      quiz: [
        { q: "Why is search traffic usually warmer than social media traffic?", options: ["The searcher has stated a need right now", "Search ads are cheaper", "Search users are richer", "Social media has fewer users"], answer: 0, why: "A search is the customer telling you their intent. Social users are interrupted while doing something else." },
        { q: "For a local service firm, which free asset often matters most in Google results?", options: ["Google Business Profile", "A YouTube channel", "A press release", "An X account"], answer: 0, why: "The Business Profile shows on Maps and local results with reviews, often before the website itself." },
        { q: "In accounting terms, how is SEO best described compared with search ads?", options: ["SEO is like capex; ads are opex", "Both are capex", "SEO is opex; ads are capex", "Both are cost of sales"], answer: 0, why: "SEO pays back for years after the spend. Ad value ends the moment spend stops, like an operating expense." }
      ],
      homework: "Write ten search phrases a property developer might type when looking for a survey, an escrow report or a serviced office. Rank them by how ready to buy the searcher sounds.",
      teacherNotes: "Do the searches live with him on your phone and talk through what you both see. Ask which result he would click and why: that is trust signals from yesterday applied to search. He will likely want to know the cost of a click. Do not guess figures; tell him week 5 covers the numbers and he will see real ones then. The capex and opex framing will stick: use it again in week 5.",
      terms: [
        { term: "SEO", def: "Search engine optimisation: making your pages the best answer so they rank without paying." },
        { term: "Search intent", def: "What the searcher actually wants, judged from the words they type." },
        { term: "Google Business Profile", def: "Free Google listing with address, hours, photos and reviews, shown on Maps." },
        { term: "Inbound marketing", def: "Attracting buyers with useful free content so they come to you. Coined by HubSpot." }
      ],
      widget: null
    },
    {
      id: "w3d4", day: 4,
      title: "Social platforms: which one is for what",
      bigIdea: "Each platform has its own crowd and its own mood. Go where your buyer already spends attention, and speak the local language.",
      teach: [
        { h: "Instagram and TikTok", p: "Visual, fast, consumer-heavy. Instagram suits anything that photographs well: food, interiors, fashion, finished spaces. TikTok rewards personality and entertainment, and can reach strangers quickly because its feed shows people what matches their interests, whoever they follow. Both are strong for consumer brands, weaker for selling a technical service to a finance director." },
        { h: "LinkedIn: where B2B lives", p: "LinkedIn is the professional network, and LinkedIn's own research says the large majority of B2B social leads come through it. Buyers there are in work mode. A founder posting useful insight usually outperforms a company page posting announcements. If your customer is a business, start here." },
        { h: "YouTube: the search engine for video", p: "People search YouTube for how-to answers, reviews and explanations. A video stays findable for years, so it behaves like SEO. Good for explaining complex services: what happens in a final survey, how an escrow report works. Long videos are cut into short clips for other platforms." },
        { h: "Snapchat and X in the Gulf", p: "Snapchat has a strong young audience in the Gulf and suits consumer offers and quick behind-the-scenes. X is where news, opinion and public debate move fast, and where journalists and officials often are. Both matter for some brands. Neither is usually where a developer chooses a survey firm." },
        { h: "Choose one, do it well", p: "A small team on six platforms posts thin content everywhere. Pick the one platform where your buyer is, master it, then add a second. The useful question: where does my buyer pay attention, and in what mood?" }
      ],
      caseStudy: {
        name: "Gymshark",
        year: "2012–2020",
        story: "Ben Francis founded Gymshark in Birmingham in 2012, aged 19. He had no budget for television or magazines. What he noticed was that his customers were watching fitness creators on YouTube. So he sent his kit to those creators to wear in their videos, before 'influencer marketing' was even a term. The audience saw the clothes on people they already trusted, in the place they already spent their attention. Gymshark kept building on social platforms as they grew, and was valued at over GBP 1 billion in August 2020.",
        lesson: "Find where your buyer already watches, then show up there through people they trust. The platform choice was the strategy.",
        source: "Gymshark company history; press coverage of 2020 valuation"
      },
      financeLens: "Compare platforms on cost per reach: what it costs to put your message in front of a thousand of the right people. Include time as a cost. Ten staff hours a week on a platform that never produces a lead is a real expense, charged at the hourly rate of whoever does it. Opportunity cost counts.",
      doNow: {
        task: "Pick which platform each of your father's three brands belongs on first, and why.",
        steps: [
          "Write Sail Survey, Built Pulse and Sky Signature down the page.",
          "Next to each, write who buys it: job title and the mood they are in when they decide.",
          "Choose one main platform per brand, with a one-line reason."
        ]
      },
      quiz: [
        { q: "According to LinkedIn's own research, where do the large majority of B2B social leads come from?", options: ["LinkedIn", "Instagram", "TikTok", "Snapchat"], answer: 0, why: "LinkedIn reports that most B2B social leads come through its platform, where buyers are in work mode." },
        { q: "What did Gymshark do first to reach buyers with no advertising budget?", options: ["Sent kit to YouTube fitness creators", "Bought television ads", "Opened shops in Birmingham", "Ran search ads"], answer: 0, why: "Ben Francis put the product on creators his buyers already watched, before influencer marketing had a name." },
        { q: "Why does YouTube behave a little like SEO?", options: ["Videos stay searchable and findable for years", "It is owned by a bank", "It only shows paid content", "Videos disappear after 24 hours"], answer: 0, why: "People search YouTube for answers, and a good video keeps being found long after it was posted." }
      ],
      homework: "Find one competitor of any of the group's brands on LinkedIn. Read their last five posts. Note which one got the most reactions and guess why in one sentence.",
      teacherNotes: "Duolingo is a useful contrast: its owl mascot's TikTok became one of the most followed brand accounts within about a year of its 2021 relaunch, by being funny and a little unhinged. Ask him why that would be wrong for Built Pulse. The answer: mood and buyer. Expect him to pick LinkedIn for all three brands. Push on Sky Signature, whose buyers may include small business founders who also use Instagram.",
      terms: [
        { term: "Cost per reach", def: "What it costs to show your message to a set number of the right people." },
        { term: "Influencer marketing", def: "Paying or gifting trusted creators to show your product to their audience." },
        { term: "Platform fit", def: "How well a platform's audience and mood match your buyer and message." }
      ],
      widget: null
    },
    {
      id: "w3d5", day: 5,
      title: "Email and WhatsApp",
      bigIdea: "Followers belong to the platform. Your email list and WhatsApp contacts belong to you. Build the list, ask permission, send what is useful.",
      teach: [
        { h: "The list you own", p: "An algorithm can halve your reach overnight. An email list cannot be taken away. Every enquiry, client and event guest should end up on your list, with their permission. A small list of real buyers is worth more than a large list of strangers. Guard it, clean it, and never buy one." },
        { h: "Permission and sequences", p: "Ask before you add anyone, and make leaving easy. Then plan a sequence: a short series of messages sent automatically after a trigger, such as an enquiry. Welcome, useful guide, case study, invitation to talk. Each message has one job. Sequences keep following up while you sleep." },
        { h: "WhatsApp Business in the Gulf", p: "In the Gulf, WhatsApp is where business actually gets done. WhatsApp Business adds a profile, catalogue, quick replies and labels for each lead. Use it for fast replies and follow-up, never for blasting strangers. Treat every chat as a conversation with one person, and record outcomes in your CRM." }
      ],
      caseStudy: {
        name: "Spotify Wrapped",
        year: "2016 onwards",
        story: "Every December since 2016, Spotify sends each user a personal summary of their year: top songs, top artists, minutes listened. It is built from data Spotify already owns. The design is made to be shared, sized for stories and full of bragging rights. Millions of users post their Wrapped on social media without being asked or paid. Spotify's owned data, delivered through its own app and email, turns into earned media at enormous scale. Every share is a free advert, endorsed by a friend.",
        lesson: "Owned data, turned into something personal and shareable, becomes earned media. Give people a reason to share you.",
        source: "Spotify Wrapped campaigns, 2016 onwards"
      },
      financeLens: "A Litmus 2020 industry survey put email's return at about USD 36 for every USD 1 spent. Quote it as a survey figure; your own results will differ. The accounting point: the list is a low-cost asset with near-zero marginal cost per send, so returns scale with list quality while costs barely move. That is operating leverage.",
      doNow: {
        task: "Draft a four-message WhatsApp follow-up for someone who enquired about a serviced office at Sky Signature.",
        steps: [
          "Message 1, same hour: thank them and ask one question about their needs.",
          "Message 2, next day: something useful, such as what to check before choosing an office.",
          "Messages 3 and 4: an invitation to view, then a polite check-in. Each under 40 words."
        ]
      },
      quiz: [
        { q: "Why is an email list safer than social media followers?", options: ["You own it; no algorithm can cut your reach", "It is always larger", "Email is free to build", "Followers cannot buy anything"], answer: 0, why: "Followers live on a platform that controls reach. Your list is owned media you can contact directly." },
        { q: "What does Spotify Wrapped turn into earned media?", options: ["Users' own listening data", "Paid celebrity endorsements", "Television adverts", "Discount codes"], answer: 0, why: "Spotify uses data it already owns to build personal summaries users choose to share for free." },
        { q: "How should the Litmus 2020 figure of about USD 36 per USD 1 be stated?", options: ["As an industry survey figure", "As a guaranteed return", "As Spotify's own result", "As a legal requirement"], answer: 0, why: "It comes from an industry survey. Quote it as such, never as a promise for your own business." }
      ],
      homework: "Count how many email newsletters and WhatsApp business chats you receive in a week. Pick the best one and write down why you open it.",
      teacherNotes: "Shorter teach today, then the week quiz. Keep the WhatsApp exercise practical: read his four messages aloud as if you were the buyer and tell him honestly which you would ignore. Remind him of the permission rule: blasting purchased numbers damages the brand and can get a WhatsApp Business account blocked. Run the flashcards before the week quiz if time allows.",
      terms: [
        { term: "Email list", def: "Contacts who agreed to receive your emails. Owned media you control." },
        { term: "Permission marketing", def: "Messaging only people who agreed to hear from you, with an easy way out." },
        { term: "Sequence", def: "A planned series of messages sent automatically after a trigger, such as an enquiry." },
        { term: "WhatsApp Business", def: "WhatsApp's free business app with profile, catalogue, quick replies and labels." }
      ],
      widget: "flashcards"
    }
  ]
};
