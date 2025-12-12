/**
 * Tests for utility functions and data transformations
 */
import { describe, it, expect } from 'vitest'

// Mock groupColors
const groupColors = {
  A: "#5bed9f",
  B: "#4aa3ff",
  C: "#f5c244",
  D: "#f36c6c",
}

// Transform function from App.jsx
const transformMatchesToDays = (matches) => {
  if (!Array.isArray(matches)) return []

  const grouped = matches.reduce((acc, match) => {
    const dateKey = match.date || (match.start_time ? match.start_time.split("T")[0] : "unknown")
    if (!acc[dateKey]) acc[dateKey] = []
    
    acc[dateKey].push({
      id: match.id,
      competition: match.competition,
      status: match.status || (match.is_locked ? "ft" : "upcoming"),
      events: match.events || [],
      kickoff: match.kickoff || (match.start_time ? new Date(match.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""),
      minute: match.minute,
      date: dateKey,
      start_time: match.start_time,
      home: { name: match.team_a, score: match.score_a, logo: match.team_a_logo, color: match.team_a_color },
      away: { name: match.team_b, score: match.score_b, logo: match.team_b_logo, color: match.team_b_color },
      predictions: match.predictions || [] 
    })
    return acc
  }, {})

  return Object.keys(grouped).sort().map(dateKey => {
     const dateObj = new Date(dateKey)
     const label = dateObj.toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
     return { id: dateKey, label: label, matches: grouped[dateKey] }
  })
}


describe('transformMatchesToDays', () => {
  it('should return empty array for non-array input', () => {
    expect(transformMatchesToDays(null)).toEqual([])
    expect(transformMatchesToDays(undefined)).toEqual([])
    expect(transformMatchesToDays('string')).toEqual([])
    expect(transformMatchesToDays(123)).toEqual([])
  })

  it('should return empty array for empty array input', () => {
    expect(transformMatchesToDays([])).toEqual([])
  })

  it('should group matches by date', () => {
    const matches = [
      { id: '1', date: '2025-01-10', team_a: 'A', team_b: 'B' },
      { id: '2', date: '2025-01-10', team_a: 'C', team_b: 'D' },
      { id: '3', date: '2025-01-11', team_a: 'E', team_b: 'F' },
    ]
    
    const result = transformMatchesToDays(matches)
    
    expect(result).toHaveLength(2)
    expect(result[0].matches).toHaveLength(2)
    expect(result[1].matches).toHaveLength(1)
  })

  it('should sort dates chronologically', () => {
    const matches = [
      { id: '1', date: '2025-01-15', team_a: 'A', team_b: 'B' },
      { id: '2', date: '2025-01-10', team_a: 'C', team_b: 'D' },
      { id: '3', date: '2025-01-12', team_a: 'E', team_b: 'F' },
    ]
    
    const result = transformMatchesToDays(matches)
    
    expect(result[0].id).toBe('2025-01-10')
    expect(result[1].id).toBe('2025-01-12')
    expect(result[2].id).toBe('2025-01-15')
  })

  it('should extract date from start_time if date not provided', () => {
    const matches = [
      { id: '1', start_time: '2025-01-10T15:00:00Z', team_a: 'A', team_b: 'B' },
    ]
    
    const result = transformMatchesToDays(matches)
    
    expect(result[0].id).toBe('2025-01-10')
  })

  it('should transform match data correctly', () => {
    const matches = [
      {
        id: 'match-1',
        competition: 'Test Cup',
        status: 'ft',
        date: '2025-01-10',
        kickoff: '15:00',
        minute: '90',
        team_a: 'Team A',
        team_a_logo: 'logo-a.png',
        team_a_color: '#ff0000',
        score_a: 2,
        team_b: 'Team B',
        team_b_logo: 'logo-b.png',
        team_b_color: '#0000ff',
        score_b: 1,
        events: [{ minute: '23', player: 'Player 1' }],
        predictions: [{ name: 'User 1', pick: '2-1' }]
      }
    ]
    
    const result = transformMatchesToDays(matches)
    const match = result[0].matches[0]
    
    expect(match.id).toBe('match-1')
    expect(match.competition).toBe('Test Cup')
    expect(match.status).toBe('ft')
    expect(match.kickoff).toBe('15:00')
    expect(match.home.name).toBe('Team A')
    expect(match.home.score).toBe(2)
    expect(match.home.color).toBe('#ff0000')
    expect(match.away.name).toBe('Team B')
    expect(match.away.score).toBe(1)
    expect(match.events).toHaveLength(1)
    expect(match.predictions).toHaveLength(1)
  })

  it('should handle missing optional fields', () => {
    const matches = [
      { id: '1', date: '2025-01-10', team_a: 'A', team_b: 'B' }
    ]
    
    const result = transformMatchesToDays(matches)
    const match = result[0].matches[0]
    
    expect(match.status).toBe('upcoming')
    expect(match.events).toEqual([])
    expect(match.predictions).toEqual([])
    expect(match.home.score).toBeUndefined()
    expect(match.away.score).toBeUndefined()
  })

  it('should set status to ft for locked matches without explicit status', () => {
    const matches = [
      { id: '1', date: '2025-01-10', team_a: 'A', team_b: 'B', is_locked: true }
    ]
    
    const result = transformMatchesToDays(matches)
    
    expect(result[0].matches[0].status).toBe('ft')
  })
})


describe('Scoring Logic (Frontend)', () => {
  // Replicate backend scoring logic for frontend testing
  const calcScore = (p_home, p_away, r_home, r_away) => {
    const result = (h, a) => {
      if (h > a) return 'H'
      if (h < a) return 'A'
      return 'D'
    }

    const res_p = result(p_home, p_away)
    const res_r = result(r_home, r_away)
    const diff_sum = Math.abs(p_home - r_home) + Math.abs(p_away - r_away)

    if (p_home === r_home && p_away === r_away) return 100
    if (res_p === res_r && (p_home - p_away) === (r_home - r_away)) return 70
    if (res_p === res_r) return 50
    if (diff_sum === 1) return 30
    if (diff_sum === 2) return 10
    return 0
  }

  it('should give 100 points for exact prediction', () => {
    expect(calcScore(2, 1, 2, 1)).toBe(100)
    expect(calcScore(0, 0, 0, 0)).toBe(100)
    expect(calcScore(3, 3, 3, 3)).toBe(100)
  })

  it('should give 70 points for correct result and goal difference', () => {
    expect(calcScore(2, 0, 3, 1)).toBe(70)
    expect(calcScore(0, 2, 1, 3)).toBe(70)
  })

  it('should give 50 points for correct result only', () => {
    expect(calcScore(3, 0, 1, 0)).toBe(50)
    expect(calcScore(0, 2, 0, 4)).toBe(50)
  })

  it('should give 30 points for off by 1 goal total (wrong result)', () => {
    // Predicted: 1-0 (home), Actual: 1-1 (draw) - diff=1, wrong result
    expect(calcScore(1, 0, 1, 1)).toBe(30)
    // Predicted: 0-0 (draw), Actual: 1-0 (home) - diff=1, wrong result  
    expect(calcScore(0, 0, 1, 0)).toBe(30)
  })

  it('should give 10 points for off by 2 goals total (wrong result)', () => {
    // Predicted: 0-0 (draw), Actual: 1-1 (draw) - diff=2, same result -> 50 not 10
    // Need wrong result case: Predicted 2-0 (home), Actual 0-0 (draw) - diff=2
    expect(calcScore(2, 0, 0, 0)).toBe(10)
  })

  it('should give 0 points for completely wrong', () => {
    expect(calcScore(3, 0, 0, 3)).toBe(0)  // Predicted home win, actual away win
    expect(calcScore(5, 0, 0, 5)).toBe(0)  // Way off
  })
})


describe('Group Colors', () => {
  it('should have correct colors for each group', () => {
    expect(groupColors.A).toBe('#5bed9f')
    expect(groupColors.B).toBe('#4aa3ff')
    expect(groupColors.C).toBe('#f5c244')
    expect(groupColors.D).toBe('#f36c6c')
  })

  it('should have 4 groups', () => {
    expect(Object.keys(groupColors)).toHaveLength(4)
  })
})


describe('Date Formatting', () => {
  const formatDay = (dateStr, fallbackLabel) => {
    const d = dateStr ? new Date(dateStr) : null
    if (!d || Number.isNaN(d.getTime())) return { full: fallbackLabel || "-", short: "", numeric: "" }
    return {
      full: d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      short: d.toLocaleDateString("vi-VN", { weekday: "short" }).toUpperCase(),
      numeric: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
    }
  }

  it('should format valid date', () => {
    const result = formatDay('2025-01-15')
    expect(result.full).toBeTruthy()
    expect(result.short).toBeTruthy()
    expect(result.numeric).toBeTruthy()
  })

  it('should return fallback for invalid date', () => {
    const result = formatDay('invalid-date', 'Fallback')
    expect(result.full).toBe('Fallback')
    expect(result.short).toBe('')
    expect(result.numeric).toBe('')
  })

  it('should return dash for null date without fallback', () => {
    const result = formatDay(null)
    expect(result.full).toBe('-')
  })
})
