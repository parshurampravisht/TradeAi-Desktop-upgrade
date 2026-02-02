import { Button, Link } from "@nextui-org/react";
const Btn = () => {
  return (
    <>
      <Button.Group color="gradient" ghost>
        <Button>Action1</Button>
        <Button>Action2</Button>
        <Button>Action3</Button>
      </Button.Group>
      <p>
        <Link href="/next">
          <a>Go to next page</a>
        </Link>
      </p>
    </>
  );
};

export default Btn;
