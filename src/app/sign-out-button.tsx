import { signOut } from "./auth/actions";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" aria-label="Sign out" variant="outline" size="icon">
        <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
      </Button>
    </form>
  );
}
