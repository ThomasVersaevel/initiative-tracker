import React, { forwardRef, useImperativeHandle, useRef } from "react";
import html2canvas from "html2canvas";

const StatBlockImageGenerator = forwardRef(function StatBlockImageGenerator(
	{ statBlock },
	ref,
) {
	const previewRef = useRef(null);

	useImperativeHandle(ref, () => ({
		async download() {
			if (!previewRef.current) return;

			const canvas = await html2canvas(previewRef.current, {
				backgroundColor: null,
				scale: 2,
			});
			const link = document.createElement("a");
			link.download = `${statBlock.name || "stat-block"}.png`;
			link.href = canvas.toDataURL("image/png");
			link.click();
		},
	}), [statBlock]);

	return (
		<div ref={previewRef} className={`stat-block-image ${statBlock.theme}`}>
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
				<span>HP {statBlock.hp}</span>
				<span>AC {statBlock.ac}</span>
				{statBlock.speeds.map((speed) => (
					<span key={speed.type}>{speed.type} {speed.value}</span>
				))}
			</div>

			<div className="stat-block-image-stats">
				{Object.entries(statBlock.stats).map(([stat, values]) => (
					<div key={stat}>
						<strong>{stat.toUpperCase()}</strong>
						<span>{values.value}</span>
						<small>{values.save}</small>
					</div>
				))}
			</div>

			<div className="stat-block-image-copy">
				{statBlock.traits.resistances.length > 0 && (
					<p><strong>Resistances:</strong> {statBlock.traits.resistances.join(", ")}</p>
				)}
				{statBlock.traits.senses.length > 0 && (
					<p><strong>Senses:</strong> {statBlock.traits.senses.join(", ")}</p>
				)}
				{statBlock.traits.languages.length > 0 && (
					<p><strong>Languages:</strong> {statBlock.traits.languages.join(", ")}</p>
				)}
				{statBlock.traits.challengeRating > 0 && (
					<p><strong>Challenge Rating:</strong> {statBlock.traits.challengeRating}</p>
				)}
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
						<strong>{attack.name || "Unnamed attack"}.</strong> {attack.description}
					</p>
				))}
			</div>
		</div>
	);
});

export default StatBlockImageGenerator;
