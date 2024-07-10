import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import { Headers } from 'node-fetch';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';

/*
* Link
* - https://docs.nestjs.com/guards
* - https://docs.nestjs.com/custom-decorators
*/


@Injectable()
export class AuthGuard implements CanActivate {


constructor(
    @Inject( NATS_SERVICE) 
    private readonly client:ClientProxy
)  {}


async canActivate(context: ExecutionContext) : Promise<boolean> { // | boolean 

    const request = context.switchToHttp().getRequest();
    const token = this.extracTokenFromHeader(request);

    if(!token) throw new UnauthorizedException('Token Not Found');

    try {
        
        const {user, token : newToken } = await firstValueFrom(
            this.client.send('auth.verify.user',  token ) );
             
        request['user'] = user;
        request['token'] = newToken;
    }
    catch(err){
        throw new UnauthorizedException();
    }

    return true;

  }

  private extracTokenFromHeader(request: Request): string | undefined {
    const [type,token] = (request.headers as Headers).authorization?.split(' ')??[];
    return type ==='Bearer'? token : undefined;
  }

}