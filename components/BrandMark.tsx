export function BrandMark({ compact = false, name = "SheepTier" }: { compact?: boolean; name?: string }) {
  return (
    <div className="brandMark">
      <span className="sheepIcon" aria-hidden="true">
        <span className="wool w1" /><span className="wool w2" /><span className="wool w3" />
        <span className="wool w4" /><span className="face" /><span className="ear e1" /><span className="ear e2" />
      </span>
      {!compact && <span className="brandWord">{name === "SheepTier" ? <>Sheep<span>Tier</span></> : name}</span>}
    </div>
  );
}
