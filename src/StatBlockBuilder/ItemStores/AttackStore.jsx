import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTrash } from "@fortawesome/free-solid-svg-icons";

const createAttack = (id) => ({
	id,
	name: "",
	description: "",
});

export function AttackStore({
	setStorePanelOpen,
	attacks,
	setAttacks,
}) {
	const updateAttack = (id, field, value) => {
		setAttacks((current) => ({
			...current,
			attacks: current.attacks.map((attack) =>
				attack.id === id ? { ...attack, [field]: value } : attack,
			),
		}));
	};

	const addAttack = () => {
		setAttacks((current) => ({
			...current,
			attacks: [
				...current.attacks,
				createAttack(
					current.attacks.reduce((maxId, attack) => Math.max(maxId, attack.id), 0) + 1,
				),
			],
		}));
	};

	const removeAttack = (id) => {
		setAttacks((current) => ({
			...current,
			attacks: current.attacks.filter((attack) => attack.id !== id),
			multiattack: {
				...current.multiattack,
				attacks: current.multiattack.attacks.filter(
					(selection) => selection.attackId !== id,
				),
			},
		}));
	};

	const toggleMultiattack = (event) => {
		setAttacks((current) => ({
			...current,
			multiattack: {
				...current.multiattack,
				enabled: event.target.checked,
			},
		}));
	};

	const toggleMultiattackAttack = (attackId) => {
		setAttacks((current) => {
			const selected = current.multiattack.attacks.some(
				(attack) => attack.attackId === attackId,
			);
			return {
				...current,
				multiattack: {
					...current.multiattack,
					attacks: selected
						? current.multiattack.attacks.filter(
								(attack) => attack.attackId !== attackId,
							)
						: [
								...current.multiattack.attacks,
								{ attackId, count: 1 },
							],
				},
			};
		});
	};

	const updateMultiattackCount = (attackId, count) => {
		setAttacks((current) => ({
			...current,
			multiattack: {
				...current.multiattack,
				attacks: current.multiattack.attacks.map((attack) =>
					attack.attackId === attackId
						? { ...attack, count: Math.max(1, Number(count) || 1) }
						: attack,
				),
			},
		}));
	};

	return (
		<div>
			<div className="store-header">
				<h2>Attacks</h2>
				<button
					type="button"
					className="btn"
					onClick={() => setStorePanelOpen("")}
				>
					<FontAwesomeIcon icon={faArrowRight} />
				</button>
			</div>

			<div className="store-items attack-store">
				<label className="multiattack-toggle">
					<input
						type="checkbox"
						checked={attacks.multiattack.enabled}
						onChange={toggleMultiattack}
					/>
					<span>Multiattack</span>
				</label>

				{attacks.multiattack.enabled && (
					<div className="multiattack-options">
						<strong>Included attacks</strong>
						{attacks.attacks.length === 0 && (
							<span className="store-muted">Add an attack below first.</span>
						)}
						{attacks.attacks.map((attack) => {
							const selection = attacks.multiattack.attacks.find(
								(item) => item.attackId === attack.id,
							);
							return (
								<label key={attack.id} className="multiattack-option">
									<input
										type="checkbox"
										checked={Boolean(selection)}
										onChange={() => toggleMultiattackAttack(attack.id)}
									/>
									<span>{attack.name || "Unnamed"}</span>
									{selection && (
										<input
											className="multiattack-count"
											type="number"
											min="1"
											value={selection.count}
											onChange={(event) =>
												updateMultiattackCount(attack.id, event.target.value)
											}
											aria-label={`Number of ${attack.name || "attack"} attacks`}
										/>
									)}
								</label>
							);
						})}
					</div>
				)}

				<button type="button" className="button add-button" onClick={addAttack}>
					Add attack
				</button>

				{attacks.attacks.map((attack) => (
					<div className="attack-editor" key={attack.id}>
						<div className="attack-editor-header">
							<strong>Attack</strong>
							<button
								type="button"
								className="attack-remove-button"
								onClick={() => removeAttack(attack.id)}
								title="Remove attack"
								aria-label="Remove attack"
							>
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</div>
						<label>
							Name
							<input
								type="text"
								value={attack.name}
								onChange={(event) =>
									updateAttack(attack.id, "name", event.target.value)
								}
							/>
						</label>
						<label>
							Description
							<textarea
								rows="3"
								value={attack.description}
								onChange={(event) =>
									updateAttack(attack.id, "description", event.target.value)
								}
							/>
						</label>
					</div>
				))}
			</div>
		</div>
	);
}
