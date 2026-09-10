import type { BuiltDoor, DoorId } from '../../game/types';
import type { ArchRect } from '../art/junctionRooms';

interface DoorProps {
	door: BuiltDoor;
	/** Where this door is painted, as percentages of the room art. */
	rect: ArchRect;
	/** Hovered, focused, or the standing selection — see Junction's `lit`. */
	lit: boolean;
	/** True when a spent hint should make this door glow. */
	hinted: boolean;
	/** Dev-only: paint the hit region so the trace can be checked. */
	showHotspot: boolean;
	/**
	 * Counter-scale for the label plate, so text stays legible as the stage
	 * shrinks. Junction clamps it; anything above ~1.15 collides plates.
	 */
	labelScale: number;
	/**
	 * True in compact mode, where the same door also has a row in the door
	 * list. The hotspot stays clickable — tapping the picture is the whole
	 * point — but it gives up its label plate and its place in the tab order,
	 * because the list's copy of it is the better-labelled of the two and one
	 * door should not be two stops for a keyboard or screen-reader user.
	 */
	listed: boolean;
	onSelect: (doorId: DoorId) => void;
	onHoverChange: (hovering: boolean) => void;
}

/**
 * A door is an INVISIBLE, arch-shaped hotspot laid over a door somebody
 * painted — the button contributes no art of its own, only the hover glow
 * and the label plate.
 *
 * This inverts the old arrangement, where the button drew its own SVG archway
 * so the art and the hit region could never drift apart. With painted art
 * they can, which is what `showHotspot` is for: the region is invisible by
 * definition, so there has to be a way to see it when the art changes.
 *
 * The button sits inside the scaled stage box, so its rect is in percentages
 * of the art and it tracks the doors at every viewport size for free.
 */
export function Door({
	door,
	rect,
	lit,
	hinted,
	showHotspot,
	labelScale,
	listed,
	onSelect,
	onHoverChange,
}: DoorProps) {
	return (
		<button
			type="button"
			className={`jn-door${lit ? ' is-lit' : ''}${hinted ? ' is-hinted' : ''}`}
			style={{
				left: `${rect.left}%`,
				top: `${rect.top}%`,
				width: `${rect.width}%`,
				height: `${rect.height}%`,
			}}
			// Focus is wired alongside hover so tabbing through the doors lights
			// exactly what the pointer would — the arches are otherwise invisible
			// and a keyboard user would have no idea where they are.
			onMouseEnter={() => onHoverChange(true)}
			onMouseLeave={() => onHoverChange(false)}
			onFocus={() => onHoverChange(true)}
			onBlur={() => onHoverChange(false)}
			onClick={() => onSelect(door.id)}
			tabIndex={listed ? -1 : undefined}
			aria-hidden={listed || undefined}
			// The hint's glow is the only thing that marks the door a spent hint
			// paid for, and a glow is worth nothing to a screen reader. Say it.
			aria-label={hinted ? `${door.label} — the hint points here` : door.label}
		>
			<span className="jn-door__glow" aria-hidden="true" />
			{showHotspot && <span className="jn-door__trace" aria-hidden="true" />}

			<span
				className="jn-door__plate"
				// `bottom` is set in unscaled stage units by the stylesheet, which
				// is what keeps all three plates on one visual line even though
				// the doors are painted at slightly different heights.
				style={{
					transform: `translateX(-50%) scale(${labelScale})`,
					opacity: listed ? 0 : 1,
				}}
				aria-hidden="true"
			>
				<span className="jn-door__plate-lit" />
				<span className="jn-door__plate-text">{door.label}</span>
			</span>
		</button>
	);
}
