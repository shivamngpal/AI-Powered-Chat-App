import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      className="p-4 border-b border-border"
      style={{ backgroundColor: "#262626" }}
    >
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-20 border-border focus-visible:ring-primary"
          style={{
            backgroundColor: "#2E2E2E",
            color: "#FAFAFA",
            caretColor: "#FAFAFA",
          }}
        />

        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            ✕
          </Button>
        )}

        <Button
          type="submit"
          variant="ghost"
          size="sm"
          disabled={searching}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-primary/10"
        >
          {searching ? "⌛" : "🔍"}
        </Button>
      </div>
    </form>
  );
}

export default SearchBar;
