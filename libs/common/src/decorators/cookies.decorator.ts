import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return key && key in request.cookies
      ? request.cookies[key]
      : key
      ? null
      : request.cookies;
  },
);
//  !!! Для роботи з куками потрібно встановити npm i cookie-parser і в main прописати
