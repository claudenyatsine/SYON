export interface SubjectKnowledge {
  name: string;
  level: string;
  board: string;
  topics: {
    title: string;
    keyConcepts: string[];
    sampleQuestions: { question: string; marks: number; answerGuide: string }[];
  }[];
}

export const SUBJECT_CURRICULUM_DATABASE: Record<string, SubjectKnowledge> = {
  agriculture: {
    name: 'Agriculture',
    level: 'ZJC & O-Level',
    board: 'ZIMSEC',
    topics: [
      {
        title: 'Soil Science & Conservation',
        keyConcepts: [
          'Soil composition: mineral matter (45%), organic matter (5%), air (25%), water (25%).',
          'Soil profile layers: Horizon O (humus), Horizon A (topsoil), Horizon B (subsoil), Horizon C (weathered parent rock), Horizon D (bedrock).',
          'Soil conservation methods: contour ploughing, terracing, crop rotation, cover cropping, mulching, afforestation.',
          'Types of soil weathering: physical (temperature, wind, frost), chemical (oxidation, hydration, carbonation), biological (root action, burrowing animals).'
        ],
        sampleQuestions: [
          {
            question: 'State three agents of soil physical weathering and describe how temperature fluctuations cause rocks to fracture.',
            marks: 4,
            answerGuide: 'Agents: Temperature changes, wind, water/ice, frost wedging. Explanation: Unequal expansion and contraction of minerals during hot days and cold nights creates internal stress, causing exfoliation/flaking of outer rock layers [2 marks].'
          },
          {
            question: 'Explain why soil organic matter (humus) improves both water retention in sandy soils and aeration in clay soils.',
            marks: 3,
            answerGuide: 'In sand: acts like a sponge binding loose particles to retain moisture. In clay: aggregates tight microscopic clay platelets into larger crumbs/peds, creating macro-pores for air and drainage.'
          }
        ]
      },
      {
        title: 'Crop Production & Management',
        keyConcepts: [
          'Field crops: Maize (staple grain), Groundnuts/Soybeans (legumes for nitrogen fixation), Sorghum/Millet (drought-tolerant grains).',
          'Plant nutrients: Macro-nutrients (N - vegetative growth/green foliage, P - root development & flowering, K - disease resistance & grain filling). Micro-nutrients (Fe, Zn, B, Cu).',
          'Principles of Crop Rotation: Deep-rooted crops follow shallow-rooted crops; Legumes follow heavy nitrogen feeders (maize); Crops of the same family (e.g. Solanaceae: tomato and potato) should not follow each other to prevent pest accumulation.',
          'Weed control: Cultural (mulching, crop rotation, spacing), Mechanical (hoeing, slashing, ploughing), Chemical (herbicides: selective vs non-selective, pre-emergence vs post-emergence).'
        ],
        sampleQuestions: [
          {
            question: 'Outline a 4-year crop rotation programme for a plot using Maize, Groundnuts, Cotton, and Cabbage. Justify your sequence.',
            marks: 4,
            answerGuide: 'Year 1: Maize (heavy nitrogen feeder). Year 2: Groundnuts (legume, restores soil nitrogen). Year 3: Cabbage/Leafy vegetable (shallow rooted, utilizes restored nitrogen). Year 4: Cotton (deep rooted, draws nutrients from deeper horizon).'
          }
        ]
      },
      {
        title: 'Animal Husbandry & Farm Implements',
        keyConcepts: [
          'Ruminants (Cattle, Goats, Sheep): 4-chambered stomach (Rumen - bacterial fermentation, Reticulum - honeycomb/cud regurgitation, Omasum - water absorption, Abomasum - true acidic stomach).',
          'Non-ruminants / Monogastrics (Pigs, Poultry, Rabbits): Single simple stomach, rely on concentrated feeds.',
          'Poultry management: Broilers (meat production, 6-8 weeks, high protein broiler starter and finisher), Layers (egg production, layer mash with calcium for strong eggshells).',
          'Animal health: Dip tanks for tick-borne diseases (Heartwater, Redwater, Gall sickness), Vaccination against Anthrax, Blackleg, and Newcastle disease.'
        ],
        sampleQuestions: [
          {
            question: 'Name the four stomach chambers of a dairy cow in order of food passage and state the main biological process in the rumen.',
            marks: 3,
            answerGuide: 'Chambers: Rumen, Reticulum, Omasum, Abomasum. Main process: Anaerobic microbial fermentation by bacteria and protozoa to break down cellulose and fibrous plant material into volatile fatty acids.'
          }
        ]
      }
    ]
  },
  biology: {
    name: 'Biology',
    level: 'O-Level & A-Level',
    board: 'ZIMSEC & Cambridge',
    topics: [
      {
        title: 'Cell Structure & Organization',
        keyConcepts: [
          'Organelles: Nucleus (genetic blueprint/DNA), Mitochondria (aerobic respiration/ATP), Ribosomes (protein synthesis), Chloroplasts (photosynthesis/chlorophyll), Vacuole (cell turgor).',
          'Plant vs Animal Cells: Plant cells have cellulose cell wall, large central vacuole, and chloroplasts. Animal cells have centrioles and only a cell membrane.',
          'Specialized cells: Root hair cell (large surface area for water/mineral absorption), Red blood cell / Erythrocyte (biconcave disc, lacks nucleus, rich in hemoglobin).'
        ],
        sampleQuestions: [
          {
            question: 'Explain how the structure of a root hair cell is adapted to its function of water and ion absorption.',
            marks: 3,
            answerGuide: '1. Elongated protrusion increases surface area to volume ratio for faster osmosis/diffusion. 2. High concentration of dissolved solutes inside vacuole maintains water potential gradient. 3. Dense mitochondria provide ATP for active transport of mineral ions.'
          }
        ]
      }
    ]
  },
  mathematics: {
    name: 'Mathematics',
    level: 'O-Level & A-Level',
    board: 'ZIMSEC & Cambridge',
    topics: [
      {
        title: 'Algebra & Quadratic Equations',
        keyConcepts: [
          'Quadratic formula: x = (-b ± √(b² - 4ac)) / 2a',
          'Factorisation methods: Difference of two squares (a² - b² = (a - b)(a + b)), Common terms, Grouping, Completing the square.',
          'Discriminant (Δ = b² - 4ac): Δ > 0 (two distinct real roots), Δ = 0 (two equal real roots), Δ < 0 (no real roots / complex roots).'
        ],
        sampleQuestions: [
          {
            question: 'Solve the equation 2x² - 5x - 3 = 0 by factorisation and show all intermediate working.',
            marks: 3,
            answerGuide: '1. Find factors of (2 × -3 = -6) that add to -5: -6 and +1. 2. Rewrite: 2x² - 6x + x - 3 = 0. 3. Group: 2x(x - 3) + 1(x - 3) = (2x + 1)(x - 3) = 0. 4. Roots: x = -1/2 or x = 3.'
          }
        ]
      }
    ]
  }
};

export function getSmartCurriculumResponse(
  subjectName: string,
  userQuery: string,
  mode: string = 'socratic'
): string {
  const queryLower = userQuery.toLowerCase();
  const subLower = subjectName.toLowerCase();

  // Find matching knowledge base entry
  let subjectKey = 'agriculture';
  if (subLower.includes('bio')) subjectKey = 'biology';
  else if (subLower.includes('math')) subjectKey = 'mathematics';
  else if (subLower.includes('chem')) subjectKey = 'chemistry';
  else if (subLower.includes('phys')) subjectKey = 'physics';

  const sub = SUBJECT_CURRICULUM_DATABASE[subjectKey] || SUBJECT_CURRICULUM_DATABASE['agriculture'];

  // Handle Exam Practice Quiz request
  if (queryLower.includes('quiz') || queryLower.includes('past paper') || queryLower.includes('exam question') || mode === 'exam_drill') {
    const topic = sub.topics[Math.floor(Math.random() * sub.topics.length)];
    const qObj = topic.sampleQuestions[Math.floor(Math.random() * topic.sampleQuestions.length)];

    return `### 📝 ${sub.name} Exam Practice Drill (${sub.board} Syllabus)
**Topic**: *${topic.title}*

---

**Question [${qObj.marks} Marks]**:
${qObj.question}

---

💡 **Examiner Tip & Hints**:
- Pay close attention to command words like *Describe*, *Explain*, or *State*.
- Write down your answer or key bullet points. Once you're ready, submit your answer and I'll grade it against the official marking scheme!`;
  }

  // Handle Concept Explanation request
  if (queryLower.includes('explain') || queryLower.includes('principles') || queryLower.includes('how') || queryLower.includes('what is') || mode === 'concept_explainer') {
    const topic = sub.topics[0];
    return `### 💡 ${sub.name}: ${topic.title}

Here is a step-by-step breakdown according to the **${sub.board} (${sub.level})** curriculum:

${topic.keyConcepts.map((c, i) => `**${i + 1}. Key Principle**\n${c}`).join('\n\n')}

---

🔍 **Quick Socratic Question for you**:
Which of these concepts would you like to explore deeper with a worked exam example?`;
  }

  // Handle Step-by-Step Problem Solving
  if (queryLower.includes('step') || queryLower.includes('solve') || queryLower.includes('problem') || mode === 'step_by_step') {
    return `### 🔍 Step-by-Step Problem Solver for ${sub.name}

To solve any ${sub.name} question effectively:
1. **Identify the Given Data**: List all known quantities, values, and units from the question.
2. **Select the Core Formula / Theory**: State the governing law or formula before calculation.
3. **Step-by-Step Working**: Substitute values carefully and check intermediate units.
4. **Final Statement**: Express your answer with appropriate units and significant figures.

**What specific problem or calculation would you like us to work through right now?**`;
  }

  // Default Socratic answer
  return `### 🎯 ${sub.name} Study Guidance (${sub.board})

I'm ready to help you master **${sub.name}**! Here are the best ways we can practice together:

- 📝 **Exam Drills**: Test yourself on high-yield past paper questions with mark allocations.
- 💡 **Step-by-Step Solutions**: Work through difficult equations or concepts together.
- 🧪 **Active Recall**: Test key definitions, diagrams, and examiner marking points.

**What specific topic or question are you studying today?**`;
}
