import { useEffect, useState } from "react";
import { searchPlaces } from "../../services/locationApi";

export default function LocationAutocompleteInput({
  value,
  setValue,
  onSelect,
  placeholder,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!value?.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      const results = await searchPlaces(value);
      setSuggestions(results);
      setLoading(false);
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
        onBlur={() => {
          setTimeout(() => setSuggestions([]), 180);
        }}
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

      {loading && <p className="muted tiny" style={{ margin: "6px 2px 0" }}>Searching places...</p>}
    </div>
  );
}