export const getHomePath = (user) => (user?.role === "admin" ? "/admin" : "/");

export const getPostLoginPath = (user, from) => {
  if (!from) return getHomePath(user);
  if (from.startsWith("/admin") && user?.role !== "admin") return "/";
  return from;
};