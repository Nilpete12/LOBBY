export const RECENT_DRIVER_CONTACTS_KEY = 'lobby:recent-driver-contacts';
const MAX_RECENT_CONTACTS = 12;

function driverContactId(driver = {}) {
  return String(driver._id || driver.id || driver.clerkId || driver.phone || '').trim();
}

function normalizeRecentDriver(driver = {}, method = 'call') {
  const contactedAt = new Date().toISOString();

  return {
    _id: driverContactId(driver),
    id: driver.id || '',
    clerkId: driver.clerkId || '',
    fullName: driver.fullName || driver.name || 'Driver',
    phone: driver.phone || '',
    vehicle: driver.vehicle || 'Standard Taxi',
    vehicleType: driver.vehicleType || driver.vehicle_type || '',
    vehiclePlate: driver.vehiclePlate || driver.vehicle_plate || '',
    profilePic: driver.profilePic || driver.imageUrl || '',
    rating: driver.rating || 5,
    routes: Array.isArray(driver.routes) ? driver.routes : [],
    taxiStands: Array.isArray(driver.taxiStands) ? driver.taxiStands : [],
    currentStand: driver.currentStand || driver.current_stand || '',
    isVerified: driver.isVerified !== false,
    contactMethod: method,
    lastContacted: contactedAt,
    lastCalled: contactedAt,
  };
}

export function loadRecentDriverContacts() {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_DRIVER_CONTACTS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((driver) => driverContactId(driver)) : [];
  } catch {
    return [];
  }
}

export function saveRecentDriverContact(driver, method = 'call') {
  if (typeof window === 'undefined') return [];

  const nextDriver = normalizeRecentDriver(driver, method);
  if (!nextDriver._id) return loadRecentDriverContacts();

  const nextContacts = [
    nextDriver,
    ...loadRecentDriverContacts().filter((item) => driverContactId(item) !== nextDriver._id),
  ].slice(0, MAX_RECENT_CONTACTS);

  try {
    window.localStorage.setItem(RECENT_DRIVER_CONTACTS_KEY, JSON.stringify(nextContacts));
    window.dispatchEvent(new CustomEvent('lobby:recent-driver-contacts', { detail: nextContacts }));
  } catch {
    // Local recent contacts are a convenience, not a critical write.
  }

  return nextContacts;
}
