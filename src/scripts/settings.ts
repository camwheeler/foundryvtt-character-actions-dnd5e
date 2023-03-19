import CONSTANTS from "./constants";
import { MySettings } from "./dnd5eCharacterActions-model";

export const registerSettings = function () {
	// Register any custom module settings here
	game.settings.register(CONSTANTS.MODULE_ID, MySettings.limitActionsToCantrips, {
		name: `${CONSTANTS.MODULE_ID}.settings.limitActionsToCantrips.Label`,
		default: false,
		type: Boolean,
		scope: "client",
		config: true,
		hint: `${CONSTANTS.MODULE_ID}.settings.limitActionsToCantrips.Hint`,
	});

	game.settings.register(CONSTANTS.MODULE_ID, MySettings.includeOneMinuteSpells, {
		name: `${CONSTANTS.MODULE_ID}.settings.includeOneMinuteSpells.Label`,
		default: true,
		type: Boolean,
		scope: "client",
		config: true,
		hint: `${CONSTANTS.MODULE_ID}.settings.includeOneMinuteSpells.Hint`,
	});

	game.settings.register(CONSTANTS.MODULE_ID, MySettings.includeSpellsWithEffects, {
		name: `${CONSTANTS.MODULE_ID}.settings.includeSpellsWithEffects.Label`,
		default: true,
		type: Boolean,
		scope: "client",
		config: true,
		hint: `${CONSTANTS.MODULE_ID}.settings.includeSpellsWithEffects.Hint`,
	});

	game.settings.register(CONSTANTS.MODULE_ID, MySettings.includeConsumables, {
		name: `${CONSTANTS.MODULE_ID}.settings.includeConsumables.Label`,
		default: true,
		type: Boolean,
		scope: "client",
		config: true,
		hint: `${CONSTANTS.MODULE_ID}.settings.includeConsumables.Hint`,
	});

	game.settings.register(CONSTANTS.MODULE_ID, MySettings.injectCharacters, {
		name: `${CONSTANTS.MODULE_ID}.settings.injectCharacters.Label`,
		default: true,
		type: Boolean,
		scope: "client",
		config: true,
		hint: `${CONSTANTS.MODULE_ID}.settings.injectCharacters.Hint`,
	});

	game.settings.register(CONSTANTS.MODULE_ID, MySettings.injectNPCs, {
		name: `${CONSTANTS.MODULE_ID}.settings.injectNPCs.Label`,
		default: true,
		type: Boolean,
		scope: "world",
		config: true,
		hint: `${CONSTANTS.MODULE_ID}.settings.injectNPCs.Hint`,
	});

	game.settings.register(CONSTANTS.MODULE_ID, MySettings.injectVehicles, {
		name: `${CONSTANTS.MODULE_ID}.settings.injectVehicles.Label`,
		default: true,
		type: Boolean,
		scope: "world",
		config: true,
		hint: `${CONSTANTS.MODULE_ID}.settings.injectVehicles.Hint`,
	});
};
