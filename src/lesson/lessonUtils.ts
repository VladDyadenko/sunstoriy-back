// lessonUtils.ts

export async function checkLessonAvailability(lessonModule, dto) {
  const queryLessonOffice = {
    dateLesson: dto.dateLesson,
    timeLesson: dto.timeLesson,
    office: dto.office,
  };

  const queryLessonTeacher = {
    dateLesson: dto.dateLesson,
    timeLesson: dto.timeLesson,
    teacher: dto.teacher,
  };

  const checkLesson = await lessonModule.find(queryLessonOffice);
  const checkTeacher = await lessonModule.find(queryLessonTeacher);

  if (checkLesson.length > 0) {
    return {
      isAvailable: false,
      message: 'Кабінет на цей час вже зайнятий',
    };
  }

  if (checkTeacher.length > 0) {
    return {
      isAvailable: false,
      message: 'Фахівець на цей час вже зайнятий',
    };
  }

  return {
    isAvailable: true,
  };
}
