import { useEffect, useState } from 'react';
import { isLeaderboardLive, leaderboardService } from '../../services';
import type { LeaderboardEntry } from '../../services/types';
import { useAuth } from '../../auth/useAuth';

/**
 * The Leaderboard popup body — a ranked list of rank · name · progression
 * (workflows completed). Reads the leaderboard service once on open and
 * renders whatever comes back, with loading and empty states. Ranking is the
 * backend's job (the query is ordered server-side); this just lays it out.
 *
 * The signed-in player's own row is marked, because the first thing anyone
 * does with a leaderboard is look for themselves.
 */
export function LeaderboardPanel() {
	const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
	const { user } = useAuth();

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
		return (
			<p style={noteStyle}>
				No one has been recorded yet. Sign in, pick a name, and clear a recipe
				to take the top spot.
			</p>
		);
	}

	return (
		<>
			<ol style={listStyle}>
				{entries.map((entry, i) => {
					const isMe = entry.uid === user?.uid;
					return (
						<li key={entry.uid} style={isMe ? meRowStyle : rowStyle}>
							<span style={rankStyle}>{i + 1}</span>
							<span style={nameStyle}>
								{entry.name}
								{isMe && <span style={meTagStyle}> (you)</span>}
							</span>
							<span style={scoreStyle}>{entry.progression}</span>
						</li>
					);
				})}
			</ol>
			{/* Without Firebase config the rows above are fixtures. Saying so
			    stops a placeholder being read as a real colleague's score. */}
			{!isLeaderboardLive && (
				<p style={noteStyle}>
					Example data — no leaderboard is configured for this build.
				</p>
			)}
		</>
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

/** The player's own row — lifted off the list, not recoloured, so it reads as
 *  emphasis rather than as a different kind of entry. */
const meRowStyle: React.CSSProperties = {
	...rowStyle,
	background: 'rgba(60,36,100,0.55)',
	boxShadow: 'inset 0 0 0 1px var(--color-accent)',
};

const rankStyle: React.CSSProperties = {
	fontWeight: 700,
	color: 'var(--color-accent)',
	textAlign: 'center',
};

const nameStyle: React.CSSProperties = {
	fontSize: 15,
};

const meTagStyle: React.CSSProperties = {
	fontSize: 12,
	color: 'var(--color-ink-muted)',
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
