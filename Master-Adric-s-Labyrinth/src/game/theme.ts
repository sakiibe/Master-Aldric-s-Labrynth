/**
 * The apothecary/alchemy theme — the only theme (an earlier swappable
 * modern-pharmacy skin was dropped). Design tokens, vocabulary, and Master
 * Aldric's authored dead-end content, kept out of scene components so those
 * can be built against placeholder art before real art exists.
 *
 * Copy here is a first pass — expect it to be revised once mockups land.
 */

import type { ThemeTokens } from './types';

export const theme: ThemeTokens = {
  colors: {
    bg: '#1b1230',
    surface: '#2a1d47',
    ink: '#f4ead6',
    inkMuted: '#c9b8e8',
    accent: '#caa14a',
    correct: '#5fb87a',
    wrong: '#c0563f',
    locked: '#4a3d63',
    cleared: '#7d6bab',
  },

  fonts: {
    display: '"Cinzel", Georgia, serif',
    body: '"Spectral", Georgia, serif',
    ui: 'system-ui, sans-serif',
  },

  labels: {
    workflow: 'Recipe',
    workflowPlural: 'Recipes',
    dose: 'Measure',
    dosePlural: 'Measures',
    hint: 'Hint',
    hintPlural: 'Hints',
    patience: 'Patience',
    patiencePlural: 'Patience',
    mentor: 'Master Aldric',
    overworld: 'The Laboratory',
    junction: 'Junction',
    complete: 'Complete',
  },

  assets: {
    mentorPortrait: 'aldric-portrait',
    doorArt: 'door-default',
    overworldArt: 'overworld-lab',
    junctionArt: 'junction-default',
  },

  deadEndScenes: [
    {
      id: 'bath',
      art: 'aldric-bath',
      line: 'Do you MIND? I was three breaths from enlightenment and a very good soak.',
    },
    {
      id: 'makeup',
      art: 'aldric-makeup',
      line: 'One moment. You have chosen poorly, and I intend to look magnificent saying so.',
    },
    {
      id: 'figurines',
      art: 'aldric-figurines',
      line: 'These are ANATOMICAL MODELS. For study. I was studying. Loudly.',
    },
    {
      id: 'cauldron',
      art: 'aldric-cauldron',
      line: 'That door was wrong, and now so is my reduction. Nine hours. NINE.',
    },
    {
      id: 'robe',
      art: 'aldric-robe',
      line: 'I have tripped on this robe eleven times today. Also: wrong door.',
    },
  ],

  outOfPatienceLine:
    'My patience, apprentice, is not so easily replenished as your resolve. We begin again.',

  typewriterMs: 30,

  jobAids: {
    bpmh: {
      id: 'bpmh',
      name: 'BPMH & Med Rec',
      color: '#3c6f8f',
      sigil: 'sigil-bpmh',
    },
    verification: {
      id: 'verification',
      name: 'Pharmacist Verification',
      color: '#7a5aa8',
      sigil: 'sigil-verification',
    },
    cpoe: {
      id: 'cpoe',
      name: 'CPOE',
      color: '#3f8f80',
      sigil: 'sigil-cpoe',
    },
    oncology: {
      id: 'oncology',
      name: 'Oncology Orders',
      color: '#a8804a',
      sigil: 'sigil-oncology',
    },
  },
};
