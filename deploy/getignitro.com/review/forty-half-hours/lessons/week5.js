window.COURSE = window.COURSE || { weeks: {} };
window.COURSE.weeks[5] = {
  n: 5,
  title: "Paid ads and the numbers",
  promise: "By day five you can build a funnel cost model in AED, judge CAC against LTV, and read a marketing dashboard like a CFO.",
  lessons: [
    {
      id: "w5d1", day: 1,
      title: "How ads work",
      bigIdea: "An ad is a bid in an auction for a person's attention. You pay per thousand views or per click, and you can stop tomorrow.",
      teach: [
        { h: "The auction", p: "Every time a page loads, the platform runs an auction for that ad slot. Advertisers bid, and the platform also scores how relevant each ad is. A better ad can win with a lower bid. So the price you pay is set partly by your money and partly by your creative. Weak ads cost more per result." },
        { h: "CPM, CPC and CTR", p: "CPM is cost per thousand impressions, the price of being seen. CPC is cost per click, the price of a visit. CTR is click-through rate: clicks divided by impressions. They link up: CPC equals CPM divided by (1,000 x CTR). Double your CTR and, at the same CPM, your CPC halves." },
        { h: "Meta interrupts, Google answers", p: "On Meta (Instagram, Facebook) you interrupt people who were not looking for you, so you target by who they are and what they like. On Google you answer people who just typed a need, so you target by the words they search. Intent is worth more per click. Interruption is cheaper per view and builds demand." },
        { h: "The pixel", p: "A pixel is a small piece of code on your website that tells the ad platform who visited and who filled the form. Without it the platform cannot learn which people convert, and you cannot see cost per lead. Install it, and test it, before you spend a single dirham." }
      ],
      caseStudy: {
        name: "Google and the value of intent",
        year: "Today",
        story: "StatCounter puts Google at about nine in ten searches worldwide. That is why search ads are the default place to catch demand that already exists. A developer who types \"final survey company Dubai\" has a project, a deadline and probably a budget. Nobody had to persuade him that he has a problem. Compare that with a reel on Instagram, which reaches someone scrolling at night with no plan to buy. Both are useful. One harvests demand, the other creates it. Most businesses need some of each, and the mix decides how the numbers behave.",
        lesson: "Search ads harvest demand that exists. Social ads create demand. Price each click by the intent behind it.",
        source: "StatCounter Global Stats, search engine market share"
      },
      financeLens: "Ad spend is pure opex: no asset, no depreciation, and you can switch it off tomorrow. That flexibility is its value. Treat each campaign like a variable cost line with a stop-loss: a spend ceiling and a cost-per-lead limit agreed before launch. If the line breaches either, it stops.",
      doNow: {
        task: "Work out the CPC from a CPM and a CTR, both ways round.",
        steps: [
          "A campaign has a CPM of AED 40 and a CTR of 1%. Work out the CPC.",
          "Now raise CTR to 2% at the same CPM. Work out the new CPC.",
          "Write one sentence on what made the difference."
        ]
      },
      quiz: [
        { q: "A campaign costs AED 40 per thousand impressions and gets a 1% CTR. What is the CPC?", options: ["AED 4", "AED 0.40", "AED 40", "AED 0.04"], answer: 0, why: "1,000 impressions at 1% give 10 clicks. AED 40 divided by 10 clicks is AED 4 per click." },
        { q: "Why does a Google search click usually cost more than a Meta click?", options: ["Google charges a fixed premium", "The searcher has stated intent, so the click is worth more", "Meta ads are always shown to fewer people", "Search ads need no landing page"], answer: 1, why: "Search catches people who typed a need right now. Advertisers bid more for that intent." },
        { q: "What does the pixel do?", options: ["Makes the ad image sharper", "Sets your daily budget", "Reports visits and conversions back to the ad platform", "Blocks bots from clicking"], answer: 2, why: "The pixel tells the platform who visited and converted, so it can optimise and you can measure cost per lead." }
      ],
      homework: "Search Google for a service you might buy in Dubai. Note which results are ads, how many there are, and what each ad promises in its first line. Bring three examples.",
      teacherNotes: "Do the CPC formula on paper with him before the exercise. Answers: AED 4, then AED 2. The point to land is that creative quality moves CTR, and CTR moves cost. He will want to think of CPC as a price the platform sets. Push back: it is partly a score of the ad. Keep Meta vs Google simple: interrupt vs answer.",
      terms: [
        { term: "CPM", def: "Cost per thousand impressions: the price of being seen a thousand times." },
        { term: "CPC", def: "Cost per click: total spend divided by clicks." },
        { term: "CTR", def: "Click-through rate: clicks divided by impressions, as a percentage." },
        { term: "Pixel", def: "Tracking code on your site that reports visits and conversions to the ad platform." }
      ],
      widget: null
    },
    {
      id: "w5d2", day: 2,
      title: "Funnel economics",
      bigIdea: "Budget becomes clicks, clicks become leads, leads become customers. Each step has a rate, and the rates decide what a customer costs.",
      teach: [
        { h: "The chain", p: "Budget divided by CPC gives clicks. Clicks times landing conversion gives leads. Leads times lead-to-customer rate gives customers. Customers times average deal gives revenue. Four inputs, one chain. Every marketing argument you will hear is really an argument about one of these rates, so learn to ask which one." },
        { h: "Worked example: the top", p: "Budget AED 10,000 a month. CPC AED 4. So 10,000 / 4 = 2,500 clicks. Landing conversion 8%, so 2,500 x 8% = 200 leads. Lead-to-customer 20%, so 200 x 20% = 40 customers. Cost per lead (CPL) = 10,000 / 200 = AED 50." },
        { h: "Worked example: the bottom", p: "CAC = spend / customers = 10,000 / 40 = AED 250. Average deal AED 15,000, so revenue = 40 x 15,000 = AED 600,000. ROAS = revenue / spend = 600,000 / 10,000 = 60x. That is a dream. Real B2B numbers are far tighter, and you should be suspicious of any plan that looks like this." },
        { h: "Now make it real", p: "Open the calculator below. Keep the budget at AED 10,000 and the deal at AED 15,000. Change CPC to 15, conversion to 3% and close rate to 10%. Watch CAC and ROAS. Then move one input at a time back towards the dream and see which rate gives you the most." },
        { h: "Rates multiply", p: "Because the rates multiply, a small gain at each step compounds. Lifting conversion and close rate by a little each can beat halving the CPC. That tells you where to spend effort: often on the landing page and the sales follow-up, which cost nothing extra per click." }
      ],
      caseStudy: {
        name: "Dollar Shave Club",
        year: "2012",
        story: "On 6 March 2012 Dollar Shave Club posted a launch video that cost about USD 4,500. It took 12,000 orders in the first 48 hours. Run it as a funnel and the acquisition cost per order is about 37 cents, before any repeat purchase. That is the top of a funnel working unusually well: one cheap piece of creative and a simple offer. Unilever bought the company in July 2016 for about USD 1 billion. The video won the attention. What a buyer pays a billion for is what happens after: whether those customers keep ordering.",
        lesson: "Cheap acquisition plus repeat revenue is the combination buyers pay for. Measure both ends of the funnel.",
        source: "Company reports; press coverage of the Unilever acquisition, 2016"
      },
      financeLens: "Build this as a cost model, the way you would build product costing. Inputs are drivers, outputs are unit costs. CPL and CAC are unit costs; ROAS is a revenue-to-cost ratio. Then run sensitivity: flex each driver by 10% and see which one moves CAC most. That driver is where management attention goes.",
      doNow: {
        task: "Run the realistic case in the calculator and find the strongest lever.",
        steps: [
          "Set budget AED 10,000, CPC 15, conversion 3%, close rate 10%, deal AED 15,000. Write down leads, customers, CAC and ROAS.",
          "Raise conversion from 3% to 4% only. Write down the new CAC.",
          "Put conversion back and cut CPC from 15 to 12 only. Compare the two CACs."
        ]
      },
      quiz: [
        { q: "Budget AED 10,000, CPC AED 4, landing conversion 8%. How many leads?", options: ["2,500", "800", "200", "40"], answer: 2, why: "10,000 / 4 = 2,500 clicks, and 2,500 x 8% = 200 leads." },
        { q: "Spend is AED 10,000 and you win 40 customers. What is the CAC?", options: ["AED 50", "AED 250", "AED 400", "AED 2,500"], answer: 1, why: "CAC is spend divided by customers: 10,000 / 40 = AED 250." },
        { q: "Revenue from a campaign is AED 600,000 on spend of AED 10,000. What is the ROAS?", options: ["6x", "600x", "0.6x", "60x"], answer: 3, why: "ROAS is revenue divided by ad spend: 600,000 / 10,000 = 60x." }
      ],
      homework: "Write the five-step chain from memory on one card: budget, clicks, leads, customers, revenue, with the formula on each arrow. Bring it tomorrow; we add LTV to the bottom.",
      teacherNotes: "Check the realistic case with him: about 667 clicks, 20 leads, 2 customers, CPL AED 500, CAC AED 5,000, revenue AED 30,000, ROAS 3x. Same budget, same deal, a hundred times less return than the dream. Then the levers: conversion to 4% gives about 27 leads and CAC near AED 3,750. That is the lesson. Let him find it in the widget.",
      terms: [
        { term: "CPL", def: "Cost per lead: spend divided by leads." },
        { term: "CAC", def: "Customer acquisition cost: spend divided by new customers won." },
        { term: "ROAS", def: "Return on ad spend: revenue from ads divided by ad spend." },
        { term: "Landing conversion", def: "Share of visitors to a landing page who become leads." }
      ],
      widget: "unitEconomics"
    },
    {
      id: "w5d3", day: 3,
      title: "LTV, payback and the 3:1 rule",
      bigIdea: "A customer is worth the gross margin they bring over their whole life with you. Spend up to a third of that to win them.",
      teach: [
        { h: "Lifetime value", p: "LTV = average deal x purchases per year x years retained x gross margin. Say a deal is AED 15,000, the client buys once a year, stays three years, and your gross margin is 40%. LTV = 15,000 x 1 x 3 x 40% = AED 18,000. Use margin, never revenue: revenue is not what you keep." },
        { h: "The 3:1 rule", p: "LTV:CAC should be at least 3. Below that, after overheads, acquisition barely pays. Well above 5 and you may be underspending, leaving growth on the table. With LTV AED 18,000 and CAC AED 5,000, the ratio is 3.6. Healthy, though not by much." },
        { h: "Payback in months", p: "Payback = CAC / monthly gross profit per customer. In the example, AED 15,000 x 40% / 12 = AED 500 a month. AED 5,000 / 500 = 10 months. Until then the customer is still repaying you. Short payback means growth funds itself. Long payback means growth eats cash." },
        { h: "Retention is the multiplier", p: "Years retained sits inside the LTV formula, so every extra year adds a whole year of margin with no new CAC. Keeping a client from year three to year four lifts LTV by a third in the example. That is why retention gets its own week of attention in serious firms." }
      ],
      caseStudy: {
        name: "Zero Defections and Amazon Prime",
        year: "1990 and 2005",
        story: "In 1990 Frederick Reichheld and W. Earl Sasser published \"Zero Defections\" in Harvard Business Review. Across the industries studied in Bain's work, a 5% increase in customer retention raised profits by 25% to 95%. The reason sits in the LTV formula: kept customers cost nothing to acquire again, and they tend to buy more over time. Amazon built a machine on the same idea. Prime, launched in 2005, is a membership that raises how often members buy and how loyal they stay. It lifts two of the four terms in LTV at once: purchases per year and years retained.",
        lesson: "Retention and purchase frequency raise LTV without raising CAC. That is the cheapest margin there is.",
        source: "Reichheld and Sasser, Harvard Business Review, 1990; Amazon"
      },
      financeLens: "A customer is an asset. LTV is its NPV: discount each year's margin back at your cost of capital, so year three counts for less than year one. CAC is the capex you pay to acquire the asset. Payback is the payback period you already know from investment appraisal. Same tools, different asset.",
      doNow: {
        task: "Calculate LTV, LTV:CAC and payback for one illustrative B2B client.",
        steps: [
          "Use: deal AED 20,000, two purchases a year, two years retained, 35% margin. Calculate LTV.",
          "CAC is AED 6,000. Calculate LTV:CAC. Pass or fail the 3:1 rule?",
          "Calculate payback in months. Check your answers in the calculator."
        ]
      },
      quiz: [
        { q: "Deal AED 15,000, one purchase a year, three years retained, 40% gross margin. What is LTV?", options: ["AED 45,000", "AED 18,000", "AED 6,000", "AED 60,000"], answer: 1, why: "15,000 x 1 x 3 x 40% = AED 18,000. LTV uses gross margin, not revenue." },
        { q: "What LTV:CAC ratio is the common minimum for healthy acquisition?", options: ["1:1", "2:1", "3:1", "10:1"], answer: 2, why: "At least 3:1 leaves room to cover overheads and still profit from each customer won." },
        { q: "CAC is AED 6,000 and a customer brings AED 500 gross profit a month. What is payback?", options: ["12 months", "6 months", "3 months", "50 months"], answer: 0, why: "Payback is CAC divided by monthly gross profit: 6,000 / 500 = 12 months." }
      ],
      homework: "Pick one business you know well, any sector. Estimate its average deal, purchases per year, years retained and margin. Write its LTV and the most it could pay to win a customer at 3:1.",
      teacherNotes: "Do Now answers: LTV = 20,000 x 2 x 2 x 35% = AED 28,000. LTV:CAC = 28,000 / 6,000, about 4.7, a pass. Monthly gross profit = 40,000 x 35% / 12, about AED 1,167, so payback about 5 months. Push him on discounting: he knows NPV, so ask what a 10% cost of capital does to year two.",
      terms: [
        { term: "LTV", def: "Lifetime value: total gross margin a customer brings over the whole relationship." },
        { term: "LTV:CAC", def: "Lifetime value divided by acquisition cost. Aim for at least 3." },
        { term: "Payback period", def: "Months of a customer's gross profit needed to recover their CAC." },
        { term: "Retention rate", def: "Share of customers still buying after a set period." }
      ],
      widget: "unitEconomics"
    },
    {
      id: "w5d4", day: 4,
      title: "Testing and attribution",
      bigIdea: "Test one change at a time, keep the winner, kill the loser fast. The creative is the biggest lever you have.",
      teach: [
        { h: "The A/B test", p: "Show version A to half the audience and version B to the other half. Change one thing only: headline, image, offer or button. Decide the metric before you start, usually cost per lead. Run until each side has enough results to trust, then keep the winner and test the next idea against it." },
        { h: "Creative beats targeting", p: "Most beginners spend hours on audiences and minutes on the ad. Research says the opposite split pays. The image, the first line and the offer decide whether anyone stops. Test creative first. Targeting is a dial; creative is the engine." },
        { h: "Kill losers fast", p: "Set a kill rule before launch: for example, if an ad has spent three times your target CPL with no lead, it stops. Losing ads do not improve with patience; they only cost more. Move the money to the winner. This is the cheapest discipline in marketing and the most often skipped." },
        { h: "Attribution has limits", p: "Attribution means deciding which touch gets credit for a sale. Platforms tend to claim credit for anything they touched. A developer may see a LinkedIn post, get a referral and then search your name on Google. Google gets the click; the referral did the work. Read platform numbers as directional and check them against what customers tell you." }
      ],
      caseStudy: {
        name: "Obama 2008 and the splash page",
        year: "2008",
        story: "In 2008 Dan Siroker, working on the Obama campaign, A/B tested the splash page where visitors signed up. The winning version paired a family photo with a \"Learn More\" button. Sign-ups rose from 8.26% to 11.6%, about 40% more. The campaign estimated that meant about 2.9 million extra email addresses and about USD 60 million more in donations. No new traffic, no bigger budget: one tested change on one page. Nielsen Catalina Solutions later found, in 2017, that the creative itself accounts for about 47% of a campaign's sales lift, more than targeting or reach.",
        lesson: "One tested change to the creative can be worth more than a larger budget. Test before you scale.",
        source: "Dan Siroker's account of the 2008 campaign; Nielsen Catalina Solutions, 2017"
      },
      financeLens: "Treat the test budget as R&D: a fixed share of spend, say a tenth, set aside to buy information. Most tests lose, and that is the cost of finding the winner. Expense it, judge it on what it teaches, and never let a losing test quietly become a permanent cost line.",
      doNow: {
        task: "Design one A/B test for an ad selling a final survey service to developers.",
        steps: [
          "Write the control: one headline, one image idea, one button.",
          "Write the variant, changing one element only.",
          "Write the metric and the kill rule in one line each."
        ]
      },
      quiz: [
        { q: "In the Obama 2008 test, sign-ups rose from 8.26% to 11.6%. Roughly what was the lift?", options: ["About 3%", "About 11%", "About 40%", "About 100%"], answer: 2, why: "11.6 divided by 8.26 is about 1.40, so a lift of about 40%." },
        { q: "Nielsen Catalina's 2017 study found which factor drives the largest share of sales lift?", options: ["The creative", "The targeting", "The reach", "The time of day"], answer: 0, why: "The creative accounted for about 47% of sales lift, more than targeting or reach." },
        { q: "Why should you read ad platform attribution with care?", options: ["Platforms never track clicks", "Attribution is illegal in the UAE", "It only works for email", "Platforms tend to claim credit for any sale they touched"], answer: 3, why: "A buyer meets several touches. The platform that got the last click often takes credit the referral earned." }
      ],
      homework: "Find two ads from the same company, on any platform, that look like a test of each other. Note the one thing that differs and guess which one won. Bring screenshots.",
      teacherNotes: "The trap he will fall into is changing three things in the variant. Make him strip it back to one. On attribution, ask him how he would know a referral drove a sale. The honest answer is: ask the customer, and record the answer in the CRM. That sets up week 6.",
      terms: [
        { term: "A/B test", def: "Two versions shown to split audiences to see which performs better on one metric." },
        { term: "Control", def: "The current version in a test, which the variant must beat." },
        { term: "Attribution", def: "The rule for which marketing touch gets credit for a sale." },
        { term: "Kill rule", def: "A pre-agreed limit at which a losing ad is switched off." }
      ],
      widget: null
    },
    {
      id: "w5d5", day: 5,
      title: "The marketing P&L and the dashboard",
      bigIdea: "Six numbers tell a CFO whether marketing is working. Everything else is decoration.",
      teach: [
        { h: "Vanity vs real", p: "Likes, followers, impressions and views feel good and pay nothing. They are vanity metrics unless they lead to a lead. Real metrics connect to cash: leads, customers, revenue, cost per result. A report full of reach and empty of revenue is a report written to avoid a question." },
        { h: "The six numbers", p: "Spend. Leads. CPL. CAC. Revenue from marketing. ROAS or payback. Six numbers, one line each, every week. Spend and leads are counts. CPL and CAC are unit costs. Revenue and ROAS or payback tell you if it paid. If a marketing report cannot fill these six, it is not ready." },
        { h: "How much to spend", p: "Service firms commonly spend in the range of 5% to 10% of revenue on marketing, with B2B at the lower end. Treat that as a starting range for a budget conversation. The better test is the unit economics: if CAC sits well inside LTV, you can justify more." }
      ],
      caseStudy: {
        name: "The budget norm",
        year: "Common practice",
        story: "Ask ten firms how they set a marketing budget and most will say a percentage of revenue. For service firms the common range is 5% to 10%, with B2B nearer the bottom because sales teams and relationships carry more of the load. The percentage is a sanity check, nothing more. A firm with a strong referral base may spend little and grow. A firm entering a new market may need to spend above the range for a year. The CFO's job is to ask what each dirham buys, then fund the lines that return the most.",
        lesson: "A budget percentage is a sanity check. The unit economics decide whether to spend more.",
        source: "Common industry range for service firms"
      },
      financeLens: "Run marketing as its own P&L line with a monthly budget variance: planned spend vs actual, planned leads vs actual, planned CAC vs actual. Explain every variance over 10%. Revenue from marketing feeds receivables, so watch DSO too: a deal won but unpaid has not paid back its CAC.",
      doNow: {
        task: "Draw a one-week dashboard for an imaginary B2B service firm.",
        steps: [
          "Draw six boxes, one for each of the six numbers.",
          "Fill them with figures that are internally consistent: CPL must equal spend divided by leads.",
          "Circle the one number you would ask about first, and write the question."
        ]
      },
      quiz: [
        { q: "Which of these is a vanity metric?", options: ["Cost per lead", "Follower count", "Customer acquisition cost", "Revenue from marketing"], answer: 1, why: "Followers do not connect to cash unless they become leads and customers." },
        { q: "What is the common marketing budget range for service firms?", options: ["1% to 2% of revenue", "20% to 30% of revenue", "5% to 10% of revenue", "50% of gross profit"], answer: 2, why: "Service firms commonly spend 5% to 10% of revenue, with B2B at the lower end." },
        { q: "Which set is the six numbers a CFO watches?", options: ["Spend, leads, CPL, CAC, revenue from marketing, ROAS or payback", "Likes, shares, reach, followers, views, comments", "Revenue, profit, cash, debt, equity, tax", "Clicks, CTR, CPM, impressions, frequency, reach"], answer: 0, why: "These six run from what went in to what came out and whether it paid." }
      ],
      homework: "Copy the six numbers onto a card and keep it in your wallet or phone case. Next week we build the system that fills them.",
      teacherNotes: "Short teach today, then the week quiz. Check the Do Now for consistency: CPL times leads must equal spend, CAC times customers must equal spend. If his invented figures do not tie, that is the real lesson: a dashboard that does not reconcile is not trusted. He knows reconciliation; let him say it.",
      terms: [
        { term: "Vanity metric", def: "A number that looks good and does not connect to revenue or cost." },
        { term: "Budget variance", def: "The gap between planned and actual, explained line by line." },
        { term: "Revenue from marketing", def: "Revenue from customers whose first touch or lead came through marketing." },
        { term: "DSO", def: "Days sales outstanding: average days from invoice to cash received." }
      ],
      widget: null
    }
  ]
};
