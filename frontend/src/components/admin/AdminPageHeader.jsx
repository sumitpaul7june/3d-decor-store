// Consistent page header for every admin section.
// Replaces the duplicated admin-page-head block copy-pasted across admin pages.

/**
 * AdminPageHeader
 *
 * @param {string} kicker    - Small eyebrow label (e.g. "Fulfilment")
 * @param {string} title     - Main h1 heading
 * @param {string} [subtitle] - Optional supporting line under the title
 * @param {React.ReactNode} [action] - Optional right-side element (button, etc.)
 */
function AdminPageHeader({ kicker, title, subtitle, action }) {
  return (
    <div className="admin-page-head">
      <div>
        {kicker && <p className="admin-page-kicker">{kicker}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="admin-page-head-action">{action}</div>}
    </div>
  );
}

export default AdminPageHeader;
