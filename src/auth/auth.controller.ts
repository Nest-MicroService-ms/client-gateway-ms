
import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, Req } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { NATS_SERVICE } from 'src/config';
import { LoginUserDto,RegisterUserDto } from './dto';
import { catchError } from 'rxjs';
import { AuthGuard } from './guards/auth.guard';
import { User,Token } from './decorators';
import { CurrentUser, } from './interface/current-user.interface';

@Controller('auth')
export class AuthController {

   /*
    foo.* matches foo.bar, foo.baz, and so on, but not foo.bar.baz
    foo.*.bar matches foo.baz.bar, foo.qux.bar, and so on, but not foo.bar or foo.bar.baz
    foo.> matches foo.bar, foo.bar.baz, and so on
  */

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post('register')
  register(@Body() registerUserDto : RegisterUserDto) {

    return this.client.send('auth.register.uer', registerUserDto)
      .pipe(catchError( (error) => {
            throw new RpcException( error )
      })
    );
  }

  @Post('login')
  login(@Body() loginUserDto : LoginUserDto) {
    
    return this.client.send('login.user', loginUserDto)
      .pipe(catchError( (error) => {
      throw new RpcException( error )
      })
    );
  }

  @UseGuards( AuthGuard)  //Llama al MS de verificacion
  @Get('verifyToken')
  verifyToken(@User() user:CurrentUser,@Token() token:string) {

    return { user, token }
  }
}
