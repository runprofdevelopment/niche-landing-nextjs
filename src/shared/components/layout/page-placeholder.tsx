type PagePlaceholderProps = {
  title: string;
  description?: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="panel flex min-h-[50vh] flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
