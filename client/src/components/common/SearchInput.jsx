import { IoSearch } from "react-icons/io5";

const SearchInput = ({placeholder,value, onChange}) => {
  return (
    <>
      <div className="relative w-full">
        <IoSearch
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2"
        />

        <input

          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );
};
export default SearchInput;
