import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string | ReactNode;
  actions?: ReactNode;
}

const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-3 px-4 pt-5 pb-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;