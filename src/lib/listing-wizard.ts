import { enabledMethods, type HostPaymentDetails } from "./payments";

// Shape and step configuration for the /become-a-host listing wizard.
//
// Fields with a matching properties column are mapped on publish; everything
// else is written to the listing_details JSONB column added by
// database/add-listing-details.sql.

export interface ListingDraft {
  // Address
  country: string;
  unit: string;
  building: string;
  street: string;
  district: string;
  city: string;
  zipCode: string;
  province: string;

  // Place
  propertyType: string;
  privacyType: string;

  // Location
  latitude: number | null;
  longitude: number | null;
  showPreciseLocation: boolean;

  // Floor plan
  guests: number;
  bedrooms: number;
  beds: number;
  bedroomLock: string;

  // Bathrooms
  bathroomsPrivate: number;
  bathroomsDedicated: number;
  bathroomsShared: number;

  // Occupancy
  occupancy: string[];

  // Stand out
  amenities: string[];
  photos: File[];
  title: string;
  highlights: string[];
  description: string;

  // Finish up
  instantBook: string;
  basePrice: number;
  weekendAdjustment: number;
  paymentDetails: HostPaymentDetails;
}

export const emptyDraft: ListingDraft = {
  country: "Philippines - PH",
  unit: "",
  building: "",
  street: "",
  district: "",
  city: "",
  zipCode: "",
  province: "",
  propertyType: "",
  privacyType: "",
  // Metro Manila, a sensible starting pin for this catalogue
  latitude: 14.5794,
  longitude: 121.0359,
  showPreciseLocation: true,
  guests: 2,
  bedrooms: 1,
  beds: 1,
  bedroomLock: "",
  bathroomsPrivate: 0,
  bathroomsDedicated: 0,
  bathroomsShared: 0,
  occupancy: [],
  amenities: [],
  photos: [],
  title: "",
  highlights: [],
  description: "",
  instantBook: "review",
  basePrice: 1500,
  weekendAdjustment: 6,
  paymentDetails: {},
};

export const PROPERTY_TYPES = [
  "House",
  "Apartment",
  "Barn",
  "Bed & breakfast",
  "Boat",
  "Cabin",
  "Camper/RV",
  "Casa particular",
  "Castle",
  "Cave",
  "Container",
  "Cycladic home",
  "Dammuso",
  "Dome",
  "Earth home",
  "Farm",
  "Guesthouse",
  "Hotel",
  "Houseboat",
  "Kezhan",
  "Minsu",
  "Riad",
  "Ryokan",
  "Shepherd's hut",
  "Tent",
  "Tiny home",
  "Tower",
  "Treehouse",
  "Trullo",
  "Windmill",
  "Yurt",
];

export const PRIVACY_TYPES = [
  {
    value: "entire",
    label: "An entire place",
    description: "Guests have the whole place to themselves.",
  },
  {
    value: "room",
    label: "A room",
    description:
      "Guests have their own room in a home, plus access to shared spaces.",
  },
  {
    value: "shared",
    label: "A shared room in a hostel",
    description:
      "Guests sleep in a shared room in a professionally managed hostel with staff onsite 24/7.",
  },
];

export const OCCUPANCY_OPTIONS = [
  "Me",
  "My family",
  "Other guests",
  "Roommates",
];

export const GUEST_FAVOURITE_AMENITIES = [
  "Wifi",
  "TV",
  "Kitchen",
  "Washer",
  "Free parking on premises",
  "Paid parking on premises",
  "Air conditioning",
  "Dedicated workspace",
];

export const STANDOUT_AMENITIES = [
  "Pool",
  "Hot tub",
  "Patio",
  "BBQ grill",
  "Outdoor dining area",
  "Fire pit",
  "Pool table",
  "Indoor fireplace",
  "Piano",
  "Exercise equipment",
  "Lake access",
  "Beach access",
  "Ski-in/Ski-out",
  "Outdoor shower",
];

export const SAFETY_AMENITIES = [
  "Smoke alarm",
  "First aid kit",
  "Fire extinguisher",
  "Carbon monoxide alarm",
];

export const HIGHLIGHTS = [
  "Peaceful",
  "Unique",
  "Family-friendly",
  "Stylish",
  "Central",
  "Spacious",
];

export const BOOKING_SETTINGS = [
  {
    value: "review",
    label: "Approve your first 3 bookings",
    recommended: true,
    description:
      "Start by reviewing reservation requests, then switch to Instant Book, so guests can book automatically.",
  },
  {
    value: "instant",
    label: "Use Instant Book",
    recommended: false,
    description: "Let guests book automatically.",
  },
];

export const MIN_PHOTOS = 5;
export const TITLE_MAX = 50;
export const DESCRIPTION_MAX = 500;
export const MAX_HIGHLIGHTS = 2;

export type StepId =
  | "about-your-place"
  | "address"
  | "structure"
  | "privacy-type"
  | "location"
  | "location-privacy"
  | "floor-plan"
  | "bathrooms"
  | "occupancy"
  | "stand-out"
  | "amenities"
  | "photos"
  | "title"
  | "description-highlights"
  | "description"
  | "finish-setup"
  | "instant-book"
  | "pricing"
  | "payment";

export interface StepConfig {
  id: StepId;
  // Which of the three progress segments this step belongs to
  section: 0 | 1 | 2;
}

export const STEPS: StepConfig[] = [
  { id: "about-your-place", section: 0 },
  { id: "address", section: 0 },
  { id: "structure", section: 0 },
  { id: "privacy-type", section: 0 },
  { id: "location", section: 0 },
  { id: "location-privacy", section: 0 },
  { id: "floor-plan", section: 0 },
  { id: "bathrooms", section: 0 },
  { id: "occupancy", section: 0 },
  { id: "stand-out", section: 1 },
  { id: "amenities", section: 1 },
  { id: "photos", section: 1 },
  { id: "title", section: 1 },
  { id: "description-highlights", section: 1 },
  { id: "description", section: 1 },
  { id: "finish-setup", section: 2 },
  { id: "instant-book", section: 2 },
  { id: "pricing", section: 2 },
  { id: "payment", section: 2 },
];

// Returns an error string when the step is incomplete, or null when Next is allowed.
export function validateStep(
  id: StepId,
  draft: ListingDraft
): string | null {
  switch (id) {
    case "address":
      if (!draft.street.trim()) return "Enter a street address";
      if (!draft.city.trim()) return "Enter a city or municipality";
      if (!draft.province.trim()) return "Enter a province";
      return null;
    case "structure":
      return draft.propertyType ? null : "Choose a property type";
    case "privacy-type":
      return draft.privacyType ? null : "Choose what guests will have";
    case "floor-plan":
      if (draft.guests < 1) return "Add at least one guest";
      if (!draft.bedroomLock) return "Say whether bedrooms have locks";
      return null;
    case "bathrooms":
      return draft.bathroomsPrivate +
        draft.bathroomsDedicated +
        draft.bathroomsShared >
        0
        ? null
        : "Add at least one bathroom";
    case "occupancy":
      return draft.occupancy.length > 0 ? null : "Choose who else might be there";
    case "photos":
      return draft.photos.length >= MIN_PHOTOS
        ? null
        : `Add at least ${MIN_PHOTOS} photos`;
    case "title":
      return draft.title.trim() ? null : "Give your place a title";
    case "description":
      return draft.description.trim() ? null : "Write a description";
    case "pricing":
      return draft.basePrice > 0 ? null : "Set a base price";
    case "payment":
      return enabledMethods(draft.paymentDetails).length > 0
        ? null
        : "Set up at least one way for guests to pay you";
    default:
      return null;
  }
}

// Everything without a properties column, packed for the JSONB field.
export function toListingDetails(draft: ListingDraft) {
  return {
    property_type: draft.propertyType,
    privacy_type: draft.privacyType,
    latitude: draft.latitude,
    longitude: draft.longitude,
    show_precise_location: draft.showPreciseLocation,
    beds: draft.beds,
    bedroom_lock: draft.bedroomLock,
    bathrooms_private: draft.bathroomsPrivate,
    bathrooms_dedicated: draft.bathroomsDedicated,
    bathrooms_shared: draft.bathroomsShared,
    occupancy: draft.occupancy,
    highlights: draft.highlights,
    instant_book: draft.instantBook,
    weekend_adjustment: draft.weekendAdjustment,
    payment_methods: draft.paymentDetails,
    unit: draft.unit,
    building: draft.building,
    district: draft.district,
    country: draft.country,
  };
}
