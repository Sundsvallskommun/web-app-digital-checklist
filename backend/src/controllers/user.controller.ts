import { Controller, Body, Req, Get, Post, UseBefore, Res, Patch } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import authMiddleware from '@middlewares/auth.middleware';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@interfaces/users.interface';

@Controller()
export class UserController {
  @Get('/me')
  @OpenAPI({ summary: 'Return current user' })
  @UseBefore(authMiddleware)
  async getUser(@Req() req: RequestWithUser, @Res() response: any): Promise<User> {
    const { name, surname, userId, givenName, isManager, personid, companyId } = req.user;

    if (!name) {
      throw new HttpException(400, 'Bad Request');
    }

    const userData: User = {
      personid,
      userId,
      name,
      givenName,
      surname,
      isManager,
      companyId,
    };

    return response.send({ data: userData, message: 'success' });
  }
}
