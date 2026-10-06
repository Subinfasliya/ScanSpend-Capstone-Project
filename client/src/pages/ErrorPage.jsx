import { Link, useRouteError } from "react-router";


const ErrorPage = () => {

    const {error} = useRouteError()

    console.log(error?.message);
    

  return (
    <>
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold">Something went wrong</h2>

        <p className="my-4 text-red-500 text-lg">{error?.message}</p>

        <Link to={"/app"} className="border rounded-lg px-4 py-2 font-semibold hover:bg-[green] hover:text-white hover:border-white">Back to Home</Link>
      </div>
    </>
  );
};
export default ErrorPage;
