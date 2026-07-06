import { supabase } from '@/lib/supabase';

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  registrationOpen: true,
  bookingOpen: true,
  supportOpen: true,
  notice: '',
};

function formatSettings(row = {}) {
  return {
    maintenanceMode: Boolean(row.maintenance_mode),
    registrationOpen: row.registration_open !== false,
    bookingOpen: row.booking_open !== false,
    supportOpen: row.support_open !== false,
    notice: typeof row.notice === 'string' ? row.notice : '',
    updatedAt: row.updated_at,
  };
}

export async function getPlatformSettings() {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .eq('key', 'global')
    .maybeSingle();

  if (error) throw error;
  if (data) return { ...DEFAULT_SETTINGS, ...formatSettings(data) };

  const { data: created, error: createError } = await supabase
    .from('platform_settings')
    .insert({
      key: 'global',
      maintenance_mode: DEFAULT_SETTINGS.maintenanceMode,
      registration_open: DEFAULT_SETTINGS.registrationOpen,
      booking_open: DEFAULT_SETTINGS.bookingOpen,
      support_open: DEFAULT_SETTINGS.supportOpen,
      notice: DEFAULT_SETTINGS.notice,
    })
    .select()
    .single();

  if (createError) throw createError;
  return { ...DEFAULT_SETTINGS, ...formatSettings(created) };
}

export async function updatePlatformSettings(updates = {}) {
  const row = {};

  if (typeof updates.maintenanceMode === 'boolean') row.maintenance_mode = updates.maintenanceMode;
  if (typeof updates.registrationOpen === 'boolean') row.registration_open = updates.registrationOpen;
  if (typeof updates.bookingOpen === 'boolean') row.booking_open = updates.bookingOpen;
  if (typeof updates.supportOpen === 'boolean') row.support_open = updates.supportOpen;
  if (typeof updates.notice === 'string') row.notice = updates.notice;

  const { data, error } = await supabase
    .from('platform_settings')
    .upsert({ key: 'global', ...row }, { onConflict: 'key' })
    .select()
    .single();

  if (error) throw error;
  return { ...DEFAULT_SETTINGS, ...formatSettings(data) };
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
