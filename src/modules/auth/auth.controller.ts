import { Body, Controller, FileTypeValidator, Get, HttpStatus, MaxFileSizeValidator, ParseFilePipe, ParseFilePipeBuilder, Post, Request, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-auth.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public, ResponseMessage } from 'src/public.decorator';
import { MailerService } from '@nestjs-modules/mailer';
import { VerifyDto } from './dto/verify-auth.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from 'src/common/file.validator';
import * as fs from 'fs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post("login")
  @ResponseMessage("Đăng nhập thành công")
  login(@Request() request: any) {
    return this.authService.login(request.user)
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    // console.log(files);
    // return {
    //   message: 'Files uploaded successfully',
    //   files: files.map((file) => ({
    //     originalName: file.originalname,
    //     filename: file.filename,
    //     path: file.path,
    //   })),
    // };
    let a = [];
    for (let i = 0; i < files.length; i++) {
      let cloud = await this.authService.uploadImage(files[i].path)
      console.log(cloud);
      a.push(cloud.secure_url)
      fs.unlink(files[i].path, (err) => {
        if (err) {
          console.error(`Error deleting file ${files[i].path}: ${err.message}`);
        } else {
          console.log(`File deleted: ${files[i].path}`);
        }
      });

    }
    return { urls: a }
  }

  @Public()
  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Get("mail")
  @Public()
  async sendMail(@Body() body: any) {
    return this.authService.sendMail(body.email)
  }

  @Public()
  @Post("verify")
  @ResponseMessage("Xác thực mã thành công")
  verify(@Body() data: VerifyDto) {
    return this.authService.verify(data)
  }
}