export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[analytics]", name, properties);
  }
}
