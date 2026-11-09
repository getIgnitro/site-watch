window.COURSE = window.COURSE || { weeks: {} };
window.COURSE.weeks[2] = {
  n: 2,
  title: "Sales: how money actually changes hands",
  promise: "By day five you can qualify a lead, run a discovery call, answer five common objections and ask for the business.",
  lessons: [
    {
      id: "w2d1", day: 1,
      title: "Marketing vs sales, and the funnel",
      bigIdea: "Marketing brings the right buyers to the door. Sales turns a named buyer into a signed deal. Revenue is leads times conversion times deal size.",
      teach: [
        { h: "Two jobs, one number", p: "Marketing creates demand and leads: people who know you and might buy. Sales converts named people into contracts. Peter Drucker wrote in 1973: \"The aim of marketing is to make selling superfluous.\" Good marketing makes the sales call easier because the buyer arrives already half convinced. Both teams answer to the same number: revenue." },
        { h: "AIDA, the oldest map", p: "In 1898 Elias St. Elmo Lewis described four steps a buyer moves through: Attention, Interest, Desire, Action. Every advert, post and sales email is trying to move someone one step down that list. When something is not working, ask which step it fails at. Most fail at the first." },
        { h: "From funnel to pipeline", p: "The funnel is the marketing view: many people at the top, fewer at each step. In B2B the bottom becomes a pipeline: a list of named deals, each at a stage such as lead, meeting, proposal, negotiation, won or lost. A pipeline you cannot name deal by deal is a hope, and hope is not a forecast." },
        { h: "Upsell and cross-sell", p: "The cheapest sale is to someone who has just bought. McDonald's \"Would you like fries with that?\" is the upsell: more of the same purchase. Amazon's \"Customers who bought this also bought\" is the cross-sell: a related product. A developer buying a final survey may also need registration support. Ask at the moment of purchase." },
        { h: "The revenue equation", p: "Revenue = leads × conversion rate × average deal size. There are only three levers. More leads is marketing. Better conversion is sales skill. Bigger deals are pricing, tiers and upselling. When someone says \"we need more sales\", ask which of the three they mean. The answer changes the whole plan." }
      ],
      caseStudy: {
        name: "Fries and recommendations",
        year: "Drucker 1973; McDonald's; Amazon",
        story: "Drucker's line sets the goal: marketing so good that selling becomes almost unnecessary. Two companies show what happens at the very end of the funnel. At McDonald's, staff were trained to ask one question at the till: \"Would you like fries with that?\" The customer was already buying. The question cost nothing and raised the value of the order. Amazon built the same instinct into software. Every product page shows \"Customers who bought this also bought\", and a large share of Amazon's sales comes from those recommendations. Neither company found a new customer. Each made more from a customer it already had, at the moment that customer was most willing to say yes.",
        lesson: "The moment of purchase is the cheapest selling moment you will ever get. Always offer the next sensible thing.",
        source: "Peter Drucker, 1973; McDonald's upsell; Amazon recommendations."
      },
      financeLens: "A pipeline is a forecast, and you should audit it like one. Use the revenue equation as a driver model: say 40 leads a month, 10% conversion, AED 50,000 average deal gives AED 200,000. Each input is an assumption to test against history. Push one input and watch revenue move, exactly as you would flex a budget.",
      doNow: {
        task: "Use the pipeline tool to see what a revenue target demands. Use made-up numbers, not the group's.",
        steps: [
          "Enter a monthly revenue target, an average deal size, a close rate and a meeting rate.",
          "Read off the leads needed per month and per week.",
          "Halve the close rate. Write down how many extra leads that costs you."
        ]
      },
      quiz: [
        { q: "What does the A at the start of AIDA stand for?", options: ["Action", "Awareness", "Attention", "Appeal"], answer: 2, why: "Lewis's 1898 model runs Attention, Interest, Desire, Action." },
        { q: "\"Would you like fries with that?\" is an example of what?", options: ["A cross-sell", "An upsell", "A discount", "A referral"], answer: 1, why: "It adds more to the same purchase at the till, which is an upsell." },
        { q: "Revenue is 30 leads × 20% conversion × AED 10,000 deal. What is it?", options: ["AED 6,000", "AED 30,000", "AED 60,000", "AED 600,000"], answer: 2, why: "30 × 0.2 = 6 customers; 6 × AED 10,000 = AED 60,000." }
      ],
      homework: "Note every upsell or cross-sell offered to you in the next 24 hours, in shops, apps or restaurants. Write which ones worked on you and why.",
      teacherNotes: "Draw the funnel and the pipeline side by side on paper. Make him define each pipeline stage by what must be true to enter it, not by feelings. The revenue equation is his home ground: let him build it as a three-driver model. On the widget, have him change one input at a time. Remind him that numbers in the course are illustrative.",
      terms: [
        { term: "AIDA", def: "Attention, Interest, Desire, Action: the buyer's steps, described by Lewis in 1898." },
        { term: "Pipeline", def: "The list of named open deals, each at a defined stage." },
        { term: "Upsell", def: "Selling more or a higher tier of the same purchase." },
        { term: "Cross-sell", def: "Selling a related product to someone already buying." }
      ],
      widget: "pipeline"
    },
    {
      id: "w2d2", day: 2,
      title: "Prospecting and qualifying",
      bigIdea: "Find leads from several sources, qualify them fast with BANT, and answer within the hour. Speed is the cheapest advantage in sales.",
      teach: [
        { h: "Four sources of leads", p: "Inbound: they find you through search, your site or a post. Outbound: you contact them first by call, email or LinkedIn. Referral: a happy client sends them. Partners: firms who serve the same buyer, such as lawyers, brokers or contractors, pass them on. In B2B relationship markets, referrals and partners usually bring the best-fit leads. Track which source each lead came from." },
        { h: "BANT", p: "IBM's checklist for whether a lead is real. Budget: can they pay? Authority: are you talking to the person who decides? Need: do they have the problem you solve? Timeline: when must it be done? A lead missing two of the four is a conversation, not yet an opportunity. Ask the questions politely and early." },
        { h: "Qualify out quickly", p: "A fast no is the second-best answer in sales. Every hour spent chasing a lead that will never buy is an hour taken from one that will. Decide early, write down why, and move on. Keep a polite line open, because today's poor fit can be next year's client." },
        { h: "Speed wins", p: "The first firm to answer usually sets the terms of the conversation. A developer who sends an enquiry at 10am is often asking three suppliers at once. Reply within the hour on the channel he used: WhatsApp gets WhatsApp, email gets email, and a call is best of all." }
      ],
      caseStudy: {
        name: "The short life of online sales leads",
        year: "HBR 2011",
        story: "Oldroyd, McElheran and Elkington audited how quickly 2,241 US companies answered online leads. The average response time was 42 hours. Only 37% responded within an hour, and 23% never responded at all. Then they looked at what speed was worth. Firms that contacted a lead within an hour were nearly 7 times as likely to qualify it as those that waited even one hour longer. Against firms that waited 24 hours or more, they were over 60 times as likely. The leads were the same. The only thing that changed was how long they sat in an inbox.",
        lesson: "A lead loses value by the hour. Answering fast costs nothing and multiplies your chance of a real conversation.",
        source: "Oldroyd, McElheran and Elkington, \"The Short Life of Online Sales Leads\", HBR 2011."
      },
      financeLens: "A lead has a cost: cost per lead, or CPL, is the spend that produced it. Treat a fresh lead like perishable inventory. Its value decays fast, so slow response is an impairment you never see in the accounts. A firm that answers in 42 hours is writing off much of its marketing spend before anyone picks up the phone.",
      doNow: {
        task: "List ten places leads could come from for Sail Survey, and sort them.",
        steps: [
          "Write ten possible lead sources, for example a partner law firm, Google search, a past client.",
          "Mark each one: inbound, outbound, referral or partner.",
          "Circle the two you think bring the best-fit developers, and write one line on why."
        ]
      },
      quiz: [
        { q: "What does the A in BANT stand for?", options: ["Attention", "Authority", "Agreement", "Availability"], answer: 1, why: "BANT is Budget, Authority, Need, Timeline. Authority checks you are speaking to the decider." },
        { q: "In the HBR 2011 audit, what was the average response time to an online lead?", options: ["1 hour", "5 hours", "24 hours", "42 hours"], answer: 3, why: "The 2,241 companies averaged 42 hours to respond." },
        { q: "Compared with waiting 24 hours or more, how much likelier were firms that replied within an hour to qualify the lead?", options: ["Twice", "About 7 times", "Over 60 times", "No difference"], answer: 2, why: "Over 60 times as likely; nearly 7 times compared with waiting just one hour longer." }
      ],
      homework: "Send an enquiry to two local businesses by WhatsApp or web form. Record how long each takes to reply and how good the reply is. Bring the times.",
      teacherNotes: "The HBR figures are memorable; make him say them back without looking. Link the decay of a lead to his audit thinking: an unanswered lead is an asset impaired by neglect. Ask him how quickly enquiries are answered in the group today. He does not need to know the answer yet; it goes on his interview list for week 7. Accept no real client names in the exercise.",
      terms: [
        { term: "BANT", def: "Budget, Authority, Need, Timeline: IBM's lead qualification checklist." },
        { term: "CPL", def: "Cost per lead: marketing spend divided by leads produced." },
        { term: "Qualify out", def: "Deciding early that a lead will not buy and stopping work on it." }
      ],
      widget: null
    },
    {
      id: "w2d3", day: 3,
      title: "Discovery: ask, do not pitch",
      bigIdea: "Big sales are won by asking good questions and listening. Let the buyer explain their problem and its cost before you offer anything.",
      teach: [
        { h: "Questions sell, pitches bore", p: "Neil Rackham's research found that in big sales the winners asked more and talked less. A pitch tells the buyer what you think matters. A good question lets the buyer tell you what actually matters, and people believe what they say themselves far more than what you tell them." },
        { h: "SPIN, in order", p: "Situation questions get the facts: how many units, which stage. Problem questions find the pain: where do delays come from? Implication questions grow the pain: what does a delay cost you? Need-payoff questions let them name the value: if that were fixed, what would it mean? Ask few situation questions; do your homework before the call instead." },
        { h: "Implication does the work", p: "A small problem does not justify a big purchase. Implication questions connect the small problem to a big consequence: a late report holds up an escrow release, which holds up cash for the next phase. When the buyer says the cost out loud, the price of fixing it stops looking expensive." },
        { h: "Listen most of the time", p: "On a good discovery call the buyer does most of the talking. Take notes. Repeat back what you heard before you move on. Silence after a question is fine; let it sit. If you find yourself explaining your company for five minutes, stop and ask a question." },
        { h: "Teach something new", p: "The Challenger Sale (CEB, 2011) studied about 6,000 sales reps and found the best ones teach the buyer something new about their own business. Bring one useful insight to every meeting: a common cause of handover delays, a question their bank will ask. It earns the right to ask harder questions." }
      ],
      caseStudy: {
        name: "SPIN Selling",
        year: "1988",
        story: "Neil Rackham and his team at Huthwaite spent 12 years studying what actually happens in sales calls. They analysed 35,000 of them. The common advice of the day was to pitch hard, handle objections and close often. For small purchases that worked well enough. For big ones it did not. In large sales, the successful sellers asked more questions, and a particular kind: questions about the consequences of the buyer's problem and the value of solving it. Rackham grouped them as Situation, Problem, Implication and Need-payoff. The finding turned sales training on its head. In a big sale the buyer has to convince himself. Your job is to ask the questions that help him do it.",
        lesson: "In large B2B sales, the seller who asks the best questions wins more often than the seller with the best pitch.",
        source: "Neil Rackham, SPIN Selling (Huthwaite, 1988); The Challenger Sale (CEB, 2011)."
      },
      financeLens: "Discovery is where you size the buyer's cost of the problem, and that sets your price ceiling. If a delay costs the developer more than your fee, your fee is an investment with a fast payback, in his own numbers. It is the buyer's business case: cost avoided against cost paid. Without discovery you can only argue on price.",
      doNow: {
        task: "Write 8 discovery questions for a property developer buying a survey or escrow report service.",
        steps: [
          "Write 2 Situation questions you could not answer from his website.",
          "Write 2 Problem and 2 Implication questions about delays, rejections or cash.",
          "Write 2 Need-payoff questions that let him say the value himself.",
          "Underline the one question you would ask first, and say why."
        ]
      },
      quiz: [
        { q: "In SPIN, which type of question connects a problem to its bigger consequences?", options: ["Situation", "Problem", "Implication", "Need-payoff"], answer: 2, why: "Implication questions grow a small problem into its real cost, which justifies the purchase." },
        { q: "How many sales calls did Rackham's team analyse?", options: ["3,500", "12,000", "35,000", "100,000"], answer: 2, why: "SPIN rests on 35,000 sales calls studied over 12 years." },
        { q: "According to The Challenger Sale, what do the best reps do?", options: ["Build friendships first", "Teach the buyer something new about their own business", "Offer the lowest price", "Call the most prospects"], answer: 1, why: "CEB's study of about 6,000 reps found the best teach the buyer a new insight." }
      ],
      homework: "Ask a friend or relative about a problem at work for ten minutes using only questions. Note one Implication question that made them stop and think.",
      teacherNotes: "Play the developer in the role-play and be a little difficult. When he jumps to pitching, stop him and ask what question he could have asked. Point out the buyer committee again: the owner, the project manager and finance each need different questions. His 8 questions feed the week 8 sales kit, so keep the best version. Praise silence after his questions.",
      terms: [
        { term: "SPIN", def: "Situation, Problem, Implication, Need-payoff: Rackham's four question types." },
        { term: "Discovery call", def: "A meeting to understand the buyer's problem before proposing anything." },
        { term: "Challenger", def: "A seller who teaches the buyer something new about their business." }
      ],
      widget: "rolePlay",
      rolePlay: [
        { prompt: "The developer says: \"We already have a surveyor. They're fine.\"", model: "\"Fine is a good place to start. Think about your last handover: where did the time go, and was any of it on the survey side?\" Then an implication: \"What did that cost you?\"" },
        { prompt: "The developer says: \"Our escrow reports keep getting sent back.\"", model: "\"Sent back by whom, and for what, usually?\" Then: \"While a report sits there, what happens to the release of funds for the next stage?\"" },
        { prompt: "The developer says: \"Handover is in four months.\"", model: "\"Walk me through what has to be true by then. Which step worries your project manager most?\" Let him list it. Write it down. Ask which step slipped last time." },
        { prompt: "The developer says: \"Just tell me your price.\"", model: "\"I will, today. So I quote the right thing and not a guess: how many units are we talking about, and what stage is the project at now?\"" },
        { prompt: "The developer says: \"Our finance director handles that side.\"", model: "\"That makes sense. What will she need to see to say yes? Would she join the next call for fifteen minutes, so we answer her questions first-hand?\"" }
      ]
    },
    {
      id: "w2d4", day: 4,
      title: "Objections and negotiation",
      bigIdea: "An objection is a question in disguise. Listen, acknowledge, explore, then respond, and use a few negotiator's tools to keep the buyer talking.",
      teach: [
        { h: "Objections are interest", p: "A buyer who objects is still in the conversation. Silence is the real danger. Most objections fall into a few families: price, timing, \"we have someone\", and \"send me a proposal\". Prepare an answer for each in advance, so you are calm when it arrives and do not argue." },
        { h: "LAER", p: "Listen to the whole objection without interrupting. Acknowledge it: \"That's fair.\" Explore it with a question to find what sits underneath. Respond only then, to the real concern. Most sellers jump straight to respond and answer the wrong thing. Exploring usually reveals that \"too expensive\" means \"I can't see the value yet\"." },
        { h: "Mirror and label", p: "Chris Voss, a former FBI negotiator, teaches two simple tools. Mirroring: repeat the last three words the buyer said, as a gentle question, and he will explain more. Labelling: name the feeling, \"It sounds like you've been let down before.\" Both keep him talking and show you are listening." },
        { h: "Calibrated questions", p: "Voss's calibrated questions begin with how or what and hand the problem back to the other side. \"How am I supposed to do that?\" in response to a demand for a big discount makes the buyer think about your constraints. \"What would need to be true for this to work?\" turns resistance into a list." },
        { h: "Trade, never give", p: "If you lower the price, take something away: scope, speed, or extras. Or ask for something back: a faster payment, a longer contract, a referral. A discount given for nothing teaches the buyer that your first price was not real, and he will ask again next time." }
      ],
      caseStudy: {
        name: "Chris Voss",
        year: "2016",
        story: "Chris Voss is a former FBI negotiator. In Never Split the Difference he argues that people are not rational calculators across the table. They are emotional and want to feel heard and in control. His tools are small and practical. Mirror the last three words and the other person keeps talking. Label what they seem to feel, \"It sounds like...\", and the tension drops. Ask calibrated questions such as \"How am I supposed to do that?\", which push the other side to solve your problem for you. None of this needs charm. It needs patience, and the discipline to talk less than the other person.",
        lesson: "Make the other side feel heard, then let your questions do the pushing. Tactical empathy works in sales as well as in a crisis.",
        source: "Chris Voss, Never Split the Difference (2016)."
      },
      financeLens: "Discounts hit contribution margin. Say a job sells at 100 with costs of 70: gross profit 30. A 10% discount cuts price to 90 and profit to 20, a third of your margin gone. To earn the same 30 in total you now need 50% more jobs. Before any discount, compute the volume it must buy just to stand still.",
      doNow: {
        task: "Write your answer to the four common objections using LAER.",
        steps: [
          "Write the objections: price, timing, \"we have someone\", \"send me a proposal\".",
          "For each, write the acknowledge line and one explore question.",
          "Rehearse two of them out loud with your uncle playing the developer."
        ]
      },
      quiz: [
        { q: "What does the E in LAER stand for?", options: ["Explain", "Explore", "Escalate", "Evaluate"], answer: 1, why: "Listen, Acknowledge, Explore, Respond. Exploring finds the real concern before you answer it." },
        { q: "In Voss's method, what is mirroring?", options: ["Copying the buyer's body language", "Repeating the buyer's last three words as a question", "Matching the competitor's price", "Writing down everything the buyer says"], answer: 1, why: "Repeating the last three words invites the other person to say more." },
        { q: "A job sells for 100 with 70 of costs. After a 10% discount, how much more volume do you need to keep the same gross profit?", options: ["10%", "30%", "50%", "100%"], answer: 2, why: "Profit per job falls from 30 to 20, so you need 1.5 times the jobs: 50% more." }
      ],
      homework: "In two conversations tomorrow, try one mirror and one label. Write what the other person said next, and whether it opened them up.",
      teacherNotes: "Do the role-play cards twice: once reading the model, once with the card hidden and him answering. Be a realistic developer: polite, busy, a little sceptical. Watch for him dropping the price at the first push. The discount sum is the finance hook; make him do it with different margins. Remind him that a buyer saying \"send a proposal\" often means \"go away nicely\".",
      terms: [
        { term: "LAER", def: "Listen, Acknowledge, Explore, Respond: a method for handling objections." },
        { term: "Mirroring", def: "Repeating the other person's last three words to make them say more." },
        { term: "Labelling", def: "Naming the other person's feeling aloud: \"It sounds like...\"" },
        { term: "Calibrated question", def: "A how or what question that hands the problem to the other side." }
      ],
      widget: "rolePlay",
      rolePlay: [
        { prompt: "The buyer says: \"Your price is too high.\"", model: "Acknowledge and label: \"It sounds like the number surprised you.\" Explore: \"Compared with what?\" Then respond to what he says: show the cost of the problem, or offer a smaller scope." },
        { prompt: "The buyer says: \"Now is not a good time.\"", model: "\"That's fair, there's a lot on.\" Then a calibrated question: \"What would have to happen for this to be the right time?\" Agree a date to speak again before you hang up." },
        { prompt: "The buyer says: \"We have someone for that.\"", model: "Mirror: \"You have someone?\" Let him talk. Then: \"If you could change one thing about how it works today, what would it be?\" You are looking for the gap, not a fight." },
        { prompt: "The buyer says: \"Just send me a proposal.\"", model: "\"Happy to. So it's worth your time to read: how will you decide between proposals, and who else will read it?\" Then book ten minutes to walk him through it." },
        { prompt: "The buyer says: \"Can you do better on the price?\"", model: "Calibrated: \"How am I supposed to do that and still deliver the same work?\" If you move, trade: \"I can, if we drop this item or you pay half upfront.\"" }
      ]
    },
    {
      id: "w2d5", day: 5,
      title: "Closing and follow-up",
      bigIdea: "Ask for the business plainly, always leave with a dated next step, and follow up until you get a clear yes or no.",
      teach: [
        { h: "Ask for the next step", p: "Closing is asking clearly for a decision or the next step. Never end a meeting with \"let me know\". End it with a date: \"Shall we book the site visit for Tuesday?\" or \"Can I send the agreement today for signature?\" A next-step close is small, easy to say yes to, and keeps the deal moving." },
        { h: "Follow up with discipline", p: "Many B2B deals are never lost to a competitor. They die of silence. Buyers are busy, and your proposal is one email among hundreds. Plan follow-ups before you send the proposal: a call, a WhatsApp, a useful article, a short reminder. Each touch should add something, and stop when you get a clear answer." },
        { h: "The CRM habit", p: "A CRM is the record of every lead, deal, stage and next action. A free one is enough to start; a disciplined spreadsheet is better than nothing. The rule: every open deal has an owner, a stage and a next step with a date. If it is not in the CRM, it did not happen." }
      ],
      caseStudy: {
        name: "Zappos",
        year: "2009",
        story: "Zappos sold shoes online, and buying shoes you cannot try on feels risky. The fear was simple: what if they don't fit? So Zappos removed it. It offered free shipping both ways and a 365-day returns policy. Saying yes no longer felt risky, because saying yes could always be undone. Then it treated service as the brand itself, so customers came back and told their friends. The close was easy because the risk had gone, and the follow-up was the service. In 2009 Amazon bought Zappos for about USD 1.2 billion.",
        lesson: "Remove the buyer's risk and closing becomes easy. Look after them afterwards and the next sale closes itself.",
        source: "Zappos returns and shipping policy; Amazon acquisition, 2009, about USD 1.2 billion."
      },
      financeLens: "A fast close is working capital. Days sales outstanding, DSO, is receivables divided by revenue, times the days in the period. Every week a deal drifts before signing, and every week an invoice waits after delivery, is cash tied up. Agree payment terms at the close, invoice the same day, and chase payment as firmly as the sale.",
      doNow: {
        task: "A developer asked for a quote three days ago and has gone quiet. Plan the close and the follow-up.",
        steps: [
          "Write a next-step close of one sentence, with a date in it.",
          "Plan three follow-up touches across call, WhatsApp and email, with the day of each.",
          "For each touch, write the one useful thing it adds besides \"just checking in\"."
        ]
      },
      quiz: [
        { q: "Which is a next-step close?", options: ["\"Let me know what you think.\"", "\"Shall we book the site visit for Tuesday?\"", "\"Any questions?\"", "\"We are the best in Dubai.\""], answer: 1, why: "It asks for a specific, dated, easy next step." },
        { q: "How did Zappos make it easy for customers to say yes?", options: ["The lowest prices online", "Free shipping both ways and 365-day returns", "Celebrity adverts", "A loyalty points scheme"], answer: 1, why: "Removing the risk of a wrong purchase removed the main objection to buying." },
        { q: "What does DSO measure?", options: ["Days of stock on hand", "How fast customers pay, in days", "Days until a deal is signed", "Days of supplier credit"], answer: 1, why: "Days sales outstanding = receivables ÷ revenue × days: how long customers take to pay." }
      ],
      homework: "Set up a simple CRM sheet with columns: name, source, stage, value, owner, next step, next date. Add three made-up deals. Bring it to Monday.",
      teacherNotes: "Short teach, then the week quiz. Practise the next-step close out loud until it sounds natural, because most people find asking awkward. Connect DSO to his ACCA working capital work and the cash conversion cycle. Point out that week 2 has given him the whole sale, from lead to signature. The CRM sheet he builds tonight becomes the base for week 6.",
      terms: [
        { term: "Next-step close", def: "Asking for a small, specific, dated next action instead of a final yes." },
        { term: "CRM", def: "Customer relationship management: the record of leads, deals, stages and next actions." },
        { term: "DSO", def: "Days sales outstanding: receivables ÷ revenue × days in the period." }
      ],
      widget: null
    }
  ]
};
