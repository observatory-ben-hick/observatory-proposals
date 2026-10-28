/* =====================================================================
   THE OBSERVATORY · GENERIC PROPOSAL FOR NEW BUSINESSES
   Built from the Observatory Proposal Master. Everything client-specific
   lives in this one block. Nothing below it needs to change.

   {client} is replaced with client.name wherever it appears.
   Any section with show:false disappears and the section numbers close up.
   Optional lines vanish when left empty.

   HOUSE RULES FOR THE COPY
   Headlines in CAPS. Body copy in sentence case. No bold. No em dashes.
   ===================================================================== */
window.PROPOSAL = {
  template: false,

  client: {
    name: 'Your business',
    short: 'You',
    preparedFor: 'businesses with a story to tell',
    title: 'The Observatory · Creative partnerships',
    year: '2026+'
  },

  /* the small label lines around the page, taken from the proposal copy */
  labels: {
    kind: 'Creative partnership proposal',
    est: ['Est', '2011'],   /* top of the page: Est, a short rule, 2011 (in place of the proposal line and year) */
    opportunity: 'The why',
    offer: 'What you get',
    offerTag: 'An extension of your team',
    levels: 'Choose your level',
    close: 'Where we go from here',
    closeTag: '',
    keyVisualShow: false,   /* no key visual block before the contact section */
    keyVisual: ['Original thinking', 'Built to last'],
    keyVisualImage: { src: 'assets/kv-lips.jpg', position: '50% 34%', alt: 'Close-up of lips and teeth, skin flecked with sand, in black and white' },
    workflow: 'Visual language concepts are now ready',
    workflowFile: 'Visual language',
    workflowMeta: 'Concepts v1 →',
    workflowNote: 'Illustration of a generative workflow',
    kvLine: ['ORIGINAL THINKING.', 'BUILT TO LAST.'],   /* the line on the key visual panel */
    footTag: ['GREAT IDEAS.', 'GOOD COMPANY.'],   /* the footer line */
    workflowCount: 45
  },

  hero: {
    /* a paragraph, then two lines that keep their break */
    tagline: ['GREAT IDEAS.', 'GOOD COMPANY.'],   /* the top section headline */
    intro: [
      'Great creative work starts with understanding the business behind it.',
      'We’re thinkers and doers. An independent creative partnership bringing decades of experience, original thinking and exceptional design to ambitious businesses.'
    ],
    prepared: false,
    navBrand: 'The Observatory × {short}',
    roundel: false,   /* no rotating OBSERVATORY roundel anywhere on the page */
    wordmark: true,   /* OBSERVATORY in FatFrank at the top and in the footer */
    metaBrand: false,
    marquee: false,
    work: 'Our work encompasses: brand, design and identity, strategy and positioning, products and packaging, exhibitions and installations, websites and digital experiences, marketing, advertising and storytelling, data visualisations, film, sound and animation.',
    /* the showreel, edge to edge, playing on a loop. The pictures below stand in if the film is removed */
    video: null,   /* showreel removed from the proposal (it stays on the website home page) */
    stage: false,
    images: []
  },

  opportunity: {
    /* the picture beside the opening, and the wide picture below it */
    /* no picture beside the opening and no wide picture below it */
    image: false,
    band: false,
    head: false,
    headline: ['THE RIGHT PEOPLE.', 'FOCUSED ON WHAT MATTERS MOST.'],
    paragraphs: [
      'Our creative partnerships give you ongoing access to experienced creatives as an extension of your team. People who expand your thinking, find opportunities and turn ideas into something real. The creative firepower and hands-on expertise to move your business forward.',
      ['You bring the ambition.', 'We bring the thinking, creativity and capability to make it happen.']
    ]
  },

  /* 01 · What you get */
  offer: {
    lead: 'A creative partnership that moves with your business. Clear thinking, bold ideas and the expertise to bring them to life, working alongside you.',
    people: [],
    /* the sequence that plays beside the list, in this order */
    galleryRatio: '3/4',
    gallery: [],
    capabilities: []
  },

  /* 02 · Your first 90 days. Three stages, each 30 days on the ruler. */
  plan: {
    show: true,
    nav: 'Where do we start',
    label: 'Where do we start',
    headline: ['WHERE DO', 'WE START?'],
    lead: 'We sharpen what you’re selling, make a stronger case for why it matters and create the work that helps you win business. From finding your position in the market to launching your next big idea, we’re experienced creative partners who take responsibility for getting things done.',
    body: '',
    connector: 'Three connected stages. One clear path.',
    map: false,   /* true shows the three stage buttons under the line */
    focusLabel: 'Our focus',
    getLabel: 'What you get',
    stages: [
      { num: '01', title: 'DEFINE.', days: 'Days 01–30', sub: 'See the bigger picture.',
        body: [
          'Before we create anything, we get to know your business. Where you are, where you want to go, what’s working, what’s missing and what could be possible.',
          'We collaborate on the brief, bringing relevant perspective, commercial understanding and original thinking to execute on the opportunities that matter.'
        ],
        focus: [
          { k: 'Understand.', t: 'Your vision, ambitions, business objectives and what success looks like.' },
          { k: 'Discover.', t: 'Explore your brand, business, products, audiences, competitors and customer experiences.' },
          { k: 'Uncover.', t: 'Find the insights, challenges, untapped potential and opportunities for differentiation.' },
          { k: 'Focus.', t: 'Identify what matters most, where the greatest value lies and what needs to change.' },
          { k: 'Define.', t: 'Establish a clear strategic direction, creative ambition and shared priorities.' }
        ],
        get: 'A deeper understanding of your business, a sharper sense of opportunity and a clear direction for what we create together.' },
      { num: '02', title: 'CREATE.', days: 'Days 31–60', sub: 'Turn insight into something extraordinary.',
        body: [
          'With a clear direction, we move from understanding to execution.'
        ],
        focus: [
          { k: 'Strategise.', t: 'Shape the positioning, proposition, messaging and creative approach.' },
          { k: 'Imagine.', t: 'Explore original concepts, new perspectives and opportunities to stand apart.' },
          { k: 'Create.', t: 'Develop the identity, design, storytelling, experiences or campaigns that bring the strategy to life.' },
          { k: 'Connect.', t: 'Build consistency across the brand, customer experience, communications and commercial touchpoints.' },
          { k: 'Refine.', t: 'Test ideas against the objectives, strengthen the work and agree what moves into production.' }
        ],
        get: 'A distinctive creative direction, a stronger brand proposition and developed ideas ready to become real.' },
      { num: '03', title: 'ACTIVATE.', days: 'Days 61–90', sub: 'Make it real. Make it matter.',
        body: [
          'From production to launch, we make sure the thinking carries through to every detail.'
        ],
        focus: [
          { k: 'Plan.', t: 'Agree the production approach, priorities, resources and delivery milestones.' },
          { k: 'Produce.', t: 'Bring the approved creative work to life across the agreed channels, formats and experiences.' },
          { k: 'Deliver.', t: 'Execute with care, consistency and attention to every detail.' },
          { k: 'Launch.', t: 'Put the work into the world, connecting your brand with the people who matter.' },
          { k: 'Evolve.', t: 'Review the results, learn what works and identify the next opportunities for growth.' }
        ],
        get: 'Creative work brought to life, a stronger presence in the market and a clear plan to build on the momentum.' }
    ],
    end: null,
    closing: ''
  },



  /* No concept section in this proposal. Set show to true and add an image, page or url to bring it in. */
  concept: {
    show: false,
    nav: 'Concept',
    label: 'The concept',
    tag: 'A first look',
    headline: ['A FIRST LOOK', 'AT THE CONCEPT.'],
    body: '',
    caption: '',
    image: 'assets/dunes.jpg',
    imagePosition: '50% 50%',
    button: 'Step inside the concept',
    page: '',
    url: ''
  },

  /* The logo wall. */
  pedigree: {
    show: false,   /* logo wall removed from the proposal */
    label: 'Pedigree',
    title: 'Clients and collaborators',
    tag: 'Since 2005',
    headline: ['THE COMPANY', 'WE KEEP.'],
    body: 'Global names and independent originals. Two decades of brands built on original thinking.'
  },

  /* 03 · Choose your level */
  /* the live page sits inside the website: the symbol goes home and case studies open with the website's curtain */
  site: {
    home: '../',
    /* the website's own menu, with Work with us (this page) above Contact */
    menu: [
      { label: 'Work', href: '../work/' },
      { label: 'About', href: '../about/' },
      { label: 'News', href: '../news/' },
      { label: 'Work with us', href: '#top', current: true },
      { label: 'Contact', href: '../contact/' }
    ],
    menuFoot: ['studio@theobservatory.je', 'Jersey, Channel Islands']
  },

  levels: {
    intro: 'Before we kick-off we agree what the fee covers, specify the priorities, likely outputs, responsibilities and boundaries.',
    maxDays: 6,
    maxSessions: 3,
    /* case studies under each level: small loops from the website's work pages */
    casesLabel: 'Case studies',
    caseBase: '../work/',
    thumbBase: '../media/work/thumb/',
    manageLabel: '',   /* no label: each level reads as two lines */
    /* applies to every level: boxed under the three */
    note: 'Larger projects, specialist production, technical development and third-party costs are scoped and agreed separately.',
    items: [
      { name: 'Essential', price: '£1,500', text: 'Focused senior creative input.', manage: 'One agreed priority, with hands-on creative development and delivery to move it forward.',
        cases: [{ id: 'releasing-shadows-the-loom', name: 'Claire Mitchell | Releasing Shadows' }, { id: 'the-good-stone', name: 'The Good Stone' }, { id: 'elizabeth-cook', name: 'Elizabeth Cook' }] },
      { name: 'Growth', price: '£2,500', text: 'Consistent creative development.', manage: 'An agreed rolling plan, with ongoing design, content and communications created and delivered.',
        cases: [{ id: 'future-of-humanity', name: 'Future of Humanity' }, { id: 'spacebox', name: 'SpaceBox' }, { id: 'po-golden-tide', name: 'Golden Tide | Tidal Rum x P&O Cruises' }] },
      { name: 'Partner', price: '£4,000+', text: 'Broader senior creative involvement.', manage: 'Creative leadership and hands-on delivery across multiple priorities, campaigns and initiatives.',
        cases: [{ id: 'timeless', name: 'Timeless' }, { id: 'ocean-culture', name: 'Ocean Culture' }, { id: 'jtc', name: 'JTC Group' }] }
    ],
    flex: ['SCALE UP WHEN THERE’S MORE TO DO.', 'SCALE BACK WHEN THERE ISN’T.', 'CHANGES AGREED IN ADVANCE.'],
    termsLead: 'A flexible creative partnership, built around your priorities.',
    terms: [
      'We work together to establish priorities each month, ensuring our time is focused on the opportunities that will create the greatest value for you.',
      'Every partnership starts with a three-month commitment, with the opportunity to adjust the level of support as the relationship develops.'
    ],
    closing: 'Our aim? Meaningful progress, exceptional thinking and a creative relationship that grows with your business.'
  },

  /* 04 · Creativity first. Technology when it adds value. */
  aim: {
    show: true,
    label: 'Creativity first',
    tag: 'Technology partnership',
    headline: ['CREATIVITY FIRST.', 'TECHNOLOGY WHEN IT ADDS VALUE.'],
    lead: 'Through our technology partnership with AiM, Automated Intelligence Models, we can also explore opportunities to introduce intelligent systems, AI and automation where there is clear commercial benefit.',
    body: 'For your business, that might eventually include connected brand and communications systems, audience insights, content management and automation. To be defined once the foundations are in.'
  },

  /* 05 · Where we go from here */
  close: {
    lines: []   /* no closing statement on the master: the page ends on Let’s talk */
  },


  contacts: {
    /* the email buttons open a new email in the viewer's own mail app */
    compose: {
      button: 'Email us',
      target: '_top',
      subject: 'Creative Partnerships',
      body: 'I’ve read The Observatory partnership proposal and I’d like to talk about a creative partnership.',
      chosen: 'I’ve read The Observatory partnership proposal and I’d like to talk about the {level} partnership. {detail}'
    },
    whatsapp: {
      button: 'WhatsApp Ben',
      name: 'Ben Hickingbotham',
      number: '447797758788',
      display: '+44 7797 758788',
      message: 'Hi Ben, I’ve read The Observatory partnership proposal.'
    },
    /* book a call: sits above the email addresses */
    booking: { url: 'https://calendly.com/studio-theobservatory/20-minute-chat', who: 'Ben and Sarah · 20 minutes', text: 'Book a call', button: 'Pick a time' },
    emails: [
      { who: 'Ben and Sarah · The studio', address: 'studio@theobservatory.je' }
    ]
  }
};
