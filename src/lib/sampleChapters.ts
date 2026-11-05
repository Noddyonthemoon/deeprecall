import { StudyKitData } from '../types/neet';

export interface SampleChapterOption {
  id: string;
  title: string;
  subject: 'Physics' | 'Chemistry' | 'Biology';
  ncertClass: '11' | '12';
  description: string;
  badge: string;
  studyKit: StudyKitData;
}

export const SAMPLE_CHAPTERS: SampleChapterOption[] = [
  {
    id: 'bio_cell_unit_of_life',
    title: 'Cell: The Unit of Life',
    subject: 'Biology',
    ncertClass: '11',
    description: 'High-yield Class 11 chapter covering Prokaryotic vs Eukaryotic cells, Endomembrane System, Mitochondria, Plastids, and Ribosomes.',
    badge: 'High Yield (3-4 NEET Qs)',
    studyKit: {
      chapter_meta: {
        subject: 'Biology',
        chapter_title: 'Cell: The Unit of Life',
        ncert_class: '11',
        topics_covered: [
          'Prokaryotic Cell Structure and Inclusions',
          'Fluid Mosaic Model of Cell Membrane',
          'Endomembrane System (ER, Golgi, Lysosomes, Vacuoles)',
          'Semiautonomous Organelles: Mitochondria and Plastids',
          'Ribosomes (70S vs 80S) and Cytoskeleton',
          'Nucleus, Chromatin, and Chromosome Morphology',
        ],
      },
      concept_summaries: [
        {
          topic: 'Cell Membrane & Fluid Mosaic Model',
          summary:
            'Proposed by Singer and Nicolson (1972). Phospholipid bilayer with polar heads pointing outward and hydrophobic tails inward. Lipids are predominantly phosphoglycerides. Protein-to-lipid ratio in human erythrocyte is ~52% protein to 40% lipids. Quasi-fluid nature of lipids enables lateral movement of proteins, measured as membrane fluidity.',
          ncert_section_reference: 'NCERT Biology Class 11, Section 8.5.1',
        },
        {
          topic: 'Endomembrane System',
          summary:
            'Includes Endoplasmic Reticulum (RER for protein synthesis, SER for lipid and steroid synthesis), Golgi apparatus (packaging and glycosidation of proteins/lipids), Lysosomes (acid hydrolases optimal at pH ~5), and Vacuoles (tonoplast facilitates active transport against concentration gradient into vacuole). Peroxisomes, mitochondria, and chloroplasts are NOT part of the endomembrane system because their functions are not coordinated with these.',
          ncert_section_reference: 'NCERT Biology Class 11, Section 8.5.3',
        },
        {
          topic: 'Semiautonomous Organelles: Mitochondria & Chloroplasts',
          summary:
            'Both are double-membraned, contain their own circular dsDNA molecule, a few RNA molecules, and 70S ribosomes. Mitochondria inner membrane forms cristae to increase surface area; matrix contains enzymes of Krebs cycle. Chloroplast stroma contains thylakoids stacked into grana; lumen of thylakoid is where protons accumulate during light reactions.',
          ncert_section_reference: 'NCERT Biology Class 11, Section 8.5.4 & 8.5.5',
        },
        {
          topic: 'Ribosomes and Inclusion Bodies in Prokaryotes',
          summary:
            'Prokaryotes lack membrane-bound organelles. Reserve material stored in cytoplasm as inclusion bodies (phosphate granules, cyanophycean granules, glycogen granules), which lie free without membrane. Gas vacuoles found in blue green, purple, and green photosynthetic bacteria. Ribosomes in prokaryotes are 70S (composed of 50S and 30S subunits).',
          ncert_section_reference: 'NCERT Biology Class 11, Section 8.4.2',
        },
      ],
      flashcards: [
        {
          front: 'What is the exact protein to lipid ratio in the human erythrocyte membrane as stated in NCERT?',
          back: '52% protein and 40% lipids.',
          topic: 'Cell Membrane',
          difficulty: 'medium',
          bloom_level: 'recall',
          pyq_inspired: true,
        },
        {
          front: 'Why are mitochondria, chloroplasts, and peroxisomes excluded from the Endomembrane System?',
          back: 'Because their functions are not coordinated with the Endoplasmic Reticulum, Golgi complex, Lysosomes, and Vacuoles.',
          topic: 'Endomembrane System',
          difficulty: 'hard',
          bloom_level: 'understanding',
          pyq_inspired: true,
        },
        {
          front: 'Which lipid component is predominantly present in the cell membrane according to NCERT?',
          back: 'Phosphoglycerides (phospholipids with glycerol backbone and fatty acid tails).',
          topic: 'Cell Membrane',
          difficulty: 'easy',
          bloom_level: 'recall',
          pyq_inspired: false,
        },
        {
          front: 'What type of ribosomes are found in the mitochondrial matrix vs eukaryotic cytoplasm?',
          back: 'Mitochondrial matrix contains 70S ribosomes; eukaryotic cytoplasm contains 80S ribosomes.',
          topic: 'Organelles',
          difficulty: 'easy',
          bloom_level: 'recall',
          pyq_inspired: true,
        },
        {
          front: 'What is the role of the Tonoplast in plant vacuoles regarding solute concentration?',
          back: 'The tonoplast facilitates transport of ions and other materials against concentration gradients into the vacuole, making concentration significantly higher in the vacuole than in cytoplasm.',
          topic: 'Vacuoles',
          difficulty: 'medium',
          bloom_level: 'understanding',
          pyq_inspired: true,
        },
        {
          front: 'What are the two faces of the Golgi apparatus and their respective orientations?',
          back: 'Cis (forming face) is convex and oriented toward the ER/nucleus. Trans (maturing face) is concave and oriented toward the cell membrane.',
          topic: 'Golgi Apparatus',
          difficulty: 'medium',
          bloom_level: 'recall',
          pyq_inspired: true,
        },
        {
          front: 'Name the non-membrane bound reserve material storage structures in prokaryotic cells.',
          back: 'Inclusion bodies (e.g., phosphate granules, cyanophycean granules, glycogen granules).',
          topic: 'Prokaryotes',
          difficulty: 'easy',
          bloom_level: 'recall',
          pyq_inspired: false,
        },
        {
          front: 'What is the arrangement of microtubules in eukaryotic flagella/cilia vs centriole basal body?',
          back: 'Cilia/Flagella: 9+2 doublet pattern with central sheath. Centriole: 9+0 triplet pattern of peripheral tubulin triplets without central microtubules.',
          topic: 'Cytoskeleton',
          difficulty: 'hard',
          bloom_level: 'analysis',
          pyq_inspired: true,
        },
      ],
      mcqs: [
        {
          question:
            'Assertion (A): The endomembrane system includes endoplasmic reticulum, Golgi complex, lysosomes, and vacuoles.\nReason (R): The functions of mitochondria, chloroplast, and peroxisomes are coordinated with the components of the endomembrane system.',
          question_style: 'assertion_reason',
          options: [
            'Both (A) and (R) are true and (R) is the correct explanation of (A)',
            'Both (A) and (R) are true but (R) is NOT the correct explanation of (A)',
            '(A) is true but (R) is false',
            'Both (A) and (R) are false',
          ],
          correct_index: 2,
          explanation:
            'Assertion is correct as per NCERT Section 8.5.3. Reason is false because mitochondria, chloroplasts, and peroxisomes are specifically EXCLUDED from the endomembrane system because their functions are NOT coordinated with the ER, Golgi, lysosomes, and vacuoles.',
          distractor_logic:
            'Common NEET trap: Students often confuse whether peroxisomes are coordinated or not. NCERT explicitly states they are not coordinated.',
          difficulty: 'medium',
          topic: 'Endomembrane System',
          pyq_trend_note: 'Assertion-Reason questions on organelle classification frequently appear in NEET 2022-2024.',
        },
        {
          question:
            'In human erythrocyte membranes, the percentage composition of proteins and lipids respectively is:',
          question_style: 'direct',
          options: [
            '40% protein and 52% lipid',
            '52% protein and 40% lipid',
            '50% protein and 50% lipid',
            '60% protein and 40% lipid',
          ],
          correct_index: 1,
          explanation:
            'According to NCERT page 131, the membrane of the erythrocyte has approximately 52 per cent protein and 40 per cent lipids.',
          distractor_logic:
            'Option A reverses the values (40% protein, 52% lipid), which is the most common student error in test series.',
          difficulty: 'easy',
          topic: 'Cell Membrane',
          pyq_trend_note: 'Direct numerical recall from NCERT lines is tested regularly in NEET Section A.',
        },
        {
          question:
            'Which of the following cellular structures lacks any surrounding membrane?',
          question_style: 'direct',
          options: [
            'Lysosome and Peroxisome',
            'Centrosome and Ribosome',
            'Vacuole and Sphaerosome',
            'Chloroplast and Nucleolus',
          ],
          correct_index: 1,
          explanation:
            'Ribosomes and Centrosomes (along with inclusion bodies and nucleolus) are non-membrane bound organelles. Lysosomes, vacuoles, and peroxisomes are single membrane-bound.',
          distractor_logic:
            'Lysosomes and peroxisomes have single unit membranes; chloroplast has double membrane.',
          difficulty: 'easy',
          topic: 'Organelles Overview',
          pyq_trend_note: 'Membrane classification (0, 1, or 2 membranes) is a classic Allen/Aakash mock test staple.',
        },
        {
          question:
            'Match the cell structures in Column I with their corresponding descriptions in Column II:\n\nColumn I:\nA. Golgi apparatus\nB. Cristae\nC. Thylakoids\nD. Tonoplast\n\nColumn II:\n1. Flattened membranous sacs in stroma\n2. Infoldings in mitochondria\n3. Active transport into plant vacuole\n4. Formation of glycoproteins & glycolipids',
          question_style: 'match_the_following',
          options: [
            'A-4, B-2, C-1, D-3',
            'A-2, B-4, C-1, D-3',
            'A-4, B-1, C-2, D-3',
            'A-3, B-2, C-1, D-4',
          ],
          correct_index: 0,
          explanation:
            'Golgi apparatus is the site of glycosylation (A-4). Cristae are infoldings of mitochondrial inner membrane (B-2). Thylakoids are flattened sacs in chloroplast stroma (C-1). Tonoplast pumps ions against concentration gradient into vacuole (D-3).',
          distractor_logic:
            'Switching Cristae with Thylakoids is a frequent confusion under exam time pressure.',
          difficulty: 'medium',
          topic: 'Cell Organelles',
          pyq_trend_note: 'NEET includes at least 3-5 Match the Column questions in the Biology paper.',
        },
      ],
      short_answer_questions: [
        {
          id: 'sa_1',
          question: 'What constitutes the quasi-fluid nature of the cell membrane, and why is this fluidity crucial?',
          model_answer:
            'The quasi-fluid nature of lipids enables lateral movement of proteins within the overall bilayer. This ability to move within the membrane is measured as its fluidity. Fluidity is essential for cell growth, formation of intercellular junctions, secretion, endocytosis, and cell division.',
          topic: 'Cell Membrane',
          difficulty: 'medium',
        },
        {
          id: 'sa_2',
          question: 'Describe the structural difference between 70S and 80S ribosomes, and explain what "S" represents.',
          model_answer:
            '"S" stands for Svedberg unit, a measure of sedimentation coefficient indirectly reflecting density and size. 70S ribosomes (found in prokaryotes, mitochondria, chloroplasts) consist of 50S and 30S subunits. 80S ribosomes (found in eukaryotic cytoplasm) consist of 60S and 40S subunits.',
          topic: 'Ribosomes',
          difficulty: 'easy',
        },
      ],
      application_questions: [
        {
          id: 'app_1',
          scenario:
            'A culture of plant cells is treated with a metabolic poison that halts ATP synthesis in the cytoplasm. Shortly after, the accumulation of ions within the central sap vacuole drops sharply compared to normal cells.',
          question: 'Explain this observation in light of the transport properties of the tonoplast.',
          model_answer:
            'The tonoplast membrane in plant cells facilitates active transport of a number of ions and other materials against their concentration gradient into the vacuole. Active transport requires ATP. When cytoplasmic ATP synthesis is poisoned, the active transporters in the tonoplast fail, preventing ion accumulation against the gradient.',
          topic: 'Vacuoles & Transport',
        },
        {
          id: 'app_2',
          scenario:
            'An investigator isolates an organelle from liver tissue. Biochemical analysis reveals high concentrations of catalase and urate oxidase, but no DNA, no RNA, and absence of proton-pumping ATP synthases.',
          question: 'Identify the organelle and justify whether it belongs to the endomembrane system.',
          model_answer:
            'The organelle is a Peroxisome (microbody). Peroxisomes contain oxidative enzymes like catalase. Peroxisomes do NOT belong to the endomembrane system because their synthesis, biogenesis, and metabolic functions are not coordinated with the ER-Golgi-Lysosome pathway.',
          topic: 'Microbodies',
        },
      ],
      pyq_trend_insights: [
        {
          observation:
            'In NEET 2020-2024, questions from "Cell: The Unit of Life" shifted heavily toward Assertion-Reason and Statement-based items comparing prokaryotic inclusion bodies with eukaryotic organelles.',
          source_titles: ['NTA NEET Past Year Papers - Biology', 'Allen Career Institute Analysis'],
          source_urls: ['https://neet.nta.nic.in', 'https://www.allen.ac.in'],
        },
        {
          observation:
            'Coaching test series (PW, Aakash) constantly test the distinction that Peroxisomes and Semiautonomous organelles (Mitochondria/Chloroplast) are EXCLUDED from the endomembrane system.',
          source_titles: ['Physics Wallah NEET PYQ Trend Repository', 'Aakash Medical Revision Series'],
          source_urls: ['https://www.pw.live', 'https://www.aakash.ac.in'],
        },
        {
          observation:
            'Erythrocyte membrane ratio (52% protein, 40% lipid) and Svedberg subunit combinations (50S+30S=70S, 60S+40S=80S) are high-probability direct recall items in Section A.',
          source_titles: ['Reddit r/NEET High-Yield Biology Checklist'],
          source_urls: ['https://www.reddit.com/r/NEET'],
        },
      ],
      external_resources: [
        {
          title: 'NCERT Official Biology Class 11 Textbook PDF (ePathshala)',
          url: 'https://ncert.nic.in/textbook.php',
          resource_type: 'reference_article',
          note: 'Official NCERT portal hosting the complete digital textbook chapters for Class 11 & 12.',
        },
        {
          title: 'NEET-UG Open Question Bank - Biology Markdown Collection',
          url: 'https://github.com/topics/neet-question-bank',
          resource_type: 'open_question_bank',
          note: 'Open-source GitHub repository index containing curated text-based NEET questions and answer keys.',
        },
        {
          title: 'r/NEET Community Discussion: NCERT Line-by-Line Biology Traps',
          url: 'https://www.reddit.com/r/NEET',
          resource_type: 'discussion_thread',
          note: 'Peer-reviewed student discussion thread detailing common coaching test series tricks on Cell Biology.',
        },
      ],
    },
  },
  {
    id: 'bio_molecular_basis_inheritance',
    title: 'Molecular Basis of Inheritance',
    subject: 'Biology',
    ncertClass: '12',
    description: 'The highest weightage chapter in NEET Biology (5-7 Qs every year). Covers DNA replication, Transcription, Genetic Code, Lac Operon, and DNA Fingerprinting.',
    badge: 'Ultra High Yield (6-7 NEET Qs)',
    studyKit: {
      chapter_meta: {
        subject: 'Biology',
        chapter_title: 'Molecular Basis of Inheritance',
        ncert_class: '12',
        topics_covered: [
          'The DNA Molecule & Packaging of DNA Helix',
          'Search for Genetic Material (Griffith, Avery-MacLeod-McCarty, Hershey-Chase)',
          'Semiconservative DNA Replication (Meselson & Stahl, Taylor)',
          'Transcription in Prokaryotes vs Eukaryotes',
          'Genetic Code and Wobble Hypothesis',
          'Translation & Lac Operon Regulation',
          'Human Genome Project & DNA Fingerprinting',
        ],
      },
      concept_summaries: [
        {
          topic: 'DNA Structure & Nucleosome Packaging',
          summary:
            'B-DNA helix pitch is 3.4 nm with ~10 bp per turn (distance between base pairs is 0.34 nm). Total DNA in a diploid human cell is 6.6 × 10^9 bp, measuring ~2.2 meters in length. Packaged around histone octamer (two copies each of H2A, H2B, H3, H4) with positively charged basic amino acids lysine and arginine. Typical nucleosome contains 200 bp of DNA. H1 histone seals the entry/exit.',
          ncert_section_reference: 'NCERT Biology Class 12, Section 6.1.2',
        },
        {
          topic: 'Experimental Proof of Genetic Material',
          summary:
            'Griffith (1928) discovered Transforming Principle in Streptococcus pneumoniae. Avery, MacLeod, McCarty (1944) discovered that DNase inhibited transformation, proving DNA is the transforming agent. Hershey and Chase (1952) used 35S (labeled protein coat) and 32P (labeled DNA) on T2 bacteriophage infecting E. coli, confirming unequivocally that DNA is the genetic material.',
          ncert_section_reference: 'NCERT Biology Class 12, Section 6.2',
        },
        {
          topic: 'The Lac Operon',
          summary:
            'Elucidated by François Jacob and Jacques Monod. Polycistronic structural gene regulated by a common promoter and regulatory gene. i gene codes for repressor protein; z gene codes for beta-galactosidase (hydrolyzes lactose into glucose and galactose); y gene codes for permease (increases permeability to beta-galactosides); a gene codes for transacetylase. Allolactose is the physiological inducer. Regulation is negative inducible.',
          ncert_section_reference: 'NCERT Biology Class 12, Section 6.8',
        },
      ],
      flashcards: [
        {
          front: 'What is the length of DNA in a diploid human cell and how is it calculated?',
          back: 'Length = 6.6 × 10^9 bp × 0.34 × 10^-9 m/bp ≈ 2.2 meters.',
          topic: 'DNA Packaging',
          difficulty: 'medium',
          bloom_level: 'application',
          pyq_inspired: true,
        },
        {
          front: 'Which radioactive isotopes were used by Hershey and Chase to label protein vs DNA?',
          back: '35S for viral protein capsule; 32P for viral DNA.',
          topic: 'Genetic Material',
          difficulty: 'easy',
          bloom_level: 'recall',
          pyq_inspired: true,
        },
        {
          front: 'What are the specific enzymes encoded by genes z, y, and a of the Lac operon?',
          back: 'z: beta-galactosidase; y: permease; a: transacetylase.',
          topic: 'Lac Operon',
          difficulty: 'medium',
          bloom_level: 'recall',
          pyq_inspired: true,
        },
        {
          front: 'What is the actual inducer molecule in the Lac operon mechanism?',
          back: 'Allolactose (an isomer of lactose).',
          topic: 'Lac Operon',
          difficulty: 'medium',
          bloom_level: 'recall',
          pyq_inspired: true,
        },
        {
          front: 'Why is the genetic code described as "degenerate"?',
          back: 'Because some amino acids are coded by more than one codon (61 codons code for 20 amino acids).',
          topic: 'Genetic Code',
          difficulty: 'easy',
          bloom_level: 'understanding',
          pyq_inspired: false,
        },
        {
          front: 'In eukaryotic transcription, what does RNA Polymerase III transcribe?',
          back: 'tRNA, 5S rRNA, and snRNAs (small nuclear RNAs).',
          topic: 'Transcription',
          difficulty: 'hard',
          bloom_level: 'recall',
          pyq_inspired: true,
        },
      ],
      mcqs: [
        {
          question:
            'If the sequence of coding strand in a transcription unit is written as 5\'-ATGCATGCATGC-3\', write down the sequence of mRNA:',
          question_style: 'direct',
          options: [
            '5\'-AUGCAUGCAUGC-3\'',
            '3\'-UACGUACGUACG-5\'',
            '5\'-UACGUACGUACG-3\'',
            '3\'-AUGCAUGCAUGC-5\'',
          ],
          correct_index: 0,
          explanation:
            'The sequence of mRNA is identical to the coding strand (sense strand) except that thymine (T) is replaced by uracil (U), preserving the 5\' to 3\' polarity.',
          distractor_logic:
            'Students frequently take the complementary sequence instead of realizing the question gave the CODING strand, not the template strand.',
          difficulty: 'medium',
          topic: 'Transcription',
          pyq_trend_note: 'Coding strand vs template strand polarity questions appear in almost every NEET edition.',
        },
        {
          question:
            'Assertion (A): In the Lac operon, a very low level of expression of lac operon has to be present in the cell all the time.\nReason (R): Otherwise, lactose cannot enter the cells to act as inducer since permease is required for its uptake.',
          question_style: 'assertion_reason',
          options: [
            'Both (A) and (R) are true and (R) is the correct explanation of (A)',
            'Both (A) and (R) are true but (R) is NOT the correct explanation of (A)',
            '(A) is true but (R) is false',
            'Both (A) and (R) are false',
          ],
          correct_index: 0,
          explanation:
            'As stated verbatim in NCERT Class 12, page 116: "A very low level of expression of lac operon has to be present in the cell all the time, otherwise lactose cannot enter the cells."',
          distractor_logic:
            'Students often think the operon is completely shut off when lactose is absent, ignoring the basal leakiness necessary for initial permease synthesis.',
          difficulty: 'hard',
          topic: 'Lac Operon',
          pyq_trend_note: 'One of the most heavily tested conceptual nuances in Allen & PW NEET test series.',
        },
      ],
      short_answer_questions: [
        {
          id: 'mol_sa_1',
          question: 'State the difference between Euchromatin and Heterochromatin in terms of density, staining, and transcription.',
          model_answer:
            'Euchromatin is loosely packed, stains light, and is transcriptionally active. Heterochromatin is densely packed, stains dark, and is transcriptionally inactive.',
          topic: 'Chromatin Structure',
          difficulty: 'easy',
        },
      ],
      application_questions: [
        {
          id: 'mol_app_1',
          scenario:
            'E. coli cells grown in 15N medium for many generations were transferred to 14N medium. After 40 minutes (two generations), DNA was extracted and centrifuged in CsCl density gradient.',
          question: 'Predict the ratio and types of DNA density bands observed in the centrifuge tube.',
          model_answer:
            'After 40 minutes (generation II): 50% hybrid (15N-14N) DNA and 50% light (14N-14N) DNA will be observed in a 1:1 ratio. No heavy (15N-15N) DNA will remain.',
          topic: 'Meselson-Stahl Experiment',
        },
      ],
      pyq_trend_insights: [
        {
          observation:
            'Lac operon gene functions (z, y, a) and Basal expression requirement have been tested 4 times in NEET over the last 6 years.',
          source_titles: ['NTA NEET Chapterwise Weightage 2019-2024'],
          source_urls: ['https://neet.nta.nic.in'],
        },
        {
          observation:
            'Distinguishing between template strand (3\'->5\') and coding strand (5\'->3\') is the #1 student error on transcription questions.',
          source_titles: ['r/NEET Study Traps Review'],
          source_urls: ['https://www.reddit.com/r/NEET'],
        },
      ],
      external_resources: [
        {
          title: 'NCERT Biology Class 12 - Molecular Basis of Inheritance Chapter PDF',
          url: 'https://ncert.nic.in/textbook.php?lebo1=6-16',
          resource_type: 'reference_article',
          note: 'Official NCERT download for Chapter 6.',
        },
        {
          title: 'NEET Biology Flashcards Anki-Text Format on GitHub',
          url: 'https://github.com/topics/neet-flashcards',
          resource_type: 'anki_export_text',
          note: 'Open collection of markdown flashcard decks formatted for medical entrance revision.',
        },
      ],
    },
  },
];
