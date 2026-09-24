import { AuthMarketingPanel } from "@/components/auth/AuthMarketingPanel";

export function AuthShell({ children, panel, topBar }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted/30 lg:block">{panel ?? <AuthMarketingPanel />}</div>
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16 lg:py-10">
        {topBar ? <div className="flex justify-end pb-4">{topBar}</div> : null}
        <div className="flex flex-1 items-center justify-center py-4">
          <div className="w-full max-w-xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
