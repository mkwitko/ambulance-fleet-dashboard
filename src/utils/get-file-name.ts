import { createSlug } from "./create-slug";


export function generateNewFileWithCustomName(original: File): string {
  const uniqueValueBasedOnTimestamp = new Date().getTime().toString();
  const fileExtension = original.name.split(".").pop();
  const fileNameWithoutExtension = original.name.replace(
    `.${fileExtension}`,
    ""
  );

  const customFileName = `${uniqueValueBasedOnTimestamp}-${createSlug(
    fileNameWithoutExtension
  )}.${fileExtension}`;

  return customFileName;
}
