import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
      <SignIn />
    </div>
  );
}
