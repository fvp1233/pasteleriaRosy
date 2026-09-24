import { cn } from "@/lib/utils";

export function RoleOptionCard({ icon: Icon, title, description, value, selected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:bg-muted/50"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-base font-medium text-foreground">
          <Icon className="size-5" />
          {title}
        </span>
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-full border",
            selected ? "border-primary bg-primary" : "border-input"
          )}
        >
          {selected ? <span className="size-1.5 rounded-full bg-primary-foreground" /> : null}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
}
