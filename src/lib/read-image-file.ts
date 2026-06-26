export class ImageFileError extends Error {}

// Imagens ficam no deck como data URL: uma URL de outra origem contamina o
// canvas e faz a exportação em PNG falhar.
export function readImageFile(file: File, maxBytes: number): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new ImageFileError("Selecione um arquivo de imagem."));
  }
  if (file.size > maxBytes) {
    const limit = maxBytes >= 1_000_000 ? `${maxBytes / 1_000_000} MB` : `${maxBytes / 1000} KB`;
    return Promise.reject(new ImageFileError(`Imagem muito grande (máximo de ${limit}).`));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new ImageFileError("Não consegui ler a imagem."));
    reader.readAsDataURL(file);
  });
}
