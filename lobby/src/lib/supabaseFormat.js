export function formatUser(row = {}) {
  if (!row) return null;

  return {
    ...row,
    _id: row.id,
    clerkId: row.clerk_id,
    fullName: row.full_name,
    accountStatus: row.account_status || 'active',
    suspendedAt: row.suspended_at,
    suspensionReason: row.suspension_reason || '',
    isAvailable: Boolean(row.is_available),
    isVerified: Boolean(row.is_verified),
    profilePic: row.profile_pic || row.image_url || '',
    carPic: row.car_pic || '',
    licenseUrl: row.license_url || '',
    vehiclePlate: row.vehicle_plate || '',
    verificationStatus: row.verification_status || (row.is_verified ? 'Approved' : 'Pending'),
    aiNotes: row.ai_notes || '',
    subscriptionStatus: row.subscription_status || 'unpaid',
    subscriptionPaidAt: row.subscription_paid_at,
    subscriptionPaidUntil: row.subscription_paid_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function userUpdatesToRow(updates = {}) {
  const row = {};
  const map = {
    fullName: 'full_name',
    accountStatus: 'account_status',
    suspendedAt: 'suspended_at',
    suspensionReason: 'suspension_reason',
    isAvailable: 'is_available',
    isVerified: 'is_verified',
    profilePic: 'profile_pic',
    carPic: 'car_pic',
    licenseUrl: 'license_url',
    vehiclePlate: 'vehicle_plate',
    verificationStatus: 'verification_status',
    aiNotes: 'ai_notes',
    subscriptionStatus: 'subscription_status',
    subscriptionPaidAt: 'subscription_paid_at',
    subscriptionPaidUntil: 'subscription_paid_until',
  };

  for (const [key, value] of Object.entries(updates)) {
    row[map[key] || key] = value;
  }

  return row;
}

export function formatBooking(row = {}, driver = null) {
  return {
    ...row,
    _id: row.id,
    riderId: row.rider_id,
    riderName: row.rider_name,
    riderPhone: row.rider_phone,
    driverId: row.driver_id,
    driver,
    pickupLocation: {
      lat: row.pickup_lat,
      lng: row.pickup_lng,
      address: row.pickup_address || 'Current Location',
    },
    acceptedAt: row.accepted_at,
    locationUpdatedAt: row.location_updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatComplaint(row = {}) {
  return {
    ...row,
    _id: row.id,
    userId: row.user_id,
    topic: row.topic || row.subject || 'Support',
    reportType: row.report_type || 'general',
    driverId: row.driver_id,
    driverName: row.driver_name || '',
    internalNotes: row.internal_notes || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatVerificationRequest(row = {}) {
  return {
    ...row,
    _id: row.id,
    driverId: row.driver_id,
    clerkId: row.clerk_id,
    driverName: row.driver_name,
    licenseUrl: row.license_url,
    reviewNotes: row.review_notes || '',
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatActivityLog(row = {}) {
  return {
    ...row,
    _id: row.id,
    targetType: row.target_type,
    targetId: row.target_id,
    targetLabel: row.target_label,
    createdAt: row.created_at,
  };
}
