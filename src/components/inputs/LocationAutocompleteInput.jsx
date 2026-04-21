import { useEffect, useState } from "react";
import { searchPlaces } from "../../services/locationApi";

export default function LocationAutocompleteInput({
  value,
  setValue,
  onSelect,
  placeholder,
}) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const results = await searchPlaces(value);
      setSuggestions(results);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="autocomplete-wrap">
      <input
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />

      {suggestions.length > 0 && (
        <div className="suggestion-box">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="suggestion-item"
              onClick={() => {
                setValue(item.name);
                onSelect(item);
                setSuggestions([]);
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}