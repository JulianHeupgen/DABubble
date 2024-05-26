import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ChannelChatComponent } from './dashboard/channel-chat/channel-chat.component';
import { UserChatComponent } from './dashboard/user-chat/user-chat.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ImprintComponent } from './imprint/imprint.component';
import { RegisterComponent } from './register/register.component';
import { LogoComponent } from './animations/logo/logo.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TestComponent } from './test/test.component';
import { SendMailToResetPasswordComponent } from './send-mail-to-reset-password/send-mail-to-reset-password.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { authGuard } from './auth.guard';
import { SearchComponent } from './dashboard/search/search.component';
import {RegisterNextComponent} from "./register-next/register-next.component";

export const routes: Routes = [

  { path: '',   redirectTo: '/hello', pathMatch: 'full' },
  { path: 'hello', component: LogoComponent},
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'register/next', component: RegisterNextComponent },
  { path: 'send-mail-to-reset', component: SendMailToResetPasswordComponent },
  { path: 'reset-password', component: PasswordResetComponent },
  {
    path: 'dashboard', component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'channel/Yk2dgejx9yy7iHLij1Qj', pathMatch: 'full' },
      { path: 'channel/:id', component: ChannelChatComponent },
      { path: 'chat/:id', component: UserChatComponent }
    ],
    canActivate: [authGuard]
  },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'logo', component: LogoComponent },
  { path: 'test', component: TestComponent, canActivate: [authGuard]},
  { path: 'search', component: SearchComponent },
  { path: '**', component: PageNotFoundComponent },
];

