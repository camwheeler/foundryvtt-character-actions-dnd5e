import CONSTANTS from "./constants";
import { ItemTypeSortValues, MyFlags, MySettings } from "./dnd5eCharacterActions-model";
import { addFavoriteControls } from "./handleFavoriteControls";
import { error, isItemFavorite, log, warn } from "./lib/lib";

const API = {
	// async executeActionArr(...inAttributes) {
	// 	if (!Array.isArray(inAttributes)) {
	// 		throw error("executeActionArr | inAttributes must be of type array");
	// 	}
	// 	let [options] = inAttributes;
	// 	options = {
	// 		...options,
	// 		fromSocket: true,
	// 	};
	// 	this.executeAction(options);
	// },

	getActorActionsData(actor: Actor5e) {
		const filteredItems = actor.items
			.filter((i: Item5e) => {
				return this.isItemInActionList(i);
			})
			.sort((a: Item5e, b: Item5e) => {
				if (a.type !== b.type) {
					return ItemTypeSortValues[a.type] - ItemTypeSortValues[b.type];
				}

				if (a.type === "spell" && b.type === "spell") {
					return a.system.level - b.system.level;
				}

				return (a.sort || 0) - (b.sort || 0);
			})
			.map((item: Item5e) => {
				if (item.labels) {
					//ts-expect-error
					item.labels.type = game.i18n.localize(`ITEM.Type${item.type.titleCase()}`);
				}

				// removes any in-formula flavor text from the formula in the label
				//ts-expect-error
				if (item.labels?.derivedDamage?.length) {
					//ts-expect-error
					item.labels.derivedDamage = item.labels.derivedDamage.map(({ formula, ...rest }) => ({
						formula: formula?.replace(/\[.+?\]/, "") || "0",
						...rest,
					}));
				}

				return item;
			});

		const actionsData: Record<
			"action" | "bonus" | "crew" | "lair" | "legendary" | "reaction" | "other",
			Set<Item5e>
		> = filteredItems.reduce(
			(acc, item: Item5e) => {
				try {
					log(`digesting item ${item}`);
					if (["backpack", "tool"].includes(item.type)) {
						return acc;
					}

					//@ts-ignore
					const activationType = this.getActivationType(item.system.activation?.type);

					acc[activationType].add(item);

					return acc;
				} catch (e) {
					error(`error trying to digest item ${item.name} ${e}`);
					return acc;
				}
			},
			{
				action: new Set<Item5e>(),
				bonus: new Set<Item5e>(),
				crew: new Set<Item5e>(),
				lair: new Set<Item5e>(),
				legendary: new Set<Item5e>(),
				reaction: new Set<Item5e>(),
				other: new Set<Item5e>(),
			}
		);

		return actionsData;
	},

	getActivationType(activationType?: string) {
		// DND5e.AbilityActivationType
		switch (activationType) {
			case "action":
			case "bonus":
			case "crew":
			case "lair":
			case "legendary":
			case "reaction": {
				return activationType;
			}
			default: {
				return "other";
			}
		}
	},

	isActiveItem(activationType?: string) {
		if (!activationType) {
			return false;
		}
		if (["minute", "hour", "day", "none"].includes(activationType)) {
			return false;
		}
		return true;
	},

	isItemInActionList(item: Item5e) {
		// log(false, 'filtering item', {
		//   item,
		// });

		// check our override
		const override = item.getFlag(CONSTANTS.MODULE_ID, MyFlags.filterOverride) as boolean | undefined;

		if (override !== undefined) {
			return override;
		}

		// check the old flags
		//@ts-ignore
		const isFavourite = isItemFavorite(item);
		if (isFavourite) {
			return true;
		}

		// perform normal filtering logic
		switch (item.type) {
			case "weapon": {
				return item.system.equipped;
			}
			case "equipment": {
				return item.system.equipped && this.isActiveItem(item.system.activation?.type);
			}
			case "consumable": {
				return (
					!!game.settings.get(CONSTANTS.MODULE_ID, MySettings.includeConsumables) &&
					this.isActiveItem(item.system.activation?.type)
				);
			}
			case "spell": {
				const limitToCantrips = game.settings.get(CONSTANTS.MODULE_ID, MySettings.limitActionsToCantrips);

				// only exclude spells which need to be prepared but aren't
				const notPrepared = item.system.preparation?.mode === "prepared" && !item.system.preparation?.prepared;

				const isCantrip = item.system.level === 0;

				if (!isCantrip && (limitToCantrips || notPrepared)) {
					return false;
				}

				const isReaction = item.system.activation?.type === "reaction";
				const isBonusAction = item.system.activation?.type === "bonus";

				//ASSUMPTION: If the spell causes damage, it will have damageParts
				const isDamageDealer = item.system.damage?.parts?.length > 0;

				let shouldInclude = isReaction || isBonusAction || isDamageDealer;

				if (game.settings.get(CONSTANTS.MODULE_ID, MySettings.includeOneMinuteSpells)) {
					const isOneMinuter =
						item.system?.duration?.units === "minute" && item.system?.duration?.value === 1;
					const isOneRounder = item.system?.duration?.units === "round" && item.system?.duration?.value === 1;

					shouldInclude = shouldInclude || isOneMinuter || isOneRounder;
				}

				if (game.settings.get(CONSTANTS.MODULE_ID, MySettings.includeSpellsWithEffects)) {
					const hasEffects = !!item.effects.size;
					shouldInclude = shouldInclude || hasEffects;
				}

				return shouldInclude;
			}
			case "feat": {
				return !!item.system.activation?.type;
			}
			default: {
				return false;
			}
		}
	},

	/**
	 * Renders the html of the actions list for the provided actor data
	 */
	async renderActionsList(
		actorData: Actor5e,
		options?: {
			rollIcon?: string;
		}
	) {
		const actionData = this.getActorActionsData(actorData);

		log(`renderActionsList ${actorData} ${actionData}`);

		return renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/actor-actions-list.hbs`, {
			actionData,
			//@ts-ignore
			abilities: game.dnd5e.config.abilityAbbreviations,
			activationTypes: {
				//@ts-ignore
				...game.dnd5e.config.abilityActivationTypes,
				other: game.i18n.localize(`DND5E.ActionOther`),
			},
			//@ts-ignore
			damageTypes: { ...game.dnd5e.config.damageTypes, ...game.dnd5e.config.healingTypes },
			damageTypeIconMap: this.damageTypeIconMap,
			rollIcon: options?.rollIcon,
			isOwner: actorData.isOwner,
		});
	},

    toggleItemAction(actor:string, item:Item):void {
        if (!item) {
            warn(`No item is passed`, true);
            return;
        }
        if (!actor) {
            warn(`No actor is passed`, true);
            return;
        }

        //@ts-ignore
        const relevantItem = actor.items.get(item.id);

        if (!relevantItem) {
            warn(`No relevant item is found on the actor`);
            return;
        }

        const currentFilter = API.isItemInActionList(relevantItem);

        // set the flag to be the opposite of what it is now
        relevantItem.setFlag(CONSTANTS.MODULE_ID, MyFlags.filterOverride, !currentFilter);
    },

	damageTypeIconMap: {
		acid: '<i class="fas fa-hand-holding-water"></i>',
		bludgeoning: '<i class="fas fa-gavel"></i>',
		cold: '<i class="fas fa-snowflake"></i>',
		fire: '<i class="fas fa-fire-alt"></i>',
		force: '<i class="fas fa-hat-wizard"></i>',
		lightning: '<i class="fas fa-bolt"></i>',
		necrotic: '<i class="fas fa-skull"></i>',
		piercing: '<i class="fas fa-thumbtack"></i>',
		poison: '<i class="fas fa-skull-crossbones"></i>',
		psychic: '<i class="fas fa-brain"></i>',
		radiant: '<i class="fas fa-sun"></i>',
		slashing: '<i class="fas fa-cut"></i>',
		thunder: '<i class="fas fa-wind"></i>',
		healing: '<i class="fas fa-heart"></i>',
		temphp: '<i class="fas fa-shield-alt"></i>',
	}
};
export default API;
