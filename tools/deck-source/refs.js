// Reference list for the Chapter 5 talk, formatted to APA 7th edition.
// Every author is listed up to 20; for 21 or more, the first 19, an ellipsis, then the final author.
// Author lists, volumes, pages and DOIs were checked against PubMed, Crossref-derived records
// and publisher pages (via web search and the Consensus index) on 3 October 2026.
// Each entry: key, authors (APA "Surname, I. I." strings) or group, year, title (sentence case),
// and either journal fields, a chapter, a book or a video.

const R = [
  { key: 'avert2015', group: 'AVERT Trial Collaboration Group', year: '2015',
    title: 'Efficacy and safety of very early mobilisation within 24 h of stroke onset (AVERT): A randomised controlled trial',
    journal: 'The Lancet', volume: '386', issue: '9988', pages: '46–55', doi: '10.1016/S0140-6736(15)60690-0' },
  { key: 'balk2026', year: '2026', authors: ['Balk, S.', 'Siller, T.', 'Sprügel, M. I.', 'Haupenthal, D.', 'Kölbl, K.', 'Hock, S.', 'Heinze, D.', 'Engelhorn, T.', 'Kallmünzer, B.', 'Schwab, S.', 'Huttner, H. B.', 'Kuramatsu, J. B.', 'Sembill, J. A.'],
    title: 'Functional outcome, five-year survival and burden of disease after size- and location-matched hemorrhagic versus ischemic stroke',
    journal: 'Neurological Research and Practice', volume: '8', article: '6', doi: '10.1186/s42466-026-00456-w' },
  { key: 'becker2001', year: '2001', authors: ['Becker, K. J.', 'Baxter, A. B.', 'Cohen, W. A.', 'Bybee, H. M.', 'Tirschwell, D. L.', 'Newell, D. W.', 'Winn, H. R.', 'Longstreth, W. T., Jr.'],
    title: 'Withdrawal of support in intracerebral hemorrhage may lead to self-fulfilling prophecies',
    journal: 'Neurology', volume: '56', issue: '6', pages: '766–772', doi: '10.1212/WNL.56.6.766' },
  { key: 'bernhardt2016', year: '2016', authors: ['Bernhardt, J.', 'Churilov, L.', 'Ellery, F.', 'Collier, J.', 'Chamberlain, J.', 'Langhorne, P.', 'Lindley, R. I.', 'Moodie, M.', 'Dewey, H.', 'Thrift, A. G.', 'Donnan, G.'],
    title: 'Prespecified dose-response analysis for A Very Early Rehabilitation Trial (AVERT)',
    journal: 'Neurology', volume: '86', issue: '23', pages: '2138–2145', doi: '10.1212/WNL.0000000000002459' },
  { key: 'broderick1993', year: '1993', authors: ['Broderick, J. P.', 'Brott, T. G.', 'Duldner, J. E.', 'Tomsick, T.', 'Huster, G.'],
    title: 'Volume of intracerebral hemorrhage: A powerful and easy-to-use predictor of 30-day mortality',
    journal: 'Stroke', volume: '24', issue: '7', pages: '987–993', doi: '10.1161/01.STR.24.7.987' },
  { key: 'brott1997', year: '1997', authors: ['Brott, T.', 'Broderick, J.', 'Kothari, R.', 'Barsan, W.', 'Tomsick, T.', 'Sauerbeck, L.', 'Spilker, J.', 'Duldner, J.', 'Khoury, J.'],
    title: 'Early hemorrhage growth in patients with intracerebral hemorrhage',
    journal: 'Stroke', volume: '28', issue: '1', pages: '1–5', doi: '10.1161/01.STR.28.1.1' },
  { key: 'butcher2013', year: '2013', authors: ['Butcher, K. S.', 'Jeerakathil, T.', 'Hill, M.', 'Demchuk, A. M.', 'Dowlatshahi, D.', 'Coutts, S. B.', 'Gould, B.', 'McCourt, R.', 'Asdaghi, N.', 'Findlay, J. M.', 'Emery, D.', 'Shuaib, A.'],
    title: 'The Intracerebral Hemorrhage Acutely Decreasing Arterial Pressure Trial',
    journal: 'Stroke', volume: '44', issue: '3', pages: '620–626', doi: '10.1161/STROKEAHA.111.000188' },
  { key: 'charidimou2022', year: '2022', etal: 'Greenberg, S. M.', authors: ['Charidimou, A.', 'Boulouis, G.', 'Frosch, M. P.', 'Baron, J.-C.', 'Pasi, M.', 'Albucher, J. F.', 'Banerjee, G.', 'Barbato, C.', 'Bonneville, F.', 'Brandner, S.', 'Calviere, L.', 'Caparros, F.', 'Casolla, B.', 'Cordonnier, C.', 'Delisle, M.-B.', 'Deramecourt, V.', 'Dichgans, M.', 'Gokcal, E.', 'Herms, J.'],
    title: 'The Boston criteria version 2.0 for cerebral amyloid angiopathy: A multicentre, retrospective, MRI–neuropathology diagnostic accuracy study',
    journal: 'The Lancet Neurology', volume: '21', issue: '8', pages: '714–725', doi: '10.1016/S1474-4422(22)00208-3' },
  { key: 'connolly2024', year: '2024', etal: 'Shoamanesh, A.', authors: ['Connolly, S. J.', 'Sharma, M.', 'Cohen, A. T.', 'Demchuk, A. M.', 'Członkowska, A.', 'Lindgren, A. G.', 'Molina, C. A.', 'Bereczki, D.', 'Toni, D.', 'Seiffge, D. J.', 'Tanne, D.', 'Sandset, E. C.', 'Tsivgoulis, G.', 'Christensen, H.', 'Beyer-Westendorf, J.', 'Coutinho, J. M.', 'Crowther, M.', 'Verhamme, P.', 'Amarenco, P.'],
    title: 'Andexanet for factor Xa inhibitor–associated acute intracerebral hemorrhage',
    journal: 'The New England Journal of Medicine', volume: '390', issue: '19', pages: '1745–1755', doi: '10.1056/NEJMoa2313040' },
  { key: 'cordonnier2007', year: '2007', authors: ['Cordonnier, C.', 'Al-Shahi Salman, R.', 'Wardlaw, J.'],
    title: 'Spontaneous brain microbleeds: Systematic review, subgroup analyses and standards for study design and reporting',
    journal: 'Brain', volume: '130', issue: '8', pages: '1988–2003', doi: '10.1093/brain/awl387' },
  { key: 'davis2006', year: '2006', authors: ['Davis, S. M.', 'Broderick, J.', 'Hennerici, M.', 'Brun, N. C.', 'Diringer, M. N.', 'Mayer, S. A.', 'Begtrup, K.', 'Steiner, T.'],
    title: 'Hematoma growth is a determinant of mortality and poor outcome after intracerebral hemorrhage',
    journal: 'Neurology', volume: '66', issue: '8', pages: '1175–1181', doi: '10.1212/01.wnl.0000208408.98482.99' },
  { key: 'demchuk2012', year: '2012', authors: ['Demchuk, A. M.', 'Dowlatshahi, D.', 'Rodriguez-Luna, D.', 'Molina, C. A.', 'Blas, Y. S.', 'Dzialowski, I.', 'Kobayashi, A.', 'Boulanger, J.-M.', 'Lum, C.', 'Gubitz, G.', 'Padma, V.', 'Roy, J.', 'Kase, C. S.', 'Kosior, J.', 'Bhatia, R.', 'Tymchuk, S.', 'Subramaniam, S.', 'Gladstone, D. J.', 'Hill, M. D.', 'Aviv, R. I.'],
    title: 'Prediction of haematoma growth and outcome in patients with intracerebral haemorrhage using the CT-angiography spot sign (PREDICT): A prospective observational study',
    journal: 'The Lancet Neurology', volume: '11', issue: '4', pages: '307–314', doi: '10.1016/S1474-4422(12)70038-8' },
  { key: 'fisher1971', year: '1971', authors: ['Fisher, C. M.'],
    title: 'Pathological observations in hypertensive cerebral hemorrhage',
    journal: 'Journal of Neuropathology and Experimental Neurology', volume: '30', issue: '3', pages: '536–550', doi: '10.1097/00005072-197107000-00015' },
  { key: 'gebel2002', year: '2002', authors: ['Gebel, J. M., Jr.', 'Jauch, E. C.', 'Brott, T. G.', 'Khoury, J.', 'Sauerbeck, L.', 'Salisbury, S.', 'Spilker, J.', 'Tomsick, T. A.', 'Duldner, J.', 'Broderick, J. P.'],
    title: 'Natural history of perihematomal edema in patients with hyperacute spontaneous intracerebral hemorrhage',
    journal: 'Stroke', volume: '33', issue: '11', pages: '2631–2635', doi: '10.1161/01.STR.0000035284.12699.84' },
  { key: 'gupta2025', year: '2025', authors: ['Gupta, S.', 'Xiao, M.', 'Liu, N.', 'Zhao, Y.', 'Zhao, X.', 'Huang, Y.', 'Wu, Y.', 'Lin, Z.', 'Ji, Z.', 'Xu, H.', 'Zhu, M.', 'Pan, S.', 'Huang, K.'],
    title: 'Involvement of the posterior limb of the internal capsule independently predicts the prognosis of patients with basal ganglia and thalamic hemorrhage',
    journal: 'Frontiers in Neurology', volume: '15', article: '1475444', doi: '10.3389/fneur.2024.1475444' },
  { key: 'hanley2009', year: '2009', authors: ['Hanley, D. F.'],
    title: 'Intraventricular hemorrhage: Severity factor and treatment target in spontaneous intracerebral hemorrhage',
    journal: 'Stroke', volume: '40', issue: '4', pages: '1533–1538', doi: '10.1161/STROKEAHA.108.535419' },
  { key: 'kan2026', year: '2026', authors: ['Kan, T.', 'Ding, L.', 'Wang, S.', 'Li, T.', 'Li, Y.', 'He, Z.', 'Shi, C.', 'Ma, C.', 'Li, Z.', 'Zhang, B.'],
    title: 'Very early versus early exercise rehabilitation after intracerebral hemorrhage: A systematic review and meta-analysis',
    journal: 'Medicine', volume: '105', issue: '34', article: 'e50253', doi: '10.1097/MD.0000000000050253' },
  { key: 'kelly2003', year: '2003', authors: ['Kelly, P. J.', 'Furie, K. L.', 'Shafqat, S.', 'Rallis, N.', 'Chang, Y.', 'Stein, J.'],
    title: 'Functional recovery following rehabilitation after hemorrhagic and ischemic stroke',
    journal: 'Archives of Physical Medicine and Rehabilitation', volume: '84', issue: '7', pages: '968–972', doi: '10.1016/S0003-9993(03)00040-6' },
  { key: 'knudsen2001', year: '2001', authors: ['Knudsen, K. A.', 'Rosand, J.', 'Karluk, D.', 'Greenberg, S. M.'],
    title: 'Clinical diagnosis of cerebral amyloid angiopathy: Validation of the Boston criteria',
    journal: 'Neurology', volume: '56', issue: '4', pages: '537–539', doi: '10.1212/WNL.56.4.537' },
  { key: 'levettjones2010', year: '2010', authors: ['Levett-Jones, T.', 'Hoffman, K.', 'Dempsey, J.', 'Jeong, S. Y.-S.', 'Noble, D.', 'Norton, C. A.', 'Roche, J.', 'Hickey, N.'],
    title: 'The "five rights" of clinical reasoning: An educational model to enhance nursing students\' ability to identify and manage clinically "at risk" patients',
    journal: 'Nurse Education Today', volume: '30', issue: '6', pages: '515–520', doi: '10.1016/j.nedt.2009.10.020' },
  { key: 'linn2010', year: '2010', authors: ['Linn, J.', 'Halpin, A.', 'Demaerel, P.', 'Ruhland, J.', 'Giese, A. D.', 'Dichgans, M.', 'van Buchem, M. A.', 'Bruckmann, H.', 'Greenberg, S. M.'],
    title: 'Prevalence of superficial siderosis in patients with cerebral amyloid angiopathy',
    journal: 'Neurology', volume: '74', issue: '17', pages: '1346–1350', doi: '10.1212/WNL.0b013e3181dad605' },
  { key: 'liu2014', year: '2014', authors: ['Liu, N.', 'Cadilhac, D. A.', 'Andrew, N. E.', 'Zeng, L.', 'Li, Z.', 'Li, J.', 'Li, Y.', 'Yu, X.', 'Mi, B.', 'Li, Z.', 'Xu, H.', 'Chen, Y.', 'Wang, J.', 'Yao, W.', 'Li, K.', 'Yan, F.', 'Wang, J.'],
    title: 'Randomized controlled trial of early rehabilitation after intracerebral hemorrhage stroke: Difference in outcomes within 6 months of stroke',
    journal: 'Stroke', volume: '45', issue: '12', pages: '3502–3507', doi: '10.1161/STROKEAHA.114.005661' },
  { key: 'ma2023', year: '2023', etal: 'Anderson, C. S.', authors: ['Ma, L.', 'Hu, X.', 'Song, L.', 'Chen, X.', 'Ouyang, M.', 'Billot, L.', 'Li, Q.', 'Malavera, A.', 'Li, X.', 'Muñoz-Venturelli, P.', 'de Silva, A.', 'Thang, N. H.', 'Wahab, K. W.', 'Pandian, J. D.', 'Wasay, M.', 'Pontes-Neto, O. M.', 'Abanto, C.', 'Arauz, A.', 'Shi, H.'],
    title: 'The third Intensive Care Bundle with Blood Pressure Reduction in Acute Cerebral Haemorrhage Trial (INTERACT3): An international, stepped wedge cluster randomised controlled trial',
    journal: 'The Lancet', volume: '402', issue: '10395', pages: '27–40', doi: '10.1016/S0140-6736(23)00806-1' },
  { key: 'macellari2014', year: '2014', authors: ['Macellari, F.', 'Paciaroni, M.', 'Agnelli, G.', 'Caso, V.'],
    title: 'Neuroimaging in intracerebral hemorrhage',
    journal: 'Stroke', volume: '45', issue: '3', pages: '903–908', doi: '10.1161/STROKEAHA.113.003701' },
  { key: 'meretoja2012', year: '2012', authors: ['Meretoja, A.', 'Strbian, D.', 'Putaala, J.', 'Curtze, S.', 'Haapaniemi, E.', 'Mustanoja, S.', 'Sairanen, T.', 'Satopää, J.', 'Silvennoinen, H.', 'Niemelä, M.', 'Kaste, M.', 'Tatlisumak, T.'],
    title: 'SMASH-U: A proposal for etiologic classification of intracerebral hemorrhage',
    journal: 'Stroke', volume: '43', issue: '10', pages: '2592–2597', doi: '10.1161/STROKEAHA.112.661603' },
  { key: 'murray2025', year: '2025', authors: ['Murray, O. N.', 'Chiuta, S.', 'Ryu, P.', 'Hanley, D. F.', 'Patel, H. C.', 'Harston, G.', 'Cootes, T.', 'Hammerbeck, U.', 'Parry-Jones, A. R.'],
    title: 'Corticospinal tract damage on baseline CT predicts motor recovery and functional outcome in intracerebral haemorrhage',
    journal: 'European Stroke Journal', volume: '10', issue: '4', pages: '1383–1391', doi: '10.1177/23969873251332769' },
  { key: 'oosterveer2022', year: '2022', authors: ['Oosterveer, D. M.', 'Wermer, M. J. H.', 'Volker, G.', 'Vliet Vlieland, T. P. M.'],
    title: 'Are there differences in long-term functioning and recovery between hemorrhagic and ischemic stroke patients receiving rehabilitation?',
    journal: 'Journal of Stroke and Cerebrovascular Diseases', volume: '31', issue: '3', article: '106294', doi: '10.1016/j.jstrokecerebrovasdis.2021.106294' },
  { key: 'paolucci2003', year: '2003', authors: ['Paolucci, S.', 'Antonucci, G.', 'Grasso, M. G.', 'Bragoni, M.', 'Coiro, P.', 'De Angelis, D.', 'Fusco, F. R.', 'Morelli, D.', 'Venturiero, V.', 'Troisi, E.', 'Pratesi, L.'],
    title: 'Functional outcome of ischemic and hemorrhagic stroke patients after inpatient rehabilitation: A matched comparison',
    journal: 'Stroke', volume: '34', issue: '12', pages: '2861–2865', doi: '10.1161/01.STR.0000102902.39759.D3' },
  { key: 'pradilla2024', year: '2024', etal: 'Barrow, D. L.', authors: ['Pradilla, G.', 'Ratcliff, J. J.', 'Hall, A. J.', 'Saville, B. R.', 'Allen, J. W.', 'Paulon, G.', 'McGlothlin, A.', 'Lewis, R. J.', 'Fitzgerald, M.', 'Caveney, A. F.', 'Li, X. T.', 'Bain, M.', 'Gomes, J.', 'Jankowitz, B.', 'Zenonos, G.', 'Molyneaux, B. J.', 'Davies, J.', 'Siddiqui, A.', 'Chicoine, M. R.'],
    title: 'Trial of early minimally invasive removal of intracerebral hemorrhage',
    journal: 'The New England Journal of Medicine', volume: '390', issue: '14', pages: '1277–1289', doi: '10.1056/NEJMoa2308440' },
  { key: 'puig2019', year: '2019', authors: ['Puig, J.', 'Blasco, G.', 'Terceño, M.', 'Daunis-i-Estadella, P.', 'Schlaug, G.', 'Hernandez-Perez, M.', 'Cuba, V.', 'Carbó, G.', 'Serena, J.', 'Essig, M.', 'Figley, C. R.', 'Nael, K.', 'Leiva-Salinas, C.', 'Pedraza, S.', 'Silva, Y.'],
    title: 'Predicting motor outcome in acute intracerebral hemorrhage',
    journal: 'American Journal of Neuroradiology', volume: '40', issue: '5', pages: '769–775', doi: '10.3174/ajnr.A6038' },
  { key: 'rossi2014', year: '2014', authors: ['Rossi, C.', 'Cordonnier, C.'], type: 'chapter',
    title: 'Pathophysiology of non-traumatic intracerebral haemorrhage', editors: 'B. Norrving (Ed.)',
    book: 'Oxford textbook of stroke and cerebrovascular disease', pages: '51–60', publisher: 'Oxford University Press', doi: '10.1093/med/9780199641208.003.0005' },
  { key: 'salvadori2021', year: '2021', authors: ['Salvadori, E.', 'Papi, G.', 'Insalata, G.', 'Rinnoci, V.', 'Donnini, I.', 'Martini, M.', 'Falsini, C.', 'Hakiki, B.', 'Romoli, A.', 'Barbato, C.', 'Polcaro, P.', 'Casamorata, F.', 'Macchi, C.', 'Cecchi, F.', 'Poggesi, A.'],
    title: 'Comparison between ischemic and hemorrhagic strokes in functional outcome at discharge from an intensive rehabilitation hospital',
    journal: 'Diagnostics', volume: '11', issue: '1', article: '38', doi: '10.3390/diagnostics11010038' },
  { key: 'selim2019', year: '2019', authors: ['Selim, M.', 'Foster, L. D.', 'Moy, C. S.', 'Xi, G.', 'Hill, M. D.', 'Morgenstern, L. B.', 'Greenberg, S. M.', 'James, M. L.', 'Singh, V.', 'Clark, W. M.', 'Norton, C.', 'Palesch, Y. Y.', 'Yeatts, S. D.'],
    title: 'Deferoxamine mesylate in patients with intracerebral haemorrhage (i-DEF): A multicentre, randomised, placebo-controlled, double-blind phase 2 trial',
    journal: 'The Lancet Neurology', volume: '18', issue: '5', pages: '428–438', doi: '10.1016/S1474-4422(19)30069-9' },
  { key: 'taylor2008a', year: '2008a', date: '2008a, February', authors: ['Taylor, J. B.'], type: 'video',
    title: 'My stroke of insight', medium: 'Video', publisher: 'TED Conferences', url: 'https://www.ted.com/talks/jill_bolte_taylor_my_stroke_of_insight' },
  { key: 'taylor2008b', year: '2008b', authors: ['Taylor, J. B.'], type: 'book',
    title: "My stroke of insight: A brain scientist's personal journey", publisher: 'Viking' },
  { key: 'vanasch2010', year: '2010', authors: ['van Asch, C. J. J.', 'Luitse, M. J. A.', 'Rinkel, G. J. E.', 'van der Tweel, I.', 'Algra, A.', 'Klijn, C. J. M.'],
    title: 'Incidence, case fatality, and functional outcome of intracerebral haemorrhage over time, according to age, sex, and ethnic origin: A systematic review and meta-analysis',
    journal: 'The Lancet Neurology', volume: '9', issue: '2', pages: '167–176', doi: '10.1016/S1474-4422(09)70340-0' },
  { key: 'xi2006', year: '2006', authors: ['Xi, G.', 'Keep, R. F.', 'Hoff, J. T.'],
    title: 'Mechanisms of brain injury after intracerebral haemorrhage',
    journal: 'The Lancet Neurology', volume: '5', issue: '1', pages: '53–63', doi: '10.1016/S1474-4422(05)70283-0' },
  { key: 'yen2020', year: '2020', authors: ['Yen, H.-C.', 'Jeng, J.-S.', 'Chen, W.-S.', 'Pan, G.-S.', 'Chuang, W.-Y.', 'Lee, Y.-Y.', 'Teng, T.'],
    title: 'Early mobilization of mild-moderate intracerebral hemorrhage patients in a stroke center: A randomized controlled trial',
    journal: 'Neurorehabilitation and Neural Repair', volume: '34', issue: '1', pages: '72–81', doi: '10.1177/1545968319893294' },
  { key: 'yen2021', year: '2021', authors: ['Yen, H.-C.', 'Jeng, J.-S.', 'Cheng, C.-H.', 'Pan, G.-S.', 'Chen, W.-S.'],
    title: 'Effects of early mobilization on short-term blood pressure variability in acute intracerebral hemorrhage patients: A protocol for randomized controlled non-inferiority trial',
    journal: 'Medicine', volume: '100', issue: '21', article: 'e26128', doi: '10.1097/MD.0000000000026128' },
  { key: 'yoo2026', year: '2026', authors: ['Yoo, H. D.', 'Chung, S. Y.'], online: true,
    title: 'Does severe early motor deficit define recovery ceiling after basal ganglia or thalamic hemorrhage? A systematic review of time-dependent motor outcomes and corticospinal tract-related predictors',
    journal: 'Cerebrovascular Diseases', doi: '10.1159/ced/accag002' },
  { key: 'zazulia2001', year: '2001', authors: ['Zazulia, A. R.', 'Diringer, M. N.', 'Videen, T. O.', 'Adams, R. E.', 'Yundt, K.', 'Aiyagari, V.', 'Grubb, R. L., Jr.', 'Powers, W. J.'],
    title: 'Hypoperfusion without ischemia surrounding acute intracerebral hemorrhage',
    journal: 'Journal of Cerebral Blood Flow & Metabolism', volume: '21', issue: '7', pages: '804–810', doi: '10.1097/00004647-200107000-00005' },
  { key: 'zhu1997', year: '1997', authors: ['Zhu, X. L.', 'Chan, M. S.', 'Poon, W. S.'],
    title: 'Spontaneous intracranial hemorrhage: Which patients need diagnostic cerebral angiography? A prospective study of 206 cases and review of the literature',
    journal: 'Stroke', volume: '28', issue: '7', pages: '1406–1409', doi: '10.1161/01.STR.28.7.1406' },
];

// ---------- formatting ----------
function authorString(e) {
  if (e.group) return e.group + '.';
  const a = e.authors;
  if (e.etal) return a.join(', ') + ', . . . ' + e.etal;
  if (a.length === 1) return a[0];
  if (a.length === 2) return `${a[0]}, & ${a[1]}`;
  return a.slice(0, -1).join(', ') + ', & ' + a[a.length - 1];
}
const endsWithPunct = (s) => /[.?!]$/.test(s);
const doiUrl = (d) => 'https://doi.org/' + d;

// Segments: [{ t, i }] where i = italic. Order and punctuation follow APA 7.
function segments(e) {
  const S = [];
  const add = (t, i = false) => S.push({ t, i });
  const au = authorString(e);
  add(au + (au.endsWith('.') ? ' ' : '. '));
  add(`(${e.date || e.year}). `);
  if (e.type === 'chapter') {
    add(e.title + '. ');
    add(`In ${e.editors}, `);
    add(e.book, true);
    add(` (pp. ${e.pages}). ${e.publisher}. `);
    add(doiUrl(e.doi));
  } else if (e.type === 'book') {
    add(e.title, true);
    add(`. ${e.publisher}.`);
  } else if (e.type === 'video') {
    add(e.title, true);
    add(` [${e.medium}]. ${e.publisher}. ${e.url}`);
  } else {
    add(e.title + (endsWithPunct(e.title) ? ' ' : '. '));
    add(e.journal, true);
    if (e.volume) { add(', '); add(e.volume, true); }
    let tail = '';
    if (e.issue) tail += `(${e.issue})`;
    if (e.pages) tail += `, ${e.pages}`;
    if (e.article) tail += `, Article ${e.article}`;
    if (e.online) tail += '. Advance online publication';
    add(tail + '. ' + doiUrl(e.doi));
  }
  return S;
}
const fold = (x) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const sortKey = (e) => fold((e.group || e.authors.join(' ')) + ' ' + e.year + ' ' + e.title);
const sorted = () => [...R].sort((x, y) => sortKey(x).localeCompare(sortKey(y), 'en'));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const linkify = (h) => h.replace(/https:\/\/[^\s<]+[^\s<.]/g, (u) => `<a href="${u}">${u}</a>`);
function toHTML(e) {
  return segments(e).map(({ t, i }) => (i ? `<i>${esc(t)}</i>` : linkify(esc(t)))).join('');
}
function toMarkdown(e) {
  return segments(e).map(({ t, i }) => (i ? `*${t}*` : t.replace(/https:\/\/[^\s]+[^\s.]/g, (u) => `<${u}>`))).join('');
}
function toPlain(e) { return segments(e).map(({ t }) => t).join(''); }

module.exports = { R, sorted, segments, toHTML, toMarkdown, toPlain, authorString };

if (require.main === module) {
  for (const e of sorted()) console.log(toPlain(e) + '\n');
  console.log(R.length, 'references');
}
