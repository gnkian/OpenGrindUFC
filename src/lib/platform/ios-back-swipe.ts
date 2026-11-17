import { isTauri } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";


const EDGE_WIDTH = 24;
const SWIPE_THRESHOLD = 80;
const HORIZONTAL_RATIO = 1.3;

export function installIosBackSwipe(): () => void {
	if (!isTauri() || platform() !== "ios") return () => {};

	let startX = 0;
	let startY = 0;
	let tracking = false;
	let horizontalSwipe = false;

	function onTouchStart(event: TouchEvent) {
		if (event.touches.length !== 1) {
			tracking = false;
			return;
		}

		const touch = event.touches[0];
		if (!touch) return;

		startX = touch.clientX;
		startY = touch.clientY;
		tracking = startX <= EDGE_WIDTH;
		horizontalSwipe = false;
	}

	function onTouchMove(event: TouchEvent) {
		if (!tracking || event.touches.length !== 1) return;

		const touch = event.touches[0];
		if (!touch) return;

		const dx = touch.clientX - startX;
		const dy = touch.clientY - startY;

		if (dx < 0 || Math.abs(dy) > dx / HORIZONTAL_RATIO) {
			if (Math.abs(dy) > 12 || dx < 0) tracking = false;
			return;
		}

		if (dx > 12) horizontalSwipe = true;

		if (horizontalSwipe && event.cancelable) {
			event.preventDefault();
		}
	}

	function onTouchEnd(event: TouchEvent) {
		if (!tracking) return;

		const touch = event.changedTouches[0];
		tracking = false;

		if (!touch || !horizontalSwipe) return;

		const dx = touch.clientX - startX;
		const dy = touch.clientY - startY;

		if (dx < SWIPE_THRESHOLD || dx < Math.abs(dy) * HORIZONTAL_RATIO) {
			return;
		}


	}


	document.addEventListener("touchstart", onTouchStart, { passive: true });
	document.addEventListener("touchmove", onTouchMove, { passive: false });
	document.addEventListener("touchend", onTouchEnd, { passive: true });

	return () => {
		document.removeEventListener("touchstart", onTouchStart);
		document.removeEventListener("touchmove", onTouchMove);
		document.removeEventListener("touchend", onTouchEnd);
	};
}
