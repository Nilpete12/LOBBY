import { supabase } from '@/lib/supabase';

export async function getPlatformSettings() {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) {
      return { baseFare: 50, perKmRate: 20, serviceFeePercentage: 5 };
    }

    return {
      baseFare: data.base_fare,
      perKmRate: data.per_km_rate,
      serviceFeePercentage: data.service_fee_percentage,
    };
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    return { baseFare: 50, perKmRate: 20, serviceFeePercentage: 5 };
  }
}