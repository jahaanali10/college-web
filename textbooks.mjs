import {topicNotes} from './textbook-topics.mjs';

// Original study summaries keyed to the English-medium Balbharati editions.
const books = [
  ['OCM', '1203020416', 'organisation of commerce and management', [
    ['Principles of Management', '1–16', 'fayol|taylor|scientific management|unity of command', 'Fayol explains how managers organise and direct work through principles such as division of work, unity of command and equity. Unity of command means each employee receives orders from one superior. Taylor focuses on improving how work is done through scientific study, standardisation and training.'],
    ['Functions of Management', '17–36', 'planning|organising|staffing|directing|coordinating|controlling', 'Planning sets objectives and decides how to achieve them. Organising assigns work and authority, staffing fills roles, directing guides employees, coordinating aligns their efforts, and controlling compares results with plans and corrects deviations.'],
    ['Entrepreneurship Development', '37–53', 'entrepreneur|startup|entrepreneurial competencies', 'An entrepreneur identifies an opportunity, organises resources, takes calculated risks and creates value. Entrepreneurship development builds the skills and support needed to turn ideas into viable enterprises.'],
    ['Business Services', '54–94', 'banking|insurance|warehousing|transport|postal services|indemnity', 'Banking provides payment, deposit and credit services. Insurance transfers specified financial risks. Transport moves goods, warehousing stores them, and communication services connect businesses with customers and suppliers.'],
    ['Emerging Modes of Business', '95–112', 'e business|outsourcing|bpo|kpo|b2b|b2c', 'E-business uses electronic networks for business activities, including online transactions. Outsourcing contracts work to a specialist. BPO covers business processes, while KPO covers work requiring specialised knowledge.'],
    ['Social Responsibilities of Business', '113–132', 'social responsibility|csr|business ethics|stakeholders', 'A business has responsibilities to employees, customers, investors, government, the community and the environment. Business ethics guides decisions through fairness and honesty. CSR concerns the company’s contribution to social and environmental well-being.'],
    ['Consumer Protection', '133–150', 'consumer rights|consumer responsibilities|consumer redressal|consumer dispute', 'Consumers have rights such as safety, information, choice and redressal. Keep bills and warranties, check product details, and raise complaints through the applicable consumer redressal process. The chapter covers the district, state and national levels.'],
    ['Marketing', '151–168', 'marketing mix|4ps|product price place promotion|selling', 'Marketing identifies customer needs and creates, prices, distributes and promotes offerings. The four Ps are product, price, place and promotion. Selling focuses on completing a sale, while marketing starts with understanding the customer.'],
  ]],
  ['SP', '1203020417', 'secretarial practice', [
    ['Introduction to Corporate Finance', '1–13', 'fixed capital|working capital|capital requirements', 'Corporate finance concerns raising and using company funds. Fixed capital finances long-term assets such as plant and machinery. Working capital supports day-to-day operations, including inventory and receivables.'],
    ['Sources of Corporate Finance', '14–38', 'retained earnings|owned capital|borrowed capital|sources of finance', 'Companies can use owners’ funds such as share capital and retained earnings, and borrow through sources such as debentures, deposits and loans. Compare sources by cost, control, repayment obligations and the period funds are needed.'],
    ['Issue of Shares', '39–67', 'share allotment|rights issue|bonus shares|private placement|public issue|esop|ipo', 'A company can issue shares through routes such as a public issue, rights issue or private placement. A rights issue offers shares to eligible existing holders. Bonus shares are issued to existing holders by capitalising eligible reserves. For a public issue, distinguish application, allotment and calls.'],
    ['Issue of Debentures', '68–79', 'debenture|debentures|debenture trustee|secured debenture', 'Debentures are company debt. Holders are creditors and generally receive interest under the issue terms. The chapter covers types, conditions, issue procedure and safeguards such as trustees for applicable issues.'],
    ['Deposits', '80–92', 'public deposits|company deposits|deposit receipt', 'Company deposits are borrowed funds received under prescribed conditions. The chapter covers eligibility, terms, accepting deposits, issuing receipts, and repaying principal and interest.'],
    ['Correspondence with Members', '93–103', 'shareholder letter|allotment letter|member letter|share certificate letter', 'Company letters to members should identify the shareholder and purpose, give relevant share or payment details, and state any action required. Practise textbook examples using the company heading, subject, body and authorised signature.'],
    ['Correspondence with Debentureholders', '104–115', 'debentureholder letter|debenture interest letter', 'Letters to debentureholders communicate matters such as allotment, interest and redemption. Give the holder’s reference and the relevant amount, date, payment details and action required.'],
    ['Correspondence with Depositors', '116–126', 'depositor letter|deposit renewal|deposit repayment letter', 'Letters to depositors cover matters such as receipts, renewal and repayment. Identify the deposit, give the relevant amount and dates, and specify how the depositor should respond.'],
    ['Depository System', '127–142', 'demat|dematerialisation|rematerialisation|depository participant|nsdl|cdsl', 'A depository holds securities electronically. Investors access it through a depository participant. Dematerialisation converts physical certificates into electronic holdings, while rematerialisation converts electronic holdings back into physical form.'],
    ['Dividend and Interest', '143–157', 'dividend|interim dividend|final dividend', 'Dividend distributes profits to shareholders when declared under the applicable rules. Interest is payable to creditors according to the borrowing terms. The chapter distinguishes interim and final dividend and covers procedures for payment.'],
    ['Financial Market', '158–169', 'primary market|secondary market|financial markets|capital market|money market', 'Financial markets connect those supplying funds with those raising them. Money markets deal with short-term funds, while capital markets deal with longer-term finance. The primary market handles new securities and the secondary market handles existing securities.'],
    ['Stock Exchange', '170–178', 'stock exchanges|nse|bse|sebi|stock trading', 'A stock exchange provides an organised market for trading listed securities. It supports liquidity and price discovery. The chapter covers exchange functions, trading and settlement, and SEBI’s role in investor protection and market regulation.'],
  ]],
  ['IT', '1203010499', 'information technology', [
    ['Advanced Web Designing', '1–26', 'html|html5|css|web forms|input types|audio video', 'HTML structures pages and forms, and CSS controls their appearance. Choose an input type that matches the data, use labels for accessibility, and test the finished page in a browser. The chapter also covers media and embedding.'],
    ['Digital Marketing', '27–41', 'seo|search engine optimisation|search engine optimization|social media marketing|email marketing', 'Digital marketing promotes products through online channels. SEO aims to improve visibility in unpaid search. Other methods include paid search, email and social media. Track outcomes such as traffic and conversions against the campaign goal.'],
    ['Computerised Accounting with GST', '42–70', 'computerized accounting with gst|gst|cgst|sgst|igst|voucher|tally', 'Practise setting up the company and ledgers, recording sales and purchase vouchers, and checking GST reports. In the usual textbook examples, intrastate supplies use CGST plus SGST and interstate supplies use IGST.'],
    ['E-Commerce and E-Governance', '71–81', 'e commerce|e governance|online payment|g2c', 'E-commerce uses electronic networks for buying and selling. E-governance uses technology to deliver public information and services. The chapter covers transaction models, payment methods and precautions when transacting online.'],
    ['Database Concepts using LibreOffice Base', '82–98', 'libreoffice|database|dbms|primary key|foreign key|sql|database queries', 'A relational database stores records in tables. A primary key identifies each record and a foreign key can link tables. In Base, use tables for data, queries to retrieve it, forms to enter it and reports to present it.'],
    ['Enterprise Resource Planning (ERP)', '99–108', 'erp|erp modules|enterprise resource planning', 'ERP connects functions such as finance, purchasing, inventory, sales and HR through shared data and processes. Benefits include fewer duplicate records and better visibility across departments. Implementation requires planning, training and reliable data.'],
    ['Skill Oriented Practicals', '109–137', 'it practicals|sop|skill oriented practicals', 'The Commerce practicals cover web design, digital marketing, computerised accounting with GST and LibreOffice Base. Complete each task in the relevant software, check the output and save the result.'],
  ]],
  ['Economics', '1203020029', 'economics', [
    ['Introduction to Micro and Macro Economics', '1–7', 'microeconomics|macroeconomics|micro economics|macro economics', 'Microeconomics studies individual units such as households, firms and specific markets. Macroeconomics studies economy-wide aggregates such as national income, employment and the general price level.'],
    ['Utility Analysis', '8–16', 'marginal utility|total utility|diminishing marginal utility', 'Total utility is satisfaction from all units consumed. Marginal utility is the change in total utility from one more unit. Under the law of diminishing marginal utility, successive units typically add less satisfaction when other conditions stay the same.'],
    ['Demand Analysis', '17–26', 'law of demand|demand curve|change in demand|determinants of demand', 'Demand combines willingness and ability to buy at a given price and time. Other things equal, quantity demanded normally falls as price rises. A price change moves along a demand curve, while a change in a factor such as income can shift the curve.'],
    ['Elasticity of Demand', '27–36', 'price elasticity|elasticity|elastic demand|inelastic demand', 'Price elasticity measures how responsive quantity demanded is to price. Divide the percentage change in quantity demanded by the percentage change in price. In absolute terms, above one is elastic, below one is inelastic and one is unit elastic.'],
    ['Supply Analysis', '37–45', 'law of supply|supply curve|change in supply', 'Supply is the quantity sellers offer at a given price and time. Other things equal, quantity supplied generally rises with price. A price change moves along the curve, while a change in costs or technology can shift it.'],
    ['Forms of Market', '46–52', 'perfect competition|monopoly|monopolistic competition|oligopoly|market structures', 'Compare markets by number of sellers, product differentiation, entry barriers and control over price. Perfect competition has many sellers and a homogeneous product. Monopoly has one seller, monopolistic competition has many differentiated sellers, and oligopoly has a few interdependent sellers.'],
    ['Index Numbers', '53–60', 'price index|base year|index number|laspeyres|paasche', 'An index number measures relative change from a base, commonly set to 100. Compare the current and base values using the prescribed method. Weighted methods assign greater influence to items with greater importance.'],
    ['National Income', '61–69', 'gdp|gnp|ndp|nnp|national income methods|per capita income', 'GDP measures final output produced within a country. Gross and net measures differ by depreciation. Domestic and national measures differ by net factor income from abroad. Output, income and expenditure are three approaches to measuring production.'],
    ['Public Finance in India', '70–80', 'public revenue|public expenditure|public debt|fiscal deficit|government budget|direct tax|indirect tax', 'Public finance studies government revenue, expenditure, debt and budgets. Revenue includes tax and non-tax receipts. Public spending funds administration, services and development. A budget compares expected receipts and expenditure.'],
    ['Money Market and Capital Market in India', '81–92', 'money market|capital market|treasury bills|commercial paper|rbi', 'The money market provides short-term funds through instruments such as treasury bills and commercial paper. The capital market supports longer-term funds through instruments such as shares and debentures. The chapter examines the Indian markets and their institutions.'],
    ['Foreign Trade of India', '93–98', 'foreign trade|exports|imports|balance of trade|balance of payments', 'Foreign trade covers exports and imports. The balance of trade compares merchandise exports and imports. The balance of payments records a broader set of transactions between residents and the rest of the world.'],
  ]],
];

const normalize = text => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const contains = (query, phrase) => ` ${query} `.includes(` ${phrase} `);
const index = books.map(([name, file, alias, chapters]) => ({
  name, file, alias,
  chapters: chapters.map(([title, pages, keywords, notes], i) => ({
    title, pages, notes, key: normalize(title), keywords: keywords.split('|').map(normalize),
    topics: (topicNotes[name][i] ?? []).map(([heading, terms, detail]) => ({heading, detail, terms: terms.split('|').map(normalize)})),
  })),
}));

export function textbookAnswer(question) {
  const query = normalize(question);
  if (/\b(my|completed|unchecked|unfinished|remaining|progress|attendance|upcoming|exam schedule|portion|study plan)\b/.test(query)) return null;
  const specified = index.filter(book => contains(query, book.name.toLowerCase()) || contains(query, book.alias));
  // Lowercase “it” is often a pronoun rather than a subject name.
  const scope = specified.filter(book => book.name !== 'IT' || /\bIT\b/.test(question) || contains(query, book.alias) || /\bit (?:chapter|textbook|practicals)\b/.test(query));
  const candidates = scope.length ? scope : index;
  const chapterNumber = query.match(/\bchapter (\d+)([ab])?\b/);
  if (chapterNumber && scope.length === 1) {
    const book = scope[0];
    const number = Number(chapterNumber[1]);
    const part = chapterNumber[2];
    const chapterIndex = book.name === 'Economics' ? number === 3 && part === 'b' ? 3 : number > 3 ? number : number - 1 : number - 1;
    if (!part || book.name === 'Economics' && number === 3) {
      const chapter = book.chapters[chapterIndex];
      if (chapter && !(book.name === 'IT' && number === 7)) return format(book, chapter);
      return `That chapter number isn’t in the ${book.name} textbook. Ask for the chapter list.\n${source(book)}`;
    }
  }
  if (/\b(textbook|chapters|contents|chapter list)\b/.test(query) && scope.length === 1 &&
      !scope[0].chapters.some(chapter => contains(query, chapter.key) || chapter.keywords.some(word => contains(query, word)))) {
    const book = scope[0];
    return `${book.name} textbook contents\n${book.chapters.map(chapter => `• ${chapter.title} (pp. ${chapter.pages})`).join('\n')}\n${source(book)}`;
  }
  const matches = candidates.flatMap(book => book.chapters.flatMap(chapter => {
    const exactTitle = contains(query, chapter.key);
    const topics = chapter.topics.map(topic => ({
      ...topic,
      score: Math.max(0, ...topic.terms.filter(term => contains(query, term)).map(term => term.length + 1)),
    })).filter(topic => topic.score).sort((a, b) => b.score - a.score);
    const keywordScore = Math.max(0, ...chapter.keywords.filter(word => contains(query, word)).map(word => word.length));
    const score = Math.max(exactTitle ? chapter.key.length + 3 : 0, keywordScore, topics[0]?.score ?? 0);
    return score ? [{book, chapter, score, topics}] : [];
  })).sort((a, b) => b.score - a.score);
  if (!matches.length) return scope.length === 1 && /\b(textbook|explain|define|chapter|topic)\b/.test(query)
    ? `I couldn’t match that to a ${scope[0].name} chapter or topic. Try the chapter name or ask for the chapter list.\n${source(scope[0])}` : null;
  const top = matches.filter(match => match.score === matches[0].score);
  return top.map(({book, chapter, topics}) => format(book, chapter, topics)).join('\n\n');
}

function source(book) {
  return `Source: Balbharati Class 12 ${book.name} · https://books.ebalbharati.in/pdfs/${book.file}.pdf`;
}

function format(book, chapter, topics = []) {
  const details = topics.length ? topics.map(topic => `${topic.heading}\n${topic.detail}`).join('\n\n') : chapter.notes;
  return `${book.name} · ${chapter.title}\n${details}\nTextbook pp. ${chapter.pages}\n${source(book)}`;
}
