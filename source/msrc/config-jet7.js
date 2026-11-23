/* =====================================================================
   THE OBSERVATORY × JET · v7 (pared back, with a first look and a moving timeline)
   Every {{KEY}} is filled from copy7.json by jet7_post.py, and the numbered
   sections 01 to 06 are built by jet7_post.py from the same file.
   Everything else on the page is The Observatory's own frame: nav,
   wordmark, contact block and footer. No pricing.
   ===================================================================== */
window.PROPOSAL = {
  template: false,

  client: {
    name: 'Jersey Energy Technologies',
    short: 'JET',
    preparedFor: 'Simon',
    title: 'The Observatory × JET',
    year: 'November 2026'
  },

  labels: {
    kind: "For discussion with Simon and Chris",
    est: ['Est', '2005'],
    opportunity: '',
    offer: 'What you get',
    offerTag: '',
    levels: 'Choose your level',
    close: 'Where we go from here',
    closeTag: '',
    keyVisualShow: false,
    keyVisual: ['Great ideas', 'Good company'],
    keyVisualImage: { src: 'assets/kv.jpg', position: '50% 46%', alt: '' },
    workflow: 'Visual language\nconcepts are now ready',
    workflowFile: 'Visual language',
    workflowMeta: 'Concepts v1 →',
    workflowNote: 'Illustration of a generative workflow',
    kvLine: ['GREAT IDEAS.', 'GOOD COMPANY.'],
    footTag: ['GREAT IDEAS.', 'GOOD COMPANY.'],
    workflowCount: 45
  },

  hero: {
    tagline: ['GREAT IDEAS.', 'GOOD COMPANY.'],
    intro: [],
    row: false,
    navBrand: 'The Observatory × {short}',
    roundel: false,
    wordmark: true,
    metaBrand: false,  /* the nav already carries The Observatory × JET */
    marquee: false,
    work: null,
    video: null,
    stage: false,
    images: []
  },

  /* the opening: line 2 as the headline, lines 4 to 6 as the three paragraphs */
  opportunity: {
    image: false,
    band: false,
    head: false,
    tags: '',
    headline: ["Make the innovation visible."],
    paragraphs: ["You’re putting science and innovation to work on things that people need every day. Making heating more affordable, local food cheaper to produce for Jersey’s growers and the island’s infrastructure future-proofed, secure and resilient.", "Now’s the time to show it working here in Jersey. In a way that fires up the imagination, carries the island along with your ambition and becomes a real exemplar for the people you want to partner with. All in your voice, demonstrated, measured, visible and ready to share with the world."]
  },

  /* the master's own sections, all switched off for this page */
  offer: { show: false, headline: ['WHAT', 'YOU GET.'], lead: '', people: [], galleryRatio: '3/4', gallery: [], capabilities: [] },
  plan: { show: false, nav: '', label: '', headline: ['YOUR FIRST', '90 DAYS.'], lead: '', body: '', connector: '', map: false, focusLabel: '', getLabel: '', stages: [], end: null, closing: '' },
  concept: { show: false, nav: 'Concept', label: 'The concept', tag: '', headline: ['A FIRST LOOK'], body: '', caption: '', image: 'assets/dunes.jpg', imagePosition: '50% 50%', button: '', page: '', url: '' },
  pedigree: { show: false, label: 'Pedigree', title: '', tag: '', headline: ['THE COMPANY', 'WE KEEP.'], body: '' },
  levels: { show: false, intro: '', maxDays: 6, maxSessions: 3, items: [], flex: [], termsLead: '', terms: [], closing: '' },
  aim: { show: false, label: '', tag: '', headline: ['CREATIVITY FIRST.'], lead: '', body: '' },

  /* no closing statement: section 06 carries the next step, and the page ends on the contact block */
  close: { lines: [] },

  contacts: {
    compose: {
      button: 'Email us',
      subject: 'JET × The Observatory',
      body: 'I’ve read The Observatory × JET and I’d like to talk about next steps.',
      chosen: 'I’ve read The Observatory × JET and I’d like to talk about next steps. {detail}'
    },
    whatsapp: { button: 'WhatsApp Ben', name: 'Ben Hickingbotham', number: '447797758788', display: '+44 7797 758788', message: 'Hi Ben, I’ve read The Observatory × JET.' },
    booking: { url: 'https://calendly.com/studio-theobservatory/20-minute-chat', who: 'Ben and Sarah · 20 minutes', text: 'Book a call', button: 'Pick a time' },
    emails: [ { who: 'Ben and Sarah · The studio', address: 'studio@theobservatory.je' } ]
  }
};
