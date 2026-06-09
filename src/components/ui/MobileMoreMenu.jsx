import { LogoutIcon, UserIcon } from "./AppIcons";

export default function MobileMoreMenu({
  activeView,
  items,
  onClose,
  onLogout,
  onSelectView,
  profileName,
}) {
  return (
    <div className="mobile-more-backdrop" role="presentation" onClick={onClose}>
      <div
        className="mobile-more-sheet"
        role="dialog"
        aria-label="More mobile navigation"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mobile-more-profile">
          <span className="avatar"><UserIcon /></span>
          <strong>{profileName}</strong>
        </div>

        <div className="mobile-more-grid">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeView === item.id ? "active" : ""}
              onClick={() => {
                onSelectView(item.id);
                onClose();
              }}
            >
              <img src={item.icon} alt="" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <button className="mobile-more-logout" type="button" onClick={onLogout}>
          <LogoutIcon />
          Log out
        </button>
      </div>
    </div>
  );
}
