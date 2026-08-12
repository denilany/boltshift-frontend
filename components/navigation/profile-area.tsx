"use client";

import { AvatarProfile } from "@/components/avatar/avatar";
import { NotificationDrawer } from "@/components/notification/notification-drawer";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ViewTransition } from "react";
import { useDeferredValue, useId } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DropdownWrapper } from "@/components/user-profile/dropdown-wrapper";
import {
  GuestUserDropdown,
  MobileGuestUser,
  MobileProfileDropdown,
  ProfileDropdown,
} from "@/components/user-profile/user-profile-dropdown";
import { useAuth } from "@/components/auth/auth-provider";
import { useStoredCollectionCounts } from "@/hooks/use-stored-collection-counts";
import { cn } from "@/lib/utils";

const actions = [
  { id: "wishlist", icon: Heart, href: "/wishlist" },
  { id: "cart", icon: ShoppingCart, href: "/cart" },
];

export function Profile() {
  const transitionScope = useId();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, signOut } = useAuth();
  const { wishlistCount, cartCount } = useStoredCollectionCounts();
  const deferredWishlistCount = useDeferredValue(wishlistCount);
  const deferredCartCount = useDeferredValue(cartCount);
  const profileDropdown = isAuthenticated ? (
    <ProfileDropdown onLogout={() => void signOut()} />
  ) : (
    <GuestUserDropdown onSignIn={() => router.push("/sign-in")} />
  );
  const mobileProfileDropdown = isAuthenticated ? (
    <MobileProfileDropdown onLogout={() => void signOut()} />
  ) : (
    <MobileGuestUser onSignIn={() => router.push("/sign-in")} />
  );

  const countsByAction = {
    wishlist: deferredWishlistCount,
    cart: deferredCartCount,
  };

  const getCountLabel = (count: number) =>
    count > 99 ? "99+" : count.toString();

  return (
    <div className="flex h-10 w-41 items-center gap-1">
      {actions.map((action) => {
        const Icon = action.icon;
        const count = countsByAction[action.id as keyof typeof countsByAction];
        const isActive =
          pathname === action.href || pathname.startsWith(`${action.href}/`);

        const content = (
          <ViewTransition
            name={`profile-count-${transitionScope}-${action.id}`}
            share="auto"
            enter="auto"
            default="none"
          >
            <span className="relative inline-flex">
              <Icon
                className={cn(
                  "size-6 stroke-[1.5]",
                  isActive && "fill-primary text-primary",
                )}
                aria-hidden="true"
              />

              {count > 0 ? (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-5 min-w-5 rounded-full px-1 text-[10px] leading-none shadow-sm"
                >
                  {getCountLabel(count)}
                </Badge>
              ) : null}
            </span>
          </ViewTransition>
        );

        return (
          <Button
            key={action.id}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            aria-label={`${action.id}${count > 0 ? `, ${count} items` : ""}`}
            asChild
          >
            <Link href={action.href} transitionTypes={["cross-fade"]}>
              {content}
            </Link>
          </Button>
        );
      })}

      <DropdownWrapper
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            aria-label="Open notifications"
          >
            <Bell className="size-6 stroke-[1.5]" aria-hidden="true" />
          </Button>
        }
        contentClassName="w-[480px] max-w-[calc(100vw-2rem)] border-0"
      >
        <NotificationDrawer />
      </DropdownWrapper>

      <div className="hidden md:block">
        <DropdownWrapper
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full border-2 p-0"
              aria-label="Open profile menu"
            >
              <AvatarProfile />
            </Button>
          }
          contentClassName="h-(--radix-dropdown-menu-content-available-height) max-h-(--radix-dropdown-menu-content-available-height) w-80 sm:h-auto sm:w-64"
        >
          {profileDropdown}
        </DropdownWrapper>
      </div>

      <div className="block md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full border-2 p-0"
              aria-label="Open profile menu"
            >
              <AvatarProfile />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[80vw] max-w-none overflow-y-auto p-0 gap-0 items-center"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Profile</SheetTitle>
            </SheetHeader>
            {mobileProfileDropdown}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
