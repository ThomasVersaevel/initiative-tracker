import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faHeart,
	faShield,
} from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";
import { speedOptions } from "./TypesUtils/StoreTypes";
import {
	formatSense,
	formatSignedModifier,
	formatTraitSkill,
	getChallengeRating,
	getInitiativeModifier,
	getTraitResistanceGroups,
	formatMultiattackDescription,
	normalizeTraitSkills,
} from "./TypesUtils/Types";
import { FormattedText } from "./FormattedText";

const defaultStatLabels = {
	str: "STR",
	dex: "DEX",
	con: "CON",
	int: "INT",
	wis: "WIS",
	cha: "CHA",
};

const StatBlockImageGenerator = forwardRef(function StatBlockImageGenerator(
	{ statBlock, size },
	ref,
) {
	const previewRef = useRef(null);
	const orderedSpeeds = [...statBlock.speeds].sort((left, right) => {
		if (left.type === "walk") return -1;
		if (right.type === "walk") return 1;
		return 0;
	});

	useImperativeHandle(ref, () => ({
		async getImageDataUrl() {
			if (!previewRef.current) return;

			const canvas = await html2canvas(previewRef.current, {
				backgroundColor: null,
				scale: 2,
			});
			return canvas.toDataURL("image/png");
		},
		async download(dataUrl) {
			const imageDataUrl = dataUrl || await this.getImageDataUrl();
			if (!imageDataUrl) return;

			const link = document.createElement("a");
			link.download = `${statBlock.name || "stat-block"}.png`;
			link.href = imageDataUrl;
			link.click();
		},
	}), [statBlock]);

	return (
		<div
			ref={previewRef}
			className={`stat-block-image ${statBlock.theme}`}
			style={{
				width: `${size?.width || 600}px`,
				minHeight: `${size?.height || 700}px`,
			}}
		>
			<div className="stat-block-image-heading">
				<div className="stat-block-image-identity">
					<h1>{statBlock.name || "Unnamed Creature"}</h1>
					<div className="stat-block-image-creature-details">
						{statBlock.legendary && "Legendary "}
						{statBlock.creatureSize || "Medium"}{" "}
						{statBlock.creatureType || "Monster"}
					</div>
				</div>
				<div className="stat-block-image-basic-values">
					<span aria-label={`Hit points: ${statBlock.hp}`}>
						<FontAwesomeIcon icon={faHeart} aria-hidden="true" /> {statBlock.hp}
					</span>
					<span aria-label={`Armor class: ${statBlock.ac}`}>
						<FontAwesomeIcon icon={faShield} aria-hidden="true" /> {statBlock.ac}
					</span>
				</div>
				<div className="stat-block-image-speeds">
					{orderedSpeeds.map((speed) => (
						<span
							key={speed.type}
							aria-label={`${speed.type} speed: ${speed.value}`}
						>
							<FontAwesomeIcon
								icon={speedOptions.find((option) => option.type === speed.type)?.icon}
								aria-hidden="true"
							/>
							{speed.value}
						</span>
					))}
				</div>
				{statBlock.portrait && (
					<img src={statBlock.portrait} alt="" className="stat-block-image-portrait" />
				)}
			</div>

			<div className="stat-block-image-stats">
				{Object.entries(statBlock.stats).map(([stat, values]) => (
					<div key={stat}>
						<strong>{values.label || defaultStatLabels[stat] || stat}</strong>
						<span className="stat-block-image-score">
							<span>{values.value}</span>
							<small>{values.save}</small>
						</span>
					</div>
				))}
			</div>

			<div className="stat-block-image-copy">
				<div className="stat-block-image-traits">
					<p>
						<strong className="accent-color">Initiative:</strong>{" "}
						{formatSignedModifier(
							getInitiativeModifier(
								statBlock.traits.initiative,
								statBlock.stats.dex.value,
							),
						)}
					</p>
					{normalizeTraitSkills(statBlock.traits.skills).length > 0 && (
						<p>
							<strong className="accent-color">Skills:</strong>{" "}
							{normalizeTraitSkills(statBlock.traits.skills).map(formatTraitSkill).join(", ")}
						</p>
					)}
					{getTraitResistanceGroups(statBlock.traits.resistances).map(
						({ relation, label, damageTypes }) => (
							<p key={relation}>
								<strong className="accent-color">{label}:</strong>{" "}
								{damageTypes.join(", ")}
							</p>
						),
					)}
					{statBlock.traits.senses.length > 0 && (
					<p><strong className="accent-color">Senses:</strong> {statBlock.traits.senses.map(formatSense).join(", ")}</p>
					)}
					{statBlock.traits.languages.length > 0 && (
					<p><strong className="accent-color">Languages:</strong> {statBlock.traits.languages.join(", ")}</p>
					)}
					<p>
					<strong className="accent-color">Challenge Rating:</strong>{" "}
					<span className="challenge-rating-value">
						{getChallengeRating(statBlock.traits.challengeRating).label}
					</span>{" "}
					<span className="challenge-rating-meta">
						(XP {getChallengeRating(statBlock.traits.challengeRating).xp}; PB{" "}
						{getChallengeRating(statBlock.traits.challengeRating).proficiencyBonus})
					</span>
					</p>
				</div>

				{(statBlock.abilities.abilities.length > 0 || statBlock.legendary) && <div className="stat-block-image-abilities">
					<h2>Abilities</h2>
					{statBlock.legendary && statBlock.legendaryDetails.resistances.map((resistance) => (
						<p key={resistance.id}>
							<strong className="accent-color">Legendary Resistance</strong>; <strong>{resistance.amount}/day</strong>{" "}
							<FormattedText
								text={resistance.description}
								name={statBlock.name}
								amount={resistance.amount}
							/>
						</p>
					))}
						{statBlock.abilities.abilities.map((ability) => (
						<p key={ability.id}>
							<strong className="accent-color">{ability.name || "Unnamed ability"}.</strong>{" "}
							<FormattedText text={ability.description} name={statBlock.name} />
						</p>
					))}
				</div>}

				{(statBlock.attacks.multiattack.enabled || statBlock.attacks.attacks.length > 0) && <div className="stat-block-image-actions">
				{(statBlock.attacks.multiattack.enabled || statBlock.attacks.attacks.length > 0) && <h2>Actions</h2>}
				{statBlock.attacks.multiattack.enabled && (
						<p>
							<strong className="accent-color">Multiattack.</strong>{" "}
							{formatMultiattackDescription(
								statBlock.attacks.multiattack.description,
								statBlock.name,
								statBlock.attacks.multiattack.count,
							)}
						</p>
					)}
				{statBlock.attacks.attacks.map((attack) => (
					<p key={attack.id}>
						<strong className="accent-color">{attack.name || "Unnamed action"}.</strong>{" "}
						<FormattedText text={attack.description} name={statBlock.name} />
					</p>
				))}
				</div>}
				{statBlock.bonusActions.length > 0 && <div className="stat-block-image-bonus-actions">
				{statBlock.bonusActions.length > 0 && <h2>Bonus Actions</h2>}
				{statBlock.bonusActions.map((action) => (
					<p key={action.id}>
						<strong className="accent-color"><em>{action.name || "Unnamed bonus action"}.</em></strong>{" "}
						<FormattedText text={action.description} name={statBlock.name} />
					</p>
				))}
				</div>}
				{statBlock.reactions.length > 0 && <div className="stat-block-image-reactions">
				{statBlock.reactions.length > 0 && <h2>Reactions</h2>}
				{statBlock.reactions.map((reaction) => (
					<p key={reaction.id}>
						<strong className="accent-color"><em>{reaction.name || "Unnamed reaction"}.</em></strong>{" "}
						<FormattedText text={reaction.description} name={statBlock.name} />
					</p>
				))}
				</div>}
				{statBlock.legendary && statBlock.legendaryDetails.actions.length > 0 && (
					<div className="stat-block-image-legendary-actions">
						<div className="stat-block-section-heading">
							<h2>Legendary Actions</h2>
							<small>{statBlock.legendaryDetails.uses} per round</small>
						</div>
						{statBlock.legendaryDetails.actions.map((action) => (
							<p key={action.id}>
								<strong className="accent-color"><em>{action.name || "Unnamed action"}.</em></strong>{" "}
								<FormattedText text={action.description} name={statBlock.name} />
							</p>
						))}
					</div>
				)}
				{statBlock.lair && statBlock.lairDetails.actions.length > 0 && (
					<div className="stat-block-image-lair-actions">
						<div className="stat-block-section-heading">
							<h2>Lair Actions</h2>
							<small>{statBlock.lairDetails.uses} per round</small>
						</div>
						{statBlock.lairDetails.actions.map((action) => (
							<p key={action.id}>
								<strong className="accent-color"><em>{action.name || "Unnamed action"}.</em></strong>{" "}
								<FormattedText text={action.description} name={statBlock.name} />
							</p>
						))}
					</div>
				)}
				{(String(statBlock.tactics ?? "").trim() ||
					String(statBlock.inventory ?? "").trim()) && (
					<div className="stat-block-image-tactics-inventory">
						<div className="stat-block-image-inventory">
							<h2>Tactics</h2>
							<p className="stat-block-image-inventory-text">{statBlock.tactics}</p>
						</div>
						<div className="stat-block-image-inventory">
							<h2>Inventory</h2>
							<p className="stat-block-image-inventory-text">{statBlock.inventory}</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
});

export default StatBlockImageGenerator;
