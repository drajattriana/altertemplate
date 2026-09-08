import AuthLayout from "../../layouts/AuthPageLayout";
import SignInForm from "../../components/app/auth/SignInForm";

export default function LoginPage() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}