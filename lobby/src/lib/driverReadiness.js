const REQUIRED_DRIVER_FIELDS = [
  { key: 'phone', label: 'phone number' },
  { key: 'vehicleType', label: 'vehicle type' },
  { key: 'vehiclePlate', label: 'number plate' },
  { key: 'taxiStand', label: 'taxi stand' },
  { key: 'carPic', label: 'vehicle photo' },
  { key: 'licenseUrl', label: 'driving license' },
  { key: 'isVerified', label: 'admin verification' },
];

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasTaxiStand(driver = {}) {
  const taxiStands = driver.taxiStands || driver.taxi_stands || [];
  return hasText(driver.currentStand || driver.current_stand) ||
    (Array.isArray(taxiStands) && taxiStands.some(hasText));
}

function valueForKey(driver = {}, key) {
  switch (key) {
    case 'phone':
      return driver.phone;
    case 'vehicleType':
      return driver.vehicleType || driver.vehicle_type;
    case 'vehiclePlate':
      return driver.vehiclePlate || driver.vehicle_plate;
    case 'taxiStand':
      return hasTaxiStand(driver);
    case 'carPic':
      return driver.carPic || driver.car_pic;
    case 'licenseUrl':
      return driver.licenseUrl || driver.license_url;
    case 'isVerified':
      return driver.isVerified === true || driver.is_verified === true;
    default:
      return '';
  }
}

export function getDriverReadiness(driver = {}) {
  const missing = REQUIRED_DRIVER_FIELDS
    .filter((field) => {
      const value = valueForKey(driver, field.key);
      return typeof value === 'boolean' ? !value : !hasText(value);
    })
    .map((field) => field.label);

  const isSuspended = (driver.accountStatus || driver.account_status) === 'suspended';
  if (isSuspended) missing.push('active account');

  return {
    ready: missing.length === 0,
    missing,
    missingText: missing.join(', '),
  };
}

export function isDriverPilotReady(driver = {}) {
  return getDriverReadiness(driver).ready;
}
