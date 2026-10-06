import { useEffect, useRef, useState } from "react";
import { BiChevronDown } from "react-icons/bi";

const Dropdown = ({
  options,
  value,
  onChange,
  error,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <>
      <div ref={dropdownRef} className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="
          w-full
          flex
          items-center
          justify-between
          px-4
          py-3
          bg-white
          border
          border-gray-300
          rounded-lg
          shadow-sm
          hover:border-gray-400
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
        >
          <span>{selectedOption?.label || placeholder}</span>

          <BiChevronDown
            size={18}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <ul
            className="
            absolute
            z-50
            w-full
            mt-2
            bg-white
            border
            border-gray-200
            rounded-lg
            shadow-lg
            overflow-y-auto
            max-h-50
          "
          >
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="
                px-4
                py-3
                cursor-pointer
                hover:bg-gray-100
                transition-colors
              "
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}

         <div className="absolute mt-2">
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </>
  );
};
export default Dropdown;
