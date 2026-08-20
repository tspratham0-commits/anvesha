type HeaderProps = {
  title: string;
  subtitle?: string;
};

export default function Header({
  title,
  subtitle,
}: HeaderProps) {
  return (
    <header className="border-b border-neutral-800 pb-6">

      <h1 className="text-4xl font-bold text-white">
        {title}
      </h1>

      {subtitle && (
        <p className="mt-2 text-gray-400">
          {subtitle}
        </p>
      )}

    </header>
  );
}