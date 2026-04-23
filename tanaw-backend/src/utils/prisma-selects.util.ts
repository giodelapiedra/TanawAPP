export const AUTHOR_SELECT = {
  id: true,
  tanawId: true,
  firstName: true,
  middleName: true,
  lastName: true,
  suffix: true,
  role: true,
  profilePhoto: true,
} as const;

export const USER_CARD_SELECT = {
  ...AUTHOR_SELECT,
  barangay: { select: { id: true, code: true, name: true } },
} as const;
