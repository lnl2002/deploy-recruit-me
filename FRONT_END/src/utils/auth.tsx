// components/withAuth.tsx
import { useAppSelector } from "@/store/store";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode, ComponentType } from "react";

interface WithAuthProps {
  children?: ReactNode; // Children might be optional
}

const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: string[]
) => {
  const ComponentWithAuth: ComponentType<P & WithAuthProps> = (props) => {
    // Correct Typing Here
    const { userInfo, isLoggedIn } = useAppSelector((state) => state.user);
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return; // Do nothing while loading
      // Improved condition - handle null user info and missing role
      if (
        !userInfo ||
        !userInfo.role ||
        !allowedRoles.includes(userInfo.role)
      ) {
        router.push("/");
      }
    }, [userInfo, router]); // Add router to dependency array

    return <WrappedComponent {...props} />; // Correct usage
  };

  return ComponentWithAuth as ComponentType<P>; // Type cast to avoid unnecessary WithAuthProps
};

export default withAuth;
