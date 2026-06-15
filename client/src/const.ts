export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Local email/password auth: route to the in-app login page.
export const getLoginUrl = (_forceLogin = false) => {
  return "/login";
};
