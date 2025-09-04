export enum UserRequirement {
  Nationality = 'Nationality',
  BVN = 'BVN (Bank Verification Number)',
  NIN = 'NIN (National ID Number)',
  FaceVerification = 'Face Verification',
  ResidentialAddress = 'Residential Address',
  ResidentialAddressVerification = 'Residential Address Verification',
  NextOfKin = 'Next of Kin',
  OptionalBusinessDetails = '(Optional) Business Details',

  // Business-related
  CACCertificate = 'CAC Business Registration Certificate',
  BusinessVerificationDocs = 'Business Verification Documents',
  BusinessNameReview = 'Business Name Review',
  Attestation = 'Attestation',
  AdvancedBusinessReview = 'Advanced Business Review',
  InternalComplianceApproval = 'Internal Compliance Approval',
  SignedIndemnityForm = 'Signed Indemnity Form',

  // New additions from payload
  IDType = 'ID Type',
  AdditionalIDType = 'Additional ID Type',
  FirstName = 'First Name',
  MiddleName = 'Middle Name',
  LastName = 'Last Name',
  PhoneNumber = 'Phone Number',
  DateOfBirth = 'Date of Birth',
  HouseNumber = 'House Number',
  StreetName = 'Street Name',
  State = 'State',
  LGA = 'Local Government Area (LGA)',
}
