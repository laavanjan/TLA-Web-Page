-- Questions and answers for the "TLA உதவி" help assistant (the உதவி button on
-- every public page). Managed at /admin/faq (add, edit, hide, reorder, delete).
--
-- Run once in Supabase → SQL Editor, AFTER team_editors.sql (it needs the
-- is_admin() and log_admin_activity() functions). Safe to re-run: the
-- questions below are only added while the table is still empty, so running
-- it again never brings back a question an admin deleted.
--
-- Who may do what:
--   everyone ........ read the visible questions
--   main admins ..... read all, add, edit, hide, reorder, delete
--
-- cat:   a topic id from FAQ_CATEGORIES in src/shared/faq/faqData.js
-- a:     the answer. {email} {phone} {phoneName} {members} {facebookUrl}
--        {youtubeUrl} {instagramUrl} are filled in on the site from the
--        contact settings and the member count.
-- links: [{"label": "…", "to": "/a-page-of-this-site"}, {"label": "…", "href": "https://…"}]
-- kw:    extra search words (English, other spellings)

create table if not exists public.faqs (
  id text primary key
    constraint faqs_id_format check (id ~ '^[a-z0-9][a-z0-9-]{1,59}$'),
  cat text not null,
  q text not null constraint faqs_q_present check (btrim(q) <> ''),
  a text not null constraint faqs_a_present check (btrim(a) <> ''),
  links jsonb not null default '[]'::jsonb constraint faqs_links_array check (jsonb_typeof(links) = 'array'),
  kw text not null default '',
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

drop policy if exists "faqs_read" on public.faqs;
create policy "faqs_read"
  on public.faqs for select
  using (is_visible or public.is_admin());

drop policy if exists "faqs_admin_write" on public.faqs;
create policy "faqs_admin_write"
  on public.faqs for all
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.touch_faq()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists faqs_touch on public.faqs;
create trigger faqs_touch
  before update on public.faqs
  for each row execute function public.touch_faq();

-- ---- The questions that were hard-coded in src/shared/faq/faqData.js ----------------------
-- Added before the activity-log trigger below, so the first run doesn't log
-- 70 "added the question" entries.
insert into public.faqs (id, cat, q, a, links, kw, sort_order)
select v.id, v.cat, v.q, v.a, v.links, v.kw, v.sort_order
from (values
  ('what-is-tla', 'about',
   E'தமிழ் இலக்கிய மன்றம் (TLA) என்றால் என்ன?',
   E'மொறட்டுவைப் பல்கலைக்கழக தமிழ் இலக்கிய மன்றம் (Tamil Literary Association - TLA) பல்கலைக்கழகத் தமிழ் மாணவர்களால் இயங்கும் ஒரு மாணவர் அமைப்பு. தமிழின் கலை, கலாச்சாரம், இலக்கியம், பண்பாடு ஆகியவற்றைப் பேணி வளர்ப்பதோடு, மாணவர்களின் ஆளுமை விருத்திக்கும் தமிழ் மக்களின் வளர்ச்சிக்கும் உதவிக்கரம் நீட்டுகிறது.',
   '[{"label":"எமது வரலாறு","to":"/history"}]'::jsonb,
   'about tla tamil literary association uom what who', 0),
  ('where-is-tla', 'about',
   E'TLA எங்கே இயங்குகிறது?',
   E'இலங்கையின் கட்டுபெத்தையில் உள்ள மொறட்டுவைப் பல்கலைக்கழகத்தில் (University of Moratuwa) மன்றம் இயங்குகிறது. பல நிகழ்வுகள் பல்கலைக்கழக வளாகத்திலும், தமிழருவி, சொற்கணை இறுதிச் சமர் போன்ற பெரிய நிகழ்வுகள் தலைநகர் கொழும்பிலும் நடைபெறுகின்றன.',
   '[{"label":"தொடர்புகள்","to":"/contact"}]'::jsonb,
   'location where moratuwa katubedda colombo university', 1),
  ('aims', 'about',
   E'மன்றத்தின் நோக்கங்கள் என்ன?',
   E'மொழி விருத்தி, ஆளுமைத்திறன் வழிகாட்டல், உதவிக்கரம் ஆகியவையே மன்றத்தின் முக்கிய நோக்கங்கள்:\n• பல்கலைக்கழக மற்றும் பாடசாலை மாணவர்களிடம் தமிழ் மொழி அறிவையும் திறமைகளையும் வெளிக்கொணர்தல்\n• மாணவர்களின் ஆளுமைத்திறன், அடுத்தகட்டத் தொழில் மற்றும் உயர்கல்வி நகர்வுகளுக்கு வழிகாட்டுதல்\n• வறுமையில் வாடும் மக்களுக்கு உதவுவதும் அவர்களின் நிலையை உலகறியச் செய்வதும்',
   '[{"label":"எமது வரலாறு","to":"/history"}]'::jsonb,
   'aim goal mission objective vision purpose', 2),
  ('activities', 'about',
   E'மன்றம் முன்னெடுக்கும் முக்கிய செயற்பாடுகள் எவை?',
   E'• கலை விழாக்கள்: தமிழருவி, தைப்பொங்கல், வாணி விழா\n• போட்டிகள்: சொற்கணை, நிரலி, பிரம்மம் (ஒளிச்சுவடு உட்பட)\n• சமூகப் பணிகள்: ஜீவநதி, உதவித்தொகை, இரத்ததான முகாம், கோவில் பணிகள்\n• வழிகாட்டல்: அரமியம்\n• வளாக நிகழ்வுகள்: PPL, திரைப்பட இரவு, உணவுத் திருவிழா',
   '[{"label":"நிகழ்வுகள்","to":"/#event"}]'::jsonb,
   'events activities programs projects list', 3),
  ('who-serves', 'about',
   E'மன்றம் யாருக்காகச் செயற்படுகிறது?',
   E'மொறட்டுவைப் பல்கலைக்கழகத் தமிழ் மாணவர்களுக்காக மட்டுமன்றி, இலங்கையெங்கும் உள்ள தமிழ் பாடசாலை மாணவர்களுக்கும் (சொற்கணை, நிரலி), உலகெங்கும் வாழும் தமிழ் உறவுகளுக்கும் (பிரம்மம்), உதவி தேவைப்படும் மக்களுக்கும் (ஜீவநதி) மன்றம் செயற்படுகிறது.',
   '[{"label":"நிகழ்வுகள்","to":"/#event"}]'::jsonb,
   'who for students schools community', 4),
  ('motto', 'about',
   E'மன்றத்தின் முழக்கம் என்ன?',
   E'"தமிழுக்காய் நாம் ! நமக்கேயான தமிழ் !!"\n\nமுகப்புப் பக்கத்தை அலங்கரிக்கும் வாசகம்: "தித்திக்கும் தமிழில் நித்திலம் சொரிய எத்திக்கும் அதிர்ந்திட சங்கே முழங்கு!"',
   '[{"label":"முகப்பு","to":"/"}]'::jsonb,
   'motto slogan tagline quote', 5),
  ('members-count', 'about',
   E'மன்றத்தில் எத்தனை உறுப்பினர்கள் உள்ளனர்?',
   E'தற்போது {members} உறுப்பினர்கள் எம்மோடு இணைந்து பயணிக்கின்றனர். உறுப்பினர்கள் பக்கத்தில் அனைவரையும் காணலாம்.',
   '[{"label":"உறுப்பினர்கள்","to":"/members"}]'::jsonb,
   'members how many count membership list', 6),
  ('founded', 'history',
   E'மன்றம் எப்போது ஆரம்பிக்கப்பட்டது?',
   E'1968 ஆம் ஆண்டு, தமிழின் கலை, கலாசார, இலக்கிய, பண்பாடுகளைப் பேணி எதிர்காலச் சந்ததிக்குக் கொண்டு சேர்க்கும் நோக்குடன் "தமிழ் மன்றம்" என்ற பெயரில் மன்றம் உருவாக்கப்பட்டது.',
   '[{"label":"எமது வரலாறு","to":"/history"}]'::jsonb,
   'founded started established year 1968 history', 7),
  ('names', 'history',
   E'மன்றத்தின் பெயர் எப்படி மாறியது?',
   E'• 1968 - "தமிழ் மன்றம்" ஆக ஆரம்பம்\n• 1973 - "தமிழ் சங்கம்" எனப் பெயர் மாற்றம்\n• 1990களின் ஆரம்பம் - "இலக்கிய மன்றம்" என மீண்டும் பெயர் மாற்றம்; இன்று "தமிழ் இலக்கிய மன்றம்"',
   '[{"label":"எமது வரலாறு","to":"/history"}]'::jsonb,
   'name change tamil mantram sangam former names', 8),
  ('nutpam', 'history',
   E'"நுட்பம்" சஞ்சிகை என்றால் என்ன?',
   E'கவிதை, கட்டுரை, நாடகம், விவாதம் எனத் தமிழின் கலையம்சங்கள் அனைத்தையும் உள்ளடக்கிய மன்றத்தின் முதல் சஞ்சிகை "நுட்பம்". மன்றம் ஆரம்பித்த காலத்திலேயே வெற்றிகரமாக வெளியிடப்பட்டது. 1970 இல் வெளியான இரண்டாவது இதழை இணையதளத்திலேயே வாசிக்கலாம்.',
   '[{"label":"நுட்பம் 1970 வாசிக்க","to":"/books/nutpam-1970"}]'::jsonb,
   'nutpam magazine journal first publication', 9),
  ('first-festival', 'history',
   E'மன்றத்தின் முதல் கலாச்சார விழா எப்போது நடந்தது?',
   E'1970 இல் "கலை விழா" என்ற பெயரில், கொழும்பு இராமகிருஷ்ண மிசன் மண்டபத்தில் முதல் கலாச்சார விழா வெகுவிமரிசையாகக் கொண்டாடப்பட்டது. அதே விழாவில் இரண்டாவது "நுட்பம்" இதழும் வெளியிடப்பட்டது. 1971, 1972 களிலும் கலை விழாக்கள் தொடர்ந்தன.',
   '[{"label":"எமது வரலாறு","to":"/history"}]'::jsonb,
   'first festival kalai vizha 1970 ramakrishna', 10),
  ('dramas', 'history',
   E'நாடகத் துறைக்கு மன்றத்தின் பங்களிப்பு என்ன?',
   E'1972-1980 காலப்பகுதி ஈழத்து நாடக வரலாற்றில் முக்கியமான காலம். இக்காலத்தில் மன்றம் 19 நாடகங்களை மேடையேற்றியது - தமிழ்ச் சங்கம் அடைந்த பெரும் மைல்கல் இது. 1976-1979 வரை கலை நிகழ்ச்சிகள், விவாதங்கள், கருத்தரங்குகளும் நடைபெற்றன.',
   '[{"label":"எமது வரலாறு","to":"/history"}]'::jsonb,
   'drama theatre plays 1970s', 11),
  ('paused', 'history',
   E'மன்றத்தின் செயற்பாடுகள் எப்போதாவது நின்றனவா?',
   E'ஆம். 1980களின் இடைப்பகுதியில் இனப்பிரிவினை ஆழ வேரூன்றியதால் தலைநகரில் பல்கலைக்கழகங்கள் பெரிதும் பாதிக்கப்பட்டன. இதனால் மன்றத்தின் செயற்பாடுகள் சில ஆண்டுகள் நிறுத்தப்பட்டன. 1990களின் ஆரம்பத்தில் தமிழ் மாணவர்களின் அக்கறையால் மீண்டும் தொடங்கின.',
   '[{"label":"எமது வரலாறு","to":"/history"}]'::jsonb,
   'stopped paused 1980s conflict', 12),
  ('war-years', 'history',
   E'போர்க்காலத்திலும் மன்றம் இயங்கியதா?',
   E'ஆம். 1990களின் பிற்பகுதி முதல் 2000களின் ஆரம்பம் வரை ஈழப்போர் உச்சம் பெற்ற காலத்திலும் மன்றம் தன் கடமையைத் தொடர்ந்தது. இனப்பிரச்சினை, கலவரம், பொருளாதாரச் சிக்கல் என அத்தனை வளைவுகளிலும் பயணித்து, ஐந்து தசாப்தங்களைக் கடந்தும் மன்றம் உறுதியாக நிற்கிறது.',
   '[{"label":"எமது வரலாறு","to":"/history"}]'::jsonb,
   'war conflict 1990s 2000s survived', 13),
  ('how-old', 'history',
   E'மன்றம் எத்தனை ஆண்டுகளாக இயங்குகிறது?',
   E'1968 இல் ஆரம்பிக்கப்பட்ட மன்றம் ஐந்து தசாப்தங்களுக்கும் மேலாக - தலைமுறை தலைமுறையாக மொறட்டுவைத் தமிழ் மாணவர்களால் - தொடர்ந்து நடத்தப்பட்டு வருகிறது.',
   '[{"label":"எமது வரலாறு","to":"/history"}]'::jsonb,
   'how old years decades age', 14),
  ('history-video', 'history',
   E'மன்றத்தின் வரலாற்றை எங்கே விரிவாக அறியலாம்?',
   E'"எமது வரலாறு" பக்கத்தில் 1968 முதல் இன்றுவரையான பயணத்தைப் படங்களுடன் வாசிக்கலாம். அப்பக்கத்தின் மேலே தமிழருவியின் வரலாறு பற்றிய காணொளியும் உள்ளது.',
   '[{"label":"எமது வரலாறு","to":"/history"},{"label":"YouTube","href":"{youtubeUrl}"}]'::jsonb,
   'history page video documentary youtube', 15),
  ('pongal', 'culture',
   E'தைப்பொங்கல் விழா எப்படிக் கொண்டாடப்படுகிறது?',
   E'மதபேதமின்றி, சூரியனுக்கும் விளைச்சலுக்கு உதவிய கால்நடைகளுக்கும் நன்றி கூறும் முகமாக, தை மாதம் பல்கலைக்கழக வளாகத்தினுள் பாரம்பரிய முறையில் பொங்கல் பொங்கப்படுகிறது. பாரம்பரிய கலாச்சார உடையில், தின்பண்டங்களுடன் விருந்தோம்பலும் பாரம்பரியத் தமிழர் விளையாட்டுக்களுமாக விழாக்கோலம் காணும்.',
   '[{"label":"தைப்பொங்கல்","to":"/events/thaipongal"}]'::jsonb,
   'thai pongal festival harvest january', 16),
  ('pongal-programme', 'culture',
   E'பொங்கல் விழாவில் என்ன நிகழ்ச்சிகள் இருக்கும்?',
   E'கடந்த விழாக்களில் (எ.கா. 2023) இடம்பெற்றவை: பொங்கல் பூஜை, தமிழ்த்தாய் வாழ்த்து, நடனம், வாய்ப்பாட்டு, வில்லுப்பாட்டு, சிறப்புரைகள், பட்டிமன்றம், பாரம்பரிய விளையாட்டுகள். பொங்கலை ஒட்டி PPL கிரிக்கெட் திருவிழாவும் நடைபெறும்.',
   '[{"label":"தைப்பொங்கல்","to":"/events/thaipongal"},{"label":"PPL","to":"/events/ppl"}]'::jsonb,
   'pongal programme agenda schedule games', 17),
  ('vani-vizha', 'culture',
   E'வாணி விழா என்றால் என்ன?',
   E'அந்திமாலைப் பொழுதில் பல்கலைக்கழக வளாகத்தில் ஆரம்பமாகும் விழா இது. கல்விக்கு சரஸ்வதி, செல்வத்திற்கு லஷ்மி, வீரத்திற்கு துர்க்கை ஆகிய முப்பெரும் தேவியருக்கான இறைவழிபாட்டுடன் ஆரம்பமாகி, இரவுப் பொழுதில் இனிதே நிறைவுறும்.',
   '[{"label":"வாணி விழா","to":"/events/vani-villa"}]'::jsonb,
   'vani vizha saraswathi navarathri pooja', 18),
  ('vani-programme', 'culture',
   E'வாணி விழாவில் என்ன கலை நிகழ்ச்சிகள் இடம்பெறும்?',
   E'இறைவழிபாட்டைத் தொடர்ந்து இசை, நடனம், வில்லுப்பாட்டு, பல்லியம் போன்ற கலை நிகழ்ச்சிகள் இடம்பெறும்.',
   '[{"label":"வாணி விழா","to":"/events/vani-villa"}]'::jsonb,
   'vani programme music dance villupattu', 19),
  ('thamilaruvi', 'culture',
   E'தமிழருவி என்றால் என்ன?',
   E'மன்றத்தின் மிகப்பெரிய கலை நிகழ்வு தமிழருவி. தமிழ் சமூகத்தின் கலை, கல்வி, கலாச்சாரம் ஆகியவற்றின் இன்றைய விருத்திக்கும் நாளைய இருப்பிற்கும் தூணாய் நிற்கும் நோக்குடன், வருடந்தோறும் தலைநகரில் பிரம்மாண்டமாக நடைபெறுகிறது.',
   '[{"label":"தமிழருவி","to":"/events/thamilaruvi"}]'::jsonb,
   'thamilaruvi thamizharuvi tamilaruvi annual festival', 20),
  ('thamilaruvi-where', 'culture',
   E'தமிழருவி எங்கே, எப்போது நடைபெறுகிறது?',
   E'தமிழருவி வருடந்தோறும் தலைநகர் கொழும்பில் நடைபெறுகிறது. உதாரணமாக, தமிழருவி 2024 ஒக்டோபர் 13 அன்று கொழும்பு இராமகிருஷ்ண மண்டபத்தில் நடைபெற்றது. ஒவ்வொரு ஆண்டின் திகதி, இடம் தமிழருவி பக்கத்திலும் எமது சமூக ஊடகங்களிலும் அறிவிக்கப்படும்.',
   '[{"label":"தமிழருவி","to":"/events/thamilaruvi"},{"label":"Facebook","href":"{facebookUrl}"}]'::jsonb,
   'thamilaruvi date venue where when colombo ramakrishna hall', 21),
  ('thamilaruvi-programme', 'culture',
   E'தமிழருவியில் என்னென்ன நிகழ்ச்சிகள் இருக்கும்?',
   E'தமிழருவி 2024 நிகழ்ச்சி நிரல்: மங்கல விளக்கேற்றல், தமிழ்த்தாய் வாழ்த்து, வரவேற்பு நடனம், தலைமை உரை, பிரதம விருந்தினர் உரை, இதழ் வெளியீடு, பல்லியம், நாடகம், மெல்லிசை, மக்கள் மன்றம், நடனம், நன்றியுரை.',
   '[{"label":"தமிழருவி","to":"/events/thamilaruvi"}]'::jsonb,
   'thamilaruvi programme agenda drama dance', 22),
  ('thamilaruvi-magazine', 'culture',
   E'தமிழருவியில் இதழ் வெளியிடப்படுகிறதா?',
   E'ஆம். ஒவ்வொரு ஆண்டும் தமிழருவி விழாவில் மன்றத்தின் இதழ் வெளியிடப்படுகிறது. அண்மைய இதழான "தமிழருவி''26 இதழ்" ஐ இணையதளத்தில் வாசிக்கவும் பதிவிறக்கவும் முடியும்.',
   '[{"label":"தமிழருவி''26 இதழ்","to":"/books/thamilaruvi26"}]'::jsonb,
   'thamilaruvi magazine book release ithal', 23),
  ('sotkanai', 'competitions',
   E'சொற்கணை என்றால் என்ன?',
   E'இலங்கையின் சிறந்த பாடசாலை விவாத அணியைத் தெரிவு செய்யும் விவாதச்சமர் சொற்கணை. மாவட்டரீதியில் தேர்வு செய்யப்பட்ட சிறந்த அணிகள், சமூகப் பிரச்சினைகள், இலக்கிய ஆராய்வு எனப் பன்முகத் தலைப்புகளில், தலைநகரில் பல்லாயிரக்கணக்கானோர் முன்னிலையில் இறுதிச் சமரில் மோதுகின்றன.',
   '[{"label":"சொற்கணை","to":"/events/sotkanai"}]'::jsonb,
   'sotkanai sorkanai debate competition schools', 24),
  ('sotkanai-format', 'competitions',
   E'சொற்கணை எப்படி நடைபெறுகிறது?',
   E'முதலில் மாவட்ட மட்டப் போட்டிகள் நடைபெறும். ஒவ்வொரு மாவட்டத்திலிருந்தும் தேர்வு செய்யப்படும் சிறந்த அணிகள் தலைநகரில் நடைபெறும் இறுதிக்கட்ட விவாதச்சமரில் பங்குபற்றும். மாவட்டப் போட்டி விபரங்களை சொற்கணை மாவட்டப் பக்கத்தில் காணலாம்.',
   '[{"label":"சொற்கணை","to":"/events/sotkanai"},{"label":"மாவட்டப் போட்டிகள்","to":"/events/sotkanai-district"}]'::jsonb,
   'sotkanai district rounds final format', 25),
  ('sotkanai-eligibility', 'competitions',
   E'சொற்கணையில் யார் பங்குபற்றலாம்?',
   E'இலங்கையின் தமிழ் பாடசாலை மாணவர்கள் தமது பாடசாலை அணியாகப் பங்குபற்றலாம். வயதெல்லை ஒவ்வொரு ஆண்டும் விதிமுறைகளில் அறிவிக்கப்படும் (உதாரணமாக 2024 இல்: 31-01-2004 இற்குப் பின்னர் பிறந்தவர்கள்).',
   '[{"label":"சொற்கணை விதிமுறைகள்","to":"/events/sotkanai"}]'::jsonb,
   'sotkanai eligibility age who can join school students', 26),
  ('sotkanai-team', 'competitions',
   E'சொற்கணை அணியில் எத்தனை பேர், எவ்வளவு நேரம்?',
   E'ஒவ்வொரு அணியும் 4 விவாதிகளையும் 1 உதிரி விவாதியையும் கொண்டிருக்க வேண்டும். தலைவர் உட்பட ஒவ்வொருவருக்கும் 4 நிமிடங்களும், இறுதியில் தலைவரின் தொகுப்புரைக்கு 5 நிமிடங்களுமாக, ஒரு அணிக்கு மொத்தம் 21 நிமிடங்கள் வழங்கப்படும்.',
   '[{"label":"சொற்கணை விதிமுறைகள்","to":"/events/sotkanai"}]'::jsonb,
   'sotkanai team size members speakers time minutes', 27),
  ('sotkanai-register', 'competitions',
   E'சொற்கணைக்கு எப்படிப் பதிவு செய்வது?',
   E'• விண்ணப்பப் படிவத்தில் போட்டியாளர்களின் முழுப்பெயர்களை ஆங்கிலத்தில் எழுதுங்கள்\n• பாடசாலை அதிபரின் கையொப்பத்துடன், போட்டி தினத்தன்று மாவட்ட இணைப்பாளரிடம் கையளியுங்கள்\n• மாவட்டப் போட்டிக்கு ஒரு கிழமை முன்னதாக, வருகையை மாவட்ட இணைப்பாளருக்குத் தொலைபேசி மூலம் உறுதிப்படுத்துங்கள் - உறுதிப்படுத்தாத அணிகள் அனுமதிக்கப்படமாட்டா',
   '[{"label":"சொற்கணை","to":"/events/sotkanai"}]'::jsonb,
   'sotkanai register registration apply form coordinator', 28),
  ('sotkanai-judging', 'competitions',
   E'சொற்கணையில் புள்ளியிடல் எப்படி?',
   E'அணிகளுக்கான தரப்படுத்தல் இசற் புள்ளி (z-score) முறையிலான புள்ளியிடல் திட்டத்தின் ஊடாக மேற்கொள்ளப்படும். விரிவான விளக்கம் போட்டி தினத்தன்று ஆரம்பத்தில் அறியத்தரப்படும். சுயாதீன நடுவர் குழாத்தின் தீர்ப்பே இறுதியானது. பேச்சுக்கள் தனிப்பட்ட தாக்குதல்களாகவோ இன, மத அவதூறுகளாகவோ அமையக்கூடாது.',
   '[{"label":"சொற்கணை விதிமுறைகள்","to":"/events/sotkanai"}]'::jsonb,
   'sotkanai judging marks score z-score judges rules', 29),
  ('sotkanai-winners', 'competitions',
   E'சொற்கணை 2024 வெற்றியாளர்கள் யார்?',
   E'• 1ம் இடம்: கிளி / அன் திரேசா பெண்கள் பாடசாலை\n• 2ம் இடம்: யாழ் / இந்துக் கல்லூரி\n• 3ம் இடம்: வவுனியா தமிழ் மகா வித்தியாலயம்\n• சிறந்த விவாதி: வைஷ்ணவி சிவாஸ்கரன்',
   '[{"label":"சொற்கணை","to":"/events/sotkanai"}]'::jsonb,
   'sotkanai winners 2024 results champion best debater', 30),
  ('niraali', 'competitions',
   E'நிரலி (Ideathon) என்றால் என்ன?',
   E'வளர்ந்து வரும் தகவல் தொழில்நுட்ப உலகில் சாதனையாளர்களைத் தேடும் மன்றத்தின் புதிய அத்தியாயம் நிரலி. இலங்கை முழுவதும் உள்ள தமிழ் பாடசாலை மாணவர்களின் புத்தாக்கம் மற்றும் தொழில் முனைவோர் திறன்களுக்குக் களம் அமைக்கும் அகில இலங்கை ரீதியான போட்டி இது.',
   '[{"label":"நிரலி","to":"/ideathon"}]'::jsonb,
   'niraali nirali ideathon innovation it technology schools', 31),
  ('niraali-prizes', 'competitions',
   E'நிரலியில் என்ன பரிசுகள் வழங்கப்படும்?',
   E'1ம், 2ம், 3ம் இடங்களுக்குப் பெறுமதிமிக்க பரிசில்கள் வழங்கப்படும். பங்குபற்றும் அனைவருக்கும் இலத்திரனியல் சான்றிதழ் வழங்கப்படும். பரிசளிப்பு வைபவம் தமிழருவி விழாவில் நடைபெறும்.',
   '[{"label":"நிரலி","to":"/ideathon"}]'::jsonb,
   'niraali ideathon prizes certificate award', 32),
  ('brammam', 'competitions',
   E'பிரம்மம் என்றால் என்ன?',
   E'பாடசாலை மாணவர்கள் மற்றும் உலகெங்கும் பரந்து வாழும் தமிழ் உறவுகளின் சிந்தனையாக்கம், பேச்சாற்றல், கற்பனைத்திறன், தொழில்நுட்ப ஆற்றல் போன்ற திறமைகளை வெளிக்கொணரும் போட்டிகள் பிரம்மம். இவை முற்றுமுழுதாக இணையவழியில் நடைபெறுவதால், வீட்டிலிருந்தே பங்குபற்றலாம்.',
   '[{"label":"பிரம்மம்","to":"/events/brammam"}]'::jsonb,
   'brammam online competitions worldwide', 33),
  ('brammam-list', 'competitions',
   E'பிரம்மத்தில் என்னென்ன போட்டிகள் உள்ளன?',
   E'• எழுத்தோவியம் - சிந்தனையாக்கத் திறனை வெளிக்கொணரும் எழுத்தாக்கப் போட்டி\n• ஒளிச்சுவடு - புகைப்படப் போட்டி\n• மீரிகை - எண்ணிமச் சித்திர (digital art) போட்டி\n• சொலல்வலர் - பேச்சாற்றல் போட்டி\nஒவ்வொரு போட்டியின் பக்கத்திலும் தலைப்புகளும் விதிமுறைகளும் உள்ளன.',
   '[{"label":"எழுத்தோவியம்","to":"/events/brammam/eluthoviyam"},{"label":"ஒளிச்சுவடு","to":"/events/brammam/olisuvadu"},{"label":"மீரிகை","to":"/events/brammam/meerigai"},{"label":"சொலல்வலர்","to":"/events/brammam/solalvalar"}]'::jsonb,
   'brammam eluthoviyam olisuvadu meerigai solalvalar writing photography digital art speech', 34),
  ('olisuvadu', 'competitions',
   E'ஒளிச்சுவடு புகைப்படப் போட்டி பற்றி அறியலாமா?',
   E'தமிழ் மாணவர்களின் புகைப்பட ஆற்றலை வெளிக்கொணர மன்றம் நடத்தும் போட்டி ஒளிச்சுவடு. இது பிரம்மம் போட்டிகளில் ஒன்று என்பதால் இணையவழியில் பங்குபற்றலாம். தலைப்புகள், விதிமுறைகள் ஒளிச்சுவடு பக்கத்தில் உள்ளன.',
   '[{"label":"ஒளிச்சுவடு","to":"/events/brammam/olisuvadu"}]'::jsonb,
   'olisuvadu oli suvadu photography photo contest', 35),
  ('brammam-published', 'competitions',
   E'பிரம்மம் வெற்றி ஆக்கங்கள் வெளியிடப்படுமா?',
   E'மன்றத்தின் நூலில் இடம்பெறக்கூடிய கூடுதல் ஆக்கங்களில் "பிரம்மப் போட்டியில் வெற்றியீட்டிய ஆக்கங்களும்" அடங்கும். வெளியீடு பற்றிய விபரங்களுக்கு படைப்பு சமர்ப்பிப்பு வழிகாட்டல்களைப் பாருங்கள்.',
   '[{"label":"பிரம்மம்","to":"/events/brammam"},{"label":"வழிகாட்டல்கள்","to":"/books/submit"}]'::jsonb,
   'brammam winners published book magazine', 36),
  ('jeevanathi', 'social',
   E'ஜீவநதி என்றால் என்ன?',
   E'ஜீவநதி மன்றத்தின் ஜீவ காருண்யப் பயணம். வறுமையில் வாழ்நிலையைத் தொலைத்த பின்தங்கிய பிரதேச மக்களுக்கு உதவுவதோடு, அவர்களின் துயரையும் வெளியுலகம் அறியச் செய்கிறது.',
   '[{"label":"ஜீவநதி","to":"/events/jeevanathi"}]'::jsonb,
   'jeevanathi jeevanadhi charity social service help poor', 37),
  ('jeevanathi-projects', 'social',
   E'ஜீவநதி மூலம் என்ன உதவிகள் வழங்கப்பட்டுள்ளன?',
   E'• 2024 - முல்லைத்தீவு செம்மலை மகா வித்தியாலய மாணவர்களுக்கு ஐந்து துவிச்சக்கரவண்டிகள் (இலங்கை தமிழர் சமூகம் கத்தாரின் உதவியுடன்)\n• 2018 - பதுளை உடவெறியா பாடசாலை மாணவர்களுக்கு அப்பியாசக் கொப்பிகள், புத்தகப்பை, சப்பாத்து உள்ளிட்ட பொருட்கள் மற்றும் பாடசாலை அபிவிருத்தி நிதியுதவி\n• 2018 - கிளிநொச்சி, முல்லைத்தீவு வெள்ள நிவாரணம்\n• 2014 - பதுளை மண்சரிவு நிவாரணம்',
   '[{"label":"ஜீவநதி","to":"/events/jeevanathi"}]'::jsonb,
   'jeevanathi projects past help bicycles schools', 38),
  ('disaster-relief', 'social',
   E'இயற்கை அனர்த்தங்களின் போது மன்றம் உதவியதா?',
   E'ஆம். 2018 இல் நாட்டின் பல மாவட்ட மக்களிடமிருந்து நிவாரணப் பொருட்களைச் சேகரித்து, கிளிநொச்சி மற்றும் முல்லைத்தீவில் வெள்ளத்தால் பாதிக்கப்பட்ட மக்களுக்கு வழங்கியது. 2014 இல் பதுளை மாவட்டத்தில் மண்சரிவால் பாதிக்கப்பட்ட மக்களுக்கும் நிவாரண உதவிகள் வழங்கப்பட்டன.',
   '[{"label":"ஜீவநதி","to":"/events/jeevanathi"}]'::jsonb,
   'flood landslide disaster relief help', 39),
  ('donate', 'social',
   E'ஜீவநதிக்கு நான் எப்படி உதவலாம்?',
   E'ஜீவநதி பக்கத்தின் "எம்முடன் இணையுங்கள்" பகுதியில் மன்றத்தின் வங்கிக் கணக்கு விபரங்களும் தொடர்பாளர்களின் இலக்கங்களும் உள்ளன. நன்கொடை வழங்குவதற்கு முன் அப்பக்கத்திலுள்ள விபரங்களைச் சரிபார்த்து, தேவையெனில் எம்மைத் தொடர்பு கொள்ளுங்கள்.',
   '[{"label":"ஜீவநதி - எம்முடன் இணையுங்கள்","to":"/events/jeevanathi"},{"label":"தொடர்புகள்","to":"/contact"}]'::jsonb,
   'donate donation bank account help contribute jeevanathi', 40),
  ('kovil', 'social',
   E'மன்றத்தின் கோவில் பணிகள் என்ன?',
   E'வருடந்தோறும் இரத்மலானையில் உள்ள திருநந்தீஸ்வர ஆலயத்தில் சிவராத்திரி, நவராத்திரி, தைப்பொங்கல் பூசைகள் மன்றத்தால் சிறப்பாக நடாத்தப்படுகின்றன. இந்நேரங்களில் மாணவர்களின் இறைவழிபாடுகளும் சிரமதானப் பணிகளும் நடைபெறுகின்றன.',
   '[{"label":"கோவில்","to":"/events/kovil"}]'::jsonb,
   'kovil temple ratmalana thirunandeeswarar sivarathri navarathri shramadana', 41),
  ('blood-donation', 'social',
   E'இரத்ததான முகாம் பற்றி?',
   E'உயிர்களை வாழவைக்கும் உன்னதமான இரத்ததானத்தை, பல மாணவர்களினதும் உறவுகளினதும் பங்குபற்றலுடன் மன்றம் வருடா வருடம் முன்னெடுக்கிறது. அடுத்த முகாம் பற்றிய அறிவிப்புகளுக்கு எமது சமூக ஊடகங்களைப் பின்தொடருங்கள்.',
   '[{"label":"இரத்ததான முகாம்","to":"/events/blood-donation"},{"label":"Facebook","href":"{facebookUrl}"}]'::jsonb,
   'blood donation camp donate blood', 42),
  ('aramiyam', 'social',
   E'அரமியம் என்றால் என்ன?',
   E'பல்கலைக்கழகக் கல்வியை முடித்து தொழில் மற்றும் உயர்கல்விக்குச் செல்லவிருக்கும் மாணவர்களின் எதிர்காலம் தொடர்பான கலந்துரையாடல்களும் தொழில் வழிகாட்டல்களும் அடங்கிய நிகழ்ச்சி அரமியம்.',
   '[{"label":"அரமியம்","to":"/events/aramiyam"}]'::jsonb,
   'aramiyam career guidance seminar higher studies jobs', 43),
  ('ppl', 'campus',
   E'PPL என்றால் என்ன?',
   E'பொங்கல் விழாவை ஒட்டி, பல்கலைக்கழக மாணவர்களிடையே நட்புறவை ஏற்படுத்தும் கிரிக்கெட் திருவிழா PPL.',
   '[{"label":"PPL","to":"/events/ppl"}]'::jsonb,
   'ppl cricket tournament pongal premier league', 44),
  ('ppl-teams', 'campus',
   E'PPL அணிகள் எப்படி அமைக்கப்படுகின்றன?',
   E'கனிஷ்ட மற்றும் சிரேஷ்ட மாணவர்களைக் கலந்து அணிகள் தெரிவு செய்யப்படுகின்றன. இதனால் வெவ்வேறு ஆண்டு மாணவர்கள் ஒன்றாக விளையாடி நட்பை வளர்க்கின்றனர்.',
   '[{"label":"PPL","to":"/events/ppl"}]'::jsonb,
   'ppl teams juniors seniors selection', 45),
  ('ppl-winners', 'campus',
   E'அண்மைய PPL முடிவுகள் என்ன?',
   E'இணையதளத்தில் உள்ள போட்டி முடிவுகள்:\n• முதலாம் இடம்: Spicy Blasters\n• இரண்டாம் இடம்: Cheddi Nadu Supper King\n• விருது: Logithan',
   '[{"label":"PPL","to":"/events/ppl"}]'::jsonb,
   'ppl winners results champion', 46),
  ('movie-night', 'campus',
   E'திரைப்பட இரவு என்றால் என்ன?',
   E'இயந்திரமாக ஓடி உடலாலும் மனதாலும் சோர்ந்திருக்கும் மாணவர்களின் மனங்களை இதமாக்க, பல்கலைக்கழக வளாகத்தில் நடைபெறும் திரைப்படக் காட்சிகள்.',
   '[{"label":"திரைப்பட இரவு","to":"/events/movie-night"}]'::jsonb,
   'movie night film screening', 47),
  ('food-festival', 'campus',
   E'உணவுத் திருவிழா என்றால் என்ன?',
   E'எமது பாரம்பரிய உணவுகளை சகோதர மொழி மாணவர்களுடன் பகிர்ந்துண்ணும் நிகழ்வு உணவுத் திருவிழா.',
   '[{"label":"உணவுத் திருவிழா","to":"/events/food-festival"}]'::jsonb,
   'food festival traditional food', 48),
  ('teams', 'teams',
   E'மன்றத்தில் என்னென்ன அணிகள் உள்ளன?',
   E'• வலையமைப்பு அணி\n• ஊடக அணி\n• வடிவமைப்பு அணி\n• தொழில்நுட்ப அணி\nஒவ்வொரு அணியின் பணிகள், உறுப்பினர்கள், படைப்புகளை அணிகள் பக்கத்தில் காணலாம்.',
   '[{"label":"அணிகள்","to":"/teams"}]'::jsonb,
   'teams list network media design technical', 49),
  ('team-network', 'teams',
   E'வலையமைப்பு அணி என்ன செய்கிறது?',
   E'இணையவழி முரசாக மன்றத்தின் புகழை தேசம் கடந்தும் பறைசாற்றுவது இவர்களின் பணி. உத்தியோகபூர்வ இணையதளத்தின் ஊடாக கடந்த கால நிகழ்வுகள், படைப்புகள் மற்றும் தமிழருவியில் வெளியிடப்படும் இதழ்களைக் காலத்தால் அழியாத வகையில் ஆவணப்படுத்துவதும் அறிக்கையிடுவதும் இவர்களின் தலையாய நோக்கம்.',
   '[{"label":"அணிகள்","to":"/teams"}]'::jsonb,
   'network team web website', 50),
  ('team-media', 'teams',
   E'ஊடக அணி என்ன செய்கிறது?',
   E'அனைத்து அணிகளின் உழைப்புக்கும் அழகியல் வடிவம் கொடுப்பவர்கள் இவர்கள். பல்லாயிரக்கணக்கான புகைப்படங்களைப் படம்பிடிப்பதோடு, பதாகைகள், நிகழ்ச்சிக் குறும் காணொளிகள் என வடிவமைப்புகளை மேற்கொண்டு மன்றத்தின் சமூக வலைத்தளங்களைக் கவர்ச்சியாக வைத்திருக்கின்றனர்.',
   '[{"label":"அணிகள்","to":"/teams"}]'::jsonb,
   'media team photography videos social media', 51),
  ('team-design', 'teams',
   E'வடிவமைப்பு அணி என்ன செய்கிறது?',
   E'கலை எனும் கருவுக்குத் தொழில்நுட்பம் எனும் உயிர் செலுத்தி, அறிவியல் சார் வடிவமைப்புகள், மேடை அலங்காரம் என நிகழ்வுகளுக்கான கண்கவர் படைப்புகளை உருவாக்குகின்றனர். சங்க இலக்கியங்களின் ஐந்நில விழுமியங்களை முப்பரிமாணத் தோற்றத்தில் அமைத்த மேடை அலங்கரிப்பு இவர்களின் குறிப்பிடத்தக்க படைப்புகளில் ஒன்று.',
   '[{"label":"அணிகள்","to":"/teams"}]'::jsonb,
   'design team stage decoration art', 52),
  ('team-tech', 'teams',
   E'தொழில்நுட்ப அணி என்ன செய்கிறது?',
   E'மொறட்டுவை ஒரு தொழில்நுட்பப் பல்கலைக்கழகம் என்பதைப் பறைசாற்றும் வகையில், நிகழ்வுகளின் வழமையான செயற்பாடுகளைத் தொழில்நுட்பம் கலந்த புதிய படைப்புகளாக மாற்றுவது இவர்களின் நோக்கம். தன்னியக்க முறையில் நூல் வெளியீடு, கண்கவர் ஒளி வடிவமைப்புகள், தொடுதிரை மூலம் மங்கல விளக்கேற்றல் ஆகியவை இவர்களின் படைப்புகள்.',
   '[{"label":"அணிகள்","to":"/teams"}]'::jsonb,
   'technical team tech technology innovation', 53),
  ('join-team', 'teams',
   E'ஒரு அணியில் எப்படி இணைவது?',
   E'"எங்கள் அணியில் இணையுங்கள்" படிவத்தில் உங்கள் பீடம், கல்வியாண்டு (batch), மாவட்டம், விரும்பும் அணி ஆகியவற்றைத் தெரிவு செய்து விண்ணப்பிக்கலாம். விண்ணப்பங்கள் திறந்திருக்கும் காலங்களில் மட்டுமே படிவம் ஏற்றுக்கொள்ளப்படும்.',
   '[{"label":"அணியில் இணைய","to":"/teams/join"}]'::jsonb,
   'join team apply application volunteer how to join', 54),
  ('join-eligibility', 'teams',
   E'அணிகளில் இணைய யார் தகுதியானவர்கள்?',
   E'மொறட்டுவைப் பல்கலைக்கழக மாணவர்கள் - பொறியியற், கட்டிடக்கலை, தகவல் தொழினுட்ப, வணிக முகாமைத்துவ பீடங்கள் உட்பட எந்தப் பீடத்தைச் சேர்ந்தவர்களும் - விண்ணப்பிக்கலாம்.',
   '[{"label":"அணியில் இணைய","to":"/teams/join"}]'::jsonb,
   'eligibility who can join faculty engineering architecture it business', 55),
  ('join-closed', 'teams',
   E'இணைவுப் படிவம் மூடப்பட்டிருக்கிறதே, என்ன செய்வது?',
   E'"தற்போது விண்ணப்பங்கள் ஏற்றுக்கொள்ளப்படவில்லை" எனக் காட்டினால், அடுத்த முறை விண்ணப்பங்கள் திறக்கப்படும் வரை காத்திருங்கள். திறக்கப்படும்போது எமது சமூக ஊடகங்களில் அறிவிக்கப்படும். அவசரமெனில் எம்மைத் தொடர்பு கொள்ளுங்கள்.',
   '[{"label":"Instagram","href":"{instagramUrl}"},{"label":"தொடர்புகள்","to":"/contact"}]'::jsonb,
   'form closed applications not accepted', 56),
  ('books-page', 'books',
   E'நூல்கள் பக்கத்தில் என்ன உள்ளது?',
   E'மன்றத்தின் வெளியீடுகளும் பல்கலைக்கழக மாணவர்களின் வெளியீடுகளும் அங்கு உள்ளன. ஒவ்வொரு நூலையும் இணையதளத்திலேயே பக்கம் பக்கமாகப் புரட்டி வாசிக்கலாம்; PDF ஆகப் பதிவிறக்கவும் முடியும்.',
   '[{"label":"நூல்கள்","to":"/books"}]'::jsonb,
   'books library publications read online', 57),
  ('read-download', 'books',
   E'நூல்களைப் பதிவிறக்க முடியுமா?',
   E'ஆம். ஒவ்வொரு நூலின் பக்கத்திலும் "PDF" பதிவிறக்கப் பொத்தான் உள்ளது. சில நூல்களுக்கு (எ.கா. தமிழருவி''26 இதழ்) Word வடிவமும் உண்டு. நூலின் இணைப்பைப் பகிரவும் முடியும்.',
   '[{"label":"தமிழருவி''26 இதழ்","to":"/books/thamilaruvi26"}]'::jsonb,
   'download pdf word book save share', 58),
  ('submit-how', 'books',
   E'எனது படைப்பை எப்படிச் சமர்ப்பிப்பது?',
   E'மொறட்டுவைப் பல்கலைக்கழக மாணவர்கள் தமது படைப்புகளை மன்றத்தின் நூலுக்குச் சமர்ப்பிக்கலாம். முதலில் வழிகாட்டல்களை வாசித்து, பின்னர் சமர்ப்பிப்புப் படிவத்தில் Word (.doc/.docx) மற்றும் PDF கோப்புகளுடன் சமர்ப்பியுங்கள். சமர்ப்பிப்புகள் திறந்திருக்கும் காலத்தில் மட்டுமே படிவம் இயங்கும்.',
   '[{"label":"வழிகாட்டல்கள்","to":"/books/submit"},{"label":"சமர்ப்பிப்புப் படிவம்","to":"/books/submit/form"}]'::jsonb,
   'submit article poem story writing submission magazine', 59),
  ('submit-types', 'books',
   E'என்ன வகையான படைப்புகளைச் சமர்ப்பிக்கலாம்?',
   E'• கவிதை (புதுக்கவிதை / மரபுக்கவிதை / ஹைக்கூ) - 16-32 வரிகள்\n• சிறுகதை - 350-500 சொற்கள்\n• கதை / குறுங்கதை, கட்டுரை - 250-500 சொற்கள்\n• சமூக / ஆய்வுக் கட்டுரை - 250-600 சொற்கள்\n• பத்தி எழுத்து - 150-400 சொற்கள்\n• உரையாடல், நேர்காணல் - 150-500 சொற்கள்\nபுகைப்படம், ஓவியம், கார்ட்டூன், இலக்கிய விமர்சனம் போன்றவையும் ஏற்கப்படும்.',
   '[{"label":"வழிகாட்டல்கள்","to":"/books/submit"}]'::jsonb,
   'types poem kavithai short story essay word limit photography art cartoon', 60),
  ('submit-format', 'books',
   E'படைப்பின் எழுத்துரு, வடிவமைப்பு விதிகள் என்ன?',
   E'• Paper: B5, ஓரங்கள் 1 inch, வரி இடைவெளி 1.15, Justify\n• தலைப்பு 16 pt Bold, உபதலைப்பு 14 pt Bold, எழுத்தாளர் பெயர் 12 pt Bold\n• எழுத்துருக்கள்: Bamini, Latha, Nirmala-UI அல்லது Unicode\n• Word (.doc/.docx) மற்றும் PDF கோப்புகள் இரண்டும் தேவை',
   '[{"label":"வழிகாட்டல்கள்","to":"/books/submit"}]'::jsonb,
   'format font size paper b5 margin bamini latha unicode', 61),
  ('submit-rules', 'books',
   E'படைப்புகள் எப்படித் தெரிவு செய்யப்படுகின்றன?',
   E'படைப்பாற்றல், மொழிநடை, கருத்தின் புதுமை, உள்ளடக்கத் தரம், வாசிப்பு அனுபவம், சமூகப் பொருத்தம் ஆகியவற்றின் அடிப்படையில் தெரிவு செய்யப்படும். படைப்பு உங்கள் சொந்தப் படைப்பாக இருக்க வேண்டும்; பிறருடையதை நகலெடுக்கவோ AI மூலம் உருவாக்கவோ கூடாது. வேறு தளத்தில் ஏற்கனவே வெளிவந்திருந்தால் அதை அறியத்தர வேண்டும்.',
   '[{"label":"வழிகாட்டல்கள்","to":"/books/submit"}]'::jsonb,
   'selection criteria rules ai plagiarism original', 62),
  ('nutpam-read', 'books',
   E'பழைய "நுட்பம்" இதழை எங்கே வாசிக்கலாம்?',
   E'1970 இல் வெளியான "நுட்பம்" இரண்டாவது இதழ் (73 பக்கங்கள்) நூல்கள் பக்கத்தில் உள்ளது. பக்கங்களைப் புரட்டி வாசிக்கலாம், PDF ஆகப் பதிவிறக்கலாம்.',
   '[{"label":"நுட்பம் 1970","to":"/books/nutpam-1970"}]'::jsonb,
   'nutpam 1970 old magazine archive', 63),
  ('contact', 'contact',
   E'மன்றத்தை எப்படித் தொடர்பு கொள்வது?',
   E'• மின்னஞ்சல்: {email}\n• தொலைபேசி: {phoneName} - {phone}\n• அல்லது இணையதளத்தின் தொடர்புப் படிவத்தில் உங்கள் தகவலை அனுப்பலாம்.',
   '[{"label":"தொடர்புப் படிவம்","to":"/contact"},{"label":"மின்னஞ்சல்","href":"mailto:{email}"}]'::jsonb,
   'contact email phone call reach', 64),
  ('social-media', 'contact',
   E'மன்றத்தின் சமூக ஊடகப் பக்கங்கள் எவை?',
   E'Facebook, YouTube, Instagram ஆகியவற்றில் எம்மைப் பின்தொடரலாம். நிகழ்வுப் புகைப்படங்கள், காணொளிகள், அறிவிப்புகள் அங்கு வெளியிடப்படுகின்றன.',
   '[{"label":"Facebook","href":"{facebookUrl}"},{"label":"YouTube","href":"{youtubeUrl}"},{"label":"Instagram","href":"{instagramUrl}"}]'::jsonb,
   'social media facebook youtube instagram follow', 65),
  ('sponsor', 'contact',
   E'மன்றத்தின் நிகழ்வுகளுக்கு அனுசரணை வழங்க விரும்புகிறேன்.',
   E'மிக்க நன்றி! தொடர்புப் படிவத்தில் "தொடர்பு வகை" ஆக "அனுசரனையாளர்" என்பதைத் தெரிவு செய்து உங்கள் விபரங்களை அனுப்புங்கள், அல்லது {email} க்கு மின்னஞ்சல் அனுப்புங்கள். எமது குழு உங்களைத் தொடர்பு கொள்ளும்.',
   '[{"label":"தொடர்புப் படிவம்","to":"/contact"}]'::jsonb,
   'sponsor sponsorship partner support company', 66),
  ('announcements', 'contact',
   E'நிகழ்வு அறிவிப்புகளை எப்படி அறிவது?',
   E'நிகழ்வுகளின் திகதிகள், பதிவுகள், முடிவுகள் இணையதளத்தின் நிகழ்வுப் பக்கங்களிலும் எமது Facebook, Instagram பக்கங்களிலும் அறிவிக்கப்படும்.',
   '[{"label":"நிகழ்வுகள்","to":"/#event"},{"label":"Instagram","href":"{instagramUrl}"}]'::jsonb,
   'announcements news updates upcoming events dates', 67),
  ('website', 'contact',
   E'இந்த இணையதளத்தை யார் பராமரிக்கிறார்கள்?',
   E'மன்றத்தின் வலையமைப்பு அணி இணையதளத்தைப் பராமரிக்கிறது. இணையதளத்தில் தவறுகளையோ பிரச்சினைகளையோ கண்டால் தொடர்புப் படிவம் மூலம் அறியத்தாருங்கள்.',
   '[{"label":"அணிகள்","to":"/teams"},{"label":"தொடர்புகள்","to":"/contact"}]'::jsonb,
   'website maintain web team bug error', 68),
  ('not-found', 'contact',
   E'என் கேள்விக்கு இங்கே பதில் இல்லையே?',
   E'மன்னிக்கவும்! உங்கள் கேள்வியை {email} க்கு மின்னஞ்சல் செய்யுங்கள், அல்லது தொடர்புப் படிவம் மூலம் அனுப்புங்கள். விரைவில் பதிலளிப்போம்.',
   '[{"label":"தொடர்புப் படிவம்","to":"/contact"},{"label":"மின்னஞ்சல்","href":"mailto:{email}"}]'::jsonb,
   'other question not found help', 69)
) as v(id, cat, q, a, links, kw, sort_order)
where not exists (select 1 from public.faqs)
on conflict (id) do nothing;

-- ---- Activity log -----------------------------------------------------------------------
-- Reordering isn't logged (same as books and wallpapers).
create or replace function public.log_faq_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_admin_activity('faq_added', null, jsonb_build_object('q', new.q, 'id', new.id));
  elsif tg_op = 'DELETE' then
    perform public.log_admin_activity('faq_removed', null, jsonb_build_object('q', old.q, 'id', old.id));
  elsif old.is_visible is distinct from new.is_visible then
    perform public.log_admin_activity(
      case when new.is_visible then 'faq_shown' else 'faq_hidden' end,
      null,
      jsonb_build_object('q', new.q, 'id', new.id)
    );
  elsif (old.cat, old.q, old.a, old.links, old.kw) is distinct from (new.cat, new.q, new.a, new.links, new.kw) then
    perform public.log_admin_activity('faq_updated', null, jsonb_build_object('q', new.q, 'id', new.id));
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists faqs_log on public.faqs;
create trigger faqs_log
  after insert or delete or update on public.faqs
  for each row execute function public.log_faq_change();
