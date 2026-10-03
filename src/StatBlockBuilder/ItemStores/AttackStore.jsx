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

	const updateMultiattackTotal = (count) => {
		setAttacks((current) => ({
			...current,
			multiattack: {
				...current.multiattack,
				count: Math.max(0, Number(count) || 0),
			},
		}));
	};

	const updateMultiattackDescription = (description) => {
		setAttacks((current) => ({
			...current,
			multiattack: {
				...current.multiattack,
				description,
			},
		}));
	};

	return (
		<div>
			<div className="store-header">
				<h2>Actions</h2>
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
						<label className="multiattack-total">
							<span>Total attacks</span>
							<input
								className="multiattack-total-input"
								type="number"
								min="0"
								onWheel={(event) => event.currentTarget.blur()}
								value={attacks.multiattack.count}
								onChange={(event) =>
									updateMultiattackTotal(event.target.value)
								}
							/>
						</label>
						<label>
							Multiattack description
							<textarea
								rows="3"
								value={attacks.multiattack.description}
								onChange={(event) =>
									updateMultiattackDescription(event.target.value)
								}
							/>
						</label>
					</div>
				)}

				<button type="button" className="button add-button" onClick={addAttack}>
					Add action
				</button>

				{attacks.attacks.map((attack) => (
					<div className="attack-editor" key={attack.id}>
						<div className="attack-editor-header">
							<strong>Action</strong>
						<button
							type="button"
							className="attack-remove-button"
							onClick={() => removeAttack(attack.id)}
								title="Remove action"
								aria-label="Remove action"
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
