import authMiddleware from '@/middlewares/auth.middleware';
import ApiService from '@/services/api.service';
import { Body, Controller, Get, Param, Put, Req, UseBefore, Res, Header, Params, QueryParam } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class EmployeeController {
  private apiService = new ApiService();

  @Get('/employee/:personid/personimage')
  @OpenAPI({ summary: 'Return employees' })
  @UseBefore(authMiddleware)
  @Header('Content-Type', 'image/jpeg')
  @Header('Cross-Origin-Resource-Policy', 'cross-origin')
  async getEmployeeImage(@Param('personid') personid: string, @QueryParam('width') width): Promise<any> {
    const url = `employee/1.0/${personid}/personimage`;
    const res = await this.apiService.get<any>({
      url,
      headers: {
        'Content-Type': 'image/jpeg',
      },
      responseType: 'arraybuffer',
      params: {
        width: width,
      },
    });
    return res.data;
  }
}
