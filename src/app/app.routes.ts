import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ChannelChatComponent } from './dashboard/channel-chat/channel-chat.component';
import { UserChatComponent } from './dashboard/user-chat/user-chat.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ImprintComponent } from './imprint/imprint.component';
import { RegisterComponent } from './register/register.component';
import { LogoComponent } from './animations/logo/logo.component';
import { PhotoSelectionComponent } from './photo-selection/photo-selection.component';


import { AddChannelComponent } from './dialog/add-channel/add-channel.component';
import { SendMailToResetPasswordComponent } from './send-mail-to-reset-password/send-mail-to-reset-password.component';

export const routes: Routes = [

  { path: '',   redirectTo: '/hello', pathMatch: 'full' },
  { path: 'hello', component: LogoComponent},
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'register/next', component: PhotoSelectionComponent },
  { path: 'send-mail-to-reset', component: SendMailToResetPasswordComponent },
  {
    path: 'dashboard', component: DashboardComponent,
    children: [
      { path: 'channel/:id', component: ChannelChatComponent },
      { path: 'chat/:id', component: UserChatComponent }
    ]
  },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'logo', component: LogoComponent },
  { path: 'adddialog', component: AddChannelComponent },
];

