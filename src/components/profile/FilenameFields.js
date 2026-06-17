export default function FilenameFields({
  companyName,
  roleName,
  onCompanyChange,
  onRoleChange,
  colors,
  styles,
  idPrefix,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "10px",
      }}
    >
      <div>
        <label htmlFor={`${idPrefix}-company`} style={styles.fieldLabel}>
          Company
        </label>
        <input
          id={`${idPrefix}-company`}
          type="text"
          value={companyName}
          onChange={(e) => onCompanyChange(e.target.value)}
          placeholder="Google"
          style={styles.input}
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-role`} style={styles.fieldLabel}>
          Role
        </label>
        <input
          id={`${idPrefix}-role`}
          type="text"
          value={roleName}
          onChange={(e) => onRoleChange(e.target.value)}
          placeholder="Senior Engineer"
          style={styles.input}
        />
      </div>
    </div>
  );
}
