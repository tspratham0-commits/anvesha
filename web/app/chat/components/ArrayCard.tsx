type ArrayCardProps = {
  title: string;
  items: string[];
};

export default function ArrayCard({
  title,
  items,
}: ArrayCardProps) {
  return (
    <div className="rounded-2xl bg-neutral-800 p-5">
      <h3 className="text-xl font-bold text-white">
        {title}
      </h3>

      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="rounded-lg bg-neutral-900 px-3 py-2 text-gray-300"
          >
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}