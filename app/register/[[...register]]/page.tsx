import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
      <SignUp />
    </div>
  );
}
