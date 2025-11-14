export function getInitials(name: string, limit = 2) {
  const words = name.split(" ");
  const initials = words.map((word) => word[0]).join("");

  return initials.slice(0, limit).toUpperCase();
}
