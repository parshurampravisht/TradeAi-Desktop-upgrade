import { useRouter } from "next/router";

const Insurance = () => {
  const router = useRouter();
  const currentRoute = router.pathname;
  return (
    <>
      <h1> {currentRoute.slice(1, currentRoute.length)} Coming Soon!</h1>
    </>
  );
};

export default Insurance;
