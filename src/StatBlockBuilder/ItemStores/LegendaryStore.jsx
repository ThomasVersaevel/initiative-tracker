import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTrash } from "@fortawesome/free-solid-svg-icons";

const createAction = (id) => ({
	id,
	name: "",
	description: "",
});

const createResistance = (id) => ({
	id,
	amount: 3,
	description: "If the <name> fails a saving throw, it can choose to succeed instead.",
});

export function LegendaryStore({
	setStorePanelOpen,
	legendary,
	setLegendary,
	initialSection,
}) {
	const updateAction = (id, field, value) => {
		setLegendary((current) => ({
			...current,
			actions: current.actions.map((action) =>
				action.id === id ? { ...action, [field]: value } : action,
			),
		}));
	};

	const addAction = () => {
		setLegendary((current) => ({
			...current,
			actions: [
				...current.actions,
				createAction(
					current.actions.reduce((maxId, action) => Math.max(maxId, action.id), 0) + 1,
				),
			],
		}));
	};

	const removeAction = (id) => {
		setLegendary((current) => ({
			...current,
			actions: current.actions.filter((action) => action.id !== id),
		}));
	};

	const updateResistance = (id, field, value) => {
		setLegendary((current) => ({
			...current,
			resistances: current.resistances.map((resistance) =>
				resistance.id === id
					? {
						...resistance,
						[field]:
							field === "amount"
								? Math.min(10, Math.max(0, Number(value) || 0))
								: value,
					}
					: resistance,
			),
		}));
	};

	const addResistance = () => {
		setLegendary((current) => ({
			...current,
			resistances: [
				...current.resistances,
				createResistance(
					current.resistances.reduce(
						(maxId, resistance) => Math.max(maxId, resistance.id),
						0,
					) + 1,
				),
			],
		}));
	};

	const removeResistance = (id) => {
		setLegendary((current) => ({
			...current,
			resistances: current.resistances.filter(
				(resistance) => resistance.id !== id,
			),
		}));
	};

	const renderActions = () => (
		<section className="legendary-store-section">
			<div className="legendary-store-section-header">
				<strong>Legendary actions</strong>
				<button type="button" className="button add-button" onClick={addAction}>
					Add action
				</button>
			</div>
			{legendary.actions.map((action) => (
				<div className="attack-editor" key={action.id}>
					<div className="attack-editor-header">
						<strong>Action</strong>
						<button
							type="button"
							className="attack-remove-button"
							onClick={() => removeAction(action.id)}
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
							value={action.name}
							onChange={(event) => updateAction(action.id, "name", event.target.value)}
						/>
					</label>
					<label>
						Description
						<textarea
							rows="3"
							value={action.description}
							onChange={(event) => updateAction(action.id, "description", event.target.value)}
						/>
					</label>
				</div>
			))}
		</section>
	);

	const renderResistance = () => (
		<section className="legendary-store-section">
			<div className="legendary-store-section-header">
				<strong>Legendary resistances</strong>
				<button type="button" className="button add-button" onClick={addResistance}>
					Add resistance
				</button>
			</div>
			{legendary.resistances.map((resistance) => (
				<div className="attack-editor" key={resistance.id}>
					<div className="attack-editor-header">
						<strong>Resistance</strong>
						<button
							type="button"
							className="attack-remove-button"
							onClick={() => removeResistance(resistance.id)}
							title="Remove resistance"
							aria-label="Remove resistance"
						>
							<FontAwesomeIcon icon={faTrash} />
						</button>
					</div>
					<label>
						Amount
						<input
							type="number"
							min="0"
							max="10"
							value={resistance.amount}
							onChange={(event) =>
								updateResistance(resistance.id, "amount", event.target.value)
							}
						/>
					</label>
					<label>
						Description
						<textarea
							rows="3"
							value={resistance.description}
							onChange={(event) =>
								updateResistance(
									resistance.id,
									"description",
									event.target.value,
								)
							}
						/>
					</label>
				</div>
			))}
		</section>
	);

	const sections = initialSection === "resistance"
		? [renderResistance(), renderActions()]
		: [renderActions(), renderResistance()];

	return (
		<div>
			<div className="store-header">
				<h2>Legendary</h2>
				<button type="button" className="btn" onClick={() => setStorePanelOpen("")}>
					<FontAwesomeIcon icon={faArrowRight} />
				</button>
			</div>
			<div className="store-items legendary-store">{sections}</div>
		</div>
	);
}
