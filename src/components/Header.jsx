import { Menu } from "lucide-react"

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow px-4 py-3 flex items-center justify-between sticky top-0 z-20">
      <button
        className="md:hidden text-gray-700"
        onClick={onMenuClick}
      >
        <Menu size={24} />
      </button>
      <h1 className="text-xl font-bold text-blue-700">من خوێندکارم</h1>
    </header>
  )
}

export default Header
