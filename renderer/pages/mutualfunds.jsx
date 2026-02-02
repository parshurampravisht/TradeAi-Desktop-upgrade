import { useRouter } from "next/router";

const MutulFunds = () => {
  const router = useRouter();
  const currentRoute = router.pathname;
  // {currentRoute.slice(1, currentRoute.length)}
  return (
    <>
      <h1>Mutual Funds Coming Soon!</h1>
    </>
  );
};

export default MutulFunds;
