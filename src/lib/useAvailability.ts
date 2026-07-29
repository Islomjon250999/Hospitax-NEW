import { useState, useEffect } from 'react';
import { getUnavailableRoomIds } from './pmsData';

export function useRoomAvailability(checkIn: string, checkOut: string, excludeBookingId?: string) {
  const [unavailableIds, setUnavailableIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setUnavailableIds(new Set());
      return;
    }
    let cancelled = false;
    getUnavailableRoomIds(checkIn, checkOut, excludeBookingId)
      .then((ids) => { if (!cancelled) setUnavailableIds(ids); })
      .catch(() => { if (!cancelled) setUnavailableIds(new Set()); });
    return () => { cancelled = true; };
  }, [checkIn, checkOut, excludeBookingId]);

  return unavailableIds;
}
