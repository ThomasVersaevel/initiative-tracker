import { fireEvent, render, screen } from "@testing-library/react";
import { GridRow } from "./GridRow";

describe("GridRow HP adjustment", () => {
  test("adds signed HP from the last committed value instead of the typed input", () => {
    render(
      <GridRow
        columnSizes="1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr"
        id={1}
        initialValues={{
          initiative: 0,
          charactername: "",
          legendary: false,
          group: false,
          speed: "",
          hp: 10,
          hpGroup: [0, 0, 0, 0],
          ac: "",
          spell: "",
          condition: "",
          timer: 0,
          isGroup: false,
        }}
        updateValues={jest.fn()}
        onDeleteRow={jest.fn()}
        highlighted={false}
        theme="default"
        showSpeed={false}
        showSpellSave={false}
        showCondition={false}
        rowIndex={0}
        savedCharacterStats={{}}
        onSaveCharacter={jest.fn()}
      />,
    );

    const hpInput = screen.getByDisplayValue("10");

    fireEvent.change(hpInput, { target: { value: "+5" } });
    fireEvent.blur(hpInput);

    expect(screen.getByDisplayValue("15")).toBeInTheDocument();
  });
});
