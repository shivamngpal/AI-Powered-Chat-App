import { useState, useEffect } from "react";

function SearchBar({ onSearchResults, onClearSearch }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // Search as user types (with debounce)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery.trim());
      } else {
        // If search is empty, show all users again
        onClearSearch();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setSearching(true);
    try {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (data.error) {
        console.error("Search error:", data.error);
        onSearchResults([]);
      } else {
        onSearchResults(data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      onSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    // Search is already handled by useEffect, just prevent form submission
  };

  const handleClear = () => {
    setSearchQuery("");
    // onClearSearch will be called by useEffect when searchQuery becomes empty
  };

  return (
    <form
      onSubmit={handleSearch}
      style={{
        padding: "10px 15px",
        borderBottom: "1px solid #ddd",
        backgroundColor: "white",
      }}
    >
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 70px 8px 12px",
            border: "1px solid #ddd",
            borderRadius: "20px",
            outline: "none",
            fontSize: "13px",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#007bff";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ddd";
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: "absolute",
              right: "35px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: "#999",
              padding: "4px",
            }}
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          disabled={searching}
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: searching ? "wait" : "pointer",
            fontSize: "16px",
            color: "#007bff",
            padding: "4px",
          }}
        >
          {searching ? "⌛" : "🔍"}
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
