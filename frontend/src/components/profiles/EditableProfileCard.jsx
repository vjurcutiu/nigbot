import React, { useState } from "react";
import { Button } from "../ui/Button";

/**
 * Generic, self‑contained “view ↔ edit” card component.
 * Works for Company, Candidate, Job or any other entity.
 *
 * Props
 * -----
 * title        – section headline
 * initialData  – object with all current field values
 * fields       – array of { name, label, type?, options? }
 * onSave(diff) – async fn called with object containing only changed keys
 * editable     – if false, component is permanently read‑only
 *
 * Example field descriptor:
 *   { name: "industry", label: "Industry", type: "select",
 *     options: ["IT", "Finance", "Retail"] }
 */
export default function EditableProfileCard({
  title,
  initialData,
  fields,
  onSave,
  editable = true,
}) {
  console.log("EditableProfileCard: editable prop =", editable);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (name, val) =>
    setValues((v) => ({ ...v, [name]: val }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const diff = Object.fromEntries(
        Object.entries(values).filter(([k, v]) => v !== initialData[k])
      );
      if (Object.keys(diff).length) {
        await onSave(diff, values);
      }
      setEditing(false);
    } catch (e) {
      console.error('Error saving profile:', e);
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValues(initialData);
    setEditing(false);
  };

  const renderField = ({ name, label, type = "text", options = [] }) => {
    const value = values[name] ?? "";
    if (!editing) {
      return (
        <li key={name}>
          <strong>{label}:</strong>{" "}
          {type === "date" && value
            ? new Date(value).toLocaleDateString()
            : value || "—"}
        </li>
      );
    }

    // Edit mode
    let input;
    switch (type) {
      case "textarea":
        input = (
          <textarea
            className="border p-1 rounded w-full"
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        );
        break;
      case "select":
        input = (
          <select
            className="border p-1 rounded"
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
          >
            <option value="">— select —</option>
            {options.map((opt) => (
              <option value={opt} key={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
        break;
      case "date":
        input = (
          <input
            type="date"
            className="border p-1 rounded"
            value={value?.slice?.(0, 10) || ""}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        );
        break;
      default:
        input = (
          <input
            type={type}
            className="border p-1 rounded"
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        );
    }

    return (
      <li key={name} className="flex flex-col gap-1">
        <label className="font-medium">{label}</label>
        {input}
      </li>
    );
  };

  return (
    <section className="mb-6">
      <div className="flex items-center gap-4 mb-2">
        <h2 className="text-lg font-medium">{title}</h2>
        {editable && !editing && (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      <ul className="space-y-2">{fields.map(renderField)}</ul>

      {error && <div className="text-red-600 mt-2">{error}</div>}

      {editing && (
        <div className="mt-4 flex gap-2">
          <Button variant="default" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      )}
    </section>
  );
}
