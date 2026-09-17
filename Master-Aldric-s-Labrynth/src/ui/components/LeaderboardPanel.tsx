import { useEffect, useState } from 'react';
import { leaderboardService } from '../../services';
import type { LeaderboardEntry } from '../../services/types';

/**
 * The Leaderboard popup body — a ranked list of rank · name · progression
 * (recipes completed). Skeleton only: it reads the leaderboard service once on
 * open and renders whatever comes back, with loading and empty states. Ranking
 * and data are the backend's job; this just lays them out.
 */
export function LeaderboardPanel() {
	const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

	useEffect(() => {
		let live = true;
		leaderboardService
			.top(10)
			.then((rows) => live && setEntries(rows))
			.catch(() => live && setEntries([]));
		return () => {
			live = false;
		};
	}, []);

	if (entries === null) {
		return <p style={noteStyle}>Consulting the ledger…</p>;
	}
	if (entries.length === 0) {
		return <p style={noteStyle}>No recipes recorded yet.</p>;
	}

	return (
		<ol style={listStyle}>
			{entries.map((entry, i) => (
				<li key={entry.uid} style={rowStyle}>
					<span style={rankStyle}>{i + 1}</span>
					<span style={nameStyle}>{entry.name}</span>
					<span style={scoreStyle}>{entry.progression}</span>
				</li>
			))}
		</ol>
	);
}

// ── Styles (theme CSS vars, as SettingsPanel) ──────────────────────────────

const listStyle: React.CSSProperties = {
	listStyle: 'none',
	margin: '8px 0 0',
	padding: 0,
	display: 'flex',
	flexDirection: 'column',
	gap: 4,
};

const rowStyle: React.CSSProperties = {
	display: 'grid',
	gridTemplateColumns: '28px 1fr auto',
	alignItems: 'center',
	gap: 12,
	padding: '9px 12px',
	borderRadius: 5,
	border: '1px solid var(--color-accent)',
	background: 'rgba(8,4,16,0.4)',
	fontFamily: 'var(--font-ui)',
	color: 'var(--color-ink)',
};

const rankStyle: React.CSSProperties = {
	fontWeight: 700,
	color: 'var(--color-accent)',
	textAlign: 'center',
};

const nameStyle: React.CSSProperties = {
	fontSize: 15,
};

const scoreStyle: React.CSSProperties = {
	fontWeight: 700,
	color: 'var(--color-ink)',
};

const noteStyle: React.CSSProperties = {
	margin: '8px 0 0',
	fontFamily: 'var(--font-body)',
	fontSize: 15,
	color: 'var(--color-ink-muted)',
};
