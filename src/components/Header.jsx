import { Menu, Search } from "lucide-react";
import { useState } from "react";

const Header = ({ onMenuClick }) => {
  const [search, setSearch] = useState("");

  return (
    <header className="bg-white shadow-md px-4 py-2 mt-4 mx-4 rounded-2xl flex items-center justify-between gap-4 sticky top-0 z-20">
      
      {/* Mobile Menu Icon */}
      <button
        className="md:hidden text-gray-700"
        onClick={onMenuClick}
      >
        <Menu size={24} />
      </button>

      {/* Title */}
      <h1 className="text-lg md:text-xl font-bold text-blue-700 whitespace-nowrap">
        من خوێندکارم
      </h1>

      {/* Search Input */}
      <div className="relative flex-1 max-w-xs hidden sm:block">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="گەڕان..."
          className="w-full bg-gray-100 text-sm text-gray-700 rounded-xl pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
      </div>
    </header>
  );
};

export default Header;
