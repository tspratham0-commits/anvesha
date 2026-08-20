type Props = {
  title: string;
  score: number;
};

export default function ReportHeader({
  title,
  score,
}: Props) {
  return (
    <>
      <h2 className="text-4xl font-bold">
        {title}
      </h2>

      <p className="mt-2 text-green-400">
        Opportunity Score: {score}/100
      </p>

      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-neutral-700">
        <div
          className="h-full rounded-full bg-green-500 transition-all"
          style={{
            width: `${score}%`,
          }}
        />
      </div>
    </>
  );
}