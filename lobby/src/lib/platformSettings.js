import PlatformSettings from '@/models/PlatformSettings';

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  registrationOpen: true,
  bookingOpen: true,
  supportOpen: true,
  notice: '',
};

export async function getPlatformSettings() {
  const settings = await PlatformSettings.findOneAndUpdate(
    { key: 'global' },
    { $setOnInsert: { key: 'global', ...DEFAULT_SETTINGS } },
    { new: true, upsert: true }
  ).lean();

  return { ...DEFAULT_SETTINGS, ...settings };
}

export function serializePlatformSettings(settings) {
  return {
    maintenanceMode: Boolean(settings.maintenanceMode),
    registrationOpen: settings.registrationOpen !== false,
    bookingOpen: settings.bookingOpen !== false,
    supportOpen: settings.supportOpen !== false,
    notice: typeof settings.notice === 'string' ? settings.notice : '',
    updatedAt: settings.updatedAt,
  };
}
