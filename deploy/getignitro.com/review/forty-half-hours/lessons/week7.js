window.COURSE = window.COURSE || { weeks: {} };
window.COURSE.weeks[7] = {
  n: 7,
  title: "Strategy: plan a real business",
  promise: "By day five you have audited your father's group, positioned its three brands and know how many leads each needs per week.",
  lessons: [
    {
      id: "w7d1", day: 1,
      title: "The one-page plan",
      bigIdea: "A marketing plan fits on one page: objective, audience, message, channels, budget, measure. If it needs ten pages, the thinking is unfinished.",
      teach: [
        { h: "Start with one objective", p: "Write one objective with a number and a date, such as a count of signed clients by the end of a quarter. Revenue, meetings or signed contracts all work. Awareness alone does not, because you cannot audit it. Every other line on the page exists to serve this one sentence." },
        { h: "Audience and message", p: "Name the buyer as precisely as a customer file: which developers, what size, what stage of project, who signs. Then write the one message they must remember. One audience, one message per plan. A plan that speaks to everyone is a plan nobody hears, and it spends the budget proving it." },
        { h: "Channels follow the audience", p: "Choose channels by where the buyer already spends attention. A developer's finance director reads LinkedIn and answers WhatsApp; he is unlikely to scroll TikTok looking for a survey firm. Two or three channels done well beat seven done thinly. For each channel write what you will publish or send, how often, and who does it." },
        { h: "Budget and measure close it", p: "The budget line says how much, by month, by channel. The measure line says which numbers you will read every week and what result counts as success. If you cannot say what would make you stop, the plan has no measure yet. Week 8 turns this page into a 90-day plan." }
      ],
      caseStudy: {
        name: "Warby Parker Home Try-On",
        year: "2010",
        story: "Warby Parker launched in February 2010 selling glasses online, which raised an obvious question: who buys frames without trying them on? Its plan answered that one objection with one offer. Home Try-On posted five frames to the customer free, to try at home and send back. The audience was clear, the message was simple, and the measure was a first-year sales target. The company hit that target in three weeks and built a waiting list of 20,000 people. The founders did not need a thick strategy document. They needed to know the single reason their buyer would say no, and to remove it.",
        lesson: "A strong plan finds the buyer's main reason to say no and builds the offer around removing it.",
        source: "Warby Parker company history"
      },
      financeLens: "A plan is a budget with a story. The story is the hypothesis; the budget is the cost of testing it. Read it the way you read a capex request: what goes in, what is expected back, by when, and how you will know. A plan without a measure is spending without a control.",
      doNow: {
        task: "Draft a one-page plan skeleton for one of your father's three brands. Use no real figures yet; leave blanks where numbers will go.",
        steps: [
          "Write the six headings down the left of a page: Objective, Audience, Message, Channels, Budget, Measure.",
          "Fill Audience and Message in one line each from what you already know.",
          "Mark each blank you need your father to fill, ready for tomorrow's interview."
        ]
      },
      quiz: [
        { q: "Which objective belongs on a one-page plan?", options: ["Raise brand awareness in Dubai", "Sign 12 new developer clients by 31 March", "Post more on LinkedIn", "Be the best surveyor in the region"], answer: 1, why: "It has a number and a date, so it can be audited. The others cannot be checked." },
        { q: "What should decide the channels in a plan?", options: ["Where the team enjoys posting", "Where the buyer already spends attention", "Which platform is newest", "Whatever the competitor uses"], answer: 1, why: "Channels follow the audience. You go where the buyer already looks." },
        { q: "In Warby Parker's launch, what did Home Try-On remove?", options: ["The company's postage costs", "The buyer's main reason to say no: not trying frames on", "The need for a website", "The need for opticians"], answer: 1, why: "Five free frames at home removed the obvious objection to buying glasses online." }
      ],
      homework: "Finish the one-page skeleton for all three brands. For each, write the one reason a developer might say no. Bring the list of blanks to tomorrow's lesson.",
      teacherNotes: "Push him to write the objective as a number and a date before anything else. He will want to start with channels; stop him. Accountants like structure, so show him the page is a control document: inputs, expected outputs, review. Warby Parker works because the plan is one objection deep. Ask him which single objection a developer raises most. He will not know yet, which is the point of tomorrow's interview.",
      terms: [
        { term: "Objective", def: "The one result a plan exists to deliver, with a number and a date." },
        { term: "Hypothesis", def: "The bet behind a plan: if we do this, that result follows." },
        { term: "Measure", def: "The numbers read every week to judge whether the plan is working." }
      ],
      widget: null
    },
    {
      id: "w7d2", day: 2,
      title: "Audit the group",
      bigIdea: "Before you plan for a business, you audit it. Twelve questions to your father will give you more truth than any report.",
      teach: [
        { h: "Run it like an audit", p: "Book an hour with your father, phone face down, notebook open. Tell him you will ask twelve questions and write down his words, without arguing. Ask each question for each brand: Sail Survey, Built Pulse, Sky Signature. Where he gives a number, ask where it comes from. Where he gives an opinion, ask for one example." },
        { h: "Questions 1 to 4: the buyer", p: "1. Who are our best customers, by type and size of developer? 2. How do they buy: referral, tender, a call, a meeting? 3. Who decides: the owner, the project manager or finance? 4. Why did our best clients choose us over the alternatives?" },
        { h: "Questions 5 to 8: the flow", p: "5. Which deals did we lose last year, and why? 6. Where do new enquiries come from today, channel by channel? 7. How many clients come back for a second job? 8. What was our best month, and what made it good?" },
        { h: "Questions 9 to 12: the edge", p: "9. What was our worst month, and what caused it? 10. What do our competitors do that we do not? 11. What are we better at than anyone? 12. What is a new customer worth to us over the years we keep them?" },
        { h: "After the interview", p: "Type your notes the same evening. Mark every answer as fact, estimate or opinion. Facts with sources go into the plan. Estimates get checked against invoices or the accounts later. Opinions become questions for clients. Keep the notes private: they belong to the group, and they never go into this course or anywhere public." }
      ],
      caseStudy: {
        name: "New Coke",
        year: "1985",
        story: "Coca-Cola ran taste tests and found that people preferred a new formula. On 23 April 1985 it launched New Coke and retired the original. The public reaction was furious. People had a bond with the old drink that no taste test had asked about. After 79 days the original came back as Coca-Cola Classic. The research was careful and still wrong, because it measured taste when the real question was attachment. The company had asked a precise question about the wrong thing.",
        lesson: "Questions decide answers. Ask why customers choose and stay before you ask what they think of the product.",
        source: "The Coca-Cola Company history"
      },
      financeLens: "This is due diligence. A buyer of a business tests revenue quality: concentration, repeat rate, churn, margin by line. Your twelve questions do the same for marketing. Question 7 is retention, question 12 is customer lifetime value, questions 8 and 9 show seasonality, which drives working capital. Tag each answer by source, as you would audit evidence.",
      doNow: {
        task: "Prepare the interview sheet you will use with your father.",
        steps: [
          "Copy the twelve questions onto one page, with three columns: Sail Survey, Built Pulse, Sky Signature.",
          "Under each question, leave room for his words and a tag: fact, estimate or opinion.",
          "Book the hour with him by WhatsApp before this lesson ends."
        ]
      },
      quiz: [
        { q: "Why did New Coke fail despite careful taste tests?", options: ["The new formula tasted worse in the tests", "The tests measured taste, and the real issue was attachment", "It was too expensive", "It was launched in the wrong country"], answer: 1, why: "Taste tests answered the wrong question. People were attached to the original." },
        { q: "Your father says a typical client is worth a lot over the years. What do you do?", options: ["Write it in the plan as fact", "Ignore it", "Tag it as an estimate and check it against invoices later", "Ask a competitor"], answer: 2, why: "An estimate is useful, and it still needs evidence before it goes into a plan." },
        { q: "Which interview question gives you the repeat rate?", options: ["Who decides?", "How many clients come back for a second job?", "What do competitors do?", "What was our best month?"], answer: 1, why: "Clients returning for another job is retention, measured as the repeat rate." }
      ],
      homework: "Hold the interview if you can, or at least book it. Type up your notes and tag every answer as fact, estimate or opinion. Keep them private.",
      teacherNotes: "This is the most important lesson in the course for him. Coach him to listen and write, and to argue nothing on the day. His father may answer with stories instead of numbers; that is fine, ask for one example per story. Remind him the notes are confidential to the group. If the interview slips, the plan in week 8 has nothing to stand on, so protect the date.",
      terms: [
        { term: "Due diligence", def: "Checking a business's claims against evidence before relying on them." },
        { term: "Repeat rate", def: "The share of customers who buy again within a period." },
        { term: "Seasonality", def: "Regular high and low months in sales, which shape cash needs." }
      ],
      widget: null
    },
    {
      id: "w7d3", day: 3,
      title: "ICP and positioning for developers",
      bigIdea: "In B2B you sell to a committee. Define the ideal client, map who signs, then write one sentence that tells them why you.",
      teach: [
        { h: "The ideal client profile", p: "An ideal client profile describes the company you want more of: type of developer, size of portfolio, stage of project, location, how they pay. Build it from your best existing clients, from question 1 of the interview. It is a filter. Leads that fit get fast attention; leads that do not get a polite, cheaper route." },
        { h: "The buyer committee", p: "A developer rarely buys a report or a survey on one person's word. The owner cares about risk and reputation. The project manager cares about the schedule and fewer re-submissions. Finance cares about price, payment terms and compliance. Your message must give each of them a reason, in their own language." },
        { h: "The positioning template", p: "Use the week 1 template: For [who] who [need], [name] is the [category] that [benefit]. Unlike [alternative], we [proof]. The proof must be something you can show: a process, a turnaround you track, a client who will vouch for you. If you cannot prove it, leave it out." },
        { h: "A worked example", p: "Meridian Survey, a fictional firm: For mid-size developers who cannot afford a delayed handover, Meridian Survey is the surveying partner that delivers final surveys ready for registration first time. Unlike firms that hand over drawings and disappear, we track each file until it is accepted. Notice: one buyer, one fear, one proof." },
        { h: "Your three statements", p: "Write one statement per brand: Sail Survey, Built Pulse, Sky Signature. Each brand speaks to a different person inside the same developer, so the three sentences should sound different. Use only what your father told you. Test each one by reading it aloud to him and asking: would a client agree this is why they chose us?" }
      ],
      caseStudy: {
        name: "Salesforce: No Software",
        year: "1999–2000",
        story: "Around 1999 and 2000, buying enterprise software usually meant licences, installation projects and busy IT teams. Salesforce positioned itself against that whole experience with two words: No Software. The phrase named the alternative the buyer already knew, and often resented, and placed Salesforce on the other side of it. Notice what the slogan leaves out: features. A busy buyer could repeat it to a colleague in a corridor. That is the test of positioning in a buying committee: can the person who heard it pass it on accurately to the person who signs?",
        lesson: "Good positioning names the alternative the buyer knows and gives a contrast simple enough to repeat to the person who signs.",
        source: "Salesforce company history"
      },
      financeLens: "Positioning shows up in the gross margin line. A firm positioned as the cheapest competes on price and keeps thin margins. A firm positioned on a specific outcome, like fewer delays, can price above the market. When you review each brand, compare gross margin by service line: it tells you which position the market actually believes.",
      doNow: {
        task: "Draft positioning for one of your father's brands, using the template and only what his interview gave you.",
        steps: [
          "Write the buyer and the need in one line, from questions 1 and 4.",
          "Fill the template in under 50 words.",
          "Underline the proof. If you cannot show it, rewrite it."
        ]
      },
      quiz: [
        { q: "What is an ideal client profile for?", options: ["Listing every possible customer", "Filtering leads so the best-fit ones get fast attention", "Setting prices", "Designing the logo"], answer: 1, why: "It describes the client you want more of, so you know where to spend time." },
        { q: "On a developer's buying committee, who usually cares most about payment terms?", options: ["The project manager", "The site engineer", "Finance", "The marketing team"], answer: 2, why: "Finance owns price, terms and cash. Give finance a reason in its own language." },
        { q: "Why did 'No Software' work for Salesforce?", options: ["It listed every feature", "It named an alternative buyers knew and offered a clear contrast", "It was the cheapest option", "It used a celebrity"], answer: 1, why: "It positioned against installed enterprise software, a contrast simple enough to repeat." }
      ],
      homework: "Write all three positioning statements, one per brand. Read them to your father and note which words he changes. Bring the before and after versions.",
      teacherNotes: "Check he has not borrowed the Meridian example and swapped the name in. Each brand serves a different person inside the developer, so the three statements must differ. If his proof line is a claim like 'best service', push back: what would a client point to? He may find his father's answers too thin for a proof line. Good. That is a gap the 90-day plan can fix by collecting testimonials.",
      terms: [
        { term: "Ideal client profile", def: "A description of the company you most want as a customer, used to filter leads." },
        { term: "Buyer committee", def: "The group inside a client who influence or approve a purchase." },
        { term: "Proof point", def: "Evidence a buyer can check that backs a positioning claim." }
      ],
      widget: null
    },
    {
      id: "w7d4", day: 4,
      title: "The B2B channel plan in the Gulf",
      bigIdea: "Developers buy from people they trust. Your channels build trust in public, then convert it in private, on WhatsApp and in meetings.",
      teach: [
        { h: "LinkedIn: founder and company", p: "LinkedIn's own research says the large majority of B2B social leads come through LinkedIn. Use two accounts. The founder posts what he has seen on projects: lessons, mistakes avoided, rules explained. The company page posts proof: finished jobs, process, team. People trust a face before a logo, so the founder's account often carries more weight." },
        { h: "Referrals and partners", p: "A lot of high-value service work in the Gulf moves through recommendation. Plan for it. List who already sends you work: consultants, contractors, lawyers, other developers. Agree a way to thank them, and ask satisfied clients for an introduction at the moment a job lands well. A partner who sends two good clients a year can outweigh a large following." },
        { h: "Direct outreach and WhatsApp", p: "Make a list of developers who fit the ideal client profile. Reach each with a short, specific message on LinkedIn or by email, offering something useful. When they reply, move to WhatsApp, where Gulf business gets done, and follow the 7-touch sequence from week 6. Every conversation goes into the CRM the same day." },
        { h: "Google and events", p: "A Google Business Profile with reviews makes you findable when a project manager searches in a hurry. Events, such as property exhibitions and industry breakfasts, give you faces to follow up. Go with a list of who you want to meet, and send a message within a day. An event without follow-up is an expensive coffee." },
        { h: "Proof content ties it together", p: "Every channel needs the same raw material: proof. Short case notes on finished projects, with the client's permission. A checklist a developer can use. An explainer on a rule that confuses buyers. Teach the buyer something about their own project. Post it on LinkedIn, send it on WhatsApp, hand it over at events. One piece of proof, used five ways." }
      ],
      caseStudy: {
        name: "The Challenger Sale",
        year: "2011",
        story: "In 2011 CEB published The Challenger Sale, based on a study of about 6,000 sales reps. The best performers shared one habit: they taught the buyer something new about the buyer's own business, then linked that insight to what they sold. For B2B content this is a direct instruction. A developer has heard plenty of firms call themselves reliable. He pays attention to the one who shows him where projects like his tend to lose time, and how to avoid it. That is content worth a meeting.",
        lesson: "Content that teaches the buyer about his own business earns the meeting. Content that praises you earns a scroll.",
        source: "Dixon and Adamson, The Challenger Sale (CEB, 2011)"
      },
      financeLens: "Judge each channel by its own CAC: cost, including staff time, divided by customers it produced. A CFO also asks for payback by channel: months of contribution needed to repay that CAC. Referrals often have the lowest CAC and fastest payback, so they deserve a budget line too. Time is a cost even when no invoice arrives.",
      doNow: {
        task: "Rank the channels for one of your father's brands.",
        steps: [
          "List six channels: LinkedIn founder, LinkedIn company, referrals and partners, direct outreach, Google Business Profile, events.",
          "Score each from 1 to 5 for fit with that brand's buyer, and from 1 to 5 for cost in time and money.",
          "Pick the top three and write one action per channel for next week."
        ]
      },
      quiz: [
        { q: "According to LinkedIn's own research, where do most B2B social leads come from?", options: ["Instagram", "LinkedIn", "TikTok", "X"], answer: 1, why: "LinkedIn's research says the large majority of B2B social leads come through LinkedIn." },
        { q: "What did The Challenger Sale find the best reps do?", options: ["Offer the lowest price", "Teach the buyer something new about their own business", "Call more often than anyone else", "Avoid disagreeing with the buyer"], answer: 1, why: "CEB's study of about 6,000 reps found the best teach the buyer something new." },
        { q: "How should a CFO compare channels?", options: ["By follower numbers", "By CAC and payback per channel, including staff time", "By how modern they feel", "By the number of posts"], answer: 1, why: "Each channel's full cost, including time, divided by the customers it produced, then its payback." }
      ],
      homework: "Write a channel plan for all three brands: top three channels each, one weekly action per channel, and who does it. One page.",
      teacherNotes: "He will rate LinkedIn high everywhere. Ask whether Sky Signature's buyer behaves like Built Pulse's buyer; they may not. Challenge the referral line: who exactly refers, and what do they get? Make him include staff time in channel cost; accountants forget that time has a price when there is no invoice. Remind him that any case note about a real client needs that client's permission.",
      terms: [
        { term: "Referral partner", def: "A firm or person who regularly sends you clients, such as a consultant or contractor." },
        { term: "Proof content", def: "Posts and documents that show finished work or teach the buyer, used as evidence." },
        { term: "Channel CAC", def: "A channel's total cost, including time, divided by the customers it produced." }
      ],
      widget: null
    },
    {
      id: "w7d5", day: 5,
      title: "Budget and targets",
      bigIdea: "Work backwards from the revenue target to the leads you need each week. Then set the most you can pay for each customer.",
      teach: [
        { h: "Leads needed, worked backwards", p: "Leads needed = revenue target ÷ average deal ÷ close rate. Invented example: a target of AED 1,200,000 a year and an average deal of AED 20,000 means 60 deals. At a 25% close rate you need 240 qualified leads a year. That is 20 a month, or about 5 a week." },
        { h: "The CAC ceiling from margin", p: "Next, the most you can pay to win a customer. If the AED 20,000 deal carries an invented 40% gross margin, it contributes AED 8,000. Keep LTV to CAC at 3 to 1 on the first deal alone and your CAC ceiling is about AED 2,670. Repeat work raises the ceiling; prove it before spending it." },
        { h: "Budget and the 90-day calendar", p: "Service firms commonly spend 5% to 10% of revenue on marketing, B2B at the lower end. At 5% of AED 1,200,000 that is AED 60,000 a year, AED 5,000 a month, or AED 1,000 per deal won: well under the ceiling. Split the 90 days into fortnights and give each a target for leads, meetings and deals." }
      ],
      caseStudy: {
        name: "Dollar Shave Club launch video",
        year: "2012–2016",
        story: "On 6 March 2012 Dollar Shave Club released a launch video that cost about USD 4,500. In the first 48 hours it brought in 12,000 orders. That is a cost of well under one dollar per order, a figure any finance team would want to see. In July 2016 Unilever bought the company for about USD 1 billion. The video was cheap. The lesson for this week is the arithmetic: the founders could count what they spent and what came back, and so could anyone deciding to back them.",
        lesson: "Spend you can count against results you can count is a plan a CFO can approve.",
        source: "Dollar Shave Club; Unilever announcement, July 2016"
      },
      financeLens: "This is budgeting by driver. Revenue target is the output; average deal, close rate and lead cost are the drivers. Change one driver and the budget moves. Set a CAC ceiling from contribution per customer, check CAC payback in months, and review variance monthly: actual leads, CAC and deals against budget, with a reason for each gap.",
      doNow: {
        task: "Use the pipeline widget below with the invented numbers, then with your father's numbers if the interview gave them.",
        steps: [
          "Enter AED 1,200,000, AED 20,000 and 25%, and check you get 240 leads a year and 20 a month.",
          "Change the close rate to 20% and note how many leads you now need.",
          "Write the weekly lead target for one brand on a card."
        ]
      },
      quiz: [
        { q: "Target AED 1,200,000, average deal AED 20,000, close rate 25%. How many qualified leads a year?", options: ["60", "120", "240", "480"], answer: 2, why: "1,200,000 ÷ 20,000 = 60 deals; 60 ÷ 0.25 = 240 leads." },
        { q: "A deal contributes AED 8,000 and you want LTV:CAC of 3:1 on that deal alone. What is the CAC ceiling?", options: ["About AED 2,670", "AED 8,000", "AED 24,000", "About AED 1,000"], answer: 0, why: "8,000 ÷ 3 is about 2,670. Spend more and the first deal cannot return three times its cost." },
        { q: "What is the common marketing budget range for service firms?", options: ["1% to 2% of revenue", "5% to 10% of revenue", "20% to 30% of revenue", "Whatever is left over"], answer: 1, why: "Service firms commonly spend 5% to 10% of revenue, B2B at the lower end." }
      ],
      homework: "Using your father's numbers, privately, work out leads per week for each brand. Keep the figures in your own notes. Bring only the method, and any questions, to Monday.",
      teacherNotes: "Make him do the arithmetic by hand before the widget. Then ask what happens to weekly leads if the close rate halves; they double, and that is the risk he must show a CFO. The 40% margin is invented; he must use the group's real margin, privately. After the teach, run the 8-question week quiz the page builds. Check his notes stay off any shared device.",
      terms: [
        { term: "Close rate", def: "The share of qualified leads that become signed deals." },
        { term: "CAC ceiling", def: "The most you can pay to win a customer and still meet your return target." },
        { term: "Driver-based budget", def: "A budget built from its causes, such as deal size, close rate and lead cost." }
      ],
      widget: "pipeline"
    }
  ]
};
