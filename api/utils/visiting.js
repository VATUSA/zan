// VATUSA's user object lists the facilities a member visits under `visiting_facilities`
// (always present). The same data is also under `visits`, but VATUSA blanks that one out
// for requests without a valid API key, so prefer `visiting_facilities`.
export function getVisitedFacilities(vatusaUser) {
  const list = vatusaUser?.visiting_facilities ?? vatusaUser?.visits
  return Array.isArray(list) ? list : []
}

export function isVisitingZan(vatusaUser) {
  return getVisitedFacilities(vatusaUser).some((v) => v.facility === 'ZAN')
}
