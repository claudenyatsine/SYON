import * as fs from 'fs';

const payload = [
  {
    "course_level": "AS Level",
    "sequence_order": 1,
    "title": "European Option: Modern Europe, 1750–1921",
    "description": "An investigation into the foundational political, social, and industrial revolutions that shaped modern European history.",
    "sub_modules": [
      {
        "topic": "France, 1774–1814",
        "exam_allocation_2026": "Paper 2 (Outline Study)",
        "key_questions": [
          "What were the causes and immediate outcomes of the 1789 Revolution?",
          "Why were French governments unstable from 1790 to 1795?",
          "Why was Napoleon Bonaparte able to overthrow the Directory in 1799?",
          "What were Napoleon Bonaparte's domestic aims and achievements from 1799 to 1814?"
        ]
      },
      {
        "topic": "The Industrial Revolution in Britain, 1750–1850",
        "exam_allocation_2026": "Paper 2 (Outline Study)",
        "key_questions": [
          "What were the causes of the Industrial Revolution?",
          "Why was there a rapid growth of industrialisation after 1780?",
          "Why, and with what consequences, did urbanisation result from industrialisation?",
          "Why, and with what consequences, did industrialisation result in popular protest and political change?"
        ]
      },
      {
        "topic": "Liberalism and nationalism in Germany, 1815–71",
        "exam_allocation_2026": "Paper 2 (Outline Study)",
        "key_questions": [
          "What were the causes of the Revolutions in 1848–49?",
          "What were the consequences of the 1848–49 Revolutions?",
          "What were Bismarck's intentions for Prussia and Germany from 1862 to 1866?",
          "How and why was the unification of Germany achieved by 1871?"
        ]
      },
      {
        "topic": "The Russian Revolution, 1894–1921",
        "exam_allocation_2026": "Paper 1 (Document Question Prescribed Topic)",
        "key_questions": [
          "What were the causes and outcomes of the 1905 Revolution up to 1914?",
          "What were the causes and immediate outcomes of the February Revolution in 1917?",
          "How and why did the Bolsheviks gain power in October 1917?",
          "How were the Bolsheviks able to consolidate their power up to 1921?"
        ]
      }
    ]
  },
  {
    "course_level": "AS Level",
    "sequence_order": 2,
    "title": "American Option: The History of the USA, 1820–1941",
    "description": "Tracking the structural transformations of the United States through sectional divide, economic expansion, and major domestic crises.",
    "sub_modules": [
      {
        "topic": "The origins of the Civil War, 1820–61",
        "exam_allocation_2026": "Paper 2 (Outline Study)",
        "key_questions": [
          "How was the issue of slavery addressed between 1820 and 1850?",
          "How and why did sectional divisions widen between 1850 and 1856?",
          "Why did the Republicans win the 1860 presidential election?",
          "Why did the Civil War begin in April 1861?"
        ]
      },
      {
        "topic": "Civil War and Reconstruction, 1861–77",
        "exam_allocation_2026": "Paper 1 (Document Question Prescribed Topic)",
        "key_questions": [
          "Why did the Civil War last four years?",
          "How significant was the immediate impact of the Civil War (1861–65)?",
          "What were the aims and outcomes of Reconstruction?",
          "How successful was Reconstruction?"
        ]
      },
      {
        "topic": "The Gilded Age and Progressive Era, 1870s to 1920",
        "exam_allocation_2026": "Paper 2 (Outline Study)",
        "key_questions": [
          "Why was the late nineteenth century an age of rapid industrialisation?",
          "How significant were the consequences of rapid economic growth in the late nineteenth century?",
          "What were the main aims and policies of the Progressive Movement and how popular were they?",
          "How successful was the Progressive Movement up to 1920?"
        ]
      },
      {
        "topic": "The Great Crash, the Great Depression and the New Deal policies, 1920–41",
        "exam_allocation_2026": "Paper 2 (Outline Study)",
        "key_questions": [
          "What were the causes of the Great Crash?",
          "What were the causes and impacts of the Great Depression?",
          "How effective were Roosevelt's strategies to deal with the domestic problems facing the USA in the 1930s?",
          "Why was there opposition to the New Deal policies and what impact did it have?"
        ]
      }
    ]
  },
  {
    "course_level": "AS Level",
    "sequence_order": 3,
    "title": "International Option: International History, 1870–1945",
    "description": "Examining global shifts in empire building, cross-border treaties, geopolitical modernizations, and the failures of collective international peace keeping.",
    "sub_modules": [
      {
        "topic": "Empire and the emergence of world powers, 1870–1919",
        "exam_allocation_2026": "Paper 2 (Outline Study)",
        "key_questions": [
          "Why was imperialism a significant force for late nineteenth century Europe?",
          "What was the impact of imperial expansion on international relations?",
          "Why did Japan emerge as a world power and what was the impact on international relations?",
          "Why did the USA emerge as a world power and what was the impact on international relations?"
        ]
      },
      {
        "topic": "The League of Nations and international relations in the 1920s",
        "exam_allocation_2026": "Paper 2 (Outline Study)",
        "key_questions": [
          "Why was there dissatisfaction with the peace settlements of 1919–20?",
          "How and why did international tensions remain high in the period between 1920 and 1923?",
          "How successful were attempts to improve international relations from 1924–29?",
          "How successful was the League of Nations during the 1920s?"
        ]
      },
      {
        "topic": "The League of Nations and international relations in the 1930s",
        "exam_allocation_2026": "Paper 2 (Outline Study)",
        "key_questions": [
          "How did the rise of extremism affect international relations?",
          "Why did the League of Nations fail to keep the peace in the 1930s?",
          "Why, and with what effects, did Britain and France pursue a policy of appeasement?",
          "Why did war break out in 1939?"
        ]
      },
      {
        "topic": "China and Japan, 1912–45",
        "exam_allocation_2026": "Paper 1 (Document Question Prescribed Topic)",
        "key_questions": [
          "What were the implications of the 'warlord era' which affected China from 1916–27?",
          "How effectively did Chiang Kai-shek deal with the communists in the period 1927–36?",
          "Why did the Chinese Communist Party (CCP) gain support up to 1945?",
          "Why did Japan become a military dictatorship in the 1930s and with what consequences?"
        ]
      }
    ]
  },
  {
    "course_level": "A Level",
    "sequence_order": 4,
    "title": "Paper 3: Interpretations Question (Core Topics)",
    "description": "Developing historiographical critique to analyze and evaluate conflicting historical schools of thought based on un-credited texts.",
    "sub_modules": [
      {
        "topic": "Topic 1: The origins of the First World War",
        "core_focus": "Who was to blame for the First World War? Exploring the Fischer thesis, shared responsibility, and short vs. long term crisis triggers."
      },
      {
        "topic": "Topic 2: The Holocaust",
        "core_focus": "Why did the Holocaust occur? Reconciling Intentionalist, Structuralist, and Functionalist synthesis perspectives, alongside victim, perpetrator, and bystander roles."
      },
      {
        "topic": "Topic 3: The origins and development of the Cold War",
        "core_focus": "Who was to blame for the Cold War? Deconstructing Traditional, Revisionist, and Post-Revisionist historical approaches in Europe from 1941 to 1950."
      }
    ]
  },
  {
    "course_level": "A Level",
    "sequence_order": 5,
    "title": "Paper 4: Depth Studies (Domestic and Foreign Policy Analysis)",
    "description": "Advanced historical modules exploring policy architectures, social shifts, and regimes from 1919 through the late twentieth century.",
    "sub_modules": [
      {
        "depth_study": "Depth Study 1: European history in the interwar years, 1919–41",
        "themes": [
          "Theme 1: Mussolini's Italy, 1919–41 (Rise, totalitarian state governance, corporate economy, and social impacts)",
          "Theme 2: Stalin's Russia, 1924–41 (Leadership conflict, Great Terror purges, collectivization, and industrial targets)",
          "Theme 3: Hitler's Germany, 1929–41 (Weimar failure, consolidation, propaganda control, and agricultural/industrial priorities)",
          "Theme 4: Britain, 1919–39 (Rise of Labour, economic Great Depression adjustments, social standard variations, and war rearmament readiness)"
        ]
      },
      {
        "depth_study": "Depth Study 2: The USA, 1944–92",
        "themes": [
          "Theme 1: The late 1940s and 1950s (Post-war economic expansion, youth culture emerge, and the early Civil Rights engine)",
          "Theme 2: The 1960s and the 1970s (Vietnam strain, counter-culture social movements, and executive imperial instabilities)",
          "Theme 3: The 1980s and early 1990s (Reaganomics deficits, identity politics, the rise of the religious right, and structural standard shifts)",
          "Theme 4: Foreign policy, 1944–92 (Bretton Woods global trade control, Containment vs. Rollback, Détente limitations, and the Cold War denouement)"
        ]
      },
      {
        "depth_study": "Depth Study 3: International history, 1945–92",
        "themes": [
          "Theme 1: US-Soviet relations during the Cold War, 1950–91 (Peaceful coexistence, the Cuban Missile Crisis, nuclear parity controls, and structural Soviet collapse)",
          "Theme 2: The spread of communism in East and Southeast Asia, 1945–91 (PRC rise, Sino-Soviet balance splits, Korean/Vietnam wars, and Sino-US normalization paths)",
          "Theme 3: Decolonisation, the Cold War and the UN in Sub-Saharan Africa, 1950–92 (Nationalist liberation leaders, proxy resource struggles, and UN security challenges)",
          "Theme 4: Conflict in the Middle East, 1948–91 (The partition of Palestine, Arab-Israeli combat cycles, the PLO, and regional destabilizations like the 1979 Iranian Revolution)"
        ]
      }
    ]
  }
];

let sql = `
DO $$ 
DECLARE
  v_subject_id UUID;
  v_module_id UUID;
BEGIN
  -- 1. Find or create the History subject
  SELECT id INTO v_subject_id FROM public.subjects WHERE name ILIKE '%History%' AND level = 'A-Level' LIMIT 1;

  IF v_subject_id IS NULL THEN
     INSERT INTO public.subjects (name, department, level, description) 
     VALUES ('History', 'Arts & Humanities', 'A-Level', 'Advanced Level History Curriculum') 
     RETURNING id INTO v_subject_id;
  END IF;

  -- 2. Clear existing modules to be completely idempotent
  DELETE FROM public.modules WHERE subject_id = v_subject_id;

`;

let dateOffset = 10;

payload.forEach(mod => {
  sql += `
  -- Module: ${mod.title.replace(/'/g, "''")}
  INSERT INTO public.modules (subject_id, course_level, sequence_order, title, description)
  VALUES (v_subject_id, '${mod.course_level}', ${mod.sequence_order}, '${mod.title.replace(/'/g, "''")}', '${mod.description.replace(/'/g, "''")}')
  RETURNING id INTO v_module_id;
`;

  let itemOrder = 1;
  mod.sub_modules.forEach((sub: any) => {
    const isDepthStudy = !!sub.depth_study;
    const itemTitle = isDepthStudy ? sub.depth_study : sub.topic;
    const metaStr = JSON.stringify(sub).replace(/'/g, "''");
    
    // Create staggered fake timeline
    const startExpr = `NOW() - INTERVAL '${dateOffset} days'`;
    dateOffset -= 7;
    const endExpr = `NOW() - INTERVAL '${dateOffset} days'`;

    sql += `
    INSERT INTO public.module_items (module_id, title, item_type, sequence_order, start_date, end_date, metadata)
    VALUES (v_module_id, '${itemTitle.replace(/'/g, "''")}', 'topic', ${itemOrder}, ${startExpr}, ${endExpr}, '${metaStr}'::jsonb);
`;
    itemOrder++;
  });
});

sql += `
END $$;
`;

fs.writeFileSync('supabase/seed_history.sql', sql);
console.log('Successfully generated supabase/seed_history.sql');
