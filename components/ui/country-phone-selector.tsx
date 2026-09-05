"use client";

import React, { useState, useRef, useEffect } from "react";
import { COUNTRIES, Country, getCountryByNameOrCode } from "@/lib/countries";
import { ChevronDown, Search, X } from "lucide-react";

interface CountryDropdownProps {
  value: string; // Country name e.g. "India"
  onChange: (country: Country) => void;
  error?: string;
}

export function CountryDropdown({ value, onChange, error }: CountryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = getCountryByNameOrCode(value);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Country Select Button - ONLY Flag + Country Name */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border flex items-center justify-between text-white text-xs sm:text-sm focus:outline-none transition-colors cursor-pointer ${
          error ? "border-[#EF4444]" : "border-white/10 hover:border-white/20 focus:border-[#E50914]"
        }`}
      >
        <span className="flex items-center gap-2.5 truncate font-medium">
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="truncate">{selectedCountry.name}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Searchable Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 bg-[#14161D] border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-white/10 relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-7 rounded-lg bg-[#0F1117] text-white text-xs placeholder-gray-500 focus:outline-none border border-white/10 focus:border-[#E50914]"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Country List - Showing ONLY Flag + Country Name */}
          <div className="overflow-y-auto max-h-48 divide-y divide-white/5">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400">No country found</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                    country.code === selectedCountry.code ? "bg-[#E50914]/15 text-white font-bold" : "text-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface DialCodeDropdownProps {
  value: string; // Dial code e.g. "+91"
  selectedCountry: Country;
  onChange: (country: Country) => void;
  seamless?: boolean;
}

export function DialCodeDropdown({ selectedCountry, onChange, seamless }: DialCodeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.dialCode.includes(searchQuery.trim())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0 h-full flex items-center" ref={dropdownRef}>
      {/* Dial Code Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          seamless
            ? "h-full px-3.5 flex items-center gap-1.5 text-white text-xs sm:text-sm focus:outline-none cursor-pointer hover:bg-white/10 transition-colors rounded-l-xl select-none"
            : "h-11 px-3 rounded-xl bg-[#0F1117] border border-white/10 hover:border-white/20 focus:border-[#E50914] flex items-center gap-2 text-white text-xs sm:text-sm focus:outline-none transition-colors cursor-pointer"
        }
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-bold text-[#0080FF]">{selectedCountry.dialCode}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Searchable Dial Code Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 top-full mt-1.5 w-64 max-h-60 bg-[#14161D] border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-white/10 relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search code or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-7 rounded-lg bg-[#0F1117] text-white text-xs placeholder-gray-500 focus:outline-none border border-white/10 focus:border-[#E50914]"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-48 divide-y divide-white/5">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400">No code found</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                    country.code === selectedCountry.code ? "bg-[#E50914]/15 text-white font-bold" : "text-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{country.flag}</span>
                    <span className="font-semibold text-white">{country.name}</span>
                  </span>
                  <span className="font-bold text-[#0080FF]">{country.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
