import { writeFile, mkdir } from 'fs/promises';

const uploadChildFiles = async (files) => {
  const uploadPromises = files.map(async (file) => {
    const uniqueSuffix = Date.now();
    const fileName = `${file.fieldname}-${file.originalname}-${uniqueSuffix}`;
    const folderPath = `./uploads/child`;
    const filePath = `${folderPath}/${fileName}`;

    try {
      await mkdir(folderPath, { recursive: true });
    } catch (error) {
      console.error('Ошибка при создании папки:', error);
    }

    try {
      await writeFile(filePath, file.buffer);
      return filePath;
    } catch (error) {
      console.error('Ошибка при сохранении файла:', error);
      return null;
    }
  });

  const savedFilePaths = await Promise.all(uploadPromises);

  return savedFilePaths.filter((filePath) => filePath !== null);
};

export default uploadChildFiles;
