import { supabase } from '@/lib/supabase';

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  registrationOpen: true,
  bookingOpen: true,
  supportOpen: true,
  notice: '',
  baseFare: 50,
  perKmRate: 20,
  serviceFeePercentage: 5,
};

function numberOrDefault(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatSettings(row = {}) {
  return {
    maintenanceMode: Boolean(row.maintenance_mode),
    registrationOpen: row.registration_open !== false,
    bookingOpen: row.booking_open !== false,
    supportOpen: row.support_open !== false,
    notice: typeof row.notice === 'string' ? row.notice : '',
    baseFare: numberOrDefault(row.base_fare, DEFAULT_SETTINGS.baseFare),
    perKmRate: numberOrDefault(row.per_km_rate, DEFAULT_SETTINGS.perKmRate),
    serviceFeePercentage: numberOrDefault(
      row.service_fee_percentage,
      DEFAULT_SETTINGS.serviceFeePercentage
    ),
    updatedAt: row.updated_at,
  };
}

async function fetchGlobalSettingsRow() {
  const keyed = await supabase
    .from('platform_settings')
    .select('*')
    .eq('key', 'global')
    .maybeSingle();

  if (!keyed.error) return keyed;

  return supabase
    .from('platform_settings')
    .select('*')
    .limit(1)
    .maybeSingle();
}

export async function getPlatformSettings() {
  const { data, error } = await fetchGlobalSettingsRow();

  if (error) {
    console.error('Error fetching platform settings:', error);
    return DEFAULT_SETTINGS;
  }

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
      base_fare: DEFAULT_SETTINGS.baseFare,
      per_km_rate: DEFAULT_SETTINGS.perKmRate,
      service_fee_percentage: DEFAULT_SETTINGS.serviceFeePercentage,
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating platform settings:', createError);
    return DEFAULT_SETTINGS;
  }

  return { ...DEFAULT_SETTINGS, ...formatSettings(created) };
}

export async function updatePlatformSettings(updates = {}) {
  const row = {};

  if (typeof updates.maintenanceMode === 'boolean') row.maintenance_mode = updates.maintenanceMode;
  if (typeof updates.registrationOpen === 'boolean') row.registration_open = updates.registrationOpen;
  if (typeof updates.bookingOpen === 'boolean') row.booking_open = updates.bookingOpen;
  if (typeof updates.supportOpen === 'boolean') row.support_open = updates.supportOpen;
  if (typeof updates.notice === 'string') row.notice = updates.notice;
  if (typeof updates.baseFare === 'number' && Number.isFinite(updates.baseFare)) {
    row.base_fare = updates.baseFare;
  }
  if (typeof updates.perKmRate === 'number' && Number.isFinite(updates.perKmRate)) {
    row.per_km_rate = updates.perKmRate;
  }
  if (
    typeof updates.serviceFeePercentage === 'number' &&
    Number.isFinite(updates.serviceFeePercentage)
  ) {
    row.service_fee_percentage = updates.serviceFeePercentage;
  }

  let { data, error } = await supabase
    .from('platform_settings')
    .upsert({ key: 'global', ...row }, { onConflict: 'key' })
    .select()
    .single();

  if (error) {
    const fareOnlyRow = {};
    if ('base_fare' in row) fareOnlyRow.base_fare = row.base_fare;
    if ('per_km_rate' in row) fareOnlyRow.per_km_rate = row.per_km_rate;
    if ('service_fee_percentage' in row) {
      fareOnlyRow.service_fee_percentage = row.service_fee_percentage;
    }

    if (Object.keys(fareOnlyRow).length) {
      await supabase.from('platform_settings').delete().neq('base_fare', -999);
      const fallback = await supabase
        .from('platform_settings')
        .insert([fareOnlyRow])
        .select()
        .single();
      data = fallback.data;
      error = fallback.error;
    }
  }

  if (error) throw error;

  return {
    ...DEFAULT_SETTINGS,
    ...updates,
    ...formatSettings(data || {}),
  };
}

export function serializePlatformSettings(settings = DEFAULT_SETTINGS) {
  return {
    maintenanceMode: Boolean(settings.maintenanceMode),
    registrationOpen: settings.registrationOpen !== false,
    bookingOpen: settings.bookingOpen !== false,
    supportOpen: settings.supportOpen !== false,
    notice: typeof settings.notice === 'string' ? settings.notice : '',
    baseFare: numberOrDefault(settings.baseFare, DEFAULT_SETTINGS.baseFare),
    perKmRate: numberOrDefault(settings.perKmRate, DEFAULT_SETTINGS.perKmRate),
    serviceFeePercentage: numberOrDefault(
      settings.serviceFeePercentage,
      DEFAULT_SETTINGS.serviceFeePercentage
    ),
    updatedAt: settings.updatedAt,
  };
}
