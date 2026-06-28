export default function NoProductsFound({ onClearFilters }) {
  return (
    <div className="nopf-wrapper">
      <div className="nopf-card">
        <div className="nopf-icon-wrap">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>

        <strong>No products found</strong>
        <span>Try adjusting your search or filters.</span>

        {onClearFilters && (
          <button onClick={onClearFilters}>Clear Filters</button>
        )}
      </div>

      <style>{`
        .nopf-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 16px;
        }
        .nopf-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-align: center;
          padding: 48px 40px;
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 6px rgba(0,0,0,0.06);
          width: 100%;
          max-width: 360px;
        }
        .nopf-icon-wrap {
          background: #f5f5f5;
          border-radius: 50%;
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
        }
        .nopf-card strong {
          font-size: 1rem;
          font-weight: 600;
          color: #111;
        }
        .nopf-card span {
          font-size: 0.875rem;
          color: #999;
        }
        .nopf-card button {
          margin-top: 8px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 28px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .nopf-card button:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}
