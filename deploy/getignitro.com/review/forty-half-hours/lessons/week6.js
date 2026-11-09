window.COURSE = window.COURSE || { weeks: {} };
window.COURSE.weeks[6] = {
  n: 6,
  title: "Systems: from lead to cash",
  promise: "By day five you can set up CRM stages, run a 7-touch follow-up, structure a three-tier proposal and chair a 20-minute weekly meeting.",
  lessons: [
    {
      id: "w6d1", day: 1,
      title: "CRM and pipeline stages",
      bigIdea: "A pipeline is a set of stages with a rule for leaving each one. Without exit rules, it is a list of hopes.",
      teach: [
        { h: "Stages, in order", p: "A simple B2B pipeline: New lead, Qualified, Discovery done, Proposal sent, Negotiation, Won or Lost. Six stages are enough for most service firms. Every deal sits in exactly one stage, and every deal has one named owner. If nobody owns it, nobody follows it up." },
        { h: "Exit criteria", p: "Each stage needs a test a deal must pass to move on. New lead to Qualified: contacted, and BANT checked. Qualified to Discovery done: meeting held, need and decision-maker confirmed. Discovery to Proposal sent: proposal delivered with a review date agreed. Negotiation to Won: signature or purchase order. Feelings do not move deals. Evidence does." },
        { h: "A free CRM is enough", p: "You do not need an expensive system to start. A free CRM or a well-kept spreadsheet works if every lead goes in on the day it arrives, every stage change is logged, and every deal has a next action with a date. The habit is the system. The software only holds it." },
        { h: "Lost is a stage too", p: "Close lost deals properly and record the reason: price, timing, chose a competitor, no response, no budget. After three months the lost reasons become your most honest market research. A pipeline that never loses anything is a pipeline nobody is cleaning." }
      ],
      caseStudy: {
        name: "Salesforce and \"No Software\"",
        year: "1999 to 2000",
        story: "When Salesforce launched, customer relationship software meant a big licence, servers in your building and a long installation project. Salesforce ran its CRM in the browser and positioned itself on two words: \"No Software\". It set itself against installed enterprise software, the very category it was selling into. The message landed because the pain was real: sales teams hated slow, expensive systems and often stopped using them. The positioning made a CRM something a small team could switch on that week. Today the same logic is why a free CRM is a sensible first step for any firm.",
        lesson: "A CRM is only as good as the habit of using it. Lower the barrier and people actually log their deals.",
        source: "Salesforce company history"
      },
      financeLens: "Weighted forecast = deal value x stage probability, summed across the pipeline. Say Proposal sent is weighted at 40% and Negotiation at 70%. A AED 50,000 deal in Proposal sent counts as AED 20,000 of forecast revenue. Compare the weighted forecast each month with actual bookings: the gap tells you whether your stage probabilities are honest.",
      doNow: {
        task: "Draw a pipeline for a Dubai firm selling surveying, escrow reporting and serviced offices to property developers.",
        steps: [
          "Write the six stages across the top of a page.",
          "Under each, write one exit criterion a deal must meet to move on.",
          "Put an illustrative probability under each stage, rising from left to right."
        ]
      },
      quiz: [
        { q: "What turns a list of stages into a working pipeline?", options: ["More stages", "Colour coding", "Exit criteria for each stage", "An expensive CRM"], answer: 2, why: "Exit criteria make each move evidence-based, so the stages mean the same thing to everyone." },
        { q: "A AED 50,000 deal sits in a stage weighted at 40%. What does it add to the weighted forecast?", options: ["AED 20,000", "AED 50,000", "AED 40,000", "AED 12,500"], answer: 0, why: "Weighted value is deal value times stage probability: 50,000 x 40% = AED 20,000." },
        { q: "Why record the reason when a deal is lost?", options: ["The CRM requires it by law", "Lost reasons, over time, show why you lose and what to fix", "It makes the pipeline look smaller", "To blame the salesperson"], answer: 1, why: "A few months of lost reasons is honest market research about price, timing and competitors." }
      ],
      homework: "Sign up for any free CRM, or set up a spreadsheet with columns: name, company, source, stage, owner, value, next action, next action date. Enter three imaginary deals.",
      teacherNotes: "He will want to add stages. Resist: six is plenty. The exit criteria are the real content. Ask him to say, for each stage, what document or event proves a deal is there. Link the weighted forecast to revenue recognition: a forecast is not a booking. That instinct from ACCA is exactly right here.",
      terms: [
        { term: "CRM", def: "Customer relationship management: the system that holds every lead, deal and next action." },
        { term: "Exit criteria", def: "The evidence a deal must show before it moves to the next stage." },
        { term: "Weighted forecast", def: "Sum of each deal's value times its stage probability." },
        { term: "Deal owner", def: "The one person responsible for moving a deal forward." }
      ],
      widget: null
    },
    {
      id: "w6d2", day: 2,
      title: "Lead response and follow-up sequences",
      bigIdea: "Reply in minutes, then follow up seven times on a fixed timetable. Most deals are lost to silence, and silence is a choice.",
      teach: [
        { h: "Reply in minutes", p: "A lead is most alive in the minutes after it arrives. The buyer is at the screen, thinking about the problem. Every hour that passes, they cool, get distracted or call someone else. Set a response target in minutes and measure it. Speed is the one sales skill anyone can master by Monday." },
        { h: "The sequence: first day", p: "Touch 1, minute 5: call. Introduce yourself, ask one discovery question, book a meeting. Touch 2, hour 1: WhatsApp. A short message confirming the call or, if missed, asking a good time. Touch 3, day 1: email with a one-pager attached: what you do, for whom, one proof, one next step." },
        { h: "The sequence: the long tail", p: "Touch 4, day 3: call. Touch 5, day 7: WhatsApp with proof, a short case or a client result. Touch 6, day 14: email with something useful, a checklist or insight. Touch 7, day 30: a polite check-in asking whether the need still stands. Then close the deal as lost, with a reason." },
        { h: "Templates save the timetable", p: "Write each of the seven messages once, as a template with blanks for the name and project. When a lead arrives, nobody has to compose anything; they fill and send. Templates are what make speed possible on a busy day. Review them monthly and replace any line that gets no replies." },
        { h: "Work back from the target", p: "Use the calculator below. Enter a revenue target, the average deal, close rate and meeting rate. It tells you how many leads you need each month and each week. Then ask the hard question: can your follow-up handle that many leads at minute-5 speed?" }
      ],
      caseStudy: {
        name: "The short life of online sales leads",
        year: "2011",
        story: "Oldroyd, McElheran and Elkington audited 2,241 US companies for Harvard Business Review. They sent each one a web enquiry and timed the reply. The average response time was 42 hours. Only 37% responded within an hour, and 23% never responded at all. The firms that did call back within an hour were nearly 7 times as likely to qualify the lead as those that waited even one hour longer. Against firms waiting 24 hours or more, they were over 60 times as likely. The leads were paid for in every case. Most firms then left them to go cold.",
        lesson: "Response time changes what a lead is worth. Speed costs nothing and multiplies the value of every lead.",
        source: "Oldroyd, McElheran and Elkington, Harvard Business Review, 2011"
      },
      financeLens: "A lead is a purchased asset with a fast impairment curve. You paid the CPL at arrival; its value drops with every hour unanswered. Slow follow-up is a write-down nobody books. If speed lifts qualification, the same spend buys more customers, so CAC falls with no change to the ad budget.",
      doNow: {
        task: "Write touches 1 to 3 of the sequence for a developer who enquired about an escrow report.",
        steps: [
          "Write the opening two lines of the minute-5 call.",
          "Write the hour-1 WhatsApp in under 40 words.",
          "Write the subject line and first sentence of the day-1 email with the one-pager."
        ]
      },
      quiz: [
        { q: "In the HBR 2011 audit, what was the average response time to a web lead?", options: ["5 minutes", "42 hours", "1 hour", "7 days"], answer: 1, why: "The audit of 2,241 US companies found an average response time of 42 hours." },
        { q: "In the 7-touch sequence, what happens at day 7?", options: ["A first call", "A final check-in", "An email with the one-pager", "A WhatsApp with proof"], answer: 3, why: "Day 7 is a WhatsApp carrying proof: a short case or client result." },
        { q: "Firms replying within an hour were how many times as likely to qualify the lead as those waiting an hour longer?", options: ["Nearly 7 times", "Twice", "Over 60 times", "About the same"], answer: 0, why: "Nearly 7 times against one hour later; over 60 times against firms waiting 24 hours or more." }
      ],
      homework: "Finish the sequence: write touches 4 to 7 as templates with blanks for name and project. Keep each WhatsApp under 40 words and each email under 120.",
      teacherNotes: "Make him say the timetable from memory before the exercise: minute 5, hour 1, day 1, day 3, day 7, day 14, day 30. In the Gulf, WhatsApp is often the faster channel than email, so the hour-1 message matters. Check his WhatsApp draft is short, polite and ends with a question.",
      terms: [
        { term: "Response time", def: "Time from a lead arriving to the first real contact." },
        { term: "Follow-up sequence", def: "A fixed series of touches on a timetable until the lead answers or closes." },
        { term: "One-pager", def: "A single page: what you do, for whom, one proof, one next step." },
        { term: "Touch", def: "One contact with a lead: a call, message or email." }
      ],
      widget: "pipeline"
    },
    {
      id: "w6d3", day: 3,
      title: "Proposals, quotes and pricing pages",
      bigIdea: "A proposal is a decision document. Give three clear options, anchor high, state the terms, and make signing easy.",
      teach: [
        { h: "The structure", p: "One page on their problem, in their words from discovery. One page on the outcome you will deliver. Then the three options, the terms, the timeline and a signature block. Put your credentials last. Buyers read a proposal to check you understood them, so start where they are." },
        { h: "Three tiers", p: "Offer Good, Better and Best. Most buyers pick the middle, so build the middle tier to be the one you want to sell. The top tier is the anchor: it makes the middle look sensible. The bottom tier keeps a price-sensitive buyer from walking away." },
        { h: "One honest FOMO device", p: "Give one real reason to decide now: a price held until a date, limited survey slots this month, or a start date that slips if signed late. Only one, and it must be true. A deadline you later ignore teaches the buyer that your deadlines mean nothing." },
        { h: "Clear terms, easy signature", p: "State scope, exclusions, payment terms, validity and what happens if the scope changes. Vague terms create disputes and slow payment. End with a signature line or a one-click acceptance. Every extra step between yes and signed is a place the deal can stall." }
      ],
      caseStudy: {
        name: "The Economist decoy",
        year: "Classic experiment",
        story: "In Predictably Irrational, Dan Ariely tested three subscription offers on MIT students: web only at 59, print only at 125, and print plus web at 125. Nobody sensible wants print only when print plus web costs the same. That option is the decoy. With it present, 84% chose print plus web. When Ariely removed the decoy, only 32% chose print plus web. The prices of the real options never changed. Only the comparison did. The same principle sits under Good, Better and Best pricing, where most buyers pick the middle option.",
        lesson: "Buyers judge price by comparison. Design the options so the one you want to sell looks obvious.",
        source: "Dan Ariely, Predictably Irrational"
      },
      financeLens: "Tiers protect margin. Without them the only move in a negotiation is a discount, which comes straight off gross profit. With tiers, a buyer who wants a lower price moves down a tier and loses scope. Price falls, cost falls with it, and the margin percentage holds. Model each tier's margin before you send.",
      doNow: {
        task: "Sketch three tiers for a final survey service sold to a property developer.",
        steps: [
          "Name the three tiers and list what each includes.",
          "Mark which tier you want most buyers to choose and why.",
          "Write the one honest reason to sign this month."
        ]
      },
      quiz: [
        { q: "In the Economist test, what share chose print plus web when the decoy was present?", options: ["32%", "59%", "84%", "125%"], answer: 2, why: "84% chose print plus web with the decoy present; 32% chose it once the decoy was removed." },
        { q: "In Good, Better, Best pricing, which tier do most buyers pick?", options: ["Good", "Better", "Best", "None of them"], answer: 1, why: "Most buyers pick the middle, so the middle tier should be the one you most want to sell." },
        { q: "How do tiers protect margin in a negotiation?", options: ["They let price fall by removing scope, not by discounting", "They raise every price", "They hide the payment terms", "They remove the need for a proposal"], answer: 0, why: "A buyer who wants less spend moves down a tier, so cost falls with price and margin holds." }
      ],
      homework: "Find one pricing page online with three tiers. Note which tier is highlighted, what the top tier is for, and one thing you would change. Bring a screenshot.",
      teacherNotes: "The decoy is the hook; the margin point is the lesson for him. Ask him what a 10% discount does to gross profit at a 40% margin: it takes a quarter of the profit. Then show how moving down a tier avoids that. On FOMO, insist it is true and singular. Fake urgency costs trust.",
      terms: [
        { term: "Decoy", def: "An option designed to be rejected that makes another option look better." },
        { term: "Anchor", def: "A first, higher figure that shapes how later prices are judged." },
        { term: "Good, Better, Best", def: "Three-tier pricing where the middle tier is built to be chosen." },
        { term: "Validity", def: "The date until which a quoted price and scope stand." }
      ],
      widget: null
    },
    {
      id: "w6d4", day: 4,
      title: "Retention, referrals and reviews",
      bigIdea: "The cheapest customer is the one you already have. The second cheapest is the one they send you.",
      teach: [
        { h: "Retention first", p: "Keeping a client costs a phone call and good work. Winning a new one costs a whole funnel. So the first growth question is always: who bought last year and has not bought this year, and why? Book a check-in with every client at least once a quarter, with nothing to sell." },
        { h: "Ask at the moment of delight", p: "The best time to ask for a referral or review is the moment the client is happiest: the report delivered early, the survey approved first time, the handover done. Ask then, in person or on WhatsApp, while the feeling is fresh. A week later the moment has gone." },
        { h: "Make referral easy", p: "Give the client the words. A short message they can forward, with your name and one line on what you do. In B2B a referral is a favour to a colleague, so make it safe: promise a fast, polite response to whoever they send. Thank them whatever the result." },
        { h: "Reviews are public proof", p: "Ask happy clients for a Google review or a LinkedIn recommendation. Send the direct link; every extra click loses some of the people who meant to do it. Reply to every review, good or bad, briefly and professionally. Prospects read your replies as closely as the reviews." }
      ],
      caseStudy: {
        name: "Dropbox and Zappos",
        year: "2008 to 2010",
        story: "Dropbox built referral into the product. Invite a friend and both of you got free extra space: a two-sided reward. Users went from 100,000 in September 2008 to 4 million in January 2010, a 3,900% rise in 15 months, as Drew Houston described in a 2010 talk. Zappos took the retention road. It offered 365-day returns and free shipping both ways, and made service the brand. Customers came back and told their friends. Amazon bought Zappos in 2009 for about USD 1.2 billion. One engineered the referral; the other earned it through service.",
        lesson: "Referral can be engineered with a two-sided reward or earned through service. The best firms do both.",
        source: "Drew Houston, 2010 talk; Amazon acquisition of Zappos, 2009"
      },
      financeLens: "Retention raises LTV with no new CAC. A referred client arrives with a CAC close to zero, so they lift the average LTV:CAC of the whole book. Review it like a receivables ageing: list clients by months since last purchase. The ones drifting past twelve months are an asset at risk of impairment.",
      doNow: {
        task: "Write the referral ask for a developer client who has just received an escrow report on time.",
        steps: [
          "Write the WhatsApp ask in under 40 words.",
          "Write the forwardable line the client can send to a colleague.",
          "Write the thank-you message you send whatever happens."
        ]
      },
      quiz: [
        { q: "What made the Dropbox referral programme two-sided?", options: ["Only the new user got space", "Users paid to refer", "Both the inviter and the friend got free space", "It was run by two companies"], answer: 2, why: "Both sides got free extra space, so both had a reason to act." },
        { q: "When is the best moment to ask a client for a referral?", options: ["At the moment of delight, when they are happiest", "When sending the invoice", "Six months after the job", "Before the work starts"], answer: 0, why: "Goodwill is highest right after a visible win, so the ask lands best then." },
        { q: "Why do referred clients improve LTV:CAC for the whole client base?", options: ["They always pay more", "They need no service", "They never leave", "Their acquisition cost is close to zero"], answer: 3, why: "A referred client costs almost nothing to acquire, which lifts the average ratio across the book." }
      ],
      homework: "Think of a service you used and liked. Write the exact review you would leave, in under 60 words. Notice what made it easy or hard to say something specific.",
      teacherNotes: "Connect back to Reichheld from week 5 day 3: retention is the multiplier in LTV. The ageing idea will land well with an accountant; push it. In the Gulf, B2B referrals travel through personal relationships, so the forwardable message must be polite and modest. Check his draft is short and makes the client look good for sending it.",
      terms: [
        { term: "Retention", def: "Keeping existing clients buying over time." },
        { term: "Two-sided referral", def: "A referral reward given to both the person who refers and the person referred." },
        { term: "Moment of delight", def: "The point at which a client is happiest with your work." },
        { term: "Churn", def: "Clients who stop buying in a period, as a share of the total." }
      ],
      widget: null
    },
    {
      id: "w6d5", day: 5,
      title: "Marketing and sales as one team",
      bigIdea: "One weekly meeting, one sheet, one number. If marketing and sales disagree on the number, they are two teams.",
      teach: [
        { h: "The 20-minute meeting", p: "Same day, same time, every week, 20 minutes. Minutes 0 to 5: the six numbers on one sheet. 5 to 12: pipeline, deals that moved and deals that stalled. 12 to 17: lost deals and lead quality. 17 to 20: one decision, one owner, one date. Then stop." },
        { h: "One sheet, one number", p: "Both teams read the same sheet. Pick one number the whole team owns this quarter, often qualified leads or revenue won. Marketing cannot claim success on leads that sales calls junk, and sales cannot blame marketing for leads it never called. One number ends that argument." },
        { h: "Handoff rules", p: "Agree in writing what a qualified lead is, using BANT. Agree how fast sales must respond, and who owns the lead at each stage. Agree that sales logs a reason for every rejected lead. The rules turn a blame game into data marketing can use to fix its targeting." }
      ],
      caseStudy: {
        name: "AARRR, the pirate metrics",
        year: "2007",
        story: "In 2007 Dave McClure proposed five stages every business should measure: Acquisition, Activation, Retention, Referral, Revenue. Read aloud, they sound like a pirate, which is why people remember them. The value is that they run across the whole customer life in one line. Acquisition and activation sit mostly with marketing. Revenue sits with sales. Retention and referral sit with whoever serves the client. No single team owns the whole chain, so no single team can fix it alone. A shared funnel forces a shared meeting.",
        lesson: "The customer passes through every team. Measure the whole chain together, in one place.",
        source: "Dave McClure, 2007"
      },
      financeLens: "The weekly sheet is a management account, in miniature. Same format every week, so variances stand out. Flag anything more than 10% off plan and explain it in one line. A meeting without a sheet is opinion; a sheet without a meeting is a report nobody acts on. The 20 minutes turns data into one decision.",
      doNow: {
        task: "Draft the agenda and the one sheet for a weekly meeting at a Dubai group selling surveying, escrow reporting and serviced offices to developers.",
        steps: [
          "Write the four agenda blocks with their minutes.",
          "List the six numbers as rows, one column per brand.",
          "Choose the one number the whole team owns, and say why."
        ]
      },
      quiz: [
        { q: "How long is the weekly marketing and sales meeting in this course?", options: ["60 minutes", "20 minutes", "5 minutes", "Half a day"], answer: 1, why: "Twenty minutes: the numbers, the pipeline, lost deals, then one decision with an owner and a date." },
        { q: "What does AARRR stand for?", options: ["Awareness, Action, Reach, Return, Revenue", "Ads, Audience, Reach, Retargeting, ROAS", "Acquisition, Activation, Retention, Referral, Revenue", "Attention, Appeal, Reason, Response, Result"], answer: 2, why: "Dave McClure's 2007 pirate metrics: Acquisition, Activation, Retention, Referral, Revenue." },
        { q: "What should sales log when it rejects a lead from marketing?", options: ["A reason for the rejection", "Nothing", "The marketer's name", "The ad cost"], answer: 0, why: "A logged reason turns rejection into data marketing can use to improve lead quality." }
      ],
      homework: "Teach the 7-touch sequence to someone at home in under three minutes, from memory. Note which touch they found strangest and why.",
      teacherNotes: "Short teach, then the week quiz. The Do Now uses the group's three lines as structure only; no figures needed, and none should be asked for. If he picks revenue as the one number, ask whether marketing can move it this week. Qualified leads is often the better shared number early on.",
      terms: [
        { term: "AARRR", def: "Acquisition, Activation, Retention, Referral, Revenue: the full customer chain in five stages." },
        { term: "Handoff", def: "The moment a lead passes from marketing to sales, under agreed rules." },
        { term: "Qualified lead", def: "A lead that meets the agreed BANT test for sales to pursue." },
        { term: "North star number", def: "The one figure the whole team owns and reviews every week." }
      ],
      widget: null
    }
  ]
};
