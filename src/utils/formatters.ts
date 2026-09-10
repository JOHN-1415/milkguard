export function formatTimestamp(isoString: string): { date: string; time: string; full: string } {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return { date: 'Invalid Date', time: '--:--', full: isoString };
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');

    return {
      date: `${day} ${month} ${year}`,
      time: `${hours}:${minutes}`,
      full: `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`
    };
  } catch {
    return { date: 'Unknown', time: '--:--', full: isoString };
  }
}

export function formatTemp(celsius: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    return `${((celsius * 9) / 5 + 32).toFixed(1)} °F`;
  }
  return `${celsius.toFixed(1)} °C`;
}

export function formatConductivity(val: number, unit: 'mS/cm' | 'uS/cm' = 'mS/cm'): string {
  if (unit === 'uS/cm') {
    return `${(val * 1000).toFixed(0)} µS/cm`;
  }
  return `${val.toFixed(2)} mS/cm`;
}

export function formatSensorValue(val: number, decimals = 1): string {
  return typeof val === 'number' ? val.toFixed(decimals) : '--';
}
