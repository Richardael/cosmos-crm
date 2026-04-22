import { Suspense, useState, type ErrorInfo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  CanAccess,
  type CoreLayoutProps,
  useTranslate,
  useUserMenu,
} from "ra-core";
import { Link } from "react-router";
import { Import, Settings, User, Users } from "lucide-react";
import { Notification } from "@/components/admin/notification";
import { Error } from "@/components/admin/error";
import { Loading } from "@/components/admin/loading";
import { RefreshButton } from "@/components/admin/refresh-button";
import { UserMenu } from "@/components/admin/user-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { useConfigurationLoader } from "../root/useConfigurationLoader";
import { NeonSidebar } from "./NeonSidebar";
import { ImportPage } from "../misc/ImportPage";

export const Layout = ({ children }: CoreLayoutProps) => {
  useConfigurationLoader();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);

  return (
    <SidebarProvider>
      <NeonSidebar />
      <main
        className={[
          "ml-auto w-full max-w-full",
          "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
          "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
          "sm:transition-[width] sm:duration-200 sm:ease-linear",
          "flex h-svh flex-col",
        ].join(" ")}
      >
        <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b border-border">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div className="flex-1" id="breadcrumb" />
          <RefreshButton />
          <UserMenu>
            <ProfileMenu />
            <CanAccess resource="sales" action="list">
              <UsersMenu />
            </CanAccess>
            <CanAccess resource="configuration" action="edit">
              <SettingsMenu />
            </CanAccess>
            <ImportMenu />
          </UserMenu>
        </header>
        <ErrorBoundary
          onError={(_: unknown, info: ErrorInfo) => setErrorInfo(info)}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <Error
              error={error}
              errorInfo={errorInfo}
              resetErrorBoundary={resetErrorBoundary}
            />
          )}
        >
          <Suspense fallback={<Loading />}>
            <div className="flex flex-1 flex-col px-4 py-2 overflow-auto">
              {children}
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Notification />
    </SidebarProvider>
  );
};

const ProfileMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) return null;
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to="/profile" className="flex items-center gap-2">
        <User />
        {translate("crm.profile.title")}
      </Link>
    </DropdownMenuItem>
  );
};

const UsersMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) return null;
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to="/sales" className="flex items-center gap-2">
        <Users />
        {translate("resources.sales.name", { smart_count: 2 })}
      </Link>
    </DropdownMenuItem>
  );
};

const SettingsMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) return null;
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to="/settings" className="flex items-center gap-2">
        <Settings />
        {translate("crm.settings.title")}
      </Link>
    </DropdownMenuItem>
  );
};

const ImportMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) return null;
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to={ImportPage.path} className="flex items-center gap-2">
        <Import />
        {translate("crm.header.import_data")}
      </Link>
    </DropdownMenuItem>
  );
};
