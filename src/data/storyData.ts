import { StoryPageData, QuestionData } from '../types/story';

export const STORY_PAGES: StoryPageData[] = [
  // Chapter 1: The Missing Doll (Pages 1-4)
  {
    id: 1,
    chapter: 1,
    pageNumber: 1,
    title: "Where is Tigi?",
    sceneId: "scene-1",
    sentences: [
      "Sports Day is tomorrow.",
      "Class 5-1 is very excited.",
      "Where is Tigi the tiger?",
      "The tiger mascot is gone!"
    ],
    koreanSentences: [
      "내일은 운동회 날이에요.",
      "5학년 1반 친구들은 매우 신나요.",
      "호랑이 티기는 어디에 있을까요?",
      "호랑이 마스코트가 사라졌어요!"
    ],
    newWord: {
      word: "mascot",
      koreanMeaning: "마스코트 인형",
      emoji: "🐯",
      simpleDefinition: "A special toy or animal doll for the class."
    },
    clueSummary: "Tigi the tiger mascot is missing from the classroom."
  },
  {
    id: 2,
    chapter: 1,
    pageNumber: 2,
    title: "An Empty Box",
    sceneId: "scene-2",
    sentences: [
      "Minji looks at the desk.",
      "She sees an open box.",
      "The big box is empty."
    ],
    koreanSentences: [
      "민지가 책상을 살펴봐요.",
      "민지는 열린 상자를 봐요.",
      "큰 상자가 텅 비어 있어요."
    ],
    newWord: {
      word: "empty",
      koreanMeaning: "텅 빈",
      emoji: "📦",
      simpleDefinition: "Nothing is inside the box."
    },
    clueSummary: "The box on the desk is open and empty."
  },
  {
    id: 3,
    chapter: 1,
    pageNumber: 3,
    title: "Mystery Feathers",
    sceneId: "scene-3",
    sentences: [
      "Jun finds a clue.",
      "He sees small feathers.",
      "They are black and white."
    ],
    koreanSentences: [
      "준이가 단서를 찾아요.",
      "준이는 작은 깃털들을 봐요.",
      "깃털들은 검은색과 흰색이에요."
    ],
    newWord: {
      word: "feathers",
      koreanMeaning: "깃털",
      emoji: "🪶",
      simpleDefinition: "Soft parts covering a bird's wings."
    },
    clueSummary: "Black and white feathers were left on the window sill."
  },
  {
    id: 4,
    chapter: 1,
    pageNumber: 4,
    title: "The Open Window",
    sceneId: "scene-4",
    sentences: [
      "Teacher Kim comes in.",
      "She looks at the window.",
      "A cool breeze comes in.",
      "The window was open!"
    ],
    koreanSentences: [
      "김 선생님이 교실로 들어오세요.",
      "선생님이 창문을 바라보세요.",
      "시원한 산들바람이 들어와요.",
      "창문이 열려 있었어요!"
    ],
    newWord: {
      word: "breeze",
      koreanMeaning: "산들바람",
      emoji: "🍃",
      simpleDefinition: "A soft and gentle wind."
    },
    clueSummary: "The window was open, letting in the breeze."
  },

  // Chapter 2: Searching for Clues (Pages 5-8)
  {
    id: 5,
    chapter: 2,
    pageNumber: 5,
    title: "Max the Dog",
    sceneId: "scene-5",
    sentences: [
      "Max the dog sits outside.",
      "He chews a brown stick.",
      "Minji suspects Max.",
      "She checks his dog house."
    ],
    koreanSentences: [
      "강아지 맥스가 밖에 앉아 있어요.",
      "맥스는 갈색 나뭇가지를 씹고 있어요.",
      "민지는 맥스를 의심해요.",
      "민지는 맥스의 개집을 확인해요."
    ],
    newWord: {
      word: "suspects",
      koreanMeaning: "의심하다",
      emoji: "🐶",
      simpleDefinition: "To think someone did something wrong."
    },
    clueSummary: "Minji checks if Max took the toy."
  },
  {
    id: 6,
    chapter: 2,
    pageNumber: 6,
    title: "Tiny Footprints",
    sceneId: "scene-6",
    sentences: [
      "Max has no tiger doll.",
      "Jun looks at the wet ground.",
      "He sees tiny bird footprints!"
    ],
    koreanSentences: [
      "맥스에게는 호랑이 인형이 없어요.",
      "준이가 젖은 땅을 봐요.",
      "준이는 아주 작은 새 발자국을 봐요!"
    ],
    newWord: {
      word: "footprints",
      koreanMeaning: "발자국",
      emoji: "🐾",
      simpleDefinition: "Marks made by feet on the ground."
    },
    clueSummary: "Tiny bird footprints in the mud prove Max is innocent."
  },
  {
    id: 7,
    chapter: 2,
    pageNumber: 7,
    title: "The Shiny Button",
    sceneId: "scene-7",
    sentences: [
      "Minji walks to the tree.",
      "She sees a shiny yellow button.",
      "It fell from Tigi's shirt!"
    ],
    koreanSentences: [
      "민지가 큰 나무 쪽으로 걸어가요.",
      "민지는 반짝이는 노란 단추를 봐요.",
      "단추는 티기의 셔츠에서 떨어진 거예요!"
    ],
    newWord: {
      word: "shiny",
      koreanMeaning: "반짝이는",
      emoji: "✨",
      simpleDefinition: "Bright and gleaming in the light."
    },
    clueSummary: "A shiny button from Tigi's shirt was found under the tree."
  },
  {
    id: 8,
    chapter: 2,
    pageNumber: 8,
    title: "Sound in the Tree",
    sceneId: "scene-8",
    sentences: [
      "Jun hears a loud cry.",
      "The bird says, \"Caw! Caw!\"",
      "Jun points at a big branch."
    ],
    koreanSentences: [
      "준이가 큰 울음소리를 들어요.",
      "새가 \"깍! 깍!\" 하고 울어요.",
      "준이가 큰 나뭇가지를 가리켜요."
    ],
    newWord: {
      word: "branch",
      koreanMeaning: "나뭇가지",
      emoji: "🌿",
      simpleDefinition: "A wooden arm growing from a tree trunk."
    },
    clueSummary: "A bird is calling from a tree branch."
  },

  // Chapter 3: The Secret in the Tree (Pages 9-12)
  {
    id: 9,
    chapter: 3,
    pageNumber: 9,
    title: "The Clever Magpie",
    sceneId: "scene-9",
    sentences: [
      "A black-and-white magpie sits in the tree.",
      "It has a long tail.",
      "Magpies love shiny things!"
    ],
    koreanSentences: [
      "검고 흰 까치가 나무에 앉아 있어요.",
      "까치는 긴 꼬리를 가지고 있어요.",
      "까치들은 반짝이는 물건을 아주 좋아해요!"
    ],
    newWord: {
      word: "magpie",
      koreanMeaning: "까치",
      emoji: "🐦",
      simpleDefinition: "A smart black-and-white bird that loves shiny objects."
    },
    clueSummary: "A magpie is perched in the tree."
  },
  {
    id: 10,
    chapter: 3,
    pageNumber: 10,
    title: "Found in the Nest!",
    sceneId: "scene-10",
    sentences: [
      "Minji sees a big nest.",
      "She sees orange fur inside.",
      "Tigi the tiger is safe!"
    ],
    koreanSentences: [
      "민지는 커다란 새둥지를 봐요.",
      "둥지 안에서 주황색 털이 보여요.",
      "호랑이 티기가 무사해요!"
    ],
    newWord: {
      word: "nest",
      koreanMeaning: "새둥지",
      emoji: "🪺",
      simpleDefinition: "A home built by birds out of twigs."
    },
    clueSummary: "Tigi the tiger doll is safe inside the magpie's nest."
  },
  {
    id: 11,
    chapter: 3,
    pageNumber: 11,
    title: "Teacher Kim's Help",
    sceneId: "scene-11",
    sentences: [
      "Teacher Kim brings a long stick.",
      "She gently takes Tigi down.",
      "Everyone claps and smiles."
    ],
    koreanSentences: [
      "김 선생님이 긴 막대기를 가져오세요.",
      "선생님이 티기를 조심스럽게 내려주세요.",
      "모두가 박수를 치며 웃어요."
    ],
    newWord: {
      word: "gently",
      koreanMeaning: "조심스럽게",
      emoji: "🤲",
      simpleDefinition: "Carefully and softly without hurting anything."
    },
    clueSummary: "Teacher Kim gently brings Tigi down safely."
  },
  {
    id: 12,
    chapter: 3,
    pageNumber: 12,
    title: "Sports Day Hero",
    sceneId: "scene-12",
    sentences: [
      "Sports Day starts today.",
      "Students cheer for their team.",
      "The magpie watches from the tree."
    ],
    koreanSentences: [
      "오늘 운동회가 시작돼요.",
      "학생들이 자기 팀을 힘차게 응원해요.",
      "까치는 나무에서 바라봐요."
    ],
    newWord: {
      word: "cheer",
      koreanMeaning: "응원하다",
      emoji: "📣",
      simpleDefinition: "Shout loudly to encourage friends."
    },
    clueSummary: "The mascot is back and the Sports Day mystery is solved!"
  }
];

export const QUESTIONS_DATA: Record<number, QuestionData> = {
  1: {
    pageId: 1,
    chapter: 1,
    level: "Find it",
    questionText: "What is missing before Sports Day?",
    hintText: "Look at the open box.",
    options: [
      { id: "a", text: "Tigi the tiger mascot", emoji: "🐯", isCorrect: true },
      { id: "b", text: "Teacher Kim", emoji: "👩‍🏫", isCorrect: false }
    ],
    fullSentenceExpansion: "Yes! Tigi the tiger mascot is missing.",
    koreanFullSentence: "맞아요! 호랑이 마스코트 티기가 사라졌어요."
  },
  2: {
    pageId: 2,
    chapter: 1,
    level: "Find it",
    questionText: "What is on the classroom desk?",
    hintText: "Look at the desk.",
    options: [
      { id: "a", text: "An empty box", emoji: "📦", isCorrect: true },
      { id: "b", text: "A soccer ball", emoji: "⚽", isCorrect: false }
    ],
    fullSentenceExpansion: "Yes! There is an empty box on the desk.",
    koreanFullSentence: "맞아요! 책상 위에 텅 빈 상자가 있어요."
  },
  3: {
    pageId: 3,
    chapter: 1,
    level: "Find it",
    questionText: "What color are the feathers?",
    hintText: "Look at the feathers Jun found.",
    options: [
      { id: "a", text: "Black and white", emoji: "🪶", isCorrect: true },
      { id: "b", text: "Red and yellow", emoji: "🎨", isCorrect: false }
    ],
    fullSentenceExpansion: "Yes! The feathers are black and white.",
    koreanFullSentence: "맞아요! 깃털들은 검은색과 흰색이에요."
  },
  4: {
    pageId: 4,
    chapter: 1,
    level: "Find it",
    questionText: "What was open in the classroom?",
    hintText: "Feel the cool breeze coming into the room.",
    options: [
      { id: "a", text: "The window", emoji: "🪟", isCorrect: true },
      { id: "b", text: "The front door", emoji: "🚪", isCorrect: false }
    ],
    fullSentenceExpansion: "Yes! The window was open.",
    koreanFullSentence: "맞아요! 창문이 열려 있었어요."
  },
  5: {
    pageId: 5,
    chapter: 2,
    level: "Why?",
    questionText: "Why does Minji check Max the dog?",
    hintText: "Dogs love to play with stuffed toys!",
    options: [
      { id: "a", text: "Dogs sometimes take toys", emoji: "🐶", isCorrect: true },
      { id: "b", text: "Max was crying loudly", emoji: "😢", isCorrect: false }
    ],
    fullSentenceExpansion: "Yes! Dogs sometimes take soft toys to play.",
    koreanFullSentence: "맞아요! 강아지들은 가끔 부드러운 장난감을 가져가요."
  },
  6: {
    pageId: 6,
    chapter: 2,
    level: "Why?",
    questionText: "Why is Max not the mascot thief?",
    hintText: "Look at the small shape of the footprints in the mud.",
    options: [
      { id: "a", text: "The footprints are from a bird", emoji: "🐾", isCorrect: true },
      { id: "b", text: "Max was sleeping in bed", emoji: "😴", isCorrect: false }
    ],
    fullSentenceExpansion: "Yes! The footprints are from a bird, not a dog.",
    koreanFullSentence: "맞아요! 발자국은 강아지가 아니라 새의 발자국이었어요."
  },
  7: {
    pageId: 7,
    chapter: 2,
    level: "Why?",
    questionText: "Why is the button a good clue?",
    hintText: "Where did Minji find the button?",
    options: [
      { id: "a", text: "Tigi was near the tree", emoji: "✨", isCorrect: true },
      { id: "b", text: "Minji lost her button", emoji: "👚", isCorrect: false }
    ],
    fullSentenceExpansion: "Yes! The button shows Tigi was near the tree.",
    koreanFullSentence: "맞아요! 단추를 보면 티기가 나무 근처에 있었다는 걸 알 수 있어요."
  },
  8: {
    pageId: 8,
    chapter: 2,
    level: "Why?",
    questionText: "Why does Jun look up at the tree?",
    hintText: "Listen to the loud 'Caw! Caw!' from the branch.",
    options: [
      { id: "a", text: "The bird may have Tigi", emoji: "🌳", isCorrect: true },
      { id: "b", text: "He wants to pick green apples", emoji: "🍏", isCorrect: false }
    ],
    fullSentenceExpansion: "Yes! Jun thinks the bird may have Tigi.",
    koreanFullSentence: "맞아요! 준이는 새가 티기를 가지고 있을 거라고 생각해요."
  },
  9: {
    pageId: 9,
    chapter: 3,
    level: "Find it",
    questionText: "What bird is in the tree?",
    hintText: "It is black and white. It loves shiny things.",
    options: [
      { id: "a", text: "A clever magpie", emoji: "🐦", isCorrect: true },
      { id: "b", text: "A small brown sparrow", emoji: "🐤", isCorrect: false }
    ],
    fullSentenceExpansion: "Yes! A clever magpie is in the tree.",
    koreanFullSentence: "맞아요! 영리한 까치가 나무 위에 있어요."
  },
  10: {
    pageId: 10,
    chapter: 3,
    level: "Your idea",
    questionText: "What should Minji and Jun do now?",
    hintText: "Both choices are great detective decisions!",
    options: [
      {
        id: "a",
        text: "Ask Teacher Kim for help",
        emoji: "👩‍🏫",
        isCorrect: true,
        expansionText: "I think they should ask Teacher Kim for help.",
        koreanExpansionText: "선생님께 도움을 요청해야 한다고 생각해요."
      },
      {
        id: "b",
        text: "Offer a shiny ribbon to the bird",
        emoji: "🎀",
        isCorrect: true,
        expansionText: "I think they should offer a shiny ribbon to the bird.",
        koreanExpansionText: "새에게 반짝이는 리본을 주어야 한다고 생각해요."
      }
    ],
    fullSentenceExpansion: "Great idea! Working with friends and teachers is smart!",
    koreanFullSentence: "좋은 생각이에요! 친구와 선생님께 도움을 청하는 건 현명해요!"
  },
  11: {
    pageId: 11,
    chapter: 3,
    level: "Find it",
    questionText: "Who brings Tigi down safely?",
    hintText: "She reached up with a long pole.",
    options: [
      { id: "a", text: "Teacher Kim", emoji: "👩‍🏫", isCorrect: true },
      { id: "b", text: "Max the dog", emoji: "🐶", isCorrect: false }
    ],
    fullSentenceExpansion: "Yes! Teacher Kim brings Tigi down safely.",
    koreanFullSentence: "맞아요! 김 선생님께서 티기를 안전하게 내려주셨어요."
  },
  12: {
    pageId: 12,
    chapter: 3,
    level: "Your idea",
    questionText: "How does the magpie feel about Sports Day?",
    hintText: "Share your detective opinion!",
    options: [
      {
        id: "a",
        text: "Happy to watch from the tree",
        emoji: "🎉",
        isCorrect: true,
        expansionText: "I think the magpie is happy to watch from the tree.",
        koreanExpansionText: "까치가 나무에서 구경하며 기뻐한다고 생각해요."
      },
      {
        id: "b",
        text: "Proud to have friendly students",
        emoji: "✨",
        isCorrect: true,
        expansionText: "I think the magpie is proud to have friendly students.",
        koreanExpansionText: "까치가 다정한 친구들이 생겨 자랑스러워한다고 생각해요."
      }
    ],
    fullSentenceExpansion: "Wonderful idea! Everyone is smiling together today!",
    koreanFullSentence: "멋진 생각이에요! 오늘 모두가 함께 활짝 웃고 있어요!"
  }
};

export interface StoryOrderCard {
  id: number;
  stepNumber: number; // 1, 2, 3, 4
  title: string;
  description: string;
  emoji: string;
}

export const CASE_CLOSED_CARDS: StoryOrderCard[] = [
  {
    id: 1,
    stepNumber: 1,
    title: "Empty Box",
    description: "Tigi the tiger mascot disappears from the classroom box.",
    emoji: "📦"
  },
  {
    id: 2,
    stepNumber: 2,
    title: "Finding Clues",
    description: "Minji and Jun spot feathers, bird tracks, and a shiny button.",
    emoji: "🔍"
  },
  {
    id: 3,
    stepNumber: 3,
    title: "The Magpie's Nest",
    description: "They discover Tigi sitting safely in a big tree nest.",
    emoji: "🪺"
  },
  {
    id: 4,
    stepNumber: 4,
    title: "Sports Day Cheer",
    description: "Teacher Kim rescues Tigi and the whole class cheers!",
    emoji: "🏅"
  }
];

export const SENTENCE_BUILDER_DATA = {
  slot1: [
    { id: "magpie", text: "magpie", emoji: "🐦", isCulprit: true },
    { id: "dog", text: "dog", emoji: "🐶", isCulprit: false },
    { id: "boy", text: "boy", emoji: "👦", isCulprit: false }
  ],
  slot2: [
    { id: "shiny", text: "it likes shiny things", emoji: "✨", isReason: true },
    { id: "hungry", text: "it was hungry", emoji: "🍖", isReason: false },
    { id: "run", text: "it wanted to run fast", emoji: "👟", isReason: false }
  ]
};
