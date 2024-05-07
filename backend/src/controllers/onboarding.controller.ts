import { Controller, Req, Get, Put, UseBefore, Param, Body, Post, Delete, OnUndefined } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import authMiddleware from '@middlewares/auth.middleware';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { HttpException } from '@/exceptions/HttpException';
import ApiService from '@/services/api.service';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { IsBoolean, IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { TaskChange, CustomTask, TaskDelete, DelegateChecklist, Onboarding } from '@/interfaces/onboarding.interface';
import { Type } from 'class-transformer';
import { DelegatedChecklists } from '../../../frontend/src/interfaces/onboarding';

interface ResponseData<T> {
  data: T;
  message: string;
  status: number;
}

export class TaskDto {
  @IsBoolean()
  completed: boolean;
  @IsBoolean()
  notRelevant: boolean;
  @IsOptional()
  @IsString()
  responseText?: string;
}

export class CustomTaskDto {
  @IsString()
  heading: string;
  @IsString()
  text: string;
  @IsNumber()
  checklistId: number;
  @IsNumber()
  phaseId: number;
  @IsOptional()
  @IsString()
  responseText?: string;
}

export class UpdateDto {
  @IsString()
  uuid: string;
  @IsBoolean()
  completed: boolean;
  @IsBoolean()
  notRelevant: boolean;
  @IsOptional()
  @IsString()
  responseText?: string;
}
class BulkUpdateDto {
  @ValidateNested({ each: true })
  @Type(() => UpdateDto)
  @IsArray()
  data: UpdateDto[];
}

export class DelegateChecklistDto {
  @IsString()
  emailToDelegateTo: string;
  @IsNumber()
  checklistId: number;
}

@Controller()
export class OnboardingController {
  private apiService = new ApiService();
  @Get('/onboarding')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Logged in user´s onboarding' })
  @UseBefore(authMiddleware)
  async getOnboarding(@Req() req: RequestWithUser): Promise<ResponseData<Onboarding>> {
    // TODO Här ska jag göra en validering. Kan behöva byta ut !req.user
    if (!req.user) {
      throw new HttpException(400, 'Bad Request');
    }

    const { userId } = req?.user;
    const url = `onboarding/1.4/checklists/${userId}`;
    const res = await this.apiService.get<Onboarding>({ url });

    // TODO Här ska jag göra en validering. Kan behöva byta ut Array.isArray(res.data) && res.data.length < 1
    if (Array.isArray(res.data) && res.data.length < 1) {
      throw new HttpException(404, 'Data not found');
    }

    if (res.status === 204) {
      return;
    }

    return { data: res.data, status: res.status, message: 'success' };
  }

  @Put('/onboarding/tasks/update/:uuid')
  @OpenAPI({ summary: 'Edit task' })
  @UseBefore(authMiddleware, validationMiddleware(TaskDto, 'body'))
  async editTask(@Req() req: RequestWithUser, @Param('uuid') uuid: string, @Body() body: TaskDto): Promise<ResponseData<TaskChange>> {
    if (!req.user) {
      throw new HttpException(400, 'Bad Request: Edit task');
    }
    const url = `onboarding/1.4/tasks/update`;
    return await this.apiService.put<TaskChange>({ url, data: { uuid, ...body } });
  }

  @Post('/onboarding/tasks')
  @OpenAPI({ summary: 'Create a custom task for a specific checklist and phase' })
  @UseBefore(authMiddleware, validationMiddleware(CustomTaskDto, 'body'))
  async customTask(@Req() req: RequestWithUser, @Body() body: CustomTaskDto): Promise<ResponseData<CustomTask>> {
    // FIXME: Behöver verifera att användaren får skapa en custom task för denna lista
    if (!req.user) {
      throw new HttpException(400, 'Bad Request: Create a custom task for a specific checklist and phase');
    }
    // FIXME: Sanera strängen så det inte finns någon annan HTML t.e.x script-taggar
    const htmlText = body.text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    const url = `onboarding/1.4/tasks`;
    return await this.apiService.post<CustomTask>({ url, data: { ...body, text: `<ul><li>${htmlText}</li></ul>` } });
  }

  @Post('/onboarding/tasks/bulkUpdate')
  @OpenAPI({ summary: 'Bulk update tasks' })
  @UseBefore(authMiddleware, validationMiddleware(BulkUpdateDto, 'body', true))
  async bulkUpdateTasks(@Req() req: RequestWithUser, @Body() body: BulkUpdateDto): Promise<ResponseData<UpdateDto[]>> {
    if (!req.user) {
      throw new HttpException(400, 'Bad Request: Bulk update tasks');
    }

    const url = `onboarding/1.4/tasks/bulkUpdate`;
    return await this.apiService.post<UpdateDto[]>({ url, data: body.data });
  }

  @Delete('/onboarding/tasks/:uuid')
  @OpenAPI({ summary: 'Delete task' })
  @UseBefore(authMiddleware)
  async deleteTasks(@Req() req: RequestWithUser, @Param('uuid') uuid: string): Promise<ResponseData<TaskDelete>> {
    if (!req.user) {
      throw new HttpException(400, 'Bad Request: Delete tasks');
    }
    const url = `onboarding/1.4/tasks/${uuid}`;
    return await this.apiService.delete<TaskDelete>({ url, data: { uuid } });
  }

  // Delegation
  @Post('/onboarding/delegatedChecklists')
  @OpenAPI({ summary: 'Delegate a checklist to a user by email and checklist id' })
  @UseBefore(authMiddleware, validationMiddleware(DelegateChecklistDto, 'body'))
  async delegateChecklist(
    @Req() req: RequestWithUser,

    @Body() body: DelegateChecklistDto,
  ): Promise<ResponseData<DelegateChecklist>> {
    if (!req.user) {
      throw new HttpException(400, 'Bad Request: Delegate Checklist');
    }

    const url = `onboarding/1.4/delegatedChecklists/${encodeURIComponent(body.emailToDelegateTo)}/${body.checklistId}`;

    return await this.apiService.post<DelegateChecklist>({ url });
  }

  @Get('/onboarding/delegatedChecklists')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Get delegated checklist(s) for a user by userId' })
  @UseBefore(authMiddleware)
  async getDelegatedChecklistsByUserId(@Req() req: RequestWithUser): Promise<ResponseData<DelegatedChecklists[]>> {
    // TODO Här ska jag göra en validering. Kan behöva byta ut !req.user
    if (!req.user) {
      throw new HttpException(400, 'Bad Request');
    }

    const { userId } = req?.user;
    const url = `onboarding/1.4/delegatedChecklists/${userId}`;

    const res = await this.apiService.get<DelegatedChecklists[]>({ url });
    // TODO Här ska jag göra en validering. Kan behöva byta ut Array.isArray(res.data) && res.data.length < 1
    if (Array.isArray(res.data) && res.data.length < 1) {
      throw new HttpException(404, 'Data not found');
    }

    if (res.status === 204) {
      return;
    }

    return { data: res.data, status: res.status, message: 'success' };
  }
}
