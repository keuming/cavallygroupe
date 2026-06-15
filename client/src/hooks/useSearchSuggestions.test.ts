import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearchSuggestions } from './useSearchSuggestions';

describe('useSearchSuggestions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty suggestions', () => {
    const { result } = renderHook(() => useSearchSuggestions());
    
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.searchHistory).toEqual([]);
  });

  it('should add query to history', () => {
    const { result } = renderHook(() => useSearchSuggestions());
    
    act(() => {
      result.current.addToHistory('Mathématiques');
    });

    expect(result.current.searchHistory).toContain('Mathématiques');
  });

  it('should limit history to 20 items', () => {
    const { result } = renderHook(() => useSearchSuggestions());
    
    act(() => {
      for (let i = 0; i < 25; i++) {
        result.current.addToHistory(`Query ${i}`);
      }
    });

    expect(result.current.searchHistory).toHaveLength(20);
  });

  it('should clear history', () => {
    const { result } = renderHook(() => useSearchSuggestions());
    
    act(() => {
      result.current.addToHistory('Test');
      result.current.clearHistory();
    });

    expect(result.current.searchHistory).toHaveLength(0);
  });

  it('should generate suggestions for valid query', () => {
    const { result } = renderHook(() => useSearchSuggestions());
    
    act(() => {
      result.current.getSuggestions('Math');
    });

    expect(result.current.suggestions.length).toBeGreaterThan(0);
    expect(result.current.suggestions[0].type).toBeDefined();
  });

  it('should show popular searches for empty query', () => {
    const { result } = renderHook(() => useSearchSuggestions());
    
    act(() => {
      result.current.getSuggestions('');
    });

    expect(result.current.suggestions.length).toBeGreaterThan(0);
  });

  it('should suggest spelling corrections', () => {
    const { result } = renderHook(() => useSearchSuggestions());
    
    act(() => {
      result.current.getSuggestions('Matematiques'); // Typo
    });

    const corrections = result.current.suggestions.filter((s) => s.type === 'correction');
    expect(corrections.length).toBeGreaterThan(0);
  });

  it('should persist search history to localStorage', () => {
    const { result } = renderHook(() => useSearchSuggestions());
    
    act(() => {
      result.current.addToHistory('Persistent Query');
    });

    const stored = localStorage.getItem('cavaly_search_history');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toContain('Persistent Query');
  });

  it('should restore history from localStorage', () => {
    const mockHistory = ['Query 1', 'Query 2'];
    localStorage.setItem('cavaly_search_history', JSON.stringify(mockHistory));
    
    const { result } = renderHook(() => useSearchSuggestions());
    
    expect(result.current.searchHistory).toEqual(mockHistory);
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    localStorage.setItem('cavaly_search_history', 'invalid json');
    
    const { result } = renderHook(() => useSearchSuggestions());
    
    expect(result.current.searchHistory).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  it('should remove duplicates from suggestions', () => {
    const { result } = renderHook(() => useSearchSuggestions());
    
    act(() => {
      result.current.addToHistory('Mathématiques');
      result.current.getSuggestions('Math');
    });

    const texts = result.current.suggestions.map((s) => s.text.toLowerCase());
    const uniqueTexts = new Set(texts);
    expect(texts.length).toBe(uniqueTexts.size);
  });

  it('should sort suggestions by score', () => {
    const { result } = renderHook(() => useSearchSuggestions());
    
    act(() => {
      result.current.getSuggestions('Math');
    });

    for (let i = 1; i < result.current.suggestions.length; i++) {
      expect(result.current.suggestions[i - 1].score).toBeGreaterThanOrEqual(
        result.current.suggestions[i].score
      );
    }
  });
});
