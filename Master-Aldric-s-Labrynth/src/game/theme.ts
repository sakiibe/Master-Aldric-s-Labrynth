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

	// One entry per painting in ui/art/registry.ts. A sixth scene, 'robe'
	// ("I have tripped on this robe eleven times today. Also: wrong door."),
	// is parked until its art exists — listing it here would put placeholder
	// blobs in front of the player one dead end in five.
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
	],

	/**
	 * Story Mode's frame. Beats are one click each; `art` keys into the story
	 * paintings in ui/art/registry.ts.
	 *
	 * The premise: Aldric has three centuries of alchemy and no PowerChart,
	 * so he locks the door until the player teaches him all 48 workflows.
	 * The threats are deliberately absurd — the audience is staff preparing
	 * for a real Go-Live, and the joke has to stay a joke.
	 */
	story: {
		prologue: [
			{
				art: 'aldric-summons',
				line: 'Stop there. Do not touch the mandrake, do not breathe on the athanor, and do not — under any circumstance — sit down.',
			},
			{
				art: 'aldric-flask',
				line: 'I am Master Aldric. Three hundred years I have kept this valley breathing. Every root distilled, every text read, every fever broken by my hand.',
			},
			{
				art: 'aldric-terms',
				line: 'And then YOU arrive. A Pharmacist of Nova Scotia Health. No athanor. No grimoire. Just a screen.',
			},
			{
				art: 'aldric-flask',
				line: 'Orders that verify themselves. Doses weighed against the patient. A record that never once forgets. I have no word for this in my language, so I will use yours: Cerner PowerChart.',
			},
			{
				art: 'aldric-cackle',
				line: 'It is the most powerful sorcery I have ever seen, and I do not know a single click of it. Which brings me to the door behind you. It is locked. It locked some time ago.',
			},
			{
				art: 'aldric-furious',
				line: 'You will teach me. Every workflow, every button, every last piece of your clickology. Then, apprentice, you may go home.',
			},
			{
				art: 'aldric-summons',
				line: 'One warning. I keep a tower. I have baths to take, reductions to watch, and a standing appointment at four. Choose a wrong door and you WILL find me in the middle of it.',
			},
			{
				art: 'aldric-terms',
				line: 'My patience is finite. Yours had better not be. Begin.',
			},
		],

		briefings: {
			bpmh: [
				{
					art: 'aldric-summons',
					line: 'This house first. The one where you ask a patient what they actually take — rather than what somebody once wrote down and never looked at again.',
				},
				{
					art: 'aldric-flask',
					line: 'Best Possible Medication History. Teach me every step of it and I shall unbar the west stair. My word as an alchemist.',
				},
				{
					art: 'aldric-cackle',
					line: 'Refuse, and I turn your shoes into newts. Not you — your SHOES. You will keep walking. They will keep swimming. It will be very difficult for everyone.',
				},
			],
			verification: [
				{
					art: 'aldric-terms',
					line: 'Verification. You read a thing another hand typed, and you decide whether it is allowed to become real. That is judgement. I respect judgement.',
				},
				{
					art: 'aldric-flask',
					line: 'Show me the whole of it and I will let you go. Truly. Almost certainly.',
				},
				{
					art: 'aldric-furious',
					line: 'Fail me and I bind your reflection to the mirror on the third landing. It keeps your face. You get the badger’s. You will still be expected at work.',
				},
			],
			cpoe: [
				{
					art: 'aldric-summons',
					line: 'Computerised Provider Order Entry. Six words your people invented to avoid saying "put the order in properly."',
				},
				{
					art: 'aldric-flask',
					line: 'Teach me this house and the front gate opens at dawn. I will even have someone walk you to the road.',
				},
				{
					art: 'aldric-cackle',
					line: 'Withhold it, and every cup you lift for the rest of your life is lukewarm. Tea. Coffee. Soup. Lukewarm. Forever. I have done it before.',
				},
			],
			oncology: [
				{
					art: 'aldric-terms',
					line: 'Oncology. Weights, volumes, sets, syringes — where one careless decimal is not a mistake, it is a funeral.',
				},
				{
					art: 'aldric-flask',
					line: 'This is the house I want most. Teach me and you walk out the front door unhexed, unaltered, entirely yourself.',
				},
				{
					art: 'aldric-furious',
					line: 'Deny me and I write your name into every crossword in the realm. You will be fourteen down. Nobody will ever get it. You will hear them TRY.',
				},
			],
		},

		finale: [
			{
				art: 'aldric-town',
				line: 'It is done. All forty-eight. You taught a three-hundred-year-old man to click Process without shouting at him once. Well — not once that counted.',
			},
			{
				art: 'aldric-town',
				line: 'The door, incidentally, has been open since the second house. I did not mention it. You did not ask. We were both busy.',
			},
			{
				art: 'aldric-town',
				line: 'But look at them out there. Right patient, right dose, right route — every time now, and not one of it left to my memory or my mood.',
			},
			{
				art: 'aldric-town',
				line: 'You were an insufferable teacher, apprentice. Thorough. Patient. Deeply, deeply annoying. My valley is safer for it.',
			},
			{
				art: 'aldric-town',
				line: 'Go home. Take the good brush. And thank you.',
			},
		],
	},

	outOfPatienceLine:
		'My patience, apprentice, is not so easily replenished as your resolve. We begin again.',

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
