import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";

const GoogleLoginButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      type="button"
      className="w-full flex items-center justify-center space-x-2 button-secondary"
      onClick={onClick}
    >
      {/* Google Logo using React Icons */}
      <FaGoogle size={24} />
      <span>Sign in with Google</span>
    </Button>
  );
};

export default GoogleLoginButton;
