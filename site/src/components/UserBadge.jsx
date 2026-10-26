// Account badges. The corner shows the member's ZAN role if they have one, otherwise their
// VATSIM rating - never both. If they have neither, the corner is left out.
//
// Class names are written out in full (not built from strings) so Tailwind can see them.
const TONES = {
  gold: {
    bar: 'bg-gold',
    text: 'text-gold',
    tile: 'bg-gold/15',
    stub: 'bg-gold/[0.08]',
    solid: 'bg-gold text-navy',
  },
  purple: {
    bar: 'bg-purple',
    text: 'text-purple',
    tile: 'bg-purple/15',
    stub: 'bg-purple/[0.08]',
    solid: 'bg-purple text-navy',
  },
  teal: {
    bar: 'bg-teal',
    text: 'text-teal',
    tile: 'bg-teal/15',
    stub: 'bg-teal/[0.07]',
    solid: 'bg-teal text-navy',
  },
}

const ROLE_TONE = {
  ATM: 'gold',
  DATM: 'gold',
  TA: 'teal',
  INS: 'teal',
  MTR: 'teal',
  WM: 'purple',
  EC: 'purple',
  FE: 'purple',
}

function getBadgeInfo(user) {
  if (user.zanRole) {
    return { code: user.zanRole, kind: 'Role', tone: TONES[ROLE_TONE[user.zanRole] ?? 'gold'], isRole: true }
  }
  if (user.rating) {
    return { code: user.rating, kind: 'Rating', tone: TONES.teal, isRole: false }
  }
  return null
}

function getInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Compact version for the navbar: name and CID on a dark panel, role or rating on the end.
function UserBadge({ user }) {
  const info = getBadgeInfo(user)

  return (
    <span
      className="flex items-stretch rounded-xl overflow-hidden bg-[#0A1330] border border-white/15 text-left"
      aria-label={`${user.name}, CID ${user.cid}${info ? `, ${info.kind.toLowerCase()} ${info.code}` : ''}`}
    >
      <span className="flex flex-col justify-center gap-0.5 px-3 py-1.5 leading-tight">
        <span className="font-extrabold text-[13.5px] text-ink">{user.name}</span>
        <span className="font-mono text-[11px] font-semibold text-muted2">{user.cid}</span>
      </span>
      {info && (
        <span
          className={`grid place-items-center px-3 font-black text-[13.5px] tracking-wide ${
            info.isRole ? info.tone.solid : `${info.tone.tile} ${info.tone.text}`
          }`}
        >
          {info.code}
        </span>
      )}
    </span>
  )
}

// Full ID-card version, for the profile page.
export function UserIdCard({ user }) {
  const info = getBadgeInfo(user)
  const tone = info ? info.tone : TONES.teal

  return (
    <div className="flex items-stretch w-full max-w-[360px] rounded-[18px] overflow-hidden bg-gradient-to-br from-[#13224D] to-[#0A1330] border border-white/10 shadow-[0_10px_26px_rgba(0,0,0,0.35)]">
      <span className={`flex-none w-1.5 ${tone.bar}`} />
      <div className="flex-1 min-w-0 flex items-center gap-3.5 px-4 py-3.5">
        <span className={`flex-none w-[46px] h-[46px] rounded-[14px] grid place-items-center font-extrabold text-base ${tone.tile} ${tone.text}`}>
          {getInitials(user.name)}
        </span>
        <div className="min-w-0 leading-tight">
          <div className="font-extrabold text-base truncate">{user.name}</div>
          <div className="mt-1 font-mono text-[12.5px] font-semibold text-muted2">CID {user.cid}</div>
        </div>
      </div>
      {info && (
        <div className={`flex-none w-[82px] flex flex-col items-center justify-center gap-1 border-l border-dashed border-white/20 ${tone.stub}`}>
          <span className={`font-black text-2xl tracking-wide leading-none ${tone.text}`}>{info.code}</span>
          <span className="text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-muted2">{info.kind}</span>
        </div>
      )}
    </div>
  )
}

export default UserBadge
