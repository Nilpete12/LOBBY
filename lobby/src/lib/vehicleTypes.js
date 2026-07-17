export const VEHICLE_TYPES = [
  { id: 'hatchback', label: 'Hatchback' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv', label: 'SUV' },
  { id: 'two_wheeler', label: 'Two Wheeler' },
];

const VEHICLE_TYPE_BY_ID = new Map(VEHICLE_TYPES.map((type) => [type.id, type]));

const VEHICLE_TYPE_ALIASES = new Map([
  ['hatchback', 'hatchback'],
  ['hatchbacks', 'hatchback'],
  ['sedan', 'sedan'],
  ['sedans', 'sedan'],
  ['suv', 'suv'],
  ['suvs', 'suv'],
  ['two wheeler', 'two_wheeler'],
  ['two wheelers', 'two_wheeler'],
  ['two-wheeler', 'two_wheeler'],
  ['two-wheelers', 'two_wheeler'],
  ['two_wheeler', 'two_wheeler'],
  ['two_wheelers', 'two_wheeler'],
  ['bike', 'two_wheeler'],
  ['bikes', 'two_wheeler'],
  ['scooter', 'two_wheeler'],
  ['scooters', 'two_wheeler'],
]);

export function normalizeVehicleType(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  return VEHICLE_TYPE_ALIASES.get(normalized) || '';
}

export function vehicleTypeLabel(value) {
  const id = normalizeVehicleType(value);
  return VEHICLE_TYPE_BY_ID.get(id)?.label || '';
}
