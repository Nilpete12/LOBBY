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
    vehicleType: row.vehicle_type || '',
    vehiclePlate: row.vehicle_plate || '',
    taxiStands: Array.isArray(row.taxi_stands) ? row.taxi_stands : [],
    currentStand: row.current_stand || '',
    currentStandUpdatedAt: row.current_stand_updated_at,
    verificationStatus: row.verification_status || (row.is_verified ? 'Approved' : 'Pending'),
    emailVerifiedAt: row.email_verified_at,
    phoneVerifiedAt: row.phone_verified_at,
    contactVerifiedAt: row.contact_verified_at,
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
    vehicleType: 'vehicle_type',
    vehiclePlate: 'vehicle_plate',
    taxiStands: 'taxi_stands',
    currentStand: 'current_stand',
    currentStandUpdatedAt: 'current_stand_updated_at',
    verificationStatus: 'verification_status',
    emailVerifiedAt: 'email_verified_at',
    phoneVerifiedAt: 'phone_verified_at',
    contactVerifiedAt: 'contact_verified_at',
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
    requestedStand: row.requested_stand || '',
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

export function formatDriverNotification(row = {}) {
  return {
    ...row,
    _id: row.id,
    driverId: row.driver_id,
    clerkId: row.clerk_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}
