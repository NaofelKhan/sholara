// Material Symbol icon wrapper
export default function MI({ name, fill = 0, size = 24 }) {
  return (
    <span
      className="material-symbols-outlined select-none"
      style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill}`, lineHeight: 1 }}
    >
      {name}
    </span>
  );
}
