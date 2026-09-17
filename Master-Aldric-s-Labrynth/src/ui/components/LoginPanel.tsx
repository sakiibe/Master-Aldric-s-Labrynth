import { useState, type FormEvent } from 'react';
import { useSound } from '../../sound/useSound';
import { MAX_NAME, useAuth } from '../../auth/useAuth';

/**
 * The Account popup body — the title screen's LOGIN overlay.
 *
 * Signing in is OPTIONAL and the copy says so plainly. Play works without an
 * account; what an account buys is that progress is attributed to a person
 * rather than to a browser, so a tech who plays on a ward machine and again at
 * home shows up once. Overstating it ("sign in to save your progress") would
 * be a lie — progress lives in localStorage either way.
 *
 * Signed out (i.e. anonymous — see auth/AuthContext.tsx, where every player
 * holds a uid from first load), it shows the email+password form and can
 * switch between signing in and creating an account. Creating one also asks
 * for a name, which is what the leaderboard shows: collected here rather than
 * derived from the email, because other players can see it.
 *
 * Signed in, it shows the account, the leaderboard name (editable), and a
 * Sign Out button. Error text is whatever the auth layer hands back; this does
 * no validation of its own beyond the input attributes.
 */
export function LoginPanel() {
	const { user, status, signUp, signIn, signOut } = useAuth();
	const { playSfx } = useSound();
	const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Firebase is not configured for this build — there is nothing to offer,
	// and a dead form would be worse than no form.
	if (status === 'off') {
		return <p style={noteStyle}>Accounts are unavailable in this build.</p>;
	}

	if (status === 'loading') {
		return <p style={noteStyle}>Connecting…</p>;
	}

	if (status === 'signedIn') {
		return (
			<div style={wrapStyle}>
				<p style={signedInStyle}>
					Signed in as <strong>{user?.email}</strong>
				</p>
				<DisplayNameField />
				<button
					type="button"
					style={buttonStyle}
					onClick={async () => {
						playSfx('click');
						await signOut();
					}}
				>
					Sign Out
				</button>
			</div>
		);
	}

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		playSfx('click');
		setError(null);
		setBusy(true);
		const result =
			mode === 'signUp'
				? await signUp(name, email, password)
				: await signIn(email, password);
		setBusy(false);
		if (result.ok) {
			setName('');
			setEmail('');
			setPassword('');
		} else {
			setError(result.message);
		}
	};

	return (
		<form style={wrapStyle} onSubmit={(e) => void onSubmit(e)}>
			<p style={noteStyle}>
				Optional. Links your progress to you instead of to this browser, and
				puts you on the leaderboard.
			</p>
			{mode === 'signUp' && (
				<label style={labelStyle}>
					Name
					<input
						type="text"
						autoComplete="nickname"
						value={name}
						onChange={(e) => setName(e.target.value)}
						style={inputStyle}
						required
						maxLength={MAX_NAME}
					/>
					<span style={noteStyle}>Shown on the leaderboard.</span>
				</label>
			)}
			<label style={labelStyle}>
				Email
				<input
					type="email"
					autoComplete="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					style={inputStyle}
					required
				/>
			</label>
			<label style={labelStyle}>
				Password
				<input
					type="password"
					// Tells a password manager whether to offer a saved credential
					// or to generate a new one.
					autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					style={inputStyle}
					required
					// Firebase's own floor. Stated up front rather than as an error
					// after the round trip.
					minLength={6}
				/>
			</label>
			{/* aria-live so a screen reader announces the failure, which is
			    otherwise a silent visual-only change after submitting. */}
			{error && (
				<p role="alert" aria-live="polite" style={errorStyle}>
					{error}
				</p>
			)}
			<button type="submit" style={buttonStyle} disabled={busy}>
				{busy
					? mode === 'signUp'
						? 'Creating…'
						: 'Signing in…'
					: mode === 'signUp'
						? 'Create Account'
						: 'Sign In'}
			</button>
			<button
				type="button"
				style={linkButtonStyle}
				onClick={() => {
					setMode(mode === 'signUp' ? 'signIn' : 'signUp');
					setError(null);
				}}
			>
				{mode === 'signUp' ? 'I already have an account' : 'Create one instead'}
			</button>
		</form>
	);
}

/**
 * The leaderboard name, for an account that already exists.
 *
 * Two jobs. It renames a player who wants a different label, and it is the
 * migration path for accounts created before names were collected — those
 * have no `displayName`, so they are invisible on the board until this is
 * filled in, and the copy says so rather than leaving them wondering.
 */
function DisplayNameField() {
	const { user, setDisplayName } = useAuth();
	const { playSfx } = useSound();
	const current = user?.displayName ?? '';
	const [value, setValue] = useState(current);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	const dirty = value.trim() !== current;

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		playSfx('click');
		setError(null);
		setSaved(false);
		setBusy(true);
		const result = await setDisplayName(value);
		setBusy(false);
		if (result.ok) setSaved(true);
		else setError(result.message);
	};

	return (
		<form style={nameFormStyle} onSubmit={(e) => void onSubmit(e)}>
			<label style={labelStyle}>
				Leaderboard name
				<input
					type="text"
					autoComplete="nickname"
					value={value}
					onChange={(e) => {
						setValue(e.target.value);
						setSaved(false);
					}}
					style={inputStyle}
					maxLength={MAX_NAME}
				/>
			</label>
			{!current && (
				<p style={noteStyle}>Set a name to appear on the leaderboard.</p>
			)}
			{error && (
				<p role="alert" aria-live="polite" style={errorStyle}>
					{error}
				</p>
			)}
			{saved && !dirty && (
				<p aria-live="polite" style={noteStyle}>
					Saved.
				</p>
			)}
			<button
				type="submit"
				style={secondaryButtonStyle}
				disabled={busy || !dirty}
			>
				{busy ? 'Saving…' : 'Save Name'}
			</button>
		</form>
	);
}

// ── Styles (theme CSS vars, as SettingsPanel) ──────────────────────────────

const wrapStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 16,
	marginTop: 8,
};

const labelStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 6,
	fontFamily: 'var(--font-ui)',
	fontSize: 14,
	color: 'var(--color-ink)',
};

const inputStyle: React.CSSProperties = {
	font: 'inherit',
	padding: '9px 11px',
	borderRadius: 5,
	border: '1px solid var(--color-accent)',
	background: 'rgba(8,4,16,0.5)',
	color: 'var(--color-ink)',
};

const buttonStyle: React.CSSProperties = {
	font: 'inherit',
	padding: '10px 16px',
	borderRadius: 5,
	border: '1px solid var(--color-accent)',
	background: 'var(--color-accent)',
	color: 'var(--color-bg)',
	fontWeight: 700,
	letterSpacing: '0.08em',
	cursor: 'pointer',
};

/** The rename form sits between two blocks in the signed-in view, so it
 *  carries its own rule above to separate it from the "Signed in as" line. */
const nameFormStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
	paddingTop: 14,
	borderTop: '1px solid var(--color-accent)',
};

/** Quieter than the primary action — saving a name is not the point of the
 *  popup, signing in and out is. */
const secondaryButtonStyle: React.CSSProperties = {
	font: 'inherit',
	alignSelf: 'flex-start',
	padding: '7px 13px',
	borderRadius: 5,
	border: '1px solid var(--color-accent)',
	background: 'transparent',
	color: 'var(--color-ink)',
	cursor: 'pointer',
};

const linkButtonStyle: React.CSSProperties = {
	font: 'inherit',
	alignSelf: 'center',
	padding: 0,
	fontSize: 12,
	color: 'var(--color-ink-muted)',
	background: 'none',
	border: 'none',
	textDecoration: 'underline',
	cursor: 'pointer',
};

const signedInStyle: React.CSSProperties = {
	margin: 0,
	fontFamily: 'var(--font-body)',
	fontSize: 15,
	color: 'var(--color-ink)',
};

const noteStyle: React.CSSProperties = {
	margin: 0,
	fontFamily: 'var(--font-body)',
	fontSize: 13,
	color: 'var(--color-ink-muted)',
};

const errorStyle: React.CSSProperties = {
	margin: 0,
	fontFamily: 'var(--font-ui)',
	fontSize: 13,
	color: 'var(--color-wrong)',
};
