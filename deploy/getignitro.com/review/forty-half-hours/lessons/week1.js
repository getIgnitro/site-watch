window.COURSE = window.COURSE || { weeks: {} };
window.COURSE.weeks[1] = {
  n: 1,
  title: "What marketing really is",
  promise: "By day five you can explain marketing in one sentence and write a positioning statement.",
  lessons: [
    {
      id: "w1d1", day: 1,
      title: "Marketing is not advertising",
      bigIdea: "Marketing is deciding who you serve, what they value and how you earn and keep them. Advertising is one small tool inside it.",
      teach: [
        { h: "Need, want, demand", p: "A need is the problem: a developer must hand over finished units. A want is the shape of the answer: a firm that gets the paperwork done fast. Demand is a want with a budget behind it. Marketing starts at the need and works forward to the product. Advertising starts at the product and shouts. Ask of any business you meet tomorrow: which need does it actually serve?" },
        { h: "Sell the hole", p: "Theodore Levitt popularised the line: people do not want a quarter-inch drill, they want a quarter-inch hole. Customers buy outcomes. The drill is your cost of delivering one. When you describe a service, describe what the buyer has afterwards: a registered unit, a released payment, a signed tenant. Specifications come second, if at all." },
        { h: "Value is a sum", p: "Value is what the customer gets minus everything it costs them: money, time, effort and worry. You can raise value by adding benefit or by removing cost. Removing worry is often the cheapest move. A developer will pay more to a supplier who never surprises him than to a cheaper one who might." },
        { h: "The whole chain", p: "Product, price, where it is sold, how people hear of it, the sale, the delivery, the repeat order, the referral. Every link is marketing. A brilliant advert on top of a broken delivery link only brings more people to the failure, faster. When sales are weak, check the chain link by link before you blame the ads." },
        { h: "Define the business by need", p: "Levitt's \"Marketing Myopia\" (HBR, 1960) argued that the railways declined because they thought they were in the railway business when they were really in transportation. Cars and planes took their customers. A firm defined by its product dies with the product. A firm defined by the customer's need can change the product and live." }
      ],
      caseStudy: {
        name: "Kodak",
        year: "1975–2012",
        story: "In 1975 a Kodak engineer called Steve Sasson built the first digital camera. Kodak owned the future in its own lab. Its managers understood the threat perfectly well. Film, chemicals and printing were the profit machine, and digital photography needed none of them. So the company did what felt prudent. It protected film and kept marketing what it already sold. Customers had never cared about film. They cared about keeping their memories. When other companies gave them that in digital form, they moved, and Kodak followed slowly and late. In January 2012 the company that had invented the answer filed for bankruptcy.",
        lesson: "Kodak defined itself by its product, film, instead of the customer's need, memories. The need moved on and Kodak stayed behind.",
        source: "Steve Sasson's prototype at Kodak, 1975; Kodak's bankruptcy filing, January 2012; Levitt, \"Marketing Myopia\", HBR 1960."
      },
      financeLens: "Marketing is capital allocation. Each dirham spent finding and keeping customers buys an asset, the customer base, the way capex buys a machine. Booking it all as a period cost hides that asset. Kodak's film profits looked like steady income. They were the returns on an asset that was quietly impairing, and nobody wrote it down.",
      doNow: {
        task: "Rewrite three real businesses by the need they serve. Use your father's group.",
        steps: [
          "Write the three brands: Sail Survey, Built Pulse, Sky Signature.",
          "Under each, write the product in five words, then the developer's need in five words.",
          "Circle the brand whose need is easiest to explain to a stranger, and say why."
        ]
      },
      quiz: [
        { q: "According to Levitt, why did the railways decline?", options: ["Their fares were too high", "They defined themselves by their product instead of the need for transport", "Governments stopped funding them", "They spent too little on advertising"], answer: 1, why: "Levitt's myopia point: they thought they were in railways, so cars and planes took the transport need." },
        { q: "Which statement best describes marketing?", options: ["Paying for adverts", "Running social media accounts", "Deciding who you serve, what they value, and how you win and keep them", "Giving discounts to move stock"], answer: 2, why: "Advertising and social media are tools. Marketing is the whole chain from need to loyalty." },
        { q: "Kodak built the first digital camera in 1975. What was its core mistake?", options: ["It protected film instead of serving the need to keep memories", "It priced digital cameras too low", "It advertised too much", "It ignored film customers"], answer: 0, why: "Kodak guarded its product and profit pool while the customer's need moved to digital." }
      ],
      homework: "Pick a shop or app you used today. Write its product, the need it serves, and the weakest link in its chain from product to loyalty. Bring it tomorrow.",
      teacherNotes: "Open with the drill line and ask him what his own accountancy training sold: a certificate or a career. Push him to say needs in the customer's words, without jargon. On the father's group, accept rough answers; the point is the habit of naming the need. If he finishes early, ask what Kodak's balance sheet would have looked like if brand and customer base were recognised assets.",
      terms: [
        { term: "Need", def: "The underlying problem a customer must solve, whatever product solves it." },
        { term: "Value", def: "What the customer gets minus everything it costs them: money, time, effort, worry." },
        { term: "Marketing myopia", def: "Defining a business by its product instead of the customer need it serves." }
      ],
      widget: null
    },
    {
      id: "w1d2", day: 2,
      title: "Who exactly is the customer",
      bigIdea: "Everyone is not a customer. Pick the group you serve best, learn who buys, who uses and who pays, and speak to each.",
      teach: [
        { h: "Segment by reason to buy", p: "Segmentation cuts a market into groups that buy for different reasons. Age and nationality are easy to measure and often useless. Reason to buy is harder and far more useful. A developer racing to hand over units and a developer planning his next tower both need a surveyor, for different reasons, and they listen to different messages." },
        { h: "The ideal customer profile", p: "Your ideal customer profile, or ICP, describes the customer you would clone ten times: their size, their stage, their pain, their budget, how they decide. Write it down. Then say no to work that sits far outside it. Every hour spent on a poor-fit client is an hour stolen from a good one." },
        { h: "Buyer, user, payer", p: "In B2B one sale has several customers. At a developer the owner signs, the project manager uses the report, and finance pays the invoice. The owner wants the project protected. The project manager wants no extra work. Finance wants clear terms and no surprises. Ignore any one of them and the sale stalls quietly." },
        { h: "Narrow beats broad", p: "A message written for everyone lands with no one. \"We serve all developers\" says nothing. \"We get mid-size developers through handover without delays\" makes the right reader lean in and the wrong one leave, which saves you both time. Narrowing feels like losing customers. It usually wins them." },
        { h: "Look where others average", p: "Big players design for the average customer. The gap is in the customers they average away. Ask: who is badly served by the market leader, and why? That group is often large, ignored and willing to switch to whoever finally takes them seriously." }
      ],
      caseStudy: {
        name: "Careem vs Uber",
        year: "2012–2019",
        story: "Uber came to the Gulf with a global playbook built around an app and a card. Careem, founded in Dubai in 2012, looked harder at the people actually riding. Many preferred to pay in cash. Many preferred to book by phone. So Careem accepted cash and took phone bookings. It called its drivers \"captains\", a word that carried respect. None of this was clever technology. It was knowing the local customer better than a giant did. Careem won the region. In March 2019 Uber announced it would buy Careem for USD 3.1 billion.",
        lesson: "The global player designed for an average rider. The local player designed for the real one and was paid billions for it.",
        source: "Careem founded Dubai 2012; Uber acquisition announced March 2019, USD 3.1 billion."
      },
      financeLens: "Two accounting ideas apply. Revenue concentration: if one client is a large share of revenue, you hold a concentration risk, like a receivable book dominated by one debtor. Customer-level profitability: allocate service and sales costs to each customer, as in activity-based costing. You will usually find some customers who lose money and should be repriced or let go.",
      doNow: {
        task: "Draw the buyer committee for a developer buying a final survey from Sail Survey.",
        steps: [
          "Draw three boxes: owner, project manager, finance.",
          "In each box write one fear and one want, in their words.",
          "Under each box write one sentence you would say to that person, and only that person."
        ]
      },
      quiz: [
        { q: "What is the most useful basis for segmenting customers?", options: ["Age", "Nationality", "Their reason to buy", "Their postcode"], answer: 2, why: "Groups with different reasons to buy respond to different messages, which is what segmentation is for." },
        { q: "At a developer, who is most likely to be the user of a project-stage report?", options: ["The owner", "The project manager", "The finance director", "The bank"], answer: 1, why: "The project manager works with the report day to day; the owner signs and finance pays." },
        { q: "How did Careem beat Uber in the region?", options: ["Lower fares everywhere", "Better app technology", "Fitting local riders: cash payment, phone booking, the captain idea", "Heavier advertising spend"], answer: 2, why: "Careem designed for the real local customer while Uber ran a global average playbook." }
      ],
      homework: "Write a five-line ideal customer profile for any business you know: who they are, their stage, their pain, their budget, how they decide. Ten minutes, no more.",
      teacherNotes: "The buyer, user, payer split is the idea he will use most in the group. Make him say the three roles out loud for a developer. If he gives demographics for segments, ask: why would that group buy differently? Link concentration risk to audit work he has done on debtor ageing; he will get it instantly. Do not let him name real clients of the group.",
      terms: [
        { term: "Segmentation", def: "Splitting a market into groups that buy for different reasons." },
        { term: "ICP", def: "Ideal customer profile: a written description of the customer you serve best." },
        { term: "Buyer committee", def: "The several people in a B2B purchase who sign, use and pay." },
        { term: "Revenue concentration", def: "How much of revenue depends on a few customers; high concentration is risk." }
      ],
      widget: null
    },
    {
      id: "w1d3", day: 3,
      title: "Positioning in one sentence",
      bigIdea: "Positioning is the one idea you own in the buyer's mind, set against the alternative they would otherwise choose. Write it in one sentence.",
      teach: [
        { h: "A place in the mind", p: "Positioning is where you sit in the customer's head when they think of the problem. It is decided by them, not by your brochure. You can only influence it by repeating one clear idea, everywhere, for a long time. Two ideas cancel each other. Five ideas are noise." },
        { h: "The template", p: "For [who] who [need], [name] is the [category] that [benefit]. Unlike [alternative], we [proof]. Fill every bracket. If you cannot fill \"unlike\", you have no position yet. If the proof is an adjective such as \"quality\" or \"professional\", you have no proof yet. Rewrite until a stranger could repeat it back." },
        { h: "Pick the alternative", p: "Customers always compare. The alternative may be a competitor, an in-house team or doing nothing at all. Choose the one your best customers are actually weighing you against, then show how you differ on the thing they care about. Positioning against the wrong alternative wins arguments nobody is having." },
        { h: "Benefit in their words", p: "The iPod could have been launched as 5 GB. Apple said \"1,000 songs in your pocket\". Nobody wants a gigabyte. Everyone can picture a thousand songs. Translate every feature into what the buyer can now do, measured in their units: days saved, payments released, tenants signed." },
        { h: "Proof makes it stick", p: "A claim without proof is a wish. Proof can be a process, a guarantee, a named standard, a track record or a case study. The best proof is specific and checkable. \"Reports delivered in a fixed format the escrow bank already accepts\" beats \"high-quality reports\" every time." }
      ],
      caseStudy: {
        name: "iPod and Salesforce",
        year: "1999–2001",
        story: "Two launches, one trick. In October 2001 Apple released the iPod. It could have led with storage. It led with \"1,000 songs in your pocket\", a benefit anyone could picture in a second. Around the same time, in 1999 and 2000, a young company called Salesforce was selling software to sales teams. The giants of the day sold enterprise software that had to be installed, run and upgraded on your own servers. Salesforce picked a fight with the whole category. Its campaign said \"No Software\": nothing to install, just log in. Each company chose one idea, said it in the customer's words, and set it against an alternative the buyer already knew and disliked.",
        lesson: "One idea, in the buyer's words, against a named alternative. That is the whole of positioning.",
        source: "Apple iPod launch, October 2001; Salesforce \"No Software\" campaign, 1999–2000."
      },
      financeLens: "A premium position shows up as gross margin. If buyers see you as the obvious choice, you can price above the commodity rate while cost of sales stays the same, so the extra drops straight to gross profit. A weak position makes you a price taker, and competition compresses your margin to the industry floor.",
      doNow: {
        task: "Write a positioning statement for one brand in your father's group, using the template. No figures.",
        steps: [
          "Choose Sail Survey, Built Pulse or Sky Signature.",
          "Fill the template: for, who, name, category, benefit, unlike, proof.",
          "Read it aloud. Cross out every adjective that a competitor could also claim.",
          "Rewrite the proof so it is specific and checkable."
        ]
      },
      quiz: [
        { q: "In the positioning template, what does the \"Unlike\" clause name?", options: ["Your price", "The alternative the buyer would otherwise choose", "Your founder", "Your weakest product"], answer: 1, why: "Positioning is relative: it states the alternative you beat and how you differ." },
        { q: "Why did \"1,000 songs in your pocket\" work better than \"5 GB\"?", options: ["It was shorter", "It was technically more accurate", "It stated the benefit in units the buyer understood", "It mentioned the price"], answer: 2, why: "Buyers picture songs, not gigabytes. Benefit in their own units sticks." },
        { q: "What did Salesforce position itself against?", options: ["Other cloud start-ups", "Installed enterprise software", "Spreadsheets", "Sales consultants"], answer: 1, why: "\"No Software\" set Salesforce against software you had to install and maintain yourself." }
      ],
      homework: "Find one company's website. Write its positioning in the template from what the homepage says. Note any bracket you could not fill. Bring both tomorrow.",
      teacherNotes: "This is the lesson he will reuse in week 7. Be strict: make him fill every bracket and kill vague proof words like quality, trusted, professional. Read his statement as a sceptical developer would. A good test: could a competitor sign the same sentence? If yes, it is not positioning yet. Keep his draft; it is the first version of his capstone work.",
      terms: [
        { term: "Positioning", def: "The single idea a brand owns in the buyer's mind against an alternative." },
        { term: "Benefit", def: "What the buyer can do or have because of a feature." },
        { term: "Price taker", def: "A seller with no pricing power who must accept the market price." }
      ],
      widget: null
    },
    {
      id: "w1d4", day: 4,
      title: "The 4Ps and the price",
      bigIdea: "Product, price, place and promotion are four decisions. Price is the one most people get wrong and the one that moves profit most.",
      teach: [
        { h: "Four decisions, one offer", p: "Product is what you deliver. Price is what you charge and how. Place is where and how the buyer gets it. Promotion is how they hear of it. Change one and the others must fit. A premium service sold through a discount channel confuses everybody. Check that all four tell the same story." },
        { h: "The anchor sets the scale", p: "The first number a buyer sees becomes the yardstick for every number after it. Show the full-scope option first and the smaller one looks reasonable. Show the cheap option first and everything else looks expensive. You always set an anchor, by design or by accident. Choose it on purpose." },
        { h: "The decoy", p: "A decoy is an option almost nobody buys, placed to make another option look like a bargain. It works because people judge by comparison, not by absolute value. Use it honestly: the decoy must be a real offer you would deliver, and the option it flatters must be one you want to sell." },
        { h: "Good, better, best", p: "Three tiers give buyers a choice between your options instead of a choice between you and a competitor. Most buyers pick the middle. So design the middle tier as the one you want sold, put the full option above it as the anchor, and keep a lean entry tier for the cautious." },
        { h: "Price structure is product", p: "Netflix positioned itself on one pricing idea: no late fees. Blockbuster earned a share of its money from late fees, so it could not copy the offer without hurting itself. In 2000 Blockbuster declined to buy Netflix for USD 50 million. In 2010 Blockbuster filed for bankruptcy. How you charge can be the whole proposition." }
      ],
      caseStudy: {
        name: "The Economist decoy",
        year: "Dan Ariely's experiment",
        story: "Dan Ariely found a subscription page for The Economist and tested it on MIT students. It offered three options: web only at 59, print only at 125, and print and web together at 125. Nobody sensible picks print only when print and web costs the same. That was the point. With that useless option on the page, 84% of students chose print and web. Ariely then removed the option nobody chose and ran the test again. This time only 32% chose print and web, and most took the cheaper web subscription. One option that nobody bought changed what most people bought.",
        lesson: "Buyers judge prices by comparison. The options you show, including ones nobody picks, decide what sells.",
        source: "Dan Ariely, Predictably Irrational."
      },
      financeLens: "Price is the strongest profit lever. Take a made-up firm: revenue 100, variable costs 60, fixed costs 30, profit 10. Raise price 1% and profit rises 1, a 10% gain. Raise volume 1% and you add 1 of revenue but 0.6 of variable cost, so profit rises 0.4, a 4% gain. Same effort, two and a half times the result.",
      doNow: {
        task: "Design three tiers for Built Pulse's escrow and project-stage reporting. Names and contents only, no prices.",
        steps: [
          "Name the three tiers, for example Essential, Standard, Complete.",
          "List what is in each. Make the middle tier the one you would most like to sell.",
          "Write one line under the top tier that makes the middle look like good value."
        ]
      },
      quiz: [
        { q: "In the Economist test, what happened when the print-only option was removed?", options: ["More people chose print and web", "Print and web fell from 84% to 32%", "Nobody subscribed", "Print only became the favourite"], answer: 1, why: "The decoy made the bundle look like a bargain. Without it, most chose the cheaper web option." },
        { q: "With profit at 10% of revenue and variable costs at 60%, a 1% price rise lifts profit by how much?", options: ["1%", "4%", "6%", "10%"], answer: 3, why: "The extra 1 of price is all profit: 1 on a base of 10 is a 10% rise." },
        { q: "Why could Blockbuster not simply copy Netflix's no-late-fees offer?", options: ["It lacked the technology", "Late fees were part of how it made money", "Regulators blocked it", "Netflix owned a patent on it"], answer: 1, why: "Copying the offer meant giving up a revenue stream Blockbuster depended on." }
      ],
      homework: "Find a three-tier price list online. Write which tier you think the company wants sold and which element is the anchor or decoy. Ten minutes.",
      teacherNotes: "He will love the 1% price versus 1% volume sum. Make him do it on paper himself, then change the numbers and redo it. Stress that decoys and anchors are honest only if every option is real and deliverable. On the tier exercise, push him to make the top tier genuinely useful for the biggest developers, not a fake.",
      terms: [
        { term: "4Ps", def: "Product, price, place, promotion: the four decisions that make up an offer." },
        { term: "Anchoring", def: "The first number shown sets the scale for judging all later numbers." },
        { term: "Decoy", def: "An option few choose that makes another option look better value." },
        { term: "Good/Better/Best", def: "Three-tier pricing; most buyers choose the middle tier." }
      ],
      widget: null
    },
    {
      id: "w1d5", day: 5,
      title: "Brand and trust",
      bigIdea: "A brand is a promise that has been kept often enough for people to stop checking. That saved checking is why they pay more.",
      teach: [
        { h: "Brand lowers risk", p: "People pay more for a brand because it reduces the risk of a bad outcome. In B2B the buyer's job is on the line, so trust is worth even more. A developer choosing a surveyor is buying the confidence that nothing will go wrong at handover. The logo is only the reminder of that promise." },
        { h: "Consistency compounds", p: "Every email, report, invoice and WhatsApp reply either confirms the promise or chips at it. Same quality, same tone, same look, every time. Nike launched \"Just Do It\" in 1988 and kept saying it. Its share of the North American athletic-shoe market went from 18% to 43% by 1998; worldwide sales grew from USD 877 million to USD 9.2 billion." },
        { h: "Attachment is not taste", p: "Customers bond with a brand in ways surveys of the product cannot measure. Change the thing they are attached to and you can lose them even with a better product. Before you change a name, a logo or a familiar service, ask what people feel about it, not just what they think of it." }
      ],
      caseStudy: {
        name: "New Coke",
        year: "1985",
        story: "On 23 April 1985 Coca-Cola replaced its famous formula with New Coke. The company had done its homework. Taste tests said people preferred the new recipe. Then the public reacted as if something personal had been taken from them. Complaints poured in. The company had changed a product; customers felt it had changed something they owned. After 79 days the original returned as Coca-Cola Classic. The taste tests had been accurate. They had simply measured the wrong thing. They measured taste, and people were attached to the brand, its history and their own memories of it.",
        lesson: "Research measures what you ask about. Coca-Cola asked about taste and missed attachment, which is what the brand really was.",
        source: "New Coke launch, 23 April 1985; Coca-Cola Classic returned after 79 days."
      },
      financeLens: "Brand is an intangible asset. When one company buys another for more than its net assets, the gap is booked as goodwill and intangibles, and much of it is brand and customer relationships. A brand you build yourself cannot be recognised on your own balance sheet under IAS 38, yet it earns every year. Accounts understate firms with strong brands.",
      doNow: {
        task: "Audit the brand promise of one brand in your father's group, from the outside, as a stranger would.",
        steps: [
          "Look at its website, LinkedIn page or Google listing on your phone.",
          "Write the promise you think it makes, in one line.",
          "List two places where the look, tone or message does not match that promise."
        ]
      },
      quiz: [
        { q: "Why do customers pay more for a strong brand?", options: ["It always has better features", "It reduces the risk of a bad outcome", "It is advertised more", "It has a better logo"], answer: 1, why: "A kept promise saves the buyer from checking and from risk, and that saving has a price." },
        { q: "What did New Coke's taste tests fail to measure?", options: ["Sweetness", "Price sensitivity", "Customers' attachment to the original brand", "Distribution costs"], answer: 2, why: "The tests measured taste accurately but missed attachment, which drove the backlash." },
        { q: "How does a brand you built yourself appear on your own balance sheet?", options: ["As goodwill", "As inventory", "It is not recognised as an asset", "As a current asset"], answer: 2, why: "IAS 38 bars recognising internally generated brands; goodwill appears only on acquisition." }
      ],
      homework: "Choose a brand you trust. Write three moments where it kept its promise to you, and one where it nearly broke it. Bring it to Monday's recap.",
      teacherNotes: "Short teach today, then the week quiz. Use the goodwill point to connect with his ACCA work: he knows IAS 38 and IFRS 3, so let him explain them to you. Ask him whether Uber paying for Careem was mostly buying cars and offices or buying trust. Before the quiz, review the four big ideas of the week in one minute.",
      terms: [
        { term: "Brand", def: "A promise kept consistently enough that customers stop checking." },
        { term: "Goodwill", def: "Price paid for a business above its identifiable net assets." },
        { term: "Intangible asset", def: "A non-physical asset such as a brand, licence or customer list." }
      ],
      widget: null
    }
  ]
};
