// ================================
// Logger utility
// ================================

import CONSTANTS from "../constants";

// export let debugEnabled = 0;
// 0 = none, warnings = 1, debug = 2, all = 3

export function debug(msg, args = "") {
	if (game.settings.get(CONSTANTS.MODULE_ID, "debug")) {
		console.log(`DEBUG | ${CONSTANTS.MODULE_ID} | ${msg}`, args);
	}
	return msg;
}

export function log(message) {
	message = `${CONSTANTS.MODULE_ID} | ${message}`;
	console.log(message.replace("<br>", "\n"));
	return message;
}

export function notify(message) {
	message = `${CONSTANTS.MODULE_ID} | ${message}`;
	ui.notifications?.notify(message);
	console.log(message.replace("<br>", "\n"));
	return message;
}

export function info(info, notify = false) {
	info = `${CONSTANTS.MODULE_ID} | ${info}`;
	if (notify) ui.notifications?.info(info);
	console.log(info.replace("<br>", "\n"));
	return info;
}

export function warn(warning, notify = false) {
	warning = `${CONSTANTS.MODULE_ID} | ${warning}`;
	if (notify) ui.notifications?.warn(warning);
	console.warn(warning.replace("<br>", "\n"));
	return warning;
}

export function error(error, notify = true) {
	error = `${CONSTANTS.MODULE_ID} | ${error}`;
	if (notify) ui.notifications?.error(error);
	return new Error(error.replace("<br>", "\n"));
}

export function timelog(message): void {
	warn(Date.now(), message);
}

export const i18n = (key: string): string => {
	return game.i18n.localize(key)?.trim();
};

export const i18nFormat = (key: string, data = {}): string => {
	return game.i18n.format(key, data)?.trim();
};

// export const setDebugLevel = (debugText: string): void => {
//   debugEnabled = { none: 0, warn: 1, debug: 2, all: 3 }[debugText] || 0;
//   // 0 = none, warnings = 1, debug = 2, all = 3
//   if (debugEnabled >= 3) CONFIG.debug.hooks = true;
// };

export function dialogWarning(message, icon = "fas fa-exclamation-triangle") {
	return `<p class="${CONSTANTS.MODULE_ID}-dialog">
        <i style="font-size:3rem;" class="${icon}"></i><br><br>
        <strong style="font-size:1.2rem;">${CONSTANTS.MODULE_ID}</strong>
        <br><br>${message}
    </p>`;
}

// =========================================================================================

export const isItemFavorite = function (item): Boolean {
	if (!item) {
		return false;
	}
	let isFav =
		(game.modules.get("favtab")?.active && item.flags["favtab"]?.isFavorite) ||
		(game.modules.get("favorite-items")?.active && item.flags["favorite-items"]?.favorite) ||
		item.flags[CONSTANTS.MODULE_ID]?.favorite ||
		false;

	const isAlreadyTidyFav = getProperty(item.flags[CONSTANTS.MODULE_ID], `favorite`);
	// for retrocompatibility
	const isAlreadyFabTab = getProperty(item.flags["favtab"], `isFavorite`);
	if (String(isAlreadyFabTab) === "true" && String(isAlreadyFabTab) === "false") {
		if (String(isAlreadyTidyFav) !== "true" && String(isAlreadyTidyFav) !== "false") {
			isFav = item.flags["favtab"]?.isFavorite; // for retrocompatibility
		}
	}

	// if(String(isAlreadyTidyFav) !== "true" && String(isAlreadyTidyFav) !== "false") {
	// //   item.setFlag(CONSTANTS.MODULE_ID,"favorite",isFav);
	// }

	return isFav;
};
