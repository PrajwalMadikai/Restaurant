import { Link } from "react-router-dom";
function Header() {
  return (
    <header className="h-14 w-full flex justify-between items-center p-4 bg-black text-white">
      <Link to='/'>
      <h1 className="text-lg font-bold sm:text-xl md:text-xl ">
        Foodie Hub
      </h1>
      </Link>
      <Link to="/add">
        <button className="px-8 py-1 bg-white text-black font-semibold rounded-[3px]   transition duration-300">
          Add
        </button>
      </Link>
    </header>
  );
}

export default Header;