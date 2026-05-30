export interface ObservationType {
  name: string;
  category: string;
  units: string[];
  placeholder?: string;
}

export const OBSERVATION_TYPES: ObservationType[] = [
  {
    name: "Blood Pressure",
    category: "Cardiovascular",
    units: ["mmHg"],
    placeholder: "e.g. 120/80",
  },
  {
    name: "Heart Rate",
    category: "Cardiovascular",
    units: ["bpm"],
    placeholder: "e.g. 72",
  },
  {
    name: "Blood Sugar",
    category: "Metabolic",
    units: ["mg/dL", "mmol/L"],
    placeholder: "e.g. 95",
  },
  {
    name: "Weight",
    category: "Body",
    units: ["kg", "lb"],
    placeholder: "e.g. 70",
  },
  {
    name: "Body Temperature",
    category: "Vitals",
    units: ["°C", "°F"],
    placeholder: "e.g. 37.0",
  },
  {
    name: "Oxygen Saturation",
    category: "Vitals",
    units: ["%"],
    placeholder: "e.g. 98",
  },
];

// "in add your [name], select the category if not the system will auto select"
// -> look up the type by name to get its category automatically.
export function categoryForName(name: string): string {
  return (
    OBSERVATION_TYPES.find((t) => t.name === name)?.category ?? "Uncategorized"
  );
}

export function typeByName(name: string): ObservationType | undefined {
  return OBSERVATION_TYPES.find((t) => t.name === name);
}

// All distinct categories, for the "view records" filter dropdown.
export function allCategories(): string[] {
  return [...new Set(OBSERVATION_TYPES.map((t) => t.category))];
}
