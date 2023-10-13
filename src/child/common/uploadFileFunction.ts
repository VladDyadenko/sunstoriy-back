import { writeFile, mkdir } from 'fs/promises';

const uploadChildFiles = async (files: Express.Multer.File[]) => {
  const uploadPromises = files?.map(async (file) => {
    const uniqueSuffix = Date.now();

    const fileName = `${uniqueSuffix}-${file.fieldname}-${file.originalname}`;
    const folderPath = `./upload`;
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
  const dataFiles = savedFilePaths.filter((filePath) => filePath !== null);
  return dataFiles;
};

export default uploadChildFiles;
