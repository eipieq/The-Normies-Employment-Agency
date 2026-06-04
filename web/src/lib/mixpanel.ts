import mixpanel from "mixpanel-browser";

let inited = false;

export function initMixpanel() {
  if (typeof window === "undefined" || inited) return;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) return;

  mixpanel.init(token, {
    autocapture: true,
    record_sessions_percent: 100,
  });

  inited = true;
}

export { mixpanel };
