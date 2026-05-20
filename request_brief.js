const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  ExternalHyperlink, TableOfContents
} = require('/tmp/docxwork/node_modules/docx');
const fs = require('fs');

// ── Colours ──────────────────────────────────────────────────────────────────
const INDIGO   = '4338CA';
const NAVY     = '1E1B4B';
const GOLD     = 'D97706';
const LIGHT_BG = 'EEF2FF';
const MID_BG   = 'E0E7FF';
const DARK_ROW = 'C7D2FE';
const WHITE    = 'FFFFFF';
const GRAY_BG  = 'F8FAFC';
const BORDER_C = 'C7D2FE';

// ── Helpers ───────────────────────────────────────────────────────────────────
const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: BORDER_C };
const borders    = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const noBorder   = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders  = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const cellPad    = { top: 100, bottom: 100, left: 160, right: 160 };

const gap = (pt = 6) => new Paragraph({ spacing: { before: 0, after: pt * 20 } });

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: 'Arial', size: 34, bold: true, color: WHITE })],
  shading: { fill: NAVY, type: ShadingType.CLEAR },
  spacing: { before: 360, after: 160 },
  indent: { left: 160 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } }
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, font: 'Arial', size: 28, bold: true, color: NAVY })],
  spacing: { before: 300, after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: BORDER_C } }
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, font: 'Arial', size: 24, bold: true, color: INDIGO })],
  spacing: { before: 200, after: 80 }
});

const body = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, font: 'Arial', size: 22, color: '1E293B', ...opts })],
  spacing: { before: 60, after: 80 }
});

const note = (text) => new Paragraph({
  children: [new TextRun({ text, font: 'Arial', size: 20, italics: true, color: '64748B' })],
  spacing: { before: 40, after: 60 }
});

const bullet = (text, bold_prefix = '') => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: [
    ...(bold_prefix ? [new TextRun({ text: bold_prefix + ' ', font: 'Arial', size: 22, bold: true, color: NAVY })] : []),
    new TextRun({ text, font: 'Arial', size: 22, color: '1E293B' }),
  ],
  spacing: { before: 40, after: 40 }
});

const sub_bullet = (text) => new Paragraph({
  numbering: { reference: 'sub-bullets', level: 0 },
  children: [new TextRun({ text, font: 'Arial', size: 20, color: '475569' })],
  spacing: { before: 20, after: 20 }
});

// ── Badge cell helper ─────────────────────────────────────────────────────────
const badgeCell = (text, fill, textColor = WHITE, w = 1800) => new TableCell({
  borders, margins: cellPad,
  width: { size: w, type: WidthType.DXA },
  shading: { fill, type: ShadingType.CLEAR },
  verticalAlign: VerticalAlign.CENTER,
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: 'Arial', size: 18, bold: true, color: textColor })]
  })]
});

// ── Simple text cell ──────────────────────────────────────────────────────────
const tc = (text, w, fill = WHITE, bold = false, color = '1E293B', size = 21) => new TableCell({
  borders, margins: cellPad,
  width: { size: w, type: WidthType.DXA },
  shading: { fill, type: ShadingType.CLEAR },
  verticalAlign: VerticalAlign.CENTER,
  children: [new Paragraph({
    children: [new TextRun({ text, font: 'Arial', size, bold, color })]
  })]
});

// ── Header cell (dark) ────────────────────────────────────────────────────────
const hc = (text, w) => tc(text, w, NAVY, true, WHITE, 20);

// ── Status badge ──────────────────────────────────────────────────────────────
const statusCell = (text, fill, textColor, w = 2200) => badgeCell(text, fill, textColor, w);

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 600, hanging: 300 } } }
        }]
      },
      {
        reference: 'sub-bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '◦',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 960, hanging: 300 } } }
        }]
      },
      {
        reference: 'numbered',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 600, hanging: 300 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
        quickFormat: true,
        run: { size: 34, bold: true, font: 'Arial', color: WHITE },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
        quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: NAVY },
        paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 }
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal',
        quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: INDIGO },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'REQUEST  ', font: 'Arial', size: 18, bold: true, color: INDIGO }),
            new TextRun({ text: '|  Project Scaffolding Brief', font: 'Arial', size: 18, color: '94A3B8' }),
            new TextRun({ text: '\tConfidential  •  May 2026', font: 'Arial', size: 18, color: '94A3B8' })
          ],
          tabStops: [{ type: 'right', position: 9360 }],
          border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: BORDER_C } }
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'github.com/TheJimmyJam/Request  •  supabase project: fstcshmibjjjyquqgkxn', font: 'Arial', size: 16, color: '94A3B8' }),
            new TextRun({ text: '\tPage ', font: 'Arial', size: 16, color: '94A3B8' }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 16, color: '94A3B8' }),
          ],
          tabStops: [{ type: 'right', position: 9360 }],
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: BORDER_C } }
        })]
      })
    },

    children: [

      // ══════════════════════════════════════════════════════
      // COVER
      // ══════════════════════════════════════════════════════
      new Paragraph({
        children: [new TextRun({ text: '', font: 'Arial' })],
        spacing: { before: 480 }
      }),

      // Title block
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [
          new TableRow({ children: [
            new TableCell({
              borders: noBorders,
              shading: { fill: NAVY, type: ShadingType.CLEAR },
              margins: { top: 400, bottom: 160, left: 400, right: 400 },
              width: { size: 9360, type: WidthType.DXA },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: 'PROJECT REQUEST', font: 'Arial', size: 56, bold: true, color: WHITE })]
                }),
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: 'The Platform to Request Anything', font: 'Arial', size: 32, color: 'A5B4FC', italics: true })]
                }),
              ]
            })
          ]}),
          new TableRow({ children: [
            new TableCell({
              borders: noBorders,
              shading: { fill: GOLD, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 400, right: 400 },
              width: { size: 9360, type: WidthType.DXA },
              children: [new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: 'SCAFFOLDING BRIEF  •  May 2, 2026', font: 'Arial', size: 22, bold: true, color: WHITE })]
              })]
            })
          ]})
        ]
      }),

      gap(10),

      // Cover meta table
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 3480, 2000, 1880],
        rows: [
          new TableRow({ children: [
            tc('Project',     2000, LIGHT_BG, true,  NAVY),
            tc('Request Platform', 3480, WHITE, false, '1E293B'),
            tc('Status',      2000, LIGHT_BG, true,  NAVY),
            tc('In Development', 1880, WHITE, false, INDIGO),
          ]}),
          new TableRow({ children: [
            tc('Owner / Client', 2000, LIGHT_BG, true, NAVY),
            tc('Sam',         3480, WHITE, false, '1E293B'),
            tc('Version',     2000, LIGHT_BG, true, NAVY),
            tc('v0.1.0 — MVP', 1880, WHITE, false, '1E293B'),
          ]}),
          new TableRow({ children: [
            tc('Repository',  2000, LIGHT_BG, true,  NAVY),
            tc('github.com/TheJimmyJam/Request', 3480, WHITE, false, INDIGO),
            tc('Date',        2000, LIGHT_BG, true,  NAVY),
            tc('May 2, 2026', 1880, WHITE, false, '1E293B'),
          ]}),
          new TableRow({ children: [
            tc('Supabase URL', 2000, LIGHT_BG, true, NAVY),
            tc('https://fstcshmibjjjyquqgkxn.supabase.co', 3480, WHITE, false, '64748B', 18),
            tc('Stack',       2000, LIGHT_BG, true,  NAVY),
            tc('React + Supabase + Netlify', 1880, WHITE, false, '1E293B', 18),
          ]})
        ]
      }),

      gap(16),

      // ══════════════════════════════════════════════════════
      // SECTION 1 — EXECUTIVE SUMMARY
      // ══════════════════════════════════════════════════════
      h1('1.  Executive Summary'),
      body('Request is a peer-to-peer platform that connects travelers with buyers who want items from foreign locations. A traveler posts their itinerary; a buyer finds that trip and submits a request for a specific item, offering to pay the item\'s purchase cost (X) plus a finder\'s fee (Y). Request takes 10% of (X + Y) as a platform connection fee. No import hassle. No duty fees. Just people helping people shop smart across borders.'),

      gap(4),

      // Concept table
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1400, 5560, 2400],
        rows: [
          new TableRow({ children: [hc('Actor', 1400), hc('Action', 5560), hc('Value Exchange', 2400)] }),
          new TableRow({ children: [
            tc('Traveler', 1400, LIGHT_BG, true, NAVY),
            tc('Posts upcoming trip (destination + dates). Accepts/declines item requests. Purchases and delivers items.', 5560),
            tc('Earns finder\'s fee (Y)', 2400, GRAY_BG, false, '047857'),
          ]}),
          new TableRow({ children: [
            tc('Buyer',    1400, LIGHT_BG, true, NAVY),
            tc('Browses trips. Submits request with item cost offer (X) and finder\'s fee (Y). Confirms receipt.', 5560),
            tc('Gets authentic item without import fees', 2400, GRAY_BG, false, INDIGO),
          ]}),
          new TableRow({ children: [
            tc('Sam (Platform)', 1400, LIGHT_BG, true, NAVY),
            tc('Facilitates the connection. Handles messaging, status tracking, and email notifications.', 5560),
            tc('(X + Y) × 10% per transaction', 2400, GRAY_BG, true, GOLD),
          ]})
        ]
      }),

      gap(8),
      body('Fee formula (enforced at database level via Postgres generated columns):'),
      new Paragraph({
        shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
        indent: { left: 400, right: 400 },
        spacing: { before: 80, after: 80 },
        border: { left: { style: BorderStyle.SINGLE, size: 8, color: INDIGO } },
        children: [
          new TextRun({ text: 'platform_fee = ROUND((item_cost + finder_fee) × 0.10, 2)', font: 'Courier New', size: 20, color: INDIGO, bold: true }),
          new TextRun({ text: '     →     total = ROUND((item_cost + finder_fee) × 1.10, 2)', font: 'Courier New', size: 20, color: NAVY }),
        ]
      }),

      // ══════════════════════════════════════════════════════
      // SECTION 2 — TECH STACK
      // ══════════════════════════════════════════════════════
      h1('2.  Tech Stack'),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1600, 2000, 3360, 2400],
        rows: [
          new TableRow({ children: [hc('Layer', 1600), hc('Technology', 2000), hc('Purpose', 3360), hc('Key Config', 2400)] }),
          new TableRow({ children: [
            tc('Frontend',    1600, LIGHT_BG, true, NAVY),
            tc('React 18 + Vite', 2000),
            tc('SPA with React Router v6. Hot module reload in dev.', 3360),
            tc('npm run dev → localhost:5173', 2400, GRAY_BG, false, '64748B', 19),
          ]}),
          new TableRow({ children: [
            tc('Styling',     1600, LIGHT_BG, true, NAVY),
            tc('Tailwind CSS v3', 2000),
            tc('Utility-first CSS. Custom brand (indigo/gold) palette in tailwind.config.js.', 3360),
            tc('Brand colors: #4338CA (indigo), #D97706 (gold)', 2400, GRAY_BG, false, '64748B', 19),
          ]}),
          new TableRow({ children: [
            tc('Database',    1600, LIGHT_BG, true, NAVY),
            tc('Supabase (Postgres)', 2000),
            tc('5 tables, RLS policies, generated columns for fee math, realtime for messaging.', 3360),
            tc('Project: fstcshmibjjjyquqgkxn', 2400, GRAY_BG, false, '64748B', 19),
          ]}),
          new TableRow({ children: [
            tc('Auth',        1600, LIGHT_BG, true, NAVY),
            tc('Supabase Auth', 2000),
            tc('Email/password + Google OAuth. Auto-creates profile row on sign-up via trigger.', 3360),
            tc('Redirect: /auth/callback', 2400, GRAY_BG, false, '64748B', 19),
          ]}),
          new TableRow({ children: [
            tc('Hosting',     1600, LIGHT_BG, true, NAVY),
            tc('Netlify',     2000),
            tc('Static site deploy from GitHub. Serverless functions for email. SPA redirect rule.', 3360),
            tc('netlify.toml configured', 2400, GRAY_BG, false, '64748B', 19),
          ]}),
          new TableRow({ children: [
            tc('Email',       1600, LIGHT_BG, true, NAVY),
            tc('Resend',      2000),
            tc('Transactional emails via Netlify function. HTML templates for all key events.', 3360),
            tc('netlify/functions/send-email.js', 2400, GRAY_BG, false, '64748B', 19),
          ]}),
          new TableRow({ children: [
            tc('CDN / DNS',   1600, LIGHT_BG, true, NAVY),
            tc('Cloudflare',  2000),
            tc('Custom domain routing, DDoS protection, SSL termination (optional — not yet set up).', 3360),
            tc('Pending domain purchase', 2400, GRAY_BG, false, '94A3B8', 19),
          ]}),
          new TableRow({ children: [
            tc('Version Control', 1600, LIGHT_BG, true, NAVY),
            tc('GitHub',      2000),
            tc('Repository: github.com/TheJimmyJam/Request. Single main branch.', 3360),
            tc('30 files, 3,485 LOC', 2400, GRAY_BG, false, '64748B', 19),
          ]}),
          new TableRow({ children: [
            tc('Payments',    1600, LIGHT_BG, true, NAVY),
            tc('Stripe (v2)', 2000),
            tc('NOT YET BUILT. Deferred to v2. Fee breakdown is calculated and displayed only.', 3360),
            tc('Credentials in .credentials', 2400, GRAY_BG, false, '94A3B8', 19),
          ]})
        ]
      }),

      // ══════════════════════════════════════════════════════
      // SECTION 3 — DATABASE SCHEMA
      // ══════════════════════════════════════════════════════
      h1('3.  Database Schema'),
      body('All tables live in the public schema of the Supabase Postgres instance. Row Level Security (RLS) is enabled on all tables.'),

      h3('3.1  Tables'),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 2200, 2600, 2760],
        rows: [
          new TableRow({ children: [hc('Table', 1800), hc('Key Columns', 2200), hc('Purpose', 2600), hc('Notes', 2760)] }),
          new TableRow({ children: [
            tc('profiles',   1800, LIGHT_BG, true, NAVY),
            tc('id, full_name, avatar_url, bio, location', 2200, WHITE, false, '1E293B', 19),
            tc('Extends auth.users. Created automatically on sign-up via trigger.', 2600, WHITE, false, '1E293B', 19),
            tc('1:1 with auth.users', 2760, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('trips',      1800, LIGHT_BG, true, NAVY),
            tc('id, traveler_id, destination, country, city, start_date, end_date, max_requests, status', 2200, WHITE, false, '1E293B', 19),
            tc('Posted by travelers. Status: active | completed | cancelled.', 2600, WHITE, false, '1E293B', 19),
            tc('Indexed on destination, dates, status', 2760, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('requests',   1800, LIGHT_BG, true, NAVY),
            tc('id, trip_id, requester_id, item_name, item_cost (X), finder_fee (Y), platform_fee, total, status', 2200, WHITE, false, '1E293B', 19),
            tc('Core transaction table. platform_fee and total are GENERATED ALWAYS columns — can\'t be overridden.', 2600, WHITE, false, '1E293B', 19),
            tc('Unique: (trip_id, requester_id) — one request per buyer per trip', 2760, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('messages',   1800, LIGHT_BG, true, NAVY),
            tc('id, request_id, sender_id, content, created_at', 2200, WHITE, false, '1E293B', 19),
            tc('Threaded messaging per request. Realtime subscription active on request detail page.', 2600, WHITE, false, '1E293B', 19),
            tc('Supabase Realtime channel per request_id', 2760, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('reviews',    1800, LIGHT_BG, true, NAVY),
            tc('id, request_id, reviewer_id, reviewee_id, rating (1-5), comment', 2200, WHITE, false, '1E293B', 19),
            tc('Post-completion reviews. Both parties can review each other.', 2600, WHITE, false, '1E293B', 19),
            tc('Unique: (request_id, reviewer_id)', 2760, GRAY_BG, false, '64748B', 18),
          ]})
        ]
      }),

      gap(8),
      h3('3.2  Request Status Flow'),
      gap(4),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1680, 400, 1680, 400, 1680, 400, 1680, 400, 1040],
        rows: [
          new TableRow({ children: [
            statusCell('pending',   'FEF3C7', '92400E', 1680),
            tc('→', 400, WHITE, true, GRAY_BG),
            statusCell('accepted',  'D1FAE5', '065F46', 1680),
            tc('→', 400, WHITE, true, GRAY_BG),
            statusCell('purchased', 'DBEAFE', '1E40AF', 1680),
            tc('→', 400, WHITE, true, GRAY_BG),
            statusCell('delivered', 'EDE9FE', '5B21B6', 1680),
            tc('→', 400, WHITE, true, GRAY_BG),
            statusCell('completed', LIGHT_BG, NAVY, 1040),
          ]}),
          new TableRow({ children: [
            tc('Buyer submitted', 1680, GRAY_BG, false, '64748B', 17),
            tc('', 400, WHITE),
            tc('Traveler accepted', 1680, GRAY_BG, false, '64748B', 17),
            tc('', 400, WHITE),
            tc('Traveler bought item', 1680, GRAY_BG, false, '64748B', 17),
            tc('', 400, WHITE),
            tc('Item shipped/handed over', 1680, GRAY_BG, false, '64748B', 17),
            tc('', 400, WHITE),
            tc('Buyer confirmed', 1040, GRAY_BG, false, '64748B', 17),
          ]})
        ]
      }),

      gap(6),
      note('Also: declined (traveler declined) and disputed (buyer/traveler raised issue). Both are terminal states.'),

      // ══════════════════════════════════════════════════════
      // SECTION 4 — WHAT WAS BUILT
      // ══════════════════════════════════════════════════════
      h1('4.  What We Have Built (MVP v0.1.0)'),

      h2('4.1  Frontend Pages & Components'),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 3760, 3400],
        rows: [
          new TableRow({ children: [hc('File', 2200), hc('What It Does', 3760), hc('Key Features', 3400)] }),
          new TableRow({ children: [
            tc('pages/Landing.jsx', 2200, LIGHT_BG, true, NAVY, 19),
            tc('Public marketing home page', 3760, WHITE, false, '1E293B', 19),
            tc('Hero, How It Works, Fee Explainer, Destinations grid, Testimonials, CTA', 3400, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('pages/Auth.jsx', 2200, LIGHT_BG, true, NAVY, 19),
            tc('Sign in / Sign up', 3760, WHITE, false, '1E293B', 19),
            tc('Email+password, Google OAuth button, tab switcher, show/hide password', 3400, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('pages/BrowseTrips.jsx', 2200, LIGHT_BG, true, NAVY, 19),
            tc('Public trip directory', 3760, WHITE, false, '1E293B', 19),
            tc('Search by destination, date filter, sort (soonest/newest/spots), 50 trip limit', 3400, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('pages/TripDetail.jsx', 2200, LIGHT_BG, true, NAVY, 19),
            tc('Single trip + request submission form', 3760, WHITE, false, '1E293B', 19),
            tc('Live fee calculator, traveler sidebar, accept/decline buttons for traveler, request list', 3400, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('pages/CreateTrip.jsx', 2200, LIGHT_BG, true, NAVY, 19),
            tc('Post a new trip (protected)', 3760, WHITE, false, '1E293B', 19),
            tc('Destination, country, city, date range, description, max requests selector', 3400, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('pages/Dashboard.jsx', 2200, LIGHT_BG, true, NAVY, 19),
            tc('Logged-in user home (protected)', 3760, WHITE, false, '1E293B', 19),
            tc('Stats cards (active trips, pending/active/completed requests), tabbed My Trips + My Requests', 3400, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('pages/RequestDetail.jsx', 2200, LIGHT_BG, true, NAVY, 19),
            tc('Individual request + messaging (protected)', 3760, WHITE, false, '1E293B', 19),
            tc('Real-time chat, status tracker (5-step progress), action buttons, star review form', 3400, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('pages/Profile.jsx', 2200, LIGHT_BG, true, NAVY, 19),
            tc('Public/private user profile', 3760, WHITE, false, '1E293B', 19),
            tc('Edit name/bio/location, active trips grid, reviews list with star ratings', 3400, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('components/Navbar.jsx', 2200, LIGHT_BG, true, NAVY, 19),
            tc('Sticky top navigation', 3760, WHITE, false, '1E293B', 19),
            tc('Auth-aware, mobile hamburger menu, user avatar dropdown, Post a Trip CTA', 3400, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('components/TripCard.jsx', 2200, LIGHT_BG, true, NAVY, 19),
            tc('Reusable trip card', 3760, WHITE, false, '1E293B', 19),
            tc('Destination, dates, traveler avatar, rating, spots remaining', 3400, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('components/FeeCalculator.jsx', 2200, LIGHT_BG, true, NAVY, 19),
            tc('Live fee breakdown widget', 3760, WHITE, false, '1E293B', 19),
            tc('Renders item cost, finder\'s fee, 10% platform fee, total as user types', 3400, GRAY_BG, false, '64748B', 18),
          ]})
        ]
      }),

      gap(8),
      h2('4.2  Backend / Infrastructure'),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          new TableRow({ children: [hc('Component', 3000), hc('Details', 6360)] }),
          new TableRow({ children: [
            tc('supabase/migrations/001_initial.sql', 3000, LIGHT_BG, true, NAVY, 19),
            tc('Full schema: 5 tables, indexes, RLS policies, set_updated_at trigger, handle_new_user trigger, trips_with_details view', 6360, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('netlify/functions/send-email.js', 3000, LIGHT_BG, true, NAVY, 19),
            tc('Resend-powered transactional emails for: new_request, request_accepted, request_declined, item_delivered, new_message. Gracefully skips if RESEND_API_KEY not set.', 6360, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('netlify.toml', 3000, LIGHT_BG, true, NAVY, 19),
            tc('Build config (npm run build → dist/), SPA redirect rule (/* → index.html), security headers, functions directory', 6360, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('src/contexts/AuthContext.jsx', 3000, LIGHT_BG, true, NAVY, 19),
            tc('React context wrapping Supabase Auth. Exposes: user, profile, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, updateProfile', 6360, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('.env / .env.example', 3000, LIGHT_BG, true, NAVY, 19),
            tc('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY wired in. RESEND_API_KEY and APP_URL documented for Netlify env vars.', 6360, WHITE, false, '1E293B', 19),
          ]})
        ]
      }),

      // ══════════════════════════════════════════════════════
      // SECTION 5 — DEPLOYMENT STATUS
      // ══════════════════════════════════════════════════════
      h1('5.  Deployment Status'),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 2400, 3760],
        rows: [
          new TableRow({ children: [hc('Task', 3200), hc('Status', 2400), hc('Notes', 3760)] }),
          new TableRow({ children: [
            tc('GitHub repo created & pushed', 3200),
            badgeCell('✓  DONE', 'D1FAE5', '065F46', 2400),
            tc('github.com/TheJimmyJam/Request • 30 files, 3,485 LOC on main', 3760, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('Supabase project created', 3200),
            badgeCell('✓  DONE', 'D1FAE5', '065F46', 2400),
            tc('Project ID: fstcshmibjjjyquqgkxn • Keys saved to .credentials', 3760, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('SQL migration run on Supabase', 3200),
            badgeCell('PENDING', 'FEF3C7', '92400E', 2400),
            tc('Run 001_initial.sql in Supabase SQL Editor to create all tables + RLS', 3760, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('Google OAuth configured in Supabase', 3200),
            badgeCell('PENDING', 'FEF3C7', '92400E', 2400),
            tc('Create OAuth app at console.cloud.google.com • Add redirect: /auth/callback', 3760, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('Netlify site deployed', 3200),
            badgeCell('PENDING', 'FEF3C7', '92400E', 2400),
            tc('Connect GitHub repo in Netlify • Set 5 env vars • Deploy', 3760, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('Resend domain verified', 3200),
            badgeCell('PENDING', 'FEF3C7', '92400E', 2400),
            tc('Verify sending domain at resend.com • Add RESEND_API_KEY to Netlify env vars', 3760, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('Cloudflare custom domain', 3200),
            badgeCell('NOT STARTED', DARK_ROW, NAVY, 2400),
            tc('Optional v1 task • CNAME www → *.netlify.app', 3760, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('Stripe payment integration', 3200),
            badgeCell('v2', MID_BG, NAVY, 2400),
            tc('Deferred. Credentials already in .credentials file for future use.', 3760, GRAY_BG, false, '64748B', 18),
          ]})
        ]
      }),

      // ══════════════════════════════════════════════════════
      // SECTION 6 — USER ROLES
      // ══════════════════════════════════════════════════════
      h1('6.  User Roles & Permissions'),

      body('Request currently has three logical user roles. All are stored in the same auth.users / profiles tables — there is no separate role column yet. Role is inferred from context (do they own the trip? are they the requester?).'),
      gap(4),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1600, 2000, 3160, 2600],
        rows: [
          new TableRow({ children: [hc('Role', 1600), hc('Who', 2000), hc('Can Do', 3160), hc('Cannot Do', 2600)] }),
          new TableRow({ children: [
            tc('Traveler',   1600, LIGHT_BG, true, NAVY),
            tc('Any authenticated user who posts a trip', 2000, WHITE, false, '1E293B', 19),
            tc('Post/edit/cancel trips • Accept/decline requests • Mark purchased/delivered • Message buyers • Leave reviews', 3160, WHITE, false, '1E293B', 19),
            tc('Cannot request on own trips', 2600, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('Buyer',      1600, LIGHT_BG, true, NAVY),
            tc('Any authenticated user who submits a request', 2000, WHITE, false, '1E293B', 19),
            tc('Browse all trips • Submit 1 request per trip • View/message on own requests • Confirm receipt • Leave reviews', 3160, WHITE, false, '1E293B', 19),
            tc('Cannot see other buyers\' requests on same trip', 2600, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('Admin (Sam)', 1600, LIGHT_BG, true, NAVY),
            tc('Platform owner', 2000, WHITE, false, '1E293B', 19),
            tc('Has Supabase service role key (full DB access) • Can view all data via Supabase dashboard', 3160, WHITE, false, '1E293B', 19),
            tc('No admin UI yet — v2 feature', 2600, GRAY_BG, false, '94A3B8', 18),
          ]}),
          new TableRow({ children: [
            tc('Guest',      1600, LIGHT_BG, true, NAVY),
            tc('Unauthenticated visitor', 2000, WHITE, false, '1E293B', 19),
            tc('Browse trips • View trip details • View public profiles', 3160, WHITE, false, '1E293B', 19),
            tc('Cannot submit requests or post trips', 2600, GRAY_BG, false, '64748B', 18),
          ]})
        ]
      }),

      gap(8),
      h3('RLS Policy Summary'),
      body('Row Level Security is enforced at the Postgres level — not just in the frontend.'),
      bullet('profiles: public read, owner write'),
      bullet('trips: public read, traveler write/delete'),
      bullet('requests: only traveler + requester can see; only requester can insert; both can update status'),
      bullet('messages: only parties to the request can read/write'),
      bullet('reviews: public read, party write (one per request per reviewer)'),

      // ══════════════════════════════════════════════════════
      // SECTION 7 — CREDENTIALS
      // ══════════════════════════════════════════════════════
      h1('7.  Credentials & Keys'),
      body('All credentials are stored locally at ~/Desktop/Projects/.credentials and are never committed to GitHub (.gitignore enforced). Below is a reference of what exists for this project.'),
      gap(4),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 2400, 4160],
        rows: [
          new TableRow({ children: [hc('Credential', 2800), hc('Variable Name', 2400), hc('Where Used', 4160)] }),
          new TableRow({ children: [
            tc('Supabase Project URL',    2800, LIGHT_BG, true, NAVY, 19),
            tc('REQUEST_SUPABASE_URL',    2400, WHITE, false, '475569', 18),
            tc('VITE_SUPABASE_URL in .env + Netlify env vars', 4160, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('Supabase Anon Key',       2800, LIGHT_BG, true, NAVY, 19),
            tc('REQUEST_SUPABASE_ANON_KEY', 2400, WHITE, false, '475569', 18),
            tc('VITE_SUPABASE_ANON_KEY in .env + Netlify env vars (public, safe to expose)', 4160, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('Supabase Service Role Key', 2800, LIGHT_BG, true, NAVY, 19),
            tc('REQUEST_SUPABASE_SERVICE_ROLE_KEY', 2400, WHITE, false, '475569', 18),
            tc('Server-side ONLY. Never expose to client. Use in admin scripts / Netlify functions.', 4160, GRAY_BG, false, 'DC2626', 18),
          ]}),
          new TableRow({ children: [
            tc('Supabase DB Password',    2800, LIGHT_BG, true, NAVY, 19),
            tc('REQUEST_SUPABASE_DB_PASSWORD', 2400, WHITE, false, '475569', 18),
            tc('Direct Postgres connection (psql / migrations via CLI)', 4160, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('GitHub PAT Classic',      2800, LIGHT_BG, true, NAVY, 19),
            tc('GITHUB_PAT_CLASSIC',      2400, WHITE, false, '475569', 18),
            tc('git push, Netlify GitHub connection', 4160, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('GitHub Fine-Grained PAT', 2800, LIGHT_BG, true, NAVY, 19),
            tc('GITHUB_PAT_FINE_GRAINED', 2400, WHITE, false, '475569', 18),
            tc('Scoped repo operations', 4160, GRAY_BG, false, '64748B', 18),
          ]}),
          new TableRow({ children: [
            tc('Resend API Key',          2800, LIGHT_BG, true, NAVY, 19),
            tc('RESEND_API_KEY',          2400, WHITE, false, '475569', 18),
            tc('Netlify env var (server-side only). Powers send-email.js function.', 4160, GRAY_BG, false, '64748B', 18),
          ]})
        ]
      }),

      // ══════════════════════════════════════════════════════
      // SECTION 8 — WHAT STILL NEEDS TO BE BUILT
      // ══════════════════════════════════════════════════════
      new Paragraph({ children: [new PageBreak()] }),
      h1('8.  What Still Needs to Be Built'),

      h2('8.1  Immediate (To Go Live)'),
      body('These must be completed before the platform is usable by real users:'),
      bullet('Run SQL migration', 'Step 1:'),
      sub_bullet('Open Supabase SQL Editor → paste supabase/migrations/001_initial.sql → Run'),
      bullet('Configure Google OAuth', 'Step 2:'),
      sub_bullet('Create OAuth credentials at console.cloud.google.com'),
      sub_bullet('Add to Supabase Authentication → Providers → Google'),
      sub_bullet('Add redirect URL: https://your-app.netlify.app/auth/callback'),
      bullet('Deploy to Netlify', 'Step 3:'),
      sub_bullet('Connect GitHub repo in Netlify dashboard'),
      sub_bullet('Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, RESEND_API_KEY, FROM_EMAIL, APP_URL'),
      sub_bullet('Trigger first deploy'),
      bullet('Verify Resend sending domain', 'Step 4:'),
      sub_bullet('Add domain DNS records in Resend → verify → set FROM_EMAIL env var'),

      gap(6),
      h2('8.2  Version 2 Features (Revenue-Critical)'),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 1400, 5160],
        rows: [
          new TableRow({ children: [hc('Feature', 2800), hc('Priority', 1400), hc('Description', 5160)] }),
          new TableRow({ children: [
            tc('Stripe Payment Integration',     2800, LIGHT_BG, true, NAVY, 19),
            badgeCell('P0', 'FEE2E2', 'DC2626', 1400),
            tc('Buyer pays at request submission. Platform collects 10% via Stripe Connect. Traveler receives payout (X + Y − Stripe fees) after delivery confirmation.', 5160, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('Admin Dashboard',                2800, LIGHT_BG, true, NAVY, 19),
            badgeCell('P0', 'FEE2E2', 'DC2626', 1400),
            tc('Sam-only view: all transactions, total platform revenue, dispute queue, user management, trip/request search.', 5160, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('Dispute Resolution Flow',        2800, LIGHT_BG, true, NAVY, 19),
            badgeCell('P1', 'FEF3C7', '92400E', 1400),
            tc('Either party can raise a dispute. Admin reviews and resolves. Funds held until resolved.', 5160, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('In-App Notifications',           2800, LIGHT_BG, true, NAVY, 19),
            badgeCell('P1', 'FEF3C7', '92400E', 1400),
            tc('Bell icon in navbar. Realtime notification feed (new request, accepted, message, delivered).', 5160, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('Image Uploads for Requests',     2800, LIGHT_BG, true, NAVY, 19),
            badgeCell('P1', 'FEF3C7', '92400E', 1400),
            tc('Buyer can attach reference photos to their request (stored in Supabase Storage).', 5160, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('Traveler Verification',          2800, LIGHT_BG, true, NAVY, 19),
            badgeCell('P1', 'FEF3C7', '92400E', 1400),
            tc('Optional ID + passport verification via third-party KYC (e.g., Persona, Stripe Identity) to build buyer trust.', 5160, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('Email Notifications (Full Wiring)', 2800, LIGHT_BG, true, NAVY, 19),
            badgeCell('P1', 'FEF3C7', '92400E', 1400),
            tc('Currently the send-email function is built but email addresses must be fetched server-side (service role) and passed from client. Needs Netlify function upgrade.', 5160, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('Search by Item Category',        2800, LIGHT_BG, true, NAVY, 19),
            badgeCell('P2', MID_BG, NAVY, 1400),
            tc('Let buyers search open requests or what traveler is willing to shop for (spirits, fashion, food, electronics, etc.).', 5160, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('Customs & Import Info Layer',    2800, LIGHT_BG, true, NAVY, 19),
            badgeCell('P2', MID_BG, NAVY, 1400),
            tc('Per-country import rules and duty thresholds surfaced on the trip/request pages.', 5160, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('Mobile App (React Native)',      2800, LIGHT_BG, true, NAVY, 19),
            badgeCell('P3', GRAY_BG, '64748B', 1400),
            tc('Same Supabase backend. iOS + Android. Push notifications via Expo.', 5160, WHITE, false, '1E293B', 19),
          ]}),
          new TableRow({ children: [
            tc('Referral Program',               2800, LIGHT_BG, true, NAVY, 19),
            badgeCell('P3', GRAY_BG, '64748B', 1400),
            tc('Users get credit for referring travelers or buyers. Platform fee discount as incentive.', 5160, WHITE, false, '1E293B', 19),
          ]})
        ]
      }),

      // ══════════════════════════════════════════════════════
      // SECTION 9 — FEATURE IDEAS / FUTURE VISION
      // ══════════════════════════════════════════════════════
      gap(8),
      h1('9.  Future Feature Ideas'),

      h2('Product Expansion'),
      bullet('Group requests — multiple buyers pool a request to a single traveler (e.g., 4 people each want a bottle of Scotch on the same trip)'),
      bullet('Request Board — buyers can post open requests without a specific trip in mind; travelers browse and claim them'),
      bullet('Recurring travelers — frequent flyers build a verified travel history, enabling pre-booking of their future trips'),
      bullet('Trip packages — traveler advertises a “shopping run” with specific categories and price ranges, buyers book slots'),
      bullet('Escrow system — buyer funds are held in escrow until delivery is confirmed; reduces fraud for both parties'),
      bullet('Insurance / liability waiver — per-transaction micro-insurance for high-value items'),

      gap(6),
      h2('Trust & Safety'),
      bullet('Two-factor authentication for high-value transactions'),
      bullet('Item photo proof — traveler uploads purchase receipt and photo of item before marking delivered'),
      bullet('Fraud detection — flag suspicious patterns (too many disputes, unverified travelers, etc.)'),
      bullet('Community reporting — flag problematic users or listings'),

      gap(6),
      h2('Monetisation Beyond 10%'),
      bullet('Featured trip placement — travelers pay to appear at the top of search'),
      bullet('Buyer subscription — monthly fee for reduced platform fee (e.g., 5% instead of 10%)'),
      bullet('Concierge tier — Sam manually sources hard-to-find items for premium buyers'),

      // ══════════════════════════════════════════════════════
      // SECTION 10 — FILE MAP
      // ══════════════════════════════════════════════════════
      gap(8),
      h1('10.  Repository File Map'),
      gap(4),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3600, 5760],
        rows: [
          new TableRow({ children: [hc('Path', 3600), hc('Purpose', 5760)] }),
          ...[
            ['src/App.jsx',                         'Root router — all routes + ProtectedRoute wrapper'],
            ['src/main.jsx',                        'React entry point — providers, Toaster'],
            ['src/index.css',                       'Tailwind + custom component classes (.btn-primary, .card, .badge, .status-*)'],
            ['src/lib/supabase.js',                 'Supabase client singleton'],
            ['src/contexts/AuthContext.jsx',        'Auth state, profile fetch, all auth methods'],
            ['src/pages/Landing.jsx',               'Marketing home'],
            ['src/pages/Auth.jsx',                  'Login / signup'],
            ['src/pages/AuthCallback.jsx',          'OAuth redirect handler'],
            ['src/pages/BrowseTrips.jsx',           'Public trip search'],
            ['src/pages/CreateTrip.jsx',            'Post trip form (protected)'],
            ['src/pages/TripDetail.jsx',            'Trip + request submission + traveler management'],
            ['src/pages/Dashboard.jsx',             'User home (protected)'],
            ['src/pages/RequestDetail.jsx',         'Request thread + real-time chat (protected)'],
            ['src/pages/Profile.jsx',               'User profile + reviews (public)'],
            ['src/components/Navbar.jsx',           'Sticky nav bar'],
            ['src/components/TripCard.jsx',         'Reusable trip card component'],
            ['src/components/FeeCalculator.jsx',    'Live fee breakdown widget'],
            ['netlify/functions/send-email.js',     'Resend email serverless function'],
            ['supabase/migrations/001_initial.sql', 'Complete DB schema + RLS + triggers'],
            ['netlify.toml',                        'Build + function config + SPA redirect + security headers'],
            ['vite.config.js',                      'Vite build config'],
            ['tailwind.config.js',                  'Brand palette + font config'],
            ['package.json',                        'All dependencies'],
            ['.env',                                'Local secrets (gitignored)'],
            ['.env.example',                        'Template — safe to commit'],
            ['.gitignore',                          'Excludes .env, dist/, node_modules/'],
            ['DEPLOY.md',                           'Step-by-step deployment guide'],
          ].map(([path, desc]) => new TableRow({ children: [
            tc(path, 3600, LIGHT_BG, true, NAVY, 17),
            tc(desc, 5760, WHITE, false, '1E293B', 19),
          ]}))
        ]
      }),

      // ══════════════════════════════════════════════════════
      // SECTION 11 — NEXT ACTIONS
      // ══════════════════════════════════════════════════════
      new Paragraph({ children: [new PageBreak()] }),
      h1('11.  Immediate Next Actions'),
      gap(4),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [480, 4480, 2400, 2000],
        rows: [
          new TableRow({ children: [hc('#', 480), hc('Action', 4480), hc('Owner', 2400), hc('Status', 2000)] }),
          ...[
            ['1', 'Run 001_initial.sql in Supabase SQL Editor',                     'Sam / Claude',   'PENDING', 'FEF3C7', '92400E'],
            ['2', 'Set up Google OAuth in Supabase + Google Console',               'Sam',            'PENDING', 'FEF3C7', '92400E'],
            ['3', 'Connect GitHub repo to Netlify + set env vars + deploy',         'Sam / Claude',   'PENDING', 'FEF3C7', '92400E'],
            ['4', 'Verify Resend sending domain + add API key to Netlify',          'Sam',            'PENDING', 'FEF3C7', '92400E'],
            ['5', 'Smoke test sign-up, post trip, submit request, messaging',       'Sam',            'PENDING', 'FEF3C7', '92400E'],
            ['6', 'Point custom domain via Cloudflare (optional)',                  'Sam',            'OPTIONAL', LIGHT_BG, NAVY],
            ['7', 'Build Stripe payment integration (v2)',                          'Claude',         'v2',       MID_BG,  NAVY],
            ['8', 'Build Admin dashboard for Sam (v2)',                             'Claude',         'v2',       MID_BG,  NAVY],
          ].map(([num, action, owner, status, fillC, textC]) => new TableRow({ children: [
            tc(num,    480, LIGHT_BG, true, NAVY, 19),
            tc(action, 4480, WHITE, false, '1E293B', 19),
            tc(owner,  2400, GRAY_BG, false, '64748B', 18),
            badgeCell(status, fillC, textC, 2000),
          ]}))
        ]
      }),

      gap(20),

      // Sign-off
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({ children: [new TableCell({
          borders: noBorders,
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          margins: { top: 240, bottom: 240, left: 400, right: 400 },
          width: { size: 9360, type: WidthType.DXA },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [
              new TextRun({ text: 'Request — The Platform to Request Anything', font: 'Arial', size: 24, bold: true, color: WHITE }),
            ]}),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 }, children: [
              new TextRun({ text: 'Confidential project brief • Generated May 2, 2026', font: 'Arial', size: 18, color: 'A5B4FC' }),
            ]})
          ]
        })
      ]
    })
  ]
})
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/sessions/exciting-sharp-hamilton/mnt/Request/Request_Scaffolding_Brief.docx', buffer);
  console.log('Done');
}).catch(console.error);
