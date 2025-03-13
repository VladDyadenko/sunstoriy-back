import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserAgent = createParamDecorator((_: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['user-agent'];
})
// Отримуємо пристрій,з якого зайшок користувач і передаємо його в метод login. Це необхідно для оновлення токенів, якщо
// користувач змінить пристрій, з я
// кого він зайшов. Це допомагає уникнути викрадення токенів.