import _env from "../utils/_env";

const serverOrigin = _env.SERVER_URL.replace(/\/api\/?$/, "");

export const getUserImage = (src?: string) => {
  if (!src) return "/user.png";

  if (/^(https?:|blob:|data:)/.test(src)) {
    return src;
  }

  if (src.startsWith("/")) {
    return `${serverOrigin}${src}`;
  }

  return src;
};
