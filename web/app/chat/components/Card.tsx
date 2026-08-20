type CardProps = {
  title: string;
  children: React.ReactNode;
};

export default function Card({
  title,
  children,
}: CardProps) {
  return (
    <div className="rounded-2xl bg-neutral-800 p-5">
      <h3 className="text-xl font-bold text-white">
        {title}
      </h3>

      <div className="mt-3 text-gray-300 leading-7">
        {children}
      </div>
    </div>
  );
}