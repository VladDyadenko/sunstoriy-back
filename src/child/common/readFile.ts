import { readFile } from 'fs/promises';

const readUploadedFile = async (fileName) => {
  try {
    const fileData = await readFile(fileName, 'utf-8');
    console.log(fileData);
    return fileData;
  } catch (error) {
    console.error('Ошибка при чтении файла:', error);
  }
};

export default readUploadedFile;
