import { cn } from "@/lib/utils";

type titleProps = {
  alt: string;
  icon: string;
  title: string;
  className?: string;
  id?: string;
};

export function SectionTitle({ alt, icon, title, className, id }: titleProps) {
  return (
    <div id={id} className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center justify-center">
        <img src={icon} alt={alt} className="w-8 h-8" />
      </div>

      <span className="h-8 font-semibold text-2xl">{title}</span>
    </div>
  );
}
