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
	getChallengeRating,
} from "./TypesUtils/Types";
import { FormattedText } from "./FormattedText";

const StatBlockImageGenerator = forwardRef(function StatBlockImageGenerator(
	{ statBlock, size },
	ref,
) {
	const previewRef = useRef(null);

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
				<div>
					<h1>{statBlock.name || "Unnamed Creature"}</h1>
					{statBlock.legendary && <em>Legendary</em>}
				</div>
				{statBlock.portrait && (
					<img src={statBlock.portrait} alt="" className="stat-block-image-portrait" />
				)}
			</div>

			<div className="stat-block-image-basics">
				<span>
					<FontAwesomeIcon icon={faHeart} aria-hidden="true" /> HP {statBlock.hp}
				</span>
				<span>
					<FontAwesomeIcon icon={faShield} aria-hidden="true" /> AC {statBlock.ac}
				</span>
				{statBlock.speeds.map((speed) => (
					<span key={speed.type}>
						<FontAwesomeIcon
							icon={speedOptions.find((option) => option.type === speed.type)?.icon}
							aria-hidden="true"
						/>{" "}
						{speed.type} {speed.value}
					</span>
				))}
			</div>

			<div className="stat-block-image-stats">
				{Object.entries(statBlock.stats).map(([stat, values]) => (
					<div key={stat}>
						<strong>{values.label || ""}</strong>
						<span>{values.value}</span>
						<small>{values.save}</small>
					</div>
				))}
			</div>

			<div className="stat-block-image-copy">
				<div className="stat-block-image-traits">
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
					{statBlock.traits.resistances.length > 0 && (
					<p><strong>Resistances:</strong> {statBlock.traits.resistances.join(", ")}</p>
					)}
					{statBlock.traits.senses.length > 0 && (
					<p><strong>Senses:</strong> {statBlock.traits.senses.map(formatSense).join(", ")}</p>
					)}
					{statBlock.traits.languages.length > 0 && (
					<p><strong>Languages:</strong> {statBlock.traits.languages.join(", ")}</p>
					)}
					<p>
					<strong>Challenge Rating:</strong>{" "}
					<span className="challenge-rating-value">
						{getChallengeRating(statBlock.traits.challengeRating).label}
					</span>{" "}
					<span className="challenge-rating-meta">
						(XP {getChallengeRating(statBlock.traits.challengeRating).xp}; PB{" "}
						{getChallengeRating(statBlock.traits.challengeRating).proficiencyBonus})
					</span>
					</p>
				</div>

				<div className="stat-block-image-abilities">
						{statBlock.abilities.abilities.map((ability) => (
						<p key={ability.id}>
							<strong>{ability.name || "Unnamed ability"}.</strong>{" "}
							<FormattedText text={ability.description} name={statBlock.name} />
						</p>
					))}
				</div>

				<div className="stat-block-image-attacks">
				{statBlock.attacks.multiattack.enabled &&
					statBlock.attacks.multiattack.attacks.length > 0 && (
						<p>
							<strong>Multiattack.</strong> The {statBlock.name || "creature"} makes{" "}
							{statBlock.attacks.multiattack.attacks.map((selection) => {
								const attack = statBlock.attacks.attacks.find(
									(item) => item.id === selection.attackId,
								);
								return `${selection.count} ${attack?.name || "unnamed attack"} attack${selection.count === 1 ? "" : "s"}`;
							}).join(" or ")}. 
						</p>
					)}
				{statBlock.attacks.attacks.map((attack) => (
					<p key={attack.id}>
						<strong>{attack.name || "Unnamed attack"}.</strong>{" "}
						<FormattedText text={attack.description} name={statBlock.name} />
					</p>
				))}
				{statBlock.legendary && (
					<div className="stat-block-image-legendary-actions">
						<h2>Legendary Actions</h2>
						{statBlock.legendaryDetails.actions.map((action) => (
							<p key={action.id}>
								<strong><em>{action.name || "Unnamed action"}.</em></strong>{" "}
								<FormattedText text={action.description} name={statBlock.name} />
							</p>
						))}
					</div>
				)}
				</div>
			</div>
		</div>
	);
});

export default StatBlockImageGenerator;
