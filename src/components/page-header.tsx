interface PageHeaderProps {
  description: string;
  title: string;
}

export function PageHeader({ description, title }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading font-semibold text-2xl tracking-tight">
        {title}
      </h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
