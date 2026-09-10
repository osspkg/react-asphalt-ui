import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { Button, Modal } from "./components";
import { Combobox, DatePicker, FileUpload, UIProvider } from "./advanced";

it("disables a loading button", () => {
  render(<Button loading>Save</Button>);
  expect((screen.getByRole("button", { name: "Save" }) as HTMLButtonElement).disabled).toBe(true);
});

it("selects a combobox option with keyboard", async () => {
  const user = userEvent.setup();
  let value: string | null = null;
  render(
    <Combobox
      label="Project"
      value={value}
      onValueChange={(next) => {
        value = next;
      }}
      items={[{ value: "atlas", label: "Atlas" }]}
    />,
  );
  await user.click(screen.getByRole("combobox"));
  await user.keyboard("{Enter}");
  expect(value).toBe("atlas");
});

it("renders a localized date picker", () => {
  render(
    <UIProvider locale="ru-RU">
      <DatePicker label="Date" value={null} onValueChange={() => {}} />
    </UIProvider>,
  );
  expect(screen.getByText(/январ|феврал|март|апрел|май|июн|июл|август|сентябр|октябр|ноябр|декабр/i)).not.toBeNull();
});

it("accepts dropped files", async () => {
  const user = userEvent.setup();
  let files: unknown[] = [];
  render(
    <FileUpload
      files={[]}
      onFilesChange={(next) => {
        files = next;
      }}
    />,
  );
  await user.upload(screen.getByLabelText("Choose files"), new File(["x"], "note.txt", { type: "text/plain" }));
  expect(files).toHaveLength(1);
});

it("locks scrolling and restores focus after a modal closes", async () => {
  const user = userEvent.setup();
  const opener = document.createElement("button");
  document.body.append(opener);
  opener.focus();
  let closed = 0;
  const view = render(
    <Modal
      title="Confirm"
      onClose={() => {
        closed += 1;
      }}
    >
      <Button>Continue</Button>
    </Modal>,
  );
  expect(document.body.style.overflow).toBe("hidden");
  await user.keyboard("{Escape}");
  expect(closed).toBe(1);
  view.unmount();
  expect(document.body.style.overflow).toBe("");
  expect(document.activeElement).toBe(opener);
  opener.remove();
});
