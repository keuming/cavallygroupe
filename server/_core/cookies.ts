import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");
  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

function getRootDomain(hostname: string): string | undefined {
  if (!hostname || LOCAL_HOSTS.has(hostname) || isIpAddress(hostname)) return undefined;
  if (hostname.endsWith(".vercel.app")) return undefined;
  const parts = hostname.split(".");
  if (parts.length >= 2) return "." + parts.slice(-2).join(".");
  return undefined;
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const domain = getRootDomain(req.hostname);
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(req),
    ...(domain ? { domain } : {}),
  };
}
