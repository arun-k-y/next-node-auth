import Link from "next/link";
import Hello from "../components/Hello";

const Home = () => {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="grid text-center space-y-4">
        <h1 className="text-4xl">Welcome to Next.js! </h1>
        <Link className=" text-[#0000EE] underline" href={"/signup"}>
          {"Go to signup page!"}
        </Link>
        <Link className="underline text-[#0000EE]" href={"/login"}>
          {"Go to login page!"}
        </Link>
      </div>
    </div>
  );
};

export default Home;
