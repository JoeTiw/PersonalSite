export const site = {
  name: 'Bhupin Tiwari',
  role: 'CEO & Founder, Neogen Technologies',
  location: 'Appleton, Wisconsin',
  email: 'bhupintiwari@gmail.com',
  github: 'https://github.com/JoeTiw',
  company: 'https://www.neogentechs.com/',
  brother: 'Bhuwan Tiwari',
}

export type Chapter = { label: string; title: string; body: string }

export const story: Chapter[] = [
  {
    label: 'The spark',
    title: 'Two brothers who could not leave a problem alone.',
    body: 'Bhuwan and I grew up taking things apart to see how they worked. When we started paying attention to the small businesses around us, we kept seeing the same thing: good people running real operations on paper, spreadsheets, and software nobody would support.',
  },
  {
    label: 'The company',
    title: 'Neogen Technologies.',
    body: 'We started Neogen to help small businesses with any tech work they needed. Websites, integrations, the odd automation, whatever the day called for. The rule was simple: if a big company would have a software team for it, a small one deserves one too.',
  },
  {
    label: 'The product',
    title: 'Neo Office.',
    body: 'The work kept pointing at one place: the back office of a gas station. So we built one. Neo Office reads from the register the store already runs, sends changes back to it, and gives an owner a modern office with nothing new to install at the counter.',
  },
  {
    label: 'Today',
    title: 'Still two brothers, now with stores counting on us.',
    body: 'Fuel pricing, item pricing, EDI invoices, till settlement, lottery, time clock, and an assistant that answers from the store’s own numbers. I run the company and still write a lot of the code. That is the part I would not give up.',
  },
]

export type NeoStep = { key: 'dashboard' | 'fuel' | 'pos' | 'ai'; title: string; body: string }

export const neoSteps: NeoStep[] = [
  {
    key: 'dashboard',
    title: 'Know the day before it ends.',
    body: 'Inside sales against fuel, tax collected, and the day hour by hour. Checked from the office, from home, or from a phone in the parking lot.',
  },
  {
    key: 'fuel',
    title: 'Every grade, cash and credit.',
    body: 'Change one grade or all of them. Each one carries its own last-updated stamp, so nobody has to wonder whether the sign matches the pump.',
  },
  {
    key: 'pos',
    title: 'Change it here, sell it there.',
    body: 'A price edit becomes a batch, the batch goes to the register, and the register confirms it. If it does not land, it retries on its own and tells you that minute.',
  },
  {
    key: 'ai',
    title: 'Ask the store a question.',
    body: 'Neo AI answers from your own sales and invoices. Nothing runs without a confirm, because a store is not a place for surprises.',
  },
]

export type Project = { name: string; year: string; stack: string; blurb: string; url: string }

export const projects: Project[] = [
  {
    name: 'Spam-Ham Classifier',
    year: '2022',
    stack: 'Python · Streamlit · NLP',
    blurb: 'A text-message spam detector trained on the SMS Spam Collection dataset. Tokenising, stemming, a count vectoriser, and a pickled model behind a one-field Streamlit app.',
    url: 'https://github.com/JoeTiw/Spam-Ham-Classifier',
  },
  {
    name: 'Rate My Pet',
    year: '2022',
    stack: 'Java · Android · Gradle',
    blurb: 'An Android app for rating pets, built to learn the platform properly: activities, layouts, state, and the Gradle build that ties it together.',
    url: 'https://github.com/JoeTiw/RateMyPet',
  },
  {
    name: 'Snake',
    year: '2023',
    stack: 'Java · Swing · Maven',
    blurb: 'The classic, rebuilt from scratch. A game loop, collision, and a score counter, mostly as an excuse to think about timing and state.',
    url: 'https://github.com/JoeTiw/SnakeJava',
  },
  {
    name: 'Spring Boot Web App',
    year: '2021',
    stack: 'Java · Spring Boot · SQL',
    blurb: 'Frontend, backend, and a database talking to each other for the first time. The project that made the whole stack click.',
    url: 'https://github.com/JoeTiw/MyWebApp',
  },
  {
    name: 'Learn with ChatGPT',
    year: '2023',
    stack: 'Java',
    blurb: 'Problem sets worked through alongside ChatGPT in early 2023, when pairing with a model was still a new idea and worth writing down.',
    url: 'https://github.com/JoeTiw/LearnWithChatGPT',
  },
  {
    name: 'College Fun',
    year: '2023',
    stack: 'Java',
    blurb: 'Coursework and experiments from the University of Wisconsin-Green Bay years. Not glamorous, and exactly where the fundamentals came from.',
    url: 'https://github.com/JoeTiw/CollegeFun',
  },
]

export const principles = [
  {
    title: 'Start from the counter.',
    body: 'Store software has to work at 5:52 AM with a line at the register. I design from the person using it, not from the diagram.',
  },
  {
    title: 'Own the whole stack.',
    body: 'Web, mobile, backend, and integrations with hardware nobody documents. Small teams ship when nobody says “not my part.”',
  },
  {
    title: 'Build it so it stays in sync.',
    body: 'Retries, alerts, history, proof. The boring reliability work is the product, and it is the part customers feel.',
  },
]

export const tools = [
  'TypeScript', 'React', 'Next.js', 'React Native', 'Node.js', '.NET', 'C#', 'Java', 'Spring Boot',
  'Python', 'PostgreSQL', 'SQL Server', 'EDI', 'POS integrations', 'GitHub Actions', 'Vercel', 'Three.js', 'GSAP',
]

export type Photo = { src: string; title: string; caption: string; w: number; h: number }

export const photos: Photo[] = [
  { src: '/photos/pic3.webp', title: 'Personal favorite', caption: 'I slept on the ground to take this.', w: 1600, h: 1067 },
  { src: '/photos/pic1.webp', title: 'Night view', caption: 'Plymouth, Wisconsin.', w: 1600, h: 1067 },
  { src: '/photos/pic6.webp', title: 'UWGB', caption: 'Wood Hall parking lot, Green Bay.', w: 1600, h: 1067 },
  { src: '/photos/pic2.webp', title: 'Window view', caption: 'Menasha.', w: 1600, h: 1002 },
  { src: '/photos/pic7.webp', title: 'Home view', caption: 'Slept on the ground again.', w: 1600, h: 1067 },
  { src: '/photos/pic4.webp', title: 'Toy', caption: 'I lost it already.', w: 1600, h: 1067 },
  { src: '/photos/pic8.webp', title: 'Highway tree', caption: 'A rest stop on Highway 43, southbound.', w: 1600, h: 1067 },
  { src: '/photos/pic5.webp', title: 'Landscape', caption: 'My class loved it.', w: 1600, h: 1067 },
  { src: '/photos/pic9.webp', title: 'Dr. Pepper', caption: 'Class project.', w: 1600, h: 1067 },
]
