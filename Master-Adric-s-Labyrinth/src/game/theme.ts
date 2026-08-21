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
      line: "Must you fail RIGHT as I've— very well. Let me towel off and explain your error.",
    },
    {
      id: 'makeup',
      art: 'aldric-makeup',
      line: 'One moment — the kohl does not apply itself. Now. About that wrong door.',
    },
    {
      id: 'cauldron',
      art: 'aldric-cauldron',
      line: "The cauldron! It's— it's fine, it's FINE. Now, apprentice, about your choice—",
    },
    {
      id: 'raven',
      art: 'aldric-raven',
      line: 'Corvus, I am WORKING — apologies. Your click was, regrettably, incorrect.',
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
};
