import { useState, type FormEvent } from 'react';
import { useSound } from '../../sound/useSound';
import { useAuth } from '../../state/useAuth';

/**
 * The Account popup body. Signed out, it shows the email+password form;
 * signed in, it shows the account and a Sign Out button. Skeleton only — it
 * calls the auth service through `useAuth` and surfaces whatever error comes
 * back, with no client-side validation of its own.
 */
export function LoginPanel() {
	const { user, signIn, signOut } = useAuth();
	const { playSfx } = useSound();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (user) {
		return (
			<div style={wrapStyle}>
				<p style={signedInStyle}>
					Signed in as <strong>{user.email}</strong>
				</p>
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
		try {
			await signIn(email, password);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not sign in.');
		} finally {
			setBusy(false);
		}
	};

	return (
		<form style={wrapStyle} onSubmit={onSubmit}>
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
					autoComplete="current-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					style={inputStyle}
					required
				/>
			</label>
			{error && <p style={errorStyle}>{error}</p>}
			<button type="submit" style={buttonStyle} disabled={busy}>
				{busy ? 'Signing in…' : 'Sign In'}
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

const signedInStyle: React.CSSProperties = {
	margin: 0,
	fontFamily: 'var(--font-body)',
	fontSize: 15,
	color: 'var(--color-ink)',
};

const errorStyle: React.CSSProperties = {
	margin: 0,
	fontFamily: 'var(--font-ui)',
	fontSize: 13,
	color: 'var(--color-wrong)',
};
