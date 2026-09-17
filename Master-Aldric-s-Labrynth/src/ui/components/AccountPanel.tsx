import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/useAuth';

/**
 * Account controls for the title-screen Settings overlay.
 *
 * Signing in is OPTIONAL and the copy says so plainly. Play works without an
 * account; what an account buys is that progress is attributed to a person
 * rather than to a browser, so a tech who plays on a ward machine and again
 * at home shows up once. Overstating it ("sign in to save your progress")
 * would be a lie — progress lives in localStorage either way.
 *
 * Styling follows SettingsPanel.tsx: inline style objects over the theme CSS
 * vars set on .theme-root, so this inherits whatever skin is active.
 */
export function AccountPanel() {
	const { user, status, signUp, signIn, signOut } = useAuth();
	const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	// Firebase is not configured for this build — there is nothing to offer,
	// and a dead form would be worse than no form.
	if (status === 'off') return null;

	if (status === 'loading') {
		return <p style={hintStyle}>Connecting…</p>;
	}

	if (status === 'signedIn') {
		return (
			<div style={wrapStyle}>
				<div style={rowStyle}>
					<span style={labelStyle}>
						Signed in
						<span style={hintStyle}>{user?.email}</span>
					</span>
					<button
						type="button"
						onClick={() => void signOut()}
						style={buttonStyle}
					>
						Sign out
					</button>
				</div>
			</div>
		);
	}

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setError(null);
		setPending(true);
		const result =
			mode === 'signUp'
				? await signUp(email, password)
				: await signIn(email, password);
		setPending(false);
		if (result.ok) {
			setEmail('');
			setPassword('');
		} else {
			setError(result.message);
		}
	}

	return (
		<form style={wrapStyle} onSubmit={(e) => void onSubmit(e)}>
			<span style={labelStyle}>
				{mode === 'signUp' ? 'Create an account' : 'Sign in'}
				<span style={hintStyle}>
					Optional. Links your progress to you instead of to this browser.
				</span>
			</span>

			<input
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="Email"
				aria-label="Email"
				autoComplete="email"
				required
				style={inputStyle}
			/>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Password"
				aria-label="Password"
				// Tells a password manager whether to offer a saved credential
				// or to generate a new one.
				autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
				required
				// Firebase's own floor. Stated up front rather than as an error
				// after the round trip.
				minLength={6}
				style={inputStyle}
			/>

			{/* aria-live so a screen reader announces the failure, which is
			    otherwise a silent visual-only change after submitting. */}
			<span role="alert" aria-live="polite" style={errorStyle}>
				{error ?? ''}
			</span>

			<div style={actionsStyle}>
				<button type="submit" disabled={pending} style={buttonStyle}>
					{pending
						? 'Working…'
						: mode === 'signUp'
							? 'Create account'
							: 'Sign in'}
				</button>
				<button
					type="button"
					onClick={() => {
						setMode(mode === 'signUp' ? 'signIn' : 'signUp');
						setError(null);
					}}
					style={linkButtonStyle}
				>
					{mode === 'signUp'
						? 'I already have an account'
						: 'Create one instead'}
				</button>
			</div>
		</form>
	);
}

// ── Styles ────────────────────────────────────────────────────────────────

const wrapStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 12,
	marginTop: 8,
};

const rowStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 20,
};

const labelStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 3,
	fontFamily: 'var(--font-ui)',
	fontSize: 15,
	color: 'var(--color-ink)',
};

const hintStyle: React.CSSProperties = {
	fontSize: 12,
	color: 'var(--color-ink-muted)',
};

const inputStyle: React.CSSProperties = {
	fontFamily: 'var(--font-ui)',
	fontSize: 15,
	padding: '8px 10px',
	color: 'var(--color-ink)',
	background: 'transparent',
	border: '1.5px solid var(--color-accent)',
	borderRadius: 4,
};

const errorStyle: React.CSSProperties = {
	fontSize: 12,
	minHeight: 16,
	color: 'var(--color-danger, #c0392b)',
};

const actionsStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 12,
};

const buttonStyle: React.CSSProperties = {
	fontFamily: 'var(--font-ui)',
	fontSize: 14,
	padding: '8px 14px',
	color: 'var(--color-ink)',
	background: 'transparent',
	border: '1.5px solid var(--color-accent)',
	borderRadius: 4,
	cursor: 'pointer',
};

const linkButtonStyle: React.CSSProperties = {
	fontFamily: 'var(--font-ui)',
	fontSize: 12,
	padding: 0,
	color: 'var(--color-ink-muted)',
	background: 'none',
	border: 'none',
	textDecoration: 'underline',
	cursor: 'pointer',
};
