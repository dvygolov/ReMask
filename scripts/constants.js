export const disable_reasons = [
    '',
    'ADS_INTEGRITY_POLICY',
    'ADS_IP_REVIEW',
    'RISK_PAYMENT',
    'GRAY_ACCOUNT_SHUT_DOWN',
    'ADS_AFC_REVIEW',
    'BUSINESS_INTEGRITY_RAR',
    'PERMANENT_CLOSE',
    'UNUSED_RESELLER_ACCOUNT'
];

export const account_statuses = {
    1: 'ACTIVE',
    2: 'DISABLED',
    3: 'UNSETTLED',
    7: 'PENDING_RISK_REVIEW',
    8: 'PENDING_SETTLEMENT',
    9: 'IN_GRACE_PERIOD',
    100: 'PENDING_CLOSURE',
    101: 'CLOSED',
    201: 'ANY_ACTIVE',
    202: 'ANY_CLOSED'
};
